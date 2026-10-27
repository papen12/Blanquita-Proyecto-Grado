from datetime import datetime

import pytest
import time_machine
from fastapi import HTTPException, status
from sqlalchemy.sql.functions import now

from app.Constants.Cantidades import CANTIDAD_MAXIMA_CONTEO_PRODUCTO_TERMINADO
from app.Constants.Estados import ESTADO_CONTEO_ABIERTO, ESTADO_CONTEO_ANULADO, ESTADO_CONTEO_CERRADO
from app.Models.InventarioFinal.Conteo import (
    IniciarConteoProductoTerminadoRequest,
    RegistrarCantidadesConteoRequest,
)
from app.Schemas.Producto import ConteoProductoTerminado
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.producto_terminado import (
    ID_ECO_J12,
    ID_LIDER,
    ID_LUX_J24,
    ID_OPERADOR,
    crear_detalle,
    fila_bloqueo,
    fila_conteo,
    fila_detalle,
)

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

MOTIVO = "Conteo semanal"
ANTES_DEL_LIMITE = datetime(2026, 10, 27, 21, 59, 59, tzinfo=ZONA_BOLIVIA)
EN_EL_LIMITE = datetime(2026, 10, 27, 22, 0, 0, tzinfo=ZONA_BOLIVIA)


@pytest.fixture
def conteo_consultable(repo_conteo):
    repo_conteo.ObtenerConteo.return_value = fila_conteo()
    repo_conteo.ObtenerDetalle.return_value = [
        fila_detalle(ID_LUX_J24, sistema=10, fisica=8),
        fila_detalle(ID_ECO_J12, sistema=5, codigo="ECO-J12", id_producto=2, nombre="EcoPack"),
    ]
    return repo_conteo


def _iniciar(servicio, motivo=MOTIVO):
    return servicio.Iniciar(IniciarConteoProductoTerminadoRequest(Motivo=motivo), id_usuario=ID_LIDER)


def _cantidades(*items):
    return RegistrarCantidadesConteoRequest(
        Cantidades=[{"IdPresentacion": i, "CantidadFisica": c} for i, c in items]
    )


def _registrar(servicio, solicitud, id_conteo=3):
    return servicio.RegistrarCantidades(id_conteo, solicitud, id_usuario=ID_OPERADOR)


class TestIniciar:
    @pytest.mark.parametrize("motivo", ["", "abc", "conteo & cierre"])
    def test_motivo_invalido_lanza_422(self, servicio_conteo, repo_conteo, motivo):
        with pytest.raises(HTTPException) as error:
            _iniciar(servicio_conteo, motivo)

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.value.detail.startswith("El motivo es obligatorio")
        repo_conteo.IniciarConteo.assert_not_called()

    @time_machine.travel(EN_EL_LIMITE, tick=False)
    def test_desde_las_22_no_se_puede_iniciar(self, servicio_conteo, repo_conteo):
        with pytest.raises(HTTPException) as error:
            _iniciar(servicio_conteo)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert error.value.detail == "No se puede iniciar un conteo físico después de las 22:00"
        repo_conteo.IniciarConteo.assert_not_called()

    @time_machine.travel(ANTES_DEL_LIMITE, tick=False)
    def test_con_bloqueo_manual_activo_lanza_409(self, servicio_conteo, repo_pt, repo_conteo):
        repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo()

        with pytest.raises(HTTPException) as error:
            _iniciar(servicio_conteo)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert "bloqueo manual activo" in error.value.detail
        repo_conteo.IniciarConteo.assert_not_called()

    @time_machine.travel(ANTES_DEL_LIMITE, tick=False)
    def test_con_otro_conteo_abierto_lanza_409(self, servicio_conteo, repo_conteo):
        repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()

        with pytest.raises(HTTPException) as error:
            _iniciar(servicio_conteo)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert error.value.detail == "Ya hay un conteo físico de producto terminado en curso"

    @time_machine.travel(ANTES_DEL_LIMITE, tick=False)
    def test_inicio_valido_crea_el_conteo_y_lo_devuelve(self, servicio_conteo, conteo_consultable):
        conteo_consultable.IniciarConteo.return_value = 3

        conteo = _iniciar(servicio_conteo, f"  {MOTIVO}  ")

        conteo_consultable.IniciarConteo.assert_called_once_with(ID_LIDER, MOTIVO)
        conteo_consultable.ObtenerConteo.assert_called_once_with(3)
        assert conteo.IdConteoProductoTerminado == 3
        assert conteo.Estado == ESTADO_CONTEO_ABIERTO
        assert [d.Diferencia for d in conteo.Detalle] == [-2, None]
        assert conteo.Detalle[0].NombrePresentacion == "Luxury 24"


class TestRegistrarCantidades:
    def test_sin_cantidades_lanza_422(self, servicio_conteo, repo_conteo):
        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades())

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo_conteo.BloquearConteo.assert_not_called()

    def test_presentaciones_repetidas_lanzan_422(self, servicio_conteo):
        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades((ID_LUX_J24, 1), (ID_LUX_J24, 2)))

        assert error.value.detail == "Hay presentaciones repetidas en el conteo"

    @pytest.mark.parametrize("cantidad", [-1, CANTIDAD_MAXIMA_CONTEO_PRODUCTO_TERMINADO + 1])
    def test_cantidad_fuera_de_rango_lanza_422(self, servicio_conteo, repo_conteo, cantidad):
        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades((ID_LUX_J24, cantidad)))

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.value.detail == f"La cantidad física debe estar entre 0 y {CANTIDAD_MAXIMA_CONTEO_PRODUCTO_TERMINADO}"
        repo_conteo.BloquearConteo.assert_not_called()

    def test_conteo_inexistente_revierte_y_lanza_404(self, servicio_conteo, repo_conteo):
        repo_conteo.BloquearConteo.return_value = None

        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades((ID_LUX_J24, 1)), id_conteo=99)

        assert error.value.status_code == status.HTTP_404_NOT_FOUND
        assert error.value.detail == "No existe el conteo físico N° 99"
        repo_conteo.Revertir.assert_called_once()

    @pytest.mark.parametrize("estado", [ESTADO_CONTEO_CERRADO, ESTADO_CONTEO_ANULADO])
    def test_conteo_que_ya_no_esta_abierto_lanza_409(self, servicio_conteo, repo_conteo, estado):
        repo_conteo.BloquearConteo.return_value = ConteoProductoTerminado(IdConteoProductoTerminado=3, Estado=estado)

        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades((ID_LUX_J24, 1)))

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert error.value.detail == f"El conteo físico N° 3 ya está {estado.lower()}"
        repo_conteo.DetallesBloqueados.assert_not_called()

    def test_presentacion_ajena_al_conteo_revierte_y_lanza_422(self, servicio_conteo, repo_conteo):
        repo_conteo.BloquearConteo.return_value = ConteoProductoTerminado(Estado=ESTADO_CONTEO_ABIERTO)
        repo_conteo.DetallesBloqueados.return_value = {ID_LUX_J24: crear_detalle(ID_LUX_J24, 10)}

        with pytest.raises(HTTPException) as error:
            _registrar(servicio_conteo, _cantidades((ID_LUX_J24, 1), (77, 2)))

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.value.detail == "Las presentaciones 77 no forman parte del conteo físico"
        repo_conteo.Revertir.assert_called_once()
        repo_conteo.Guardar.assert_not_called()

    @pytest.mark.parametrize("cantidad", [0, CANTIDAD_MAXIMA_CONTEO_PRODUCTO_TERMINADO])
    def test_registro_valido_anota_cantidad_usuario_y_hora(self, servicio_conteo, conteo_consultable, cantidad):
        detalle = crear_detalle(ID_LUX_J24, 10)
        otro = crear_detalle(ID_ECO_J12, 5)
        conteo_consultable.BloquearConteo.return_value = ConteoProductoTerminado(Estado=ESTADO_CONTEO_ABIERTO)
        conteo_consultable.DetallesBloqueados.return_value = {ID_LUX_J24: detalle, ID_ECO_J12: otro}

        _registrar(servicio_conteo, _cantidades((ID_LUX_J24, cantidad)))

        assert detalle.CantidadFisica == cantidad
        assert detalle.IdUsuarioConteo == ID_OPERADOR
        assert isinstance(detalle.FechaHoraConteo, now)
        assert otro.CantidadFisica is None
        conteo_consultable.Guardar.assert_called_once()
        conteo_consultable.Revertir.assert_not_called()
