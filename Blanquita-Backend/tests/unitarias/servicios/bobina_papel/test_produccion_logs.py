import pytest
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.Constants.Cantidades import CANTIDAD_INGRESO_LOGS
from app.Constants.Estados import (
    ESTADO_PRODUCCION_CANCELADA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_FINALIZADO,
    ESTADO_PRODUCCION_PAUSA,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import InsertarMovimientoOperadorLogsRequest
from app.Schemas.Produccion import MovimientoOperadorLogs
from app.Services.BobinaPapel.ProduccionBobinaPapelService import TIPO_LOG_DESCUENTO, TIPO_LOG_INGRESO
from tests.dobles.fabricas import crear_produccion

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]


def _solicitud(cantidad, tipo=TIPO_LOG_INGRESO, id_produccion=10):
    return InsertarMovimientoOperadorLogsRequest(
        IdProduccionBobinaTubo=id_produccion,
        IdTipoMovimientoOperadorLogs=tipo,
        CantidadLogs=cantidad,
    )


def _error(servicio, solicitud) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        servicio.InsertarMovimientoOperadorLogs(solicitud, id_usuario=7)
    return error.value


@pytest.mark.parametrize("cantidad", [0, -1])
def test_el_modelo_rechaza_cantidades_menores_a_uno(cantidad):
    with pytest.raises(ValidationError):
        _solicitud(cantidad)


def test_registrar_mas_logs_que_el_maximo_lanza_422_sin_consultar(servicio, repo):
    error = _error(servicio, _solicitud(CANTIDAD_INGRESO_LOGS + 1))

    assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert error.detail == f"La cantidad máxima de ingreso es de {CANTIDAD_INGRESO_LOGS}"
    repo.ObtenerProduccionBloqueada.assert_not_called()


def test_registrar_con_tipo_de_movimiento_invalido_lanza_400(servicio, repo):
    error = _error(servicio, _solicitud(5, tipo=9))

    assert error.status_code == status.HTTP_400_BAD_REQUEST
    repo.ObtenerProduccionBloqueada.assert_not_called()


def test_registrar_en_produccion_inexistente_lanza_404_y_revierte(servicio, repo):
    repo.ObtenerProduccionBloqueada.return_value = None

    error = _error(servicio, _solicitud(5))

    assert error.status_code == status.HTTP_404_NOT_FOUND
    assert error.detail == "No existe la producción con id 10"
    repo.Revertir.assert_called_once()


@pytest.mark.parametrize("estado", [ESTADO_PRODUCCION_FINALIZADO, ESTADO_PRODUCCION_CANCELADA])
def test_registrar_en_produccion_cerrada_lanza_409(servicio, repo, estado):
    repo.ObtenerProduccionBloqueada.return_value = crear_produccion(id_estado=estado)

    error = _error(servicio, _solicitud(5))

    assert error.status_code == status.HTTP_409_CONFLICT
    repo.Guardar.assert_not_called()


@pytest.mark.parametrize("estado", [ESTADO_PRODUCCION_EN_PRODUCCION, ESTADO_PRODUCCION_PAUSA])
def test_registrar_ingreso_suma_al_contador_tambien_en_pausa(servicio, repo, estado):
    produccion = crear_produccion(id_estado=estado, logs=40)
    repo.ObtenerProduccionBloqueada.return_value = produccion

    respuesta = servicio.InsertarMovimientoOperadorLogs(_solicitud(CANTIDAD_INGRESO_LOGS), id_usuario=7)

    assert produccion.CantidadLogsActual == 40 + CANTIDAD_INGRESO_LOGS
    assert respuesta.CantidadTotalActual == 40 + CANTIDAD_INGRESO_LOGS
    assert respuesta.CantidadLogs == CANTIDAD_INGRESO_LOGS


def test_registrar_descuento_resta_del_contador(servicio, repo):
    produccion = crear_produccion(logs=60)
    repo.ObtenerProduccionBloqueada.return_value = produccion

    respuesta = servicio.InsertarMovimientoOperadorLogs(_solicitud(15, tipo=TIPO_LOG_DESCUENTO), id_usuario=7)

    assert produccion.CantidadLogsActual == 45
    assert respuesta.CantidadTotalActual == 45


def test_descontar_exactamente_todo_deja_el_contador_en_cero(servicio, repo):
    produccion = crear_produccion(logs=15)
    repo.ObtenerProduccionBloqueada.return_value = produccion

    servicio.InsertarMovimientoOperadorLogs(_solicitud(15, tipo=TIPO_LOG_DESCUENTO), id_usuario=7)

    assert produccion.CantidadLogsActual == 0


def test_descontar_mas_de_lo_registrado_lanza_409_y_no_modifica(servicio, repo):
    produccion = crear_produccion(logs=10)
    repo.ObtenerProduccionBloqueada.return_value = produccion

    error = _error(servicio, _solicitud(11, tipo=TIPO_LOG_DESCUENTO))

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "La cantidad a descontar supera el total de logs registrados"
    assert produccion.CantidadLogsActual == 10
    repo.Revertir.assert_called_once()
    repo.Guardar.assert_not_called()


def test_registrar_guarda_la_produccion_y_el_movimiento_con_el_usuario(servicio, repo):
    produccion = crear_produccion(logs=0)
    repo.ObtenerProduccionBloqueada.return_value = produccion

    servicio.InsertarMovimientoOperadorLogs(_solicitud(20), id_usuario=7)

    registros = repo.Guardar.call_args.args
    assert registros[0] is produccion
    movimiento = registros[1]
    assert isinstance(movimiento, MovimientoOperadorLogs)
    assert movimiento.IdUsuario == 7
    assert movimiento.CantidadLogs == 20
    assert movimiento.IdTipoMovimientoOperadorLogs == TIPO_LOG_INGRESO
    assert movimiento.IdProduccionBobinaTubo == produccion.IdProduccionBobinaTubo
