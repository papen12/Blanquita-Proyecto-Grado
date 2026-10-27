from itertools import count

import pytest
from fastapi import HTTPException, status
from sqlalchemy.sql.functions import now

from app.Constants.Estados import (
    ESTADO_CONTEO_ABIERTO,
    ESTADO_CONTEO_ANULADO,
    ESTADO_CONTEO_CERRADO,
    MOVIMIENTO_PT_AJUSTE_NEGATIVO,
    MOVIMIENTO_PT_AJUSTE_POSITIVO,
)
from app.Models.InventarioFinal.Conteo import (
    AnularConteoProductoTerminadoRequest,
    CerrarConteoProductoTerminadoRequest,
)
from app.Schemas.Producto import (
    ConteoProductoTerminado,
    InventarioProductoTerminado,
    MovimientoProductoTerminado,
)
from tests.dobles.producto_terminado import (
    ID_ECO_J12,
    ID_LIDER,
    ID_LUX_J24,
    ID_MRO_PLANCHA,
    catalogo_presentaciones,
    crear_detalle,
    crear_inventario,
    fila_conteo,
    fila_detalle,
)

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

MOTIVO_FALTANTE = "Dos jabas danadas en el almacen"
MOTIVO_SOBRANTE = "Ingreso sin registrar del turno noche"


def _del_catalogo(ids_presentacion):
    catalogo = catalogo_presentaciones()
    return {i: catalogo[i] for i in ids_presentacion if i in catalogo}


@pytest.fixture
def conteo_abierto(repo_pt, repo_conteo):
    conteo = ConteoProductoTerminado(IdConteoProductoTerminado=3, Estado=ESTADO_CONTEO_ABIERTO)
    agregados = []
    ids = count(500)

    def enlazar():
        for entidad in agregados:
            if isinstance(entidad, MovimientoProductoTerminado):
                entidad.IdMovimientoProductoTerminado = next(ids)

    repo_conteo.BloquearConteo.return_value = conteo
    repo_conteo.Agregar.side_effect = agregados.append
    repo_conteo.Enlazar.side_effect = enlazar
    repo_conteo.ObtenerConteo.return_value = fila_conteo(estado=ESTADO_CONTEO_CERRADO)
    repo_conteo.ObtenerDetalle.return_value = [fila_detalle()]
    repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo
    conteo.agregados = agregados
    return conteo


def _preparar(repo_conteo, detalles, inventarios):
    repo_conteo.DetallesBloqueados.return_value = {d.IdPresentacion: d for d in detalles}
    repo_conteo.InventariosBloqueados.return_value = {
        i: crear_inventario(i, cantidad) for i, cantidad in inventarios.items()
    }
    return repo_conteo.InventariosBloqueados.return_value


def _cerrar(servicio, motivos=(), confirmado=True):
    return servicio.Cerrar(
        3,
        CerrarConteoProductoTerminadoRequest(
            Motivos=[{"IdPresentacion": i, "Motivo": m} for i, m in motivos],
            Confirmado=confirmado,
        ),
        id_usuario=ID_LIDER,
    )


def _error_cerrar(servicio, **opciones) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        _cerrar(servicio, **opciones)
    return error.value


class TestCerrar:
    def test_sin_confirmar_lanza_422_sin_bloquear(self, servicio_conteo, repo_conteo):
        error = _error_cerrar(servicio_conteo, confirmado=False)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == "Debe confirmar que desea cerrar el conteo físico"
        repo_conteo.BloquearConteo.assert_not_called()

    def test_motivos_repetidos_lanzan_422(self, servicio_conteo, repo_conteo):
        error = _error_cerrar(servicio_conteo, motivos=[(ID_LUX_J24, MOTIVO_FALTANTE), (ID_LUX_J24, MOTIVO_SOBRANTE)])

        assert error.detail == "Hay presentaciones repetidas en los motivos"
        repo_conteo.BloquearConteo.assert_not_called()

    def test_con_presentaciones_sin_contar_revierte_y_lanza_409(self, servicio_conteo, repo_conteo, conteo_abierto):
        _preparar(repo_conteo, [crear_detalle(ID_LUX_J24, 10, 10), crear_detalle(ID_ECO_J12, 5)], {})

        error = _error_cerrar(servicio_conteo)

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == "Faltan 1 presentaciones por contar antes de cerrar el conteo"
        repo_conteo.Revertir.assert_called_once()

    @pytest.mark.parametrize("motivo", [None, "", "abc", "danado & roto"])
    def test_diferencia_sin_motivo_valido_lanza_422_con_los_codigos(self, servicio_conteo, repo_conteo, conteo_abierto, motivo):
        _preparar(repo_conteo, [crear_detalle(ID_LUX_J24, 10, 8), crear_detalle(ID_ECO_J12, 5, 6)], {})
        motivos = [(ID_LUX_J24, motivo)] if motivo is not None else []

        error = _error_cerrar(servicio_conteo, motivos=motivos)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail.endswith("Revise: LUX-J24, ECO-J12")
        repo_conteo.Revertir.assert_called_once()
        repo_conteo.InventariosBloqueados.assert_not_called()

    def test_stock_que_cambio_durante_el_conteo_revierte_y_lanza_409(self, servicio_conteo, repo_conteo, conteo_abierto):
        _preparar(repo_conteo, [crear_detalle(ID_LUX_J24, 10, 10), crear_detalle(ID_ECO_J12, 5, 5)], {ID_LUX_J24: 12, ID_ECO_J12: 5})

        error = _error_cerrar(servicio_conteo)

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == "El stock de LUX-J24 cambió durante el conteo, anule este conteo e inicie uno nuevo"
        repo_conteo.Revertir.assert_called_once()
        repo_conteo.Guardar.assert_not_called()

    def test_sin_diferencias_cierra_sin_ajustes_ni_motivos(self, servicio_conteo, repo_conteo, conteo_abierto):
        _preparar(repo_conteo, [crear_detalle(ID_LUX_J24, 10, 10), crear_detalle(ID_MRO_PLANCHA, 0, 0)], {ID_LUX_J24: 10})

        _cerrar(servicio_conteo)

        assert conteo_abierto.agregados == []
        assert conteo_abierto.Estado == ESTADO_CONTEO_CERRADO
        assert conteo_abierto.IdUsuarioCierre == ID_LIDER
        assert isinstance(conteo_abierto.FechaHoraCierre, now)
        repo_conteo.Guardar.assert_called_once()

    def test_con_diferencias_genera_ajustes_y_los_enlaza(self, servicio_conteo, repo_conteo, conteo_abierto):
        faltante = crear_detalle(ID_LUX_J24, 10, 8)
        sobrante = crear_detalle(ID_ECO_J12, 5, 9)
        igual = crear_detalle(ID_MRO_PLANCHA, 3, 3)
        inventarios = _preparar(repo_conteo, [faltante, sobrante, igual], {ID_LUX_J24: 10, ID_ECO_J12: 5, ID_MRO_PLANCHA: 3})
        repo_conteo.IdTurnoActual.return_value = 2

        _cerrar(
            servicio_conteo,
            motivos=[(ID_LUX_J24, f"  {MOTIVO_FALTANTE} "), (ID_ECO_J12, MOTIVO_SOBRANTE), (ID_MRO_PLANCHA, "")],
        )

        movimientos = [e for e in conteo_abierto.agregados if isinstance(e, MovimientoProductoTerminado)]
        assert [(m.IdPresentacion, m.IdTipoMovimientoInventario, int(m.CantidadIngresoInventario)) for m in movimientos] == [
            (ID_LUX_J24, MOVIMIENTO_PT_AJUSTE_NEGATIVO, 2),
            (ID_ECO_J12, MOVIMIENTO_PT_AJUSTE_POSITIVO, 4),
        ]
        assert movimientos[0].Observacion == f"Conteo físico N° 3: {MOTIVO_FALTANTE}"
        assert all(m.IdUsuario == ID_LIDER and m.IdTurno == 2 for m in movimientos)

        assert int(inventarios[ID_LUX_J24].CantidadActual) == 8
        assert int(inventarios[ID_ECO_J12].CantidadActual) == 9
        assert int(inventarios[ID_MRO_PLANCHA].CantidadActual) == 3

        assert faltante.IdMovimientoProductoTerminado == movimientos[0].IdMovimientoProductoTerminado
        assert sobrante.IdMovimientoProductoTerminado == movimientos[1].IdMovimientoProductoTerminado
        assert faltante.MotivoDiferencia == MOTIVO_FALTANTE
        assert igual.IdMovimientoProductoTerminado is None
        assert igual.MotivoDiferencia is None

        llamadas = [c[0] for c in repo_conteo.mock_calls if c[0] in ("Agregar", "Enlazar", "Guardar")]
        assert llamadas[-2:] == ["Enlazar", "Guardar"]

    def test_diferencia_en_presentacion_sin_inventario_lo_crea(self, servicio_conteo, repo_conteo, conteo_abierto):
        _preparar(repo_conteo, [crear_detalle(ID_MRO_PLANCHA, 0, 6)], {})

        _cerrar(servicio_conteo, motivos=[(ID_MRO_PLANCHA, MOTIVO_SOBRANTE)])

        inventario = next(e for e in conteo_abierto.agregados if isinstance(e, InventarioProductoTerminado))
        assert inventario.IdPresentacion == ID_MRO_PLANCHA
        assert inventario.CantidadActual == 6


class TestAnular:
    def _anular(self, servicio, motivo="Se contó la bodega equivocada", confirmado=True):
        return servicio.Anular(
            3, AnularConteoProductoTerminadoRequest(Motivo=motivo, Confirmado=confirmado), id_usuario=ID_LIDER
        )

    def test_sin_confirmar_lanza_422(self, servicio_conteo, repo_conteo):
        with pytest.raises(HTTPException) as error:
            self._anular(servicio_conteo, confirmado=False)

        assert error.value.detail == "Debe confirmar que desea anular el conteo físico"
        repo_conteo.BloquearConteo.assert_not_called()

    def test_motivo_invalido_lanza_422(self, servicio_conteo, repo_conteo):
        with pytest.raises(HTTPException) as error:
            self._anular(servicio_conteo, motivo="no")

        assert error.value.detail.startswith("El motivo de anulación es obligatorio")
        repo_conteo.BloquearConteo.assert_not_called()

    def test_conteo_ya_cerrado_no_se_puede_anular(self, servicio_conteo, repo_conteo):
        repo_conteo.BloquearConteo.return_value = ConteoProductoTerminado(Estado=ESTADO_CONTEO_CERRADO)

        with pytest.raises(HTTPException) as error:
            self._anular(servicio_conteo)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        repo_conteo.Guardar.assert_not_called()

    def test_anular_marca_el_conteo_sin_tocar_el_inventario(self, servicio_conteo, repo_conteo, conteo_abierto):
        self._anular(servicio_conteo, motivo="  Se contó la bodega equivocada  ")

        assert conteo_abierto.Estado == ESTADO_CONTEO_ANULADO
        assert conteo_abierto.MotivoAnulacion == "Se contó la bodega equivocada"
        assert conteo_abierto.IdUsuarioCierre == ID_LIDER
        repo_conteo.DetallesBloqueados.assert_not_called()
        repo_conteo.InventariosBloqueados.assert_not_called()
        repo_conteo.Agregar.assert_not_called()
        repo_conteo.Guardar.assert_called_once()
