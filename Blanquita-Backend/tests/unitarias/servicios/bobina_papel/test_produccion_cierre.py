import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Cantidades import CANTIDAD_MINIMA_LOGS_CIERRE
from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_PRODUCCION_CAMBIO_LINEA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_FINALIZADO,
    ESTADO_PRODUCCION_PAUSA,
    MOVIMIENTO_MATERIA_PRIMA_CAMBIO_LINEA,
    MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    CambiarLineaProduccionBobinaTuboRequest,
    FinalizarProduccionBobinaTuboRequest,
)
from app.Schemas.BobinaPapel import MovimientoBobina
from app.Schemas.Produccion import ProduccionBobinaTubo
from tests.dobles.fabricas import (
    FECHA_BASE,
    PRODUCTO_ECO,
    PRODUCTO_INACTIVO,
    PRODUCTO_LUX,
    crear_bobina,
    crear_produccion,
)

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]


def _bobinas_en_produccion():
    return {
        1: crear_bobina(1, id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION),
        2: crear_bobina(2, id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION),
    }


def _finalizar(servicio):
    return servicio.FinalizarProduccion(FinalizarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=10), id_usuario=7)


def _cambiar(servicio, id_producto=PRODUCTO_ECO["IdProducto"]):
    return servicio.CambiarLineaProduccion(
        CambiarLineaProduccionBobinaTuboRequest(IdProduccionBobinaTubo=10, IdProducto=id_producto),
        id_usuario=7,
    )


@pytest.mark.parametrize("logs", [0, 1, CANTIDAD_MINIMA_LOGS_CIERRE - 1])
def test_finalizar_con_menos_logs_del_minimo_lanza_409(servicio, repo, logs):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(logs=logs)

    with pytest.raises(HTTPException) as error:
        _finalizar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail.startswith(f"La producción tiene {logs} logs registrados")
    assert "Si no se produjo, páusala y cancélala" in error.value.detail
    repo.Revertir.assert_called_once()
    repo.ObtenerBobinasBloqueadas.assert_not_called()


def test_finalizar_produccion_en_pausa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(id_estado=ESTADO_PRODUCCION_PAUSA, logs=80)

    with pytest.raises(HTTPException) as error:
        _finalizar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert "no puede finalizarse" in error.value.detail


@time_machine.travel(FECHA_BASE, tick=False)
def test_finalizar_con_el_minimo_exacto_agota_las_bobinas(servicio, repo):
    produccion = crear_produccion(logs=CANTIDAD_MINIMA_LOGS_CIERRE)
    bobinas = _bobinas_en_produccion()
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerBobinasBloqueadas.return_value = bobinas

    respuesta = _finalizar(servicio)

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_FINALIZADO
    assert produccion.FechaFinProduccion == FECHA_BASE
    assert all(b.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO for b in bobinas.values())
    movimientos = repo.Guardar.call_args.args[1:]
    assert len(movimientos) == 2
    assert all(m.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA for m in movimientos)
    repo.NombreEstadoProduccion.assert_called_once_with(ESTADO_PRODUCCION_FINALIZADO)
    assert respuesta.NombreEstadoProduccion == "Finalizado"


def test_cambiar_a_la_misma_linea_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(logs=80)

    with pytest.raises(HTTPException) as error:
        _cambiar(servicio, id_producto=PRODUCTO_LUX["IdProducto"])

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "La producción ya se encuentra en la línea indicada"


def test_cambiar_linea_en_pausa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(id_estado=ESTADO_PRODUCCION_PAUSA, logs=80)

    with pytest.raises(HTTPException) as error:
        _cambiar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert "no puede cambiar de línea" in error.value.detail


def test_cambiar_linea_con_menos_logs_del_minimo_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(logs=CANTIDAD_MINIMA_LOGS_CIERRE - 1)

    with pytest.raises(HTTPException) as error:
        _cambiar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert "para cambiar de línea" in error.value.detail


@pytest.mark.parametrize(
    "productos",
    [[PRODUCTO_LUX], [PRODUCTO_LUX, PRODUCTO_INACTIVO]],
    ids=["un-solo-producto", "segundo-producto-inactivo"],
)
def test_cambiar_linea_en_tipo_con_un_solo_producto_activo_lanza_409(servicio, repo, productos):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(logs=80)
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas_en_produccion()
    repo.ProductosDelTipo.return_value = productos

    with pytest.raises(HTTPException) as error:
        _cambiar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert "más de un producto activo" in error.value.detail


def test_cambiar_linea_sin_turnos_configurados_lanza_409_y_no_cierra_la_anterior(servicio, repo):
    anterior = crear_produccion(logs=80)
    repo.ObtenerProduccionBloqueada.return_value = anterior
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas_en_produccion()
    repo.ProductosDelTipo.return_value = [PRODUCTO_LUX, PRODUCTO_ECO]
    repo.TurnoActual.return_value = None

    with pytest.raises(HTTPException) as error:
        _cambiar(servicio)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "No hay turnos configurados"
    assert anterior.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    repo.Agregar.assert_not_called()


@time_machine.travel(FECHA_BASE, tick=False)
def test_cambiar_linea_cierra_la_anterior_y_abre_otra_con_contador_en_cero(servicio, repo):
    anterior = crear_produccion(logs=120)
    bobinas = _bobinas_en_produccion()
    repo.ObtenerProduccionBloqueada.return_value = anterior
    repo.ObtenerBobinasBloqueadas.return_value = bobinas
    repo.ProductosDelTipo.return_value = [PRODUCTO_LUX, PRODUCTO_ECO]

    respuesta = _cambiar(servicio)

    assert anterior.IdEstadoProduccion == ESTADO_PRODUCCION_CAMBIO_LINEA
    assert anterior.FechaFinProduccion == FECHA_BASE
    assert anterior.CantidadLogsActual == 120

    nueva = repo.Agregar.call_args.args[0]
    assert isinstance(nueva, ProduccionBobinaTubo)
    assert nueva.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    assert nueva.CantidadLogsActual == 0
    assert nueva.IdProducto == PRODUCTO_ECO["IdProducto"]
    assert (nueva.IdBobina_1, nueva.IdBobina_2) == (1, 2)
    assert nueva.FechaInicioProduccion == anterior.FechaFinProduccion

    assert all(b.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION for b in bobinas.values())
    movimientos = [r for r in repo.Guardar.call_args.args if isinstance(r, MovimientoBobina)]
    assert len(movimientos) == 2
    assert all(m.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_CAMBIO_LINEA for m in movimientos)
    assert all("(EcoPack)" in m.Observacion for m in movimientos)

    assert respuesta.IdProduccionAnterior == 10
    assert respuesta.IdProduccionBobinaTubo == nueva.IdProduccionBobinaTubo
    assert respuesta.NombreProducto == "EcoPack"
