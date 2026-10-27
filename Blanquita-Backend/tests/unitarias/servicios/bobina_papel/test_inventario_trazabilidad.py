from decimal import Decimal

import pytest
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_ALMACEN,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    MOVIMIENTO_MATERIA_PRIMA_CORRECCION,
    MOVIMIENTO_MATERIA_PRIMA_INGRESO,
    MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA,
    MOVIMIENTO_MATERIA_PRIMA_REINGRESO,
    MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA,
    MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
)
from app.Models.BobinaPapel.BobinaPapel import EditarBobinaPapelRequest, IngresoModelo
from app.Models.BobinaPapel.InventarioBobinaPapel import (
    ReingresarBobinaAInventarioRequest,
    VerDetalleInventarioBobinaPapelRequest,
)
from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    CancelarProduccionBobinaTuboRequest,
    FinalizarProduccionBobinaTuboRequest,
    IniciarProduccionBobinaTuboRequest,
    InsertarMovimientoOperadorLogsRequest,
    PausarProduccionBobinaTuboRequest,
)
from app.Schemas.BobinaPapel import MovimientoBobina
from tests.dobles.bobina_papel import ID_PROVEEDOR_ACTIVO, bobina_ingreso
from tests.dobles.fabricas import FECHA_BASE, ID_TIPO_HIGIENICO, PRODUCTO_LUX, crear_bobina

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]

OBSERVACION = "Bobina revisada, sin dano en el nucleo"


def _reingresar(servicio, observacion=OBSERVACION, id_bobina=1):
    return servicio.ReingresarBobinaInventario(
        ReingresarBobinaAInventarioRequest(IdBobinaPapel=id_bobina, Observacion=observacion), 2
    )


class TestReingreso:
    @pytest.mark.parametrize("observacion", ["", "   ", "abcd", "bobina #1 & #2"])
    def test_observacion_invalida_lanza_422_sin_consultar(self, servicio_inventario, repo_inventario, observacion):
        with pytest.raises(HTTPException) as error:
            _reingresar(servicio_inventario, observacion)

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo_inventario.ObtenerBobinaBloqueada.assert_not_called()

    def test_bobina_inexistente_revierte_y_lanza_404(self, servicio_inventario, repo_inventario):
        repo_inventario.ObtenerBobinaBloqueada.return_value = None

        with pytest.raises(HTTPException) as error:
            _reingresar(servicio_inventario, id_bobina=99)

        assert error.value.detail == "La bobina de papel con id 99 no existe"
        repo_inventario.Revertir.assert_called_once()

    @pytest.mark.parametrize(
        "estado",
        [ESTADO_MATERIA_PRIMA_EN_ALMACEN, ESTADO_MATERIA_PRIMA_EN_PRODUCCION, ESTADO_MATERIA_PRIMA_AGOTADO],
    )
    def test_solo_se_reingresa_lo_que_esta_fuera_de_inventario(self, servicio_inventario, repo_inventario, estado):
        repo_inventario.ObtenerBobinaBloqueada.return_value = crear_bobina(1, id_estado=estado)

        with pytest.raises(HTTPException) as error:
            _reingresar(servicio_inventario)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert error.value.detail == "La bobina BP-0001 no está Fuera de Inventario, no puede reingresarse"
        repo_inventario.Revertir.assert_called_once()
        repo_inventario.RegistrarMovimiento.assert_not_called()

    def test_reingreso_vuelve_la_bobina_al_almacen_con_movimiento(self, servicio_inventario, repo_inventario):
        bobina = crear_bobina(1, id_estado=ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO)
        repo_inventario.ObtenerBobinaBloqueada.return_value = bobina

        respuesta = _reingresar(servicio_inventario, f"  {OBSERVACION}  ")

        _, movimiento, id_estado = repo_inventario.RegistrarMovimiento.call_args.args
        assert id_estado == ESTADO_MATERIA_PRIMA_EN_ALMACEN
        assert movimiento.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_REINGRESO
        assert movimiento.Observacion == OBSERVACION
        assert movimiento.IdUsuario == 2
        assert bobina.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN
        assert respuesta.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN


class TestConsultasInventario:
    def test_resumen_vacio_se_considera_error_del_servidor(self, servicio_inventario, repo_inventario):
        repo_inventario.VerResumen.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_inventario.VerResumen()

        assert error.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_resumen_con_nivel_de_stock(self, servicio_inventario, repo_inventario):
        repo_inventario.VerResumen.return_value = [
            {
                "IdTipoBobina": 1, "NombreTipoBobina": "Higiénico", "Activo": True, "CantidadBobinas": 3,
                "PesoNetoTotalKg": Decimal("2094"), "GramajePromedio": Decimal("13.9"),
                "StockMinimo": 4, "StockPreventivo": 8, "NivelStock": "Crítico",
            }
        ]

        resumen = servicio_inventario.VerResumen()

        assert resumen[0].NivelStock == "Crítico"

    def test_detalle_sin_bobinas_lanza_404(self, servicio_inventario, repo_inventario):
        repo_inventario.VerDetalle.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_inventario.VerDetalle(VerDetalleInventarioBobinaPapelRequest(IdTipoBobina=1))

        assert error.value.status_code == status.HTTP_404_NOT_FOUND
        repo_inventario.VerDetalle.assert_called_once_with(1)

    def test_detalle_marca_las_reingresadas(self, servicio_inventario, repo_inventario):
        repo_inventario.VerDetalle.return_value = [
            {
                "IdBobinaPapel": 1, "CodigoBobina": "BP-0001", "CodigoLote": "L-1", "FechaRecepcion": FECHA_BASE.date(),
                "NombreProveedor": "Papelera Andina", "PesoBrutoKg": Decimal("736"), "PesoNetoKg": Decimal("698"),
                "Gramaje": Decimal("13.9"), "Reingresada": True, "FechaUltimoReingreso": FECHA_BASE,
            }
        ]

        assert servicio_inventario.VerDetalle(VerDetalleInventarioBobinaPapelRequest(IdTipoBobina=1))[0].Reingresada is True

    def test_fuera_de_inventario_vacio_lanza_404(self, servicio_inventario, repo_inventario):
        repo_inventario.VerBobinasFueraInventario.return_value = []

        with pytest.raises(HTTPException) as error:
            servicio_inventario.VerBobinasFueraInventario()

        assert error.value.detail == "No hay bobinas fuera de inventario"

    def test_fuera_de_inventario_mapea_las_filas(self, servicio_inventario, repo_inventario):
        repo_inventario.VerBobinasFueraInventario.return_value = [
            {
                "IdBobinaPapel": 1, "CodigoBobina": "BP-0001", "NombreTipoBobina": "Higiénico", "PesoBrutoKg": 736.0,
                "Gramaje": 13.9, "NombreProveedor": "Papelera Andina", "FechaRecepcion": FECHA_BASE.date(),
                "UltimaObservacion": "Retiro por cancelación", "FechaUltimoMovimiento": FECHA_BASE,
            }
        ]

        assert servicio_inventario.VerBobinasFueraInventario()[0].CodigoBobina == "BP-0001"


class TestTrazabilidad:
    def _ingresar(self, ingreso, *codigos):
        ingreso.InsertarBobinasPapel(
            IngresoModelo(
                IdProveedor=ID_PROVEEDOR_ACTIVO,
                IdTipoBobina=ID_TIPO_HIGIENICO,
                Bobinas=[bobina_ingreso(codigo) for codigo in codigos],
            ),
            7,
        )

    def _iniciar(self, produccion, bobina_1, bobina_2) -> int:
        return produccion.IniciarProduccionBobinaTubo(
            IniciarProduccionBobinaTuboRequest(
                IdBobina1=bobina_1.IdBobinaPapel, IdBobina2=bobina_2.IdBobinaPapel, IdProducto=PRODUCTO_LUX["IdProducto"]
            ),
            7,
        ).IdProduccionBobinaTubo

    def test_un_codigo_ingresado_no_puede_volver_a_ingresar_en_otro_lote(self, planta_papel, almacen_papel):
        ingreso, _, _ = planta_papel
        self._ingresar(ingreso, "bp-0001", "bp-0002")

        with pytest.raises(HTTPException) as error:
            self._ingresar(ingreso, "BP 0002", "BP-0003")

        assert error.value.detail == "Ya existen bobinas registradas con los códigos BP-0002"
        assert len(almacen_papel.lotes) == 1
        assert len(almacen_papel.bobinas) == 2

    def test_la_correccion_no_puede_duplicar_un_codigo_existente(self, planta_papel, almacen_papel):
        ingreso, _, _ = planta_papel
        self._ingresar(ingreso, "BP-0001", "BP-0002")
        primera = almacen_papel.por_codigo("BP-0001")

        with pytest.raises(HTTPException) as error:
            ingreso.EditarBobinaPapel(
                EditarBobinaPapelRequest(
                    IdBobinaPapel=primera.IdBobinaPapel, CodigoBobina="bp 0002", PesoBrutoKg="736", PesoNetoKg="698",
                    Gramaje="13.9", Observacion="Codigo mal copiado de la etiqueta",
                ),
                2,
            )

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert primera.CodigoBobina == "BP-0001"

    def test_historial_completo_de_una_bobina_desde_el_ingreso_hasta_agotarse(self, planta_papel, almacen_papel):
        ingreso, inventario, produccion = planta_papel
        self._ingresar(ingreso, "BP-0001", "BP-0002", "BP-0003")
        b1, b2, b3 = (almacen_papel.por_codigo(c) for c in ("BP-0001", "BP-0002", "BP-0003"))

        ingreso.EditarBobinaPapel(
            EditarBobinaPapelRequest(
                IdBobinaPapel=b1.IdBobinaPapel, CodigoBobina="BP-0001", PesoBrutoKg="740", PesoNetoKg="702",
                Gramaje="13.9", Observacion="Peso corregido con la ficha",
            ),
            2,
        )

        primera = self._iniciar(produccion, b1, b2)
        produccion.PausarProduccion(
            PausarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=primera, MotivoPausaProduccion="Bobina BP-0001 rasgada"), 7
        )
        produccion.CancelarProduccion(
            CancelarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=primera, MotivoCancelacion="Se retira para revision"), 2
        )
        assert b1.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO

        with pytest.raises(HTTPException):
            self._iniciar(produccion, b1, b3)

        inventario.ReingresarBobinaInventario(ReingresarBobinaAInventarioRequest(IdBobinaPapel=b1.IdBobinaPapel, Observacion=OBSERVACION), 2)
        segunda = self._iniciar(produccion, b1, b3)
        produccion.InsertarMovimientoOperadorLogs(
            InsertarMovimientoOperadorLogsRequest(IdProduccionBobinaTubo=segunda, IdTipoMovimientoOperadorLogs=1, CantidadLogs=60),
            7,
        )
        produccion.FinalizarProduccion(FinalizarProduccionBobinaTuboRequest(IdProduccionBobinaTubo=segunda), 2)

        assert almacen_papel.movimientos_de(b1) == [
            MOVIMIENTO_MATERIA_PRIMA_INGRESO,
            MOVIMIENTO_MATERIA_PRIMA_CORRECCION,
            MOVIMIENTO_MATERIA_PRIMA_REINGRESO,
        ]
        tipos_produccion = [
            m.IdTipoMovimiento
            for m in produccion.repository.Guardados(MovimientoBobina)
            if m.IdBobinaPapel == b1.IdBobinaPapel
        ]
        assert tipos_produccion == [
            MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
            MOVIMIENTO_MATERIA_PRIMA_RETIRO_FALLA,
            MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
            MOVIMIENTO_MATERIA_PRIMA_PRODUCCION_TERMINADA,
        ]
        assert b1.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO
        assert b2.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
        assert b3.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO
        assert b1.PesoBrutoKg == Decimal("740")
