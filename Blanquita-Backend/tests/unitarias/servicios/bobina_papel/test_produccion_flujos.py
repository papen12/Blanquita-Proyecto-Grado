import pytest
from fastapi import HTTPException

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_ALMACEN,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    ESTADO_PRODUCCION_CAMBIO_LINEA,
    ESTADO_PRODUCCION_CANCELADA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_FINALIZADO,
    MOVIMIENTO_MATERIA_PRIMA_CAMBIO_LINEA,
    MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA,
    MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA,
    MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    CambiarLineaProduccionBobinaTuboRequest,
    CancelarProduccionBobinaTuboRequest,
    FinalizarProduccionBobinaTuboRequest,
    IniciarProduccionBobinaTuboRequest,
    InsertarMovimientoOperadorLogsRequest,
    PausarProduccionBobinaTuboRequest,
    ReanudarProduccionBobinaTuboRequest,
)
from app.Schemas.BobinaPapel import MovimientoBobina
from app.Schemas.Produccion import (
    CancelacionProduccionBobinaTubo,
    MovimientoOperadorLogs,
    PausaProduccionBobinaTubo,
)
from app.Services.BobinaPapel.ProduccionBobinaPapelService import TIPO_LOG_DESCUENTO, TIPO_LOG_INGRESO
from tests.dobles.fabricas import PRODUCTO_ECO, PRODUCTO_LUX

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]

OPERADOR = 7
LIDER = 2


def _iniciar(servicio, id_1=1, id_2=2, id_producto=PRODUCTO_LUX["IdProducto"]) -> int:
    respuesta = servicio.IniciarProduccionBobinaTubo(
        IniciarProduccionBobinaTuboRequest(IdBobina1=id_1, IdBobina2=id_2, IdProducto=id_producto),
        id_usuario=OPERADOR,
    )
    return respuesta.IdProduccionBobinaTubo


def _logs(servicio, id_produccion, cantidad, tipo=TIPO_LOG_INGRESO):
    return servicio.InsertarMovimientoOperadorLogs(
        InsertarMovimientoOperadorLogsRequest(
            IdProduccionBobinaTubo=id_produccion,
            IdTipoMovimientoOperadorLogs=tipo,
            CantidadLogs=cantidad,
        ),
        id_usuario=OPERADOR,
    )


def _pausar(servicio, id_produccion, motivo="Falta de pegamento"):
    servicio.PausarProduccion(
        PausarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=id_produccion, MotivoPausaProduccion=motivo),
        id_usuario=OPERADOR,
    )


def _reanudar(servicio, id_produccion, motivo="Llego el pegamento"):
    servicio.ReanudarProduccion(
        ReanudarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=id_produccion, MotivoReanudacion=motivo),
        id_usuario=OPERADOR,
    )


def _movimientos_bobina(fake_repo, tipo):
    return [m for m in fake_repo.Guardados(MovimientoBobina) if m.IdTipoMovimiento == tipo]


def test_flujo_completo_iniciar_pausar_reanudar_y_finalizar(servicio_fake, fake_repo):
    id_produccion = _iniciar(servicio_fake)
    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION

    _logs(servicio_fake, id_produccion, 30)
    _pausar(servicio_fake, id_produccion)
    _logs(servicio_fake, id_produccion, 25)
    _reanudar(servicio_fake, id_produccion)
    total = _logs(servicio_fake, id_produccion, 5, tipo=TIPO_LOG_DESCUENTO).CantidadTotalActual
    assert total == 50

    servicio_fake.FinalizarProduccion(
        FinalizarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=id_produccion), id_usuario=OPERADOR
    )

    produccion = fake_repo.producciones[id_produccion]
    assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_FINALIZADO
    assert produccion.CantidadLogsActual == 50
    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO
    assert fake_repo.bobinas[2].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO

    pausas = fake_repo.Guardados(PausaProduccionBobinaTubo)
    assert len(pausas) == 1
    assert pausas[0].FechaHoraReanudacion is not None
    assert pausas[0].MotivoReanudacion == "Llego el pegamento"
    assert len(fake_repo.Guardados(MovimientoOperadorLogs)) == 3
    assert len(_movimientos_bobina(fake_repo, MOVIMIENTO_MATERIA_PRIMA_TRASLADO)) == 2
    assert len(_movimientos_bobina(fake_repo, MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA)) == 2
    assert fake_repo.reversiones == 0


def test_flujo_sin_produccion_se_pausa_y_se_cancela(servicio_fake, fake_repo):
    id_produccion = _iniciar(servicio_fake)

    with pytest.raises(HTTPException):
        servicio_fake.FinalizarProduccion(
            FinalizarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=id_produccion), id_usuario=OPERADOR
        )
    assert fake_repo.reversiones == 1

    _pausar(servicio_fake, id_produccion, "Bobina con falla de fabrica")
    servicio_fake.CancelarProduccion(
        CancelarProduccionBobinaTuboRequest(
            IdProduccionBobinaTubo=id_produccion, MotivoCancelacion="Bobina defectuosa, se retira"
        ),
        id_usuario=LIDER,
    )

    assert fake_repo.producciones[id_produccion].IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA
    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
    assert fake_repo.bobinas[2].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
    assert len(fake_repo.Guardados(CancelacionProduccionBobinaTubo)) == 1
    assert len(_movimientos_bobina(fake_repo, MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA)) == 2


def test_flujo_cambio_de_linea_conserva_las_bobinas_y_reinicia_el_contador(servicio_fake, fake_repo):
    id_anterior = _iniciar(servicio_fake)
    _logs(servicio_fake, id_anterior, 100)
    _logs(servicio_fake, id_anterior, 20)

    respuesta = servicio_fake.CambiarLineaProduccion(
        CambiarLineaProduccionBobinaTuboRequest(
            IdProduccionBobinaTubo=id_anterior, IdProducto=PRODUCTO_ECO["IdProducto"]
        ),
        id_usuario=LIDER,
    )
    id_nueva = respuesta.IdProduccionBobinaTubo
    _logs(servicio_fake, id_nueva, 60)

    anterior = fake_repo.producciones[id_anterior]
    nueva = fake_repo.producciones[id_nueva]
    assert id_nueva != id_anterior
    assert anterior.IdEstadoProduccion == ESTADO_PRODUCCION_CAMBIO_LINEA
    assert anterior.CantidadLogsActual == 120
    assert nueva.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
    assert nueva.IdProducto == PRODUCTO_ECO["IdProducto"]
    assert nueva.CantidadLogsActual == 60
    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION
    assert len(_movimientos_bobina(fake_repo, MOVIMIENTO_MATERIA_PRIMA_CAMBIO_LINEA)) == 2


def test_una_bobina_en_produccion_no_puede_iniciar_otra_produccion(servicio_fake, fake_repo):
    _iniciar(servicio_fake, 1, 2)

    with pytest.raises(HTTPException) as error:
        _iniciar(servicio_fake, 2, 3)

    assert error.value.status_code == 409
    assert fake_repo.bobinas[3].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN
    assert len(fake_repo.producciones) == 1


def test_no_se_pueden_registrar_logs_despues_de_finalizar(servicio_fake):
    id_produccion = _iniciar(servicio_fake)
    _logs(servicio_fake, id_produccion, 50)
    servicio_fake.FinalizarProduccion(
        FinalizarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=id_produccion), id_usuario=OPERADOR
    )

    with pytest.raises(HTTPException) as error:
        _logs(servicio_fake, id_produccion, 1)

    assert error.value.status_code == 409


def test_dos_pausas_seguidas_solo_dejan_una_pausa_abierta(servicio_fake, fake_repo):
    id_produccion = _iniciar(servicio_fake)
    _pausar(servicio_fake, id_produccion)

    with pytest.raises(HTTPException):
        _pausar(servicio_fake, id_produccion, "Otra pausa encima")

    assert len(fake_repo.Guardados(PausaProduccionBobinaTubo)) == 1
