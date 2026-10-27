from datetime import date, datetime
from decimal import Decimal

import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import ESTADO_MATERIA_PRIMA_EN_ALMACEN, MOVIMIENTO_MATERIA_PRIMA_CORRECCION
from app.Models.BobinaPapel.BobinaPapel import EditarBobinaPapelRequest, IngresoModelo
from app.Schemas.BobinaPapel import BobinaPapel, LoteBobina
from app.Services.BobinaPapel.BobinaPapelService import OBSERVACION_INGRESO_BOBINA
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.bobina_papel import (
    ID_PROVEEDOR_ACTIVO,
    ID_PROVEEDOR_INACTIVO,
    ID_TIPO_ECONOMICO_INACTIVO,
    bobina_ingreso,
)
from tests.dobles.fabricas import ID_TIPO_HIGIENICO, crear_bobina

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]

MOTIVO = "Peso mal leido en la balanza"


def _lote(*bobinas, proveedor=ID_PROVEEDOR_ACTIVO, tipo=ID_TIPO_HIGIENICO):
    return IngresoModelo(IdProveedor=proveedor, IdTipoBobina=tipo, Bobinas=list(bobinas))


def _error(funcion, *argumentos) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        funcion(*argumentos)
    return error.value


class TestIngresoLote:
    def test_lote_vacio_lanza_400(self, servicio_ingreso, repo_ingreso):
        error = _error(servicio_ingreso.InsertarBobinasPapel, _lote(), 7)

        assert error.status_code == status.HTTP_400_BAD_REQUEST
        repo_ingreso.ObtenerProveedor.assert_not_called()

    @pytest.mark.parametrize(
        ("codigo", "detalle"),
        [
            ("", "El código de la bobina es obligatorio"),
            ("ab", "El código de la bobina «AB» no es válido"),
            ("BP#01", "El código de la bobina «BP#01» no es válido"),
        ],
    )
    def test_codigo_invalido_lanza_422(self, servicio_ingreso, repo_ingreso, codigo, detalle):
        error = _error(servicio_ingreso.InsertarBobinasPapel, _lote(bobina_ingreso(codigo)), 7)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail.startswith(detalle)
        repo_ingreso.RegistrarLote.assert_not_called()

    @pytest.mark.parametrize(
        ("bruto", "neto", "gramaje", "detalle"),
        [
            ("99.99", "60", "13.9", "El peso bruto de la bobina BP-0001 debe estar entre 100 y 1500 kg"),
            ("1500.01", "700", "13.9", "El peso bruto de la bobina BP-0001 debe estar entre 100 y 1500 kg"),
            ("736", "0", "13.9", "El peso neto de la bobina BP-0001 debe ser mayor a 0 y como máximo 1500 kg"),
            ("736", "736.01", "13.9", "El peso neto de la bobina BP-0001 no puede superar a su peso bruto"),
            ("736", "698", "50.1", "El gramaje de la bobina BP-0001 debe ser mayor a 0 y como máximo 50 g/m²"),
            ("736.123", "698", "13.9", "El peso bruto de la bobina BP-0001 admite como máximo 2 decimales"),
            (None, "698", "13.9", "Falta el peso bruto de la bobina BP-0001"),
        ],
        ids=["bruto-bajo", "bruto-alto", "neto-cero", "neto-mayor-bruto", "gramaje-alto", "tres-decimales", "sin-bruto"],
    )
    def test_medidas_fuera_de_rango_indican_la_bobina(self, servicio_ingreso, repo_ingreso, bruto, neto, gramaje, detalle):
        error = _error(servicio_ingreso.InsertarBobinasPapel, _lote(bobina_ingreso("bp 0001", bruto, neto, gramaje)), 7)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == detalle
        repo_ingreso.RegistrarLote.assert_not_called()

    def test_neto_igual_al_bruto_y_sin_gramaje_se_acepta(self, servicio_ingreso, repo_ingreso):
        servicio_ingreso.InsertarBobinasPapel(_lote(bobina_ingreso("BP-0001", "736", "736", None)), 7)

        bobina = repo_ingreso.RegistrarLote.call_args.args[1][0]
        assert bobina.PesoNetoKg == bobina.PesoBrutoKg
        assert bobina.Gramaje is None

    def test_codigos_repetidos_tras_normalizar_lanzan_400(self, servicio_ingreso, repo_ingreso):
        lote = _lote(bobina_ingreso("bp 0001"), bobina_ingreso("BP-0001"), bobina_ingreso("bp-0002"), bobina_ingreso("BP 0002"))

        error = _error(servicio_ingreso.InsertarBobinasPapel, lote, 7)

        assert error.status_code == status.HTTP_400_BAD_REQUEST
        assert error.detail == "Los códigos BP-0001, BP-0002 están repetidos en el lote"
        repo_ingreso.ObtenerProveedor.assert_not_called()

    @pytest.mark.parametrize(
        ("proveedor", "tipo", "codigo", "detalle"),
        [
            (99, ID_TIPO_HIGIENICO, status.HTTP_404_NOT_FOUND, "El proveedor con id 99 no existe"),
            (ID_PROVEEDOR_INACTIVO, ID_TIPO_HIGIENICO, status.HTTP_409_CONFLICT, "El proveedor Papeles del Sur está inactivo, no se puede registrar el lote"),
            (ID_PROVEEDOR_ACTIVO, 99, status.HTTP_404_NOT_FOUND, "El tipo de bobina con id 99 no existe"),
            (ID_PROVEEDOR_ACTIVO, ID_TIPO_ECONOMICO_INACTIVO, status.HTTP_409_CONFLICT, "El tipo de bobina Económico está inactivo, no se puede registrar el lote"),
        ],
        ids=["proveedor-inexistente", "proveedor-inactivo", "tipo-inexistente", "tipo-inactivo"],
    )
    def test_proveedor_y_tipo_deben_existir_y_estar_activos(self, servicio_ingreso, repo_ingreso, proveedor, tipo, codigo, detalle):
        error = _error(servicio_ingreso.InsertarBobinasPapel, _lote(bobina_ingreso("BP-0001"), proveedor=proveedor, tipo=tipo), 7)

        assert (error.status_code, error.detail) == (codigo, detalle)
        repo_ingreso.RegistrarLote.assert_not_called()

    def test_codigos_ya_registrados_en_otro_lote_lanzan_409(self, servicio_ingreso, repo_ingreso):
        repo_ingreso.CodigosRegistrados.return_value = ["BP-0002", "BP-0001"]

        error = _error(servicio_ingreso.InsertarBobinasPapel, _lote(bobina_ingreso("bp-0001"), bobina_ingreso("bp-0002"), bobina_ingreso("bp-0003")), 7)

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == "Ya existen bobinas registradas con los códigos BP-0001, BP-0002"
        repo_ingreso.CodigosRegistrados.assert_called_once_with(["BP-0001", "BP-0002", "BP-0003"])

    @time_machine.travel(datetime(2026, 10, 27, 23, 30, tzinfo=ZONA_BOLIVIA), tick=False)
    def test_lote_valido_se_registra_con_fecha_de_la_paz_y_bobinas_en_almacen(self, servicio_ingreso, repo_ingreso):
        respuesta = servicio_ingreso.InsertarBobinasPapel(
            _lote(bobina_ingreso("bp 0001", "736.5", "698.5"), bobina_ingreso("bp 0002", "740", "702", "13")), 7
        )

        lote, bobinas, id_usuario, observacion = repo_ingreso.RegistrarLote.call_args.args
        assert isinstance(lote, LoteBobina)
        assert lote.IdProveedor == ID_PROVEEDOR_ACTIVO
        assert lote.IdUsuario == 7
        assert lote.FechaRecepcion == date(2026, 10, 27)
        assert all(isinstance(b, BobinaPapel) for b in bobinas)
        assert [b.CodigoBobina for b in bobinas] == ["BP-0001", "BP-0002"]
        assert all(b.IdTipoBobina == ID_TIPO_HIGIENICO for b in bobinas)
        assert all(b.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN for b in bobinas)
        assert (bobinas[0].PesoBrutoKg, bobinas[0].PesoNetoKg, bobinas[0].Gramaje) == (Decimal("736.5"), Decimal("698.5"), Decimal("13.9"))
        assert observacion == OBSERVACION_INGRESO_BOBINA
        assert (respuesta.FechaRecepcion, respuesta.CantidadBobinas) == (date(2026, 10, 27), 2)

    def test_tipos_para_el_formulario_incluyen_la_tara(self, servicio_ingreso, repo_ingreso):
        repo_ingreso.ObtenerTipoBobinaPapel.return_value = [
            {"IdTipoBobina": 1, "NombreTipoBobina": "Higiénico", "Activo": True, "TaraKg": Decimal("38")}
        ]

        tipos = servicio_ingreso.ObtenerTiposBobinaPapel()

        assert tipos[0].TaraKg == Decimal("38")


class TestEditarBobina:
    def _editar(self, servicio, codigo="BP-0001", bruto="736", neto="698", gramaje="13.9", motivo=MOTIVO):
        return servicio.EditarBobinaPapel(
            EditarBobinaPapelRequest(
                IdBobinaPapel=1, CodigoBobina=codigo, PesoBrutoKg=bruto, PesoNetoKg=neto, Gramaje=gramaje, Observacion=motivo
            ),
            7,
        )

    def _bobina(self, repo_ingreso):
        bobina = crear_bobina(1)
        bobina.PesoBrutoKg, bobina.PesoNetoKg, bobina.Gramaje = Decimal("736"), Decimal("698"), Decimal("13.9")
        repo_ingreso.ObtenerBobinaBloqueada.return_value = bobina
        return bobina

    @pytest.mark.parametrize("motivo", [None, "", "abc", "error <balanza>"])
    def test_motivo_invalido_lanza_422_sin_consultar(self, servicio_ingreso, repo_ingreso, motivo):
        error = _error(self._editar, servicio_ingreso, "BP-0001", "736", "698", "13.9", motivo)

        assert error.detail.startswith("El motivo de la corrección es obligatorio")
        repo_ingreso.ObtenerBobinaBloqueada.assert_not_called()

    def test_medidas_invalidas_lanzan_422_sin_consultar(self, servicio_ingreso, repo_ingreso):
        error = _error(self._editar, servicio_ingreso, "BP-0001", "736", "740")

        assert error.detail == "El peso neto de la bobina BP-0001 no puede superar a su peso bruto"
        repo_ingreso.ObtenerBobinaBloqueada.assert_not_called()

    def test_bobina_inexistente_revierte_y_lanza_404(self, servicio_ingreso, repo_ingreso):
        repo_ingreso.ObtenerBobinaBloqueada.return_value = None

        assert _error(self._editar, servicio_ingreso).status_code == status.HTTP_404_NOT_FOUND
        repo_ingreso.Revertir.assert_called_once()

    def test_sin_cambios_revierte_y_lanza_409(self, servicio_ingreso, repo_ingreso):
        self._bobina(repo_ingreso)

        error = _error(self._editar, servicio_ingreso, "bp 0001", "736.00", "698.0")

        assert error.detail == "No hay cambios para guardar"
        repo_ingreso.Revertir.assert_called_once()

    def test_codigo_nuevo_ya_usado_por_otra_bobina_lanza_409(self, servicio_ingreso, repo_ingreso):
        self._bobina(repo_ingreso)
        repo_ingreso.CodigosRegistrados.return_value = ["BP-0099"]

        error = _error(self._editar, servicio_ingreso, "bp 0099")

        assert error.detail == "Ya existe una bobina registrada con el código BP-0099"
        repo_ingreso.CodigosRegistrados.assert_called_once_with(["BP-0099"], 1)
        repo_ingreso.RegistrarCorreccion.assert_not_called()

    def test_cambiar_solo_pesos_no_revisa_codigos(self, servicio_ingreso, repo_ingreso):
        self._bobina(repo_ingreso)

        self._editar(servicio_ingreso, "BP-0001", "740", "702")

        repo_ingreso.CodigosRegistrados.assert_not_called()

    def test_correccion_registra_antes_y_despues_de_cada_campo(self, servicio_ingreso, repo_ingreso):
        bobina = self._bobina(repo_ingreso)

        respuesta = self._editar(servicio_ingreso, "bp 0002", "740.5", "698", None)

        _, cambios, movimiento = repo_ingreso.RegistrarCorreccion.call_args.args
        assert cambios == {"CodigoBobina": "BP-0002", "PesoBrutoKg": Decimal("740.5"), "Gramaje": None}
        assert movimiento.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_CORRECCION
        assert movimiento.IdUsuario == 7
        assert movimiento.Observacion == (
            "Código: BP-0001 → BP-0002 · Peso bruto: 736 → 740.5 · Gramaje: 13.9 → sin dato"
            f" · Motivo: {MOTIVO}"
        )
        assert bobina.CodigoBobina == "BP-0002"
        assert respuesta.CodigoBobina == "BP-0002"
