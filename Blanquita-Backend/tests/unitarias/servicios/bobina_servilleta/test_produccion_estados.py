import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    ESTADO_PRODUCCION_CANCELADA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_FINALIZADO,
    ESTADO_PRODUCCION_PAUSA,
    MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA,
    MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA,
)
from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    CancelarProduccionServilletaRequest,
    FinalizarProduccionServilletaRequest,
    PausaProduccionServilletaRequest,
    ReanudarProduccionServilletaRequest,
    VerProduccionServilletaActivasRequest,
)
from app.Schemas.BobinaServilleta import MovimientoSubBobina
from app.Schemas.Produccion import CancelacionProduccionServilleta, PausaProduccionServilleta
from tests.dobles.fabricas import (
    FECHA_BASE,
    ID_MEDIDA_435,
    crear_pausa_servilleta,
    crear_produccion_servilleta,
    crear_sub_bobina,
)

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_servilleta]

MOTIVO = "Cambio de cuchilla en maquina 1"

ACCIONES_CON_MOTIVO = [
    ("PausaProduccionServilleta", PausaProduccionServilletaRequest, "MotivoPausaProduccion"),
    ("ReanudarProduccionServilleta", ReanudarProduccionServilletaRequest, "MotivoReanudacion"),
    ("CancelarProduccionServilleta", CancelarProduccionServilletaRequest, "MotivoCancelacion"),
]


def _ejecutar(servicio, metodo, solicitud, campo=None, motivo=MOTIVO):
    datos = {"IdProduccionServilleta": 20}
    if campo:
        datos[campo] = motivo
    return getattr(servicio, metodo)(solicitud(**datos), id_usuario=7)


@pytest.mark.parametrize(("metodo", "solicitud", "campo"), ACCIONES_CON_MOTIVO)
@pytest.mark.parametrize("motivo", [None, "", "abcd", "motivo con ! raro"])
def test_motivo_invalido_lanza_422_sin_consultar(servicio, repo, metodo, solicitud, campo, motivo):
    with pytest.raises(HTTPException) as error:
        _ejecutar(servicio, metodo, solicitud, campo, motivo)

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    repo.ObtenerProduccionBloqueada.assert_not_called()


@pytest.mark.parametrize(
    ("metodo", "solicitud", "campo"),
    [*ACCIONES_CON_MOTIVO, ("FinalizarProduccionServilleta", FinalizarProduccionServilletaRequest, None)],
)
def test_produccion_inexistente_revierte_y_lanza_404(servicio, repo, metodo, solicitud, campo):
    repo.ObtenerProduccionBloqueada.return_value = None

    with pytest.raises(HTTPException) as error:
        _ejecutar(servicio, metodo, solicitud, campo)

    assert error.value.status_code == status.HTTP_404_NOT_FOUND
    assert error.value.detail == "No existe la producción con id 20"
    repo.Revertir.assert_called_once()


@pytest.mark.parametrize(
    ("metodo", "solicitud", "campo", "estado_invalido"),
    [
        ("PausaProduccionServilleta", PausaProduccionServilletaRequest, "MotivoPausaProduccion", ESTADO_PRODUCCION_PAUSA),
        ("ReanudarProduccionServilleta", ReanudarProduccionServilletaRequest, "MotivoReanudacion", ESTADO_PRODUCCION_EN_PRODUCCION),
        ("CancelarProduccionServilleta", CancelarProduccionServilletaRequest, "MotivoCancelacion", ESTADO_PRODUCCION_EN_PRODUCCION),
        ("FinalizarProduccionServilleta", FinalizarProduccionServilletaRequest, None, ESTADO_PRODUCCION_PAUSA),
        ("FinalizarProduccionServilleta", FinalizarProduccionServilletaRequest, None, ESTADO_PRODUCCION_FINALIZADO),
    ],
    ids=["pausar-en-pausa", "reanudar-activa", "cancelar-activa", "finalizar-en-pausa", "finalizar-finalizada"],
)
def test_transicion_de_estado_no_permitida_lanza_409(servicio, repo, metodo, solicitud, campo, estado_invalido):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion_servilleta(id_estado=estado_invalido)

    with pytest.raises(HTTPException) as error:
        _ejecutar(servicio, metodo, solicitud, campo)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    repo.Revertir.assert_called_once()
    repo.Guardar.assert_not_called()


@time_machine.travel(FECHA_BASE, tick=False)
def test_pausar_registra_la_pausa_con_motivo_limpio(servicio, repo):
    produccion = crear_produccion_servilleta()
    repo.ObtenerProduccionBloqueada.return_value = produccion

    respuesta = _ejecutar(servicio, "PausaProduccionServilleta", PausaProduccionServilletaRequest, "MotivoPausaProduccion", f"  {MOTIVO} ")

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_PAUSA
    pausa = next(r for r in repo.Guardar.call_args.args if isinstance(r, PausaProduccionServilleta))
    assert pausa.MotivoPausaProduccion == MOTIVO
    assert pausa.FechaHoraPausa == FECHA_BASE
    assert respuesta.FechaHoraReanudacion is None


def test_reanudar_sin_pausa_activa_lanza_409(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion_servilleta(id_estado=ESTADO_PRODUCCION_PAUSA)
    repo.ObtenerPausaActiva.return_value = None

    with pytest.raises(HTTPException) as error:
        _ejecutar(servicio, "ReanudarProduccionServilleta", ReanudarProduccionServilletaRequest, "MotivoReanudacion")

    assert error.value.detail == "No existe una pausa activa para la producción indicada"


@time_machine.travel(FECHA_BASE, tick=False)
def test_reanudar_cierra_la_pausa_y_vuelve_a_produccion(servicio, repo):
    produccion = crear_produccion_servilleta(id_estado=ESTADO_PRODUCCION_PAUSA)
    pausa = crear_pausa_servilleta()
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerPausaActiva.return_value = pausa

    respuesta = _ejecutar(servicio, "ReanudarProduccionServilleta", ReanudarProduccionServilletaRequest, "MotivoReanudacion")

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    assert pausa.FechaHoraReanudacion == FECHA_BASE
    assert pausa.MotivoReanudacion == MOTIVO
    assert respuesta.MotivoPausaProduccion == "Falta de personal"


@time_machine.travel(FECHA_BASE, tick=False)
def test_finalizar_agota_la_sub_bobina_sin_exigir_minimo(servicio, repo):
    produccion = crear_produccion_servilleta()
    sub = crear_sub_bobina(id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION)
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerSubBobinaBloqueada.return_value = sub

    respuesta = _ejecutar(servicio, "FinalizarProduccionServilleta", FinalizarProduccionServilletaRequest)

    repo.ObtenerSubBobinaBloqueada.assert_called_once_with(30)
    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_FINALIZADO
    assert produccion.FechaFinProduccion == FECHA_BASE
    assert sub.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO
    movimiento = next(r for r in repo.Guardar.call_args.args if isinstance(r, MovimientoSubBobina))
    assert movimiento.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA
    assert respuesta.NombreEstadoProduccion == "Finalizado"


@time_machine.travel(FECHA_BASE, tick=False)
def test_cancelar_en_pausa_saca_la_sub_bobina_del_inventario(servicio, repo):
    produccion = crear_produccion_servilleta(id_estado=ESTADO_PRODUCCION_PAUSA)
    sub = crear_sub_bobina(id_estado=ESTADO_MATERIA_PRIMA_EN_PRODUCCION)
    repo.ObtenerProduccionBloqueada.return_value = produccion
    repo.ObtenerSubBobinaBloqueada.return_value = sub

    respuesta = _ejecutar(servicio, "CancelarProduccionServilleta", CancelarProduccionServilletaRequest, "MotivoCancelacion")

    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA
    assert sub.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
    registros = repo.Guardar.call_args.args
    cancelacion = next(r for r in registros if isinstance(r, CancelacionProduccionServilleta))
    movimiento = next(r for r in registros if isinstance(r, MovimientoSubBobina))
    assert cancelacion.MotivoCancelacion == MOTIVO
    assert movimiento.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA
    assert respuesta.IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA


def test_ver_activas_filtra_por_medida(servicio, repo):
    repo.VerProduccionServilletaActivas.return_value = []

    assert servicio.VerProduccionServilletaActivas(VerProduccionServilletaActivasRequest(IdTipoMedidaSubBobina=ID_MEDIDA_435)) == []
    repo.VerProduccionServilletaActivas.assert_called_once_with(ID_MEDIDA_435)


def test_ver_pausas_activas_mapea_las_filas(servicio, repo):
    repo.VerPausasProduccionServilletaActivas.return_value = [
        {
            "IdPausaProduccionServilleta": 60,
            "IdProduccionServilleta": 20,
            "IdSubBobina": 30,
            "CodigoUnidadOrigen": "BS-0001-A",
            "IdTipoMedidaSubBobina": ID_MEDIDA_435,
            "MedidaMm": 435,
            "DescripcionFormato": "435x3",
            "FechaHoraPausa": FECHA_BASE,
            "NombreEstadoProduccion": "Pausa",
        }
    ]

    pausas = servicio.VerPausasProduccionServilletaActivas()

    assert pausas[0].CodigoUnidadOrigen == "BS-0001-A"
    repo.Guardar.assert_not_called()
