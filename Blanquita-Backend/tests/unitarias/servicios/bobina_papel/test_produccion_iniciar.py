import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_EN_ALMACEN,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import IniciarProduccionBobinaTuboRequest
from app.Schemas.BobinaPapel import MovimientoBobina
from app.Schemas.Produccion import ProduccionBobinaTubo
from tests.dobles.fabricas import (
    FECHA_BASE,
    ID_TIPO_TOALLA,
    PRODUCTO_ECO,
    PRODUCTO_INACTIVO,
    PRODUCTO_LUX,
    crear_bobina,
)

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]


def _solicitud(id_1=1, id_2=2, id_producto=None):
    return IniciarProduccionBobinaTuboRequest(IdBobina1=id_1, IdBobina2=id_2, IdProducto=id_producto)


def _bobinas(*bobinas):
    return {b.IdBobinaPapel: b for b in bobinas}


def _error(servicio, solicitud) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        servicio.IniciarProduccionBobinaTubo(solicitud, id_usuario=7)
    return error.value


def test_iniciar_con_la_misma_bobina_lanza_400_sin_consultar(servicio, repo):
    error = _error(servicio, _solicitud(1, 1))

    assert error.status_code == status.HTTP_400_BAD_REQUEST
    repo.ObtenerBobinasBloqueadas.assert_not_called()


def test_iniciar_con_bobina_inexistente_lanza_404_y_revierte(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1))

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_404_NOT_FOUND
    repo.Revertir.assert_called_once()
    repo.Guardar.assert_not_called()


@pytest.mark.parametrize(
    "estado",
    [ESTADO_MATERIA_PRIMA_EN_PRODUCCION, ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO],
)
def test_iniciar_con_bobina_fuera_de_almacen_lanza_409(servicio, repo, estado):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2, id_estado=estado))

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "Una de las bobinas indicadas no está disponible en almacén"
    repo.Revertir.assert_called_once()


def test_iniciar_con_bobinas_de_distinto_tipo_lanza_409(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2, id_tipo=ID_TIPO_TOALLA))

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "Las bobinas deben ser del mismo tipo para iniciar la producción"


def test_iniciar_sin_producto_con_un_solo_activo_lo_elige_automaticamente(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))
    repo.ProductosDelTipo.return_value = [PRODUCTO_LUX, PRODUCTO_INACTIVO]

    respuesta = servicio.IniciarProduccionBobinaTubo(_solicitud(), id_usuario=7)

    assert respuesta.IdProducto == PRODUCTO_LUX["IdProducto"]
    assert respuesta.NombreProducto == "Luxury"


def test_iniciar_sin_producto_con_varios_activos_lanza_422(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))
    repo.ProductosDelTipo.return_value = [PRODUCTO_LUX, PRODUCTO_ECO]

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert error.detail == "Debe seleccionar el producto para la producción"


def test_iniciar_en_tipo_sin_productos_activos_lanza_409(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))
    repo.ProductosDelTipo.return_value = [PRODUCTO_INACTIVO]

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "El tipo de bobina no tiene productos activos asociados"


def test_iniciar_con_producto_de_otro_tipo_lanza_409(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))

    error = _error(servicio, _solicitud(id_producto=99))

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "El producto 99 no es válido para este tipo de bobina"


def test_iniciar_con_producto_inactivo_lanza_409(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))
    repo.ProductosDelTipo.return_value = [PRODUCTO_LUX, PRODUCTO_INACTIVO]

    error = _error(servicio, _solicitud(id_producto=PRODUCTO_INACTIVO["IdProducto"]))

    assert error.status_code == status.HTTP_409_CONFLICT
    assert "está inactivo" in error.detail


def test_iniciar_sin_turnos_configurados_lanza_409(servicio, repo):
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(crear_bobina(1), crear_bobina(2))
    repo.TurnoActual.return_value = None

    error = _error(servicio, _solicitud())

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "No hay turnos configurados"
    repo.Agregar.assert_not_called()


@time_machine.travel(FECHA_BASE, tick=False)
def test_iniciar_valido_crea_la_produccion_y_traslada_ambas_bobinas(servicio, repo):
    bobina_1, bobina_2 = crear_bobina(1), crear_bobina(2)
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(bobina_1, bobina_2)

    respuesta = servicio.IniciarProduccionBobinaTubo(_solicitud(), id_usuario=7)

    repo.ObtenerBobinasBloqueadas.assert_called_once_with([1, 2])
    repo.Agregar.assert_called_once()
    repo.Guardar.assert_called_once()
    repo.Revertir.assert_not_called()

    registros = repo.Guardar.call_args.args
    produccion = registros[0]
    movimientos = registros[1:]

    assert isinstance(produccion, ProduccionBobinaTubo)
    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    assert produccion.CantidadLogsActual == 0
    assert produccion.IdUsuario == 7
    assert produccion.FechaInicioProduccion == FECHA_BASE

    assert [m.IdBobinaPapel for m in movimientos] == [1, 2]
    assert all(isinstance(m, MovimientoBobina) for m in movimientos)
    assert all(m.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_TRASLADO for m in movimientos)
    assert all(f"#{produccion.IdProduccionBobinaTubo}" in m.Observacion for m in movimientos)

    assert bobina_1.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION
    assert bobina_2.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION

    assert respuesta.IdProduccionBobinaTubo == produccion.IdProduccionBobinaTubo
    assert respuesta.NombreTurno == "Mañana"


def test_iniciar_fallido_no_cambia_el_estado_de_las_bobinas(servicio, repo):
    bobina_1, bobina_2 = crear_bobina(1), crear_bobina(2)
    repo.ObtenerBobinasBloqueadas.return_value = _bobinas(bobina_1, bobina_2)
    repo.TurnoActual.return_value = None

    _error(servicio, _solicitud())

    assert bobina_1.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN
    assert bobina_2.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN
