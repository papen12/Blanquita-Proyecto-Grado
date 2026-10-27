import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    ESTADO_PRODUCCION_CANCELADA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_PAUSA,
    MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    CancelarProduccionBobinaTuboRequest,
    PausarProduccionBobinaTuboRequest,
    ReanudarProduccionBobinaTuboRequest,
)
from app.Schemas.BobinaPapel import MovimientoBobina
from app.Schemas.Produccion import CancelacionProduccionBobinaTubo, PausaProduccionBobinaTubo
from app.Services.BobinaPapel import ProduccionBobinaPapelService as modulo_servicio
from tests.dobles.fabricas import FECHA_BASE, crear_bobina, crear_pausa, crear_produccion

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]

MOTIVO = "Empalme bobina BP-0003"


def _pausar(motivo=MOTIVO):
    return PausarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=10, MotivoPausaProduccion=motivo)


def _reanudar(motivo="Se repuso el pegamento"):
    return ReanudarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=10, MotivoReanudacion=motivo)


def _cancelar(motivo="Bobina con falla de fabrica"):
    return CancelarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=10, MotivoCancelacion=motivo)


@pytest.mark.parametrize(
    ("metodo", "solicitud"),
    [
        ("PausarProduccion", PausarProduccionBobinaTuboRequest),
        ("ReanudarProduccion", ReanudarProduccionBobinaTuboRequest),
        ("CancelarProduccion", CancelarProduccionBobinaTuboRequest),
    ],
)
@pytest.mark.parametrize("motivo", [None, "", "   ", "abcd", "x" * 151, "motivo con @ invalido"])
def test_motivo_invalido_lanza_422_antes_de_consultar(servicio, repo, metodo, solicitud, motivo):
    campo = {
        "PausarProduccion": "MotivoPausaProduccion",
        "ReanudarProduccion": "MotivoReanudacion",
        "CancelarProduccion": "MotivoCancelacion",
    }[metodo]

    with pytest.raises(HTTPException) as error:
        getattr(servicio, metodo)(solicitud(IdProduccionBobinaTubo=10, **{campo: motivo}), id_usuario=7)

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "debe tener entre 5 y 150 caracteres" in error.value.detail
    repo.ObtenerProduccionBloqueada.assert_not_called()


def test_el_motivo_se_valida_con_la_regla_comun_de_texto(servicio, repo, mocker):
    espia = mocker.spy(modulo_servicio, "ValidarTexto")
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion()

    servicio.PausarProduccion(_pausar(f"  {MOTIVO}  "), id_usuario=7)

    espia.assert_called_once_with(5, 150, MOTIVO)


@time_machine.travel(FECHA_BASE, tick=False)
def test_pausar_produccion_activa_la_pone_en_pausa_y_registra_la_pausa(servicio, repo):
    produccion = crear_produccion()
    repo.ObtenerProduccionBloqueada.return_value = produccion

    respuesta = servicio.PausarProduccion(_pausar(f"  {MOTIVO} "), id_usuario=7)

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_PAUSA
    registros = repo.Guardar.call_args.args
    pausa = registros[1]
    assert isinstance(pausa, PausaProduccionBobinaTubo)
    assert pausa.MotivoPausaProduccion == MOTIVO
    assert pausa.FechaHoraPausa == FECHA_BASE
    assert pausa.IdUsuario == 7
    assert respuesta.IdEstadoProduccion == ESTADO_PRODUCCION_PAUSA
    assert respuesta.FechaHoraReanudacion is None


@pytest.mark.parametrize("estado", [ESTADO_PRODUCCION_PAUSA, ESTADO_PRODUCCION_CANCELADA])
def test_pausar_produccion_que_no_esta_activa_lanza_409(servicio, repo, estado):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(id_estado=estado)

    with pytest.raises(HTTPException) as error:
        servicio.PausarProduccion(_pausar(), id_usuario=7)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    repo.Revertir.assert_called_once()
    repo.Guardar.assert_not_called()


def test_reanudar_produccion_activa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion()

    with pytest.raises(HTTPException) as error:
        servicio.ReanudarProduccion(_reanudar(), id_usuario=7)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "La producción indicada no se encuentra en Pausa, no puede reanudarse"


def test_reanudar_sin_pausa_activa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(id_estado=ESTADO_PRODUCCION_PAUSA)
    repo.ObtenerPausaActiva.return_value = None

    with pytest.raises(HTTPException) as error:
        servicio.ReanudarProduccion(_reanudar(), id_usuario=7)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "No existe una pausa activa para la producción indicada"
    repo.Revertir.assert_called_once()


@time_machine.travel(FECHA_BASE, tick=False)
def test_reanudar_cierra_la_pausa_con_motivo_y_vuelve_a_produccion(servicio, repo):
    produccion = crear_produccion(id_estado=ESTADO_PRODUCCION_PAUSA)
    pausa = crear_pausa()
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerPausaActiva.return_value = pausa

    respuesta = servicio.ReanudarProduccion(_reanudar(), id_usuario=7)

    repo.ObtenerPausaActiva.assert_called_once_with(10)
    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    assert pausa.FechaHoraReanudacion == FECHA_BASE
    assert pausa.MotivoReanudacion == "Se repuso el pegamento"
    assert respuesta.MotivoPausaProduccion == "Falta de pegamento"
    assert respuesta.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION


def test_cancelar_produccion_activa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion()

    with pytest.raises(HTTPException) as error:
        servicio.CancelarProduccion(_cancelar(), id_usuario=7)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "La producción indicada no está en Pausa, no se puede cancelar"
    repo.ObtenerBobinasBloqueadas.assert_not_called()
    repo.Guardar.assert_not_called()


@time_machine.travel(FECHA_BASE, tick=False)
def test_cancelar_en_pausa_saca_las_bobinas_del_inventario(servicio, repo):
    produccion = crear_produccion(id_estado=ESTADO_PRODUCCION_PAUSA, logs=0)
    bobinas = {
        1: crear_bobina(1, id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION),
        2: crear_bobina(2, id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION),
    }
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerBobinasBloqueadas.return_value = bobinas

    respuesta = servicio.CancelarProduccion(_cancelar(), id_usuario=7)

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA
    assert produccion.FechaFinProduccion == FECHA_BASE
    assert all(b.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO for b in bobinas.values())

    registros = repo.Guardar.call_args.args
    cancelaciones = [r for r in registros if isinstance(r, CancelacionProduccionBobinaTubo)]
    movimientos = [r for r in registros if isinstance(r, MovimientoBobina)]
    assert len(cancelaciones) == 1
    assert cancelaciones[0].MotivoCancelacion == "Bobina con falla de fabrica"
    assert len(movimientos) == 2
    assert all(m.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA for m in movimientos)
    assert respuesta.IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA
