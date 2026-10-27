import pytest
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.Constants.Cantidades import (
    CANTIDAD_INGRESO_PRODUCTO_TERMINADO,
    CANTIDAD_SALIDA_PRODUCTO_TERMINADO,
)
from app.Constants.Estados import MOVIMIENTO_PT_ENTRADA, MOVIMIENTO_PT_SALIDA
from app.Models.InventarioFinal.ProductoFinal import (
    IngresoProductoTerminadoRequest,
    SalidaProductoTerminadoItem,
    SalidaProductoTerminadoRequest,
)
from app.Services.InventarioFinal.ProductoFinal import OBSERVACION_INGRESO_PRODUCTO
from tests.dobles.producto_terminado import (
    ID_ECO_J12,
    ID_LUX_INACTIVA,
    ID_LUX_J24,
    ID_OPERADOR,
    catalogo_presentaciones,
    crear_inventario,
    crear_presentacion,
    crear_producto,
    fila_bloqueo,
    fila_conteo,
)

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

OBSERVACION_SALIDA = "Despacho repartidor zona norte"


def _ingreso(*items):
    return IngresoProductoTerminadoRequest(
        Presentaciones=[
            {"IdPresentacion": item[0], "Cantidad": item[1], "Observacion": item[2] if len(item) > 2 else None}
            for item in items
        ]
    )


def _salida(*items, observacion=OBSERVACION_SALIDA):
    return SalidaProductoTerminadoRequest(
        Observacion=observacion,
        Presentaciones=[{"IdPresentacion": i, "Cantidad": c} for i, c in items],
    )


def _del_catalogo(ids_presentacion):
    catalogo = catalogo_presentaciones()
    return {i: catalogo[i] for i in ids_presentacion if i in catalogo}


def _inventarios(stock: dict[int, int]):
    catalogo = catalogo_presentaciones()
    return {
        id_presentacion: (crear_inventario(id_presentacion, cantidad), *catalogo[id_presentacion])
        for id_presentacion, cantidad in stock.items()
    }


def _error(funcion, solicitud) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        funcion(solicitud, id_usuario=ID_OPERADOR)
    return error.value


class TestIngreso:
    def test_con_conteo_en_curso_lanza_409_con_quien_y_a_que_hora(self, servicio_pt, repo_pt, repo_conteo):
        repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()

        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((ID_LUX_J24, 5)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == (
            "Los ingresos de producto terminado están bloqueados: hay un conteo físico en curso, "
            "iniciado por Carlos Pérez a las 08:30"
        )
        repo_pt.ObtenerBloqueoActivo.assert_not_called()

    def test_con_bloqueo_de_ingreso_lanza_409_con_el_motivo(self, servicio_pt, repo_pt):
        repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(ingreso=True, correccion=False, salida=False)

        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((ID_LUX_J24, 5)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == (
            "Los ingresos de producto terminado están bloqueados por Carlos Pérez. "
            "Motivo: Inventario de fin de mes"
        )
        repo_pt.RegistrarMovimientos.assert_not_called()

    def test_bloqueo_que_no_incluye_ingresos_no_lo_impide(self, servicio_pt, repo_pt):
        repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(ingreso=False, correccion=True, salida=True)
        repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: 10})

        respuesta = servicio_pt.InsertarIngresoProductoTerminado(_ingreso((ID_LUX_J24, 5)), id_usuario=ID_OPERADOR)

        assert respuesta[0].CantidadActual == 15

    def test_sin_presentaciones_lanza_400(self, servicio_pt):
        error = _error(servicio_pt.InsertarIngresoProductoTerminado, IngresoProductoTerminadoRequest(Presentaciones=[]))

        assert error.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.parametrize(
        ("cantidad", "detalle"),
        [
            (0, "La cantidad de ingreso debe ser mayor a 0"),
            (-3, "La cantidad de ingreso debe ser mayor a 0"),
            (
                CANTIDAD_INGRESO_PRODUCTO_TERMINADO + 1,
                f"La cantidad máxima de ingreso por presentación es de {CANTIDAD_INGRESO_PRODUCTO_TERMINADO}",
            ),
        ],
    )
    def test_cantidad_fuera_de_rango_lanza_422(self, servicio_pt, repo_pt, cantidad, detalle):
        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((ID_LUX_J24, cantidad)))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == detalle
        repo_pt.ObtenerPresentaciones.assert_not_called()

    def test_presentaciones_repetidas_lanzan_422(self, servicio_pt):
        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((ID_LUX_J24, 5), (ID_LUX_J24, 3)))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == "Hay presentaciones repetidas en el ingreso"

    def test_presentaciones_inexistentes_lanzan_404_con_sus_ids(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.return_value = {}

        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((77, 5), (88, 1)))

        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert error.detail == "Las presentaciones 77, 88 no existen"

    def test_presentacion_inactiva_lanza_409_con_su_codigo(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo

        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((ID_LUX_J24, 5), (ID_LUX_INACTIVA, 1)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == "Las presentaciones LUX-J06 están inactivas, no se puede registrar el ingreso"
        repo_pt.ObtenerInventariosBloqueados.assert_not_called()

    def test_presentacion_activa_de_producto_inactivo_tambien_se_rechaza(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.return_value = {
            5: crear_presentacion(5, crear_producto(5, "Económico", activo=False), "ECN-P01")
        }

        error = _error(servicio_pt.InsertarIngresoProductoTerminado, _ingreso((5, 1)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert "ECN-P01" in error.detail

    def test_ingreso_maximo_suma_al_inventario_existente(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: 10})

        respuesta = servicio_pt.InsertarIngresoProductoTerminado(
            _ingreso((ID_LUX_J24, CANTIDAD_INGRESO_PRODUCTO_TERMINADO)), id_usuario=ID_OPERADOR
        )

        assert respuesta[0].CantidadActual == 10 + CANTIDAD_INGRESO_PRODUCTO_TERMINADO
        assert respuesta[0].CodigoPresentacion == "LUX-J24"
        assert respuesta[0].NombreProducto == "Luxury"

    def test_ingreso_sin_inventario_previo_lo_crea_desde_cero(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo
        repo_pt.ObtenerInventariosBloqueados.return_value = {}

        respuesta = servicio_pt.InsertarIngresoProductoTerminado(_ingreso((ID_ECO_J12, 7)), id_usuario=ID_OPERADOR)

        inventario, _, cantidad_nueva = repo_pt.RegistrarMovimientos.call_args.args[0][0]
        assert inventario.IdPresentacion == ID_ECO_J12
        assert cantidad_nueva == 7
        assert respuesta[0].CantidadActual == 7

    def test_ingreso_registra_turno_usuario_y_observacion(self, servicio_pt, repo_pt):
        repo_pt.ObtenerPresentaciones.side_effect = _del_catalogo
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: 0, ID_ECO_J12: 0})
        repo_pt.IdTurnoActual.return_value = 2

        servicio_pt.InsertarIngresoProductoTerminado(
            _ingreso((ID_ECO_J12, 3, "  Ingreso manual  "), (ID_LUX_J24, 4)),
            id_usuario=ID_OPERADOR,
        )

        repo_pt.ObtenerInventariosBloqueados.assert_called_once_with([ID_LUX_J24, ID_ECO_J12])
        movimientos = [m for _, m, _ in repo_pt.RegistrarMovimientos.call_args.args[0]]
        assert [m.IdPresentacion for m in movimientos] == [ID_ECO_J12, ID_LUX_J24]
        assert all(m.IdTipoMovimientoInventario == MOVIMIENTO_PT_ENTRADA for m in movimientos)
        assert all(m.IdTurno == 2 and m.IdUsuario == ID_OPERADOR for m in movimientos)
        assert movimientos[0].Observacion == "Ingreso manual"
        assert movimientos[1].Observacion == OBSERVACION_INGRESO_PRODUCTO


class TestSalida:
    def test_con_bloqueo_de_salida_lanza_409(self, servicio_pt, repo_pt):
        repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(ingreso=False, correccion=False, salida=True)

        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, 1)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail.startswith("Las salidas de producto terminado están bloqueadas por Carlos Pérez")

    @pytest.mark.parametrize("observacion", ["", "    ", "abcd", "salida $$$", "x" * 151])
    def test_observacion_invalida_lanza_422(self, servicio_pt, repo_pt, observacion):
        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, 1), observacion=observacion))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail.startswith("La observación es obligatoria")
        repo_pt.ObtenerInventariosBloqueados.assert_not_called()

    def test_sin_presentaciones_lanza_422(self, servicio_pt):
        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida())

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == "Debe incluir al menos una presentación"

    def test_el_modelo_rechaza_presentacion_cero(self):
        with pytest.raises(ValidationError):
            SalidaProductoTerminadoItem(IdPresentacion=0, Cantidad=1)

    @pytest.mark.parametrize(
        ("cantidad", "detalle"),
        [
            (0, "La cantidad de salida debe ser mayor a 0"),
            (
                CANTIDAD_SALIDA_PRODUCTO_TERMINADO + 1,
                f"La cantidad máxima de salida por presentación es de {CANTIDAD_SALIDA_PRODUCTO_TERMINADO}",
            ),
        ],
    )
    def test_cantidad_fuera_de_rango_lanza_422(self, servicio_pt, cantidad, detalle):
        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, cantidad)))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == detalle

    def test_presentacion_repetida_lanza_422(self, servicio_pt):
        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, 1), (ID_LUX_J24, 2)))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == f"La presentación {ID_LUX_J24} está repetida en la salida"

    def test_presentacion_sin_inventario_revierte_y_lanza_404(self, servicio_pt, repo_pt):
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: 10})

        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, 1), (ID_ECO_J12, 1)))

        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert error.detail == f"Las presentaciones {ID_ECO_J12} no existen o no tienen inventario"
        repo_pt.Revertir.assert_called_once()

    def test_stock_insuficiente_lista_todas_las_presentaciones_y_no_registra(self, servicio_pt, repo_pt):
        inventarios = _inventarios({ID_LUX_J24: 3, ID_ECO_J12: 1})
        repo_pt.ObtenerInventariosBloqueados.return_value = inventarios

        error = _error(servicio_pt.InsertarSalidaProductoTerminado, _salida((ID_LUX_J24, 4), (ID_ECO_J12, 2)))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == (
            "Stock insuficiente: LUX-J24 (disponible 3, solicitado 4); "
            "ECO-J12 (disponible 1, solicitado 2)"
        )
        repo_pt.Revertir.assert_called_once()
        repo_pt.RegistrarMovimientos.assert_not_called()
        assert int(inventarios[ID_LUX_J24][0].CantidadActual) == 3

    def test_salida_maxima_de_todo_el_stock_lo_deja_en_cero(self, servicio_pt, repo_pt):
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: CANTIDAD_SALIDA_PRODUCTO_TERMINADO})

        respuesta = servicio_pt.InsertarSalidaProductoTerminado(
            _salida((ID_LUX_J24, CANTIDAD_SALIDA_PRODUCTO_TERMINADO)), id_usuario=ID_OPERADOR
        )

        assert respuesta.Presentaciones[0].CantidadActual == 0

    def test_salida_de_varias_presentaciones_es_un_solo_despacho(self, servicio_pt, repo_pt):
        repo_pt.ObtenerInventariosBloqueados.return_value = _inventarios({ID_LUX_J24: 50, ID_ECO_J12: 20})

        respuesta = servicio_pt.InsertarSalidaProductoTerminado(
            _salida((ID_LUX_J24, 30), (ID_ECO_J12, 5), observacion=f"  {OBSERVACION_SALIDA}  "),
            id_usuario=ID_OPERADOR,
        )

        repo_pt.RegistrarMovimientos.assert_called_once()
        movimientos = [m for _, m, _ in repo_pt.RegistrarMovimientos.call_args.args[0]]
        assert all(m.IdTipoMovimientoInventario == MOVIMIENTO_PT_SALIDA for m in movimientos)
        assert all(m.Observacion == OBSERVACION_SALIDA for m in movimientos)
        assert respuesta.Observacion == OBSERVACION_SALIDA
        assert respuesta.CantidadTotal == 35
        assert [p.CantidadActual for p in respuesta.Presentaciones] == [20, 15]
        assert respuesta.FechaMovimiento == movimientos[0].FechaMovimiento
