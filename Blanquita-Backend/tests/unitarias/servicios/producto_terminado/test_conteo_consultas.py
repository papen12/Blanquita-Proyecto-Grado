from datetime import date, datetime, timedelta, timezone

import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Cantidades import DIAS_MAXIMOS_REPORTE_PRODUCCION, HORAS_ALERTA_CONTEO_ABIERTO
from app.Constants.Estados import ESTADO_CONTEO_ABIERTO, ESTADO_CONTEO_ANULADO, ESTADO_CONTEO_CERRADO, ESTADOS_CONTEO
from app.Services.InventarioFinal.Conteo import conteo_atrasado
from tests.dobles.producto_terminado import FECHA_CONTEO, fila_conteo, fila_detalle

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

INICIO = date(2026, 10, 1)
FIN = date(2026, 10, 27)

AJUSTE_MANUAL = {
    "IdMovimientoProductoTerminado": 40,
    "FechaMovimiento": FECHA_CONTEO,
    "CodigoPresentacion": "LUX-J24",
    "NombreProducto": "Luxury",
    "CantidadRollosUnidades": 24,
    "NombreTipoMovimientoInventario": "Ajuste -",
    "Cantidad": 3,
    "Usuario": "Carlos Pérez",
    "Observacion": "Jabas rotas",
}

DIFERENCIA = {
    "IdPresentacion": 1,
    "CodigoPresentacion": "LUX-J24",
    "IdProducto": 1,
    "NombreProducto": "Luxury",
    "CantidadRollosUnidades": 24,
    "VecesConDiferencia": 2,
    "Faltante": 5,
    "Sobrante": 1,
}


class TestConteoAtrasado:
    @time_machine.travel(FECHA_CONTEO + timedelta(hours=HORAS_ALERTA_CONTEO_ABIERTO, seconds=1), tick=False)
    def test_abierto_por_mas_del_limite_esta_atrasado(self):
        assert conteo_atrasado(fila_conteo()) is True

    @time_machine.travel(FECHA_CONTEO + timedelta(hours=HORAS_ALERTA_CONTEO_ABIERTO), tick=False)
    def test_abierto_justo_en_el_limite_no_esta_atrasado(self):
        assert conteo_atrasado(fila_conteo()) is False

    @time_machine.travel(FECHA_CONTEO + timedelta(days=3), tick=False)
    def test_cerrado_nunca_esta_atrasado(self):
        assert conteo_atrasado(fila_conteo(estado=ESTADO_CONTEO_CERRADO)) is False


def test_ver_activo_sin_conteo(servicio_conteo):
    estado = servicio_conteo.VerActivo()

    assert estado.Abierto is False
    assert estado.HorasAlerta == HORAS_ALERTA_CONTEO_ABIERTO
    assert estado.Conteo is None


def test_ver_activo_con_conteo_incluye_el_detalle(servicio_conteo, repo_conteo):
    repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()
    repo_conteo.ObtenerDetalle.return_value = [fila_detalle(sistema=10, fisica=12)]

    estado = servicio_conteo.VerActivo()

    assert estado.Abierto is True
    assert estado.Conteo.Detalle[0].Diferencia == 2
    assert estado.Conteo.Detalle[0].Unidad == "jabas"
    repo_conteo.ObtenerDetalle.assert_called_once_with(3)


def test_ver_conteo_inexistente_lanza_404(servicio_conteo, repo_conteo):
    repo_conteo.ObtenerConteo.return_value = None

    with pytest.raises(HTTPException) as error:
        servicio_conteo.VerConteo(99)

    assert error.value.status_code == status.HTTP_404_NOT_FOUND


class TestListar:
    def test_fecha_inicio_posterior_al_fin_lanza_422(self, servicio_conteo, repo_conteo):
        with pytest.raises(HTTPException) as error:
            servicio_conteo.Listar(FIN, INICIO)

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo_conteo.ListarConteos.assert_not_called()

    def test_estados_invalidos_lanzan_422(self, servicio_conteo):
        with pytest.raises(HTTPException) as error:
            servicio_conteo.Listar(INICIO, FIN, ["Abierto", "Borrado", "cerrado"])

        assert error.value.detail == "Estados de conteo no válidos: Borrado, cerrado"

    @time_machine.travel(FECHA_CONTEO + timedelta(hours=5), tick=False)
    def test_listar_marca_los_atrasados(self, servicio_conteo, repo_conteo):
        repo_conteo.ListarConteos.return_value = [
            fila_conteo(id_conteo=3),
            fila_conteo(id_conteo=2, estado=ESTADO_CONTEO_CERRADO),
        ]

        conteos = servicio_conteo.Listar(INICIO, FIN, [ESTADO_CONTEO_ABIERTO, ESTADO_CONTEO_CERRADO])

        repo_conteo.ListarConteos.assert_called_once_with(INICIO, FIN, [ESTADO_CONTEO_ABIERTO, ESTADO_CONTEO_CERRADO])
        assert [c.Atrasado for c in conteos] == [True, False]


class TestReporte:
    def test_rango_mayor_al_maximo_lanza_422(self, servicio_conteo, repo_conteo):
        fin = INICIO + timedelta(days=DIAS_MAXIMOS_REPORTE_PRODUCCION)

        with pytest.raises(HTTPException) as error:
            servicio_conteo.Reporte(INICIO, fin, None)

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo_conteo.ListarConteos.assert_not_called()

    def test_rango_maximo_exacto_es_valido(self, servicio_conteo, repo_conteo):
        repo_conteo.ListarConteos.return_value = [fila_conteo(estado=ESTADO_CONTEO_CERRADO)]
        repo_conteo.DiferenciasPorPresentacion.return_value = []

        servicio_conteo.Reporte(INICIO, INICIO + timedelta(days=DIAS_MAXIMOS_REPORTE_PRODUCCION - 1), None)

    def test_sin_conteos_lanza_404(self, servicio_conteo, repo_conteo):
        repo_conteo.ListarConteos.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_conteo.Reporte(INICIO, FIN, None)

        assert error.value.status_code == status.HTTP_404_NOT_FOUND

    def test_sin_filtro_incluye_todos_los_estados_y_las_diferencias(self, servicio_conteo, repo_conteo):
        repo_conteo.ListarConteos.return_value = [fila_conteo(estado=ESTADO_CONTEO_CERRADO)]
        repo_conteo.DiferenciasPorPresentacion.return_value = [DIFERENCIA]

        reporte = servicio_conteo.Reporte(INICIO, FIN, None)

        assert reporte.Estados == list(ESTADOS_CONTEO)
        assert reporte.Presentaciones[0].NombrePresentacion == "Luxury 24"
        assert reporte.Presentaciones[0].Faltante == 5
        repo_conteo.DiferenciasPorPresentacion.assert_called_once_with(INICIO, FIN)

    def test_solo_anulados_no_calcula_diferencias(self, servicio_conteo, repo_conteo):
        repo_conteo.ListarConteos.return_value = [fila_conteo(estado=ESTADO_CONTEO_ANULADO)]

        reporte = servicio_conteo.Reporte(INICIO, FIN, [ESTADO_CONTEO_ANULADO])

        assert reporte.Presentaciones == []
        repo_conteo.DiferenciasPorPresentacion.assert_not_called()


class TestActa:
    def test_conteo_abierto_no_tiene_acta(self, servicio_conteo, repo_conteo):
        repo_conteo.ObtenerConteo.return_value = fila_conteo()
        repo_conteo.ObtenerDetalle.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_conteo.Acta(3)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        repo_conteo.AjustesManuales.assert_not_called()

    def test_acta_incluye_los_ajustes_manuales_desde_el_cierre_anterior(self, servicio_conteo, repo_conteo):
        cierre_anterior = datetime(2026, 10, 20, 18, 0, tzinfo=timezone.utc)
        repo_conteo.ObtenerConteo.return_value = fila_conteo(estado=ESTADO_CONTEO_CERRADO)
        repo_conteo.ObtenerDetalle.return_value = [fila_detalle(sistema=10, fisica=10)]
        repo_conteo.FechaCierreAnterior.return_value = cierre_anterior
        repo_conteo.AjustesManuales.return_value = [AJUSTE_MANUAL]

        acta = servicio_conteo.Acta(3)

        repo_conteo.FechaCierreAnterior.assert_called_once_with(3, FECHA_CONTEO)
        repo_conteo.AjustesManuales.assert_called_once_with(cierre_anterior, FECHA_CONTEO)
        assert acta.AjustesManualesDesde == cierre_anterior
        assert acta.AjustesManuales[0].NombrePresentacion == "Luxury 24"
        assert acta.Detalle[0].Diferencia == 0


class TestHoja:
    def test_sin_conteo_usa_las_presentaciones_actuales(self, servicio_conteo, repo_conteo):
        repo_conteo.PresentacionesParaConteo.return_value = [fila_detalle()]

        hoja = servicio_conteo.Hoja()

        assert hoja.IdConteoProductoTerminado is None
        assert hoja.FechaHoraInicio is None
        assert len(hoja.Presentaciones) == 1
        repo_conteo.ObtenerDetalle.assert_not_called()

    def test_con_conteo_abierto_usa_su_detalle(self, servicio_conteo, repo_conteo):
        repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()
        repo_conteo.ObtenerDetalle.return_value = [fila_detalle(), fila_detalle(2, codigo="ECO-J12", id_producto=2, nombre="EcoPack")]

        hoja = servicio_conteo.Hoja()

        assert hoja.IdConteoProductoTerminado == 3
        assert hoja.FechaHoraInicio == FECHA_CONTEO
        assert [p.CodigoPresentacion for p in hoja.Presentaciones] == ["LUX-J24", "ECO-J12"]
        repo_conteo.PresentacionesParaConteo.assert_not_called()

    def test_sin_presentaciones_lanza_404(self, servicio_conteo, repo_conteo):
        repo_conteo.PresentacionesParaConteo.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_conteo.Hoja()

        assert error.value.status_code == status.HTTP_404_NOT_FOUND
