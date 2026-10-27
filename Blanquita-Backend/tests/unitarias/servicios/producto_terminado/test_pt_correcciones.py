import pytest
from fastapi import HTTPException, status

from app.Constants.Cantidades import (
    CANTIDAD_AJUSTE_PRODUCTO_TERMINADO,
    CANTIDAD_CORRECCION_PRODUCTO_TERMINADO,
)
from app.Constants.Estados import (
    MOVIMIENTO_PT_AJUSTE_NEGATIVO,
    MOVIMIENTO_PT_AJUSTE_POSITIVO,
    MOVIMIENTO_PT_AUMENTO,
    MOVIMIENTO_PT_DESCUENTO,
)
from app.Models.InventarioFinal.ProductoFinal import CorreccionProductoTerminadoRequest
from tests.dobles.producto_terminado import (
    ID_LUX_J24,
    ID_OPERADOR,
    catalogo_presentaciones,
    crear_inventario,
    fila_bloqueo,
    fila_conteo,
)

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

OBSERVACION = "Jabas mal registradas en turno"

OPERACIONES = [
    pytest.param("CorregirInventarioProductoTerminado", MOVIMIENTO_PT_DESCUENTO, CANTIDAD_CORRECCION_PRODUCTO_TERMINADO, -1, id="correccion"),
    pytest.param("AumentarInventarioProductoTerminado", MOVIMIENTO_PT_AUMENTO, CANTIDAD_CORRECCION_PRODUCTO_TERMINADO, 1, id="aumento"),
    pytest.param("AjustePositivoInventarioProductoTerminado", MOVIMIENTO_PT_AJUSTE_POSITIVO, CANTIDAD_AJUSTE_PRODUCTO_TERMINADO, 1, id="ajuste-positivo"),
    pytest.param("AjusteNegativoInventarioProductoTerminado", MOVIMIENTO_PT_AJUSTE_NEGATIVO, CANTIDAD_AJUSTE_PRODUCTO_TERMINADO, -1, id="ajuste-negativo"),
]

AJUSTES = ["AjustePositivoInventarioProductoTerminado", "AjusteNegativoInventarioProductoTerminado"]
CORRECCIONES = ["CorregirInventarioProductoTerminado", "AumentarInventarioProductoTerminado"]


def _solicitud(cantidad, observacion=OBSERVACION, id_presentacion=ID_LUX_J24):
    return CorreccionProductoTerminadoRequest(IdPresentacion=id_presentacion, Cantidad=cantidad, Observacion=observacion)


def _con_stock(repo_pt, cantidad):
    presentacion, producto = catalogo_presentaciones()[ID_LUX_J24]
    inventario = crear_inventario(ID_LUX_J24, cantidad)
    repo_pt.ObtenerInventariosBloqueados.return_value = {ID_LUX_J24: (inventario, presentacion, producto)}
    return inventario


def _error(servicio, metodo, solicitud) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        getattr(servicio, metodo)(solicitud, id_usuario=ID_OPERADOR)
    return error.value


@pytest.mark.parametrize(("metodo", "tipo", "maximo", "signo"), OPERACIONES)
class TestReglasComunes:
    def test_cantidad_maxima_se_aplica(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo):
        _con_stock(repo_pt, 1000)

        respuesta = getattr(servicio_pt, metodo)(_solicitud(maximo), id_usuario=ID_OPERADOR)

        assert respuesta.CantidadAplicada == maximo
        assert respuesta.CantidadActual == 1000 + signo * maximo

    def test_cantidad_mayor_al_maximo_lanza_422(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo):
        error = _error(servicio_pt, metodo, _solicitud(maximo + 1))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == f"La cantidad máxima por presentación es de {maximo}"
        repo_pt.ObtenerInventariosBloqueados.assert_not_called()

    @pytest.mark.parametrize("cantidad", [0, -5])
    def test_cantidad_no_positiva_lanza_422(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo, cantidad):
        error = _error(servicio_pt, metodo, _solicitud(cantidad))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == "La cantidad debe ser mayor a 0"

    @pytest.mark.parametrize("observacion", ["", "abc", "error en <script>"])
    def test_observacion_invalida_lanza_422(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo, observacion):
        error = _error(servicio_pt, metodo, _solicitud(1, observacion=observacion))

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail.startswith("La observación es obligatoria")

    def test_sin_inventario_revierte_y_lanza_404(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo):
        repo_pt.ObtenerInventariosBloqueados.return_value = {}

        error = _error(servicio_pt, metodo, _solicitud(1))

        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert error.detail == f"No existe inventario registrado para la presentación {ID_LUX_J24}"
        repo_pt.Revertir.assert_called_once()

    def test_con_conteo_en_curso_lanza_409(self, servicio_pt, repo_pt, repo_conteo, metodo, tipo, maximo, signo):
        repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()

        error = _error(servicio_pt, metodo, _solicitud(1))

        assert error.status_code == status.HTTP_409_CONFLICT
        assert "hay un conteo físico en curso" in error.detail
        repo_pt.ObtenerInventariosBloqueados.assert_not_called()

    def test_registra_el_tipo_turno_y_observacion(self, servicio_pt, repo_pt, metodo, tipo, maximo, signo):
        _con_stock(repo_pt, 100)
        repo_pt.IdTurnoActual.return_value = 3

        respuesta = getattr(servicio_pt, metodo)(_solicitud(10, observacion=f" {OBSERVACION} "), id_usuario=ID_OPERADOR)

        inventario, movimiento, cantidad_nueva = repo_pt.RegistrarMovimientos.call_args.args[0][0]
        assert movimiento.IdTipoMovimientoInventario == tipo
        assert movimiento.IdTurno == 3
        assert movimiento.IdUsuario == ID_OPERADOR
        assert movimiento.Observacion == OBSERVACION
        assert cantidad_nueva == 100 + signo * 10
        repo_pt.NombreTipoMovimiento.assert_called_once_with(tipo)
        assert respuesta.NombreTipoMovimientoInventario


@pytest.mark.parametrize(
    "metodo",
    ["CorregirInventarioProductoTerminado", "AjusteNegativoInventarioProductoTerminado"],
)
def test_restar_mas_que_el_stock_revierte_y_lanza_409(servicio_pt, repo_pt, metodo):
    inventario = _con_stock(repo_pt, 4)

    error = _error(servicio_pt, metodo, _solicitud(5))

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail == "Stock insuficiente para LUX-J24 (disponible 4, solicitado 5)"
    repo_pt.Revertir.assert_called_once()
    repo_pt.RegistrarMovimientos.assert_not_called()
    assert int(inventario.CantidadActual) == 4


@pytest.mark.parametrize("metodo", ["CorregirInventarioProductoTerminado", "AjusteNegativoInventarioProductoTerminado"])
def test_restar_todo_el_stock_lo_deja_en_cero(servicio_pt, repo_pt, metodo):
    _con_stock(repo_pt, 5)

    respuesta = getattr(servicio_pt, metodo)(_solicitud(5), id_usuario=ID_OPERADOR)

    assert respuesta.CantidadActual == 0


@pytest.mark.parametrize("metodo", CORRECCIONES)
def test_bloqueo_de_correcciones_impide_corregir(servicio_pt, repo_pt, metodo):
    repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(ingreso=False, correccion=True, salida=False)

    error = _error(servicio_pt, metodo, _solicitud(1))

    assert error.status_code == status.HTTP_409_CONFLICT
    assert error.detail.startswith("Las correcciones de producto terminado están bloqueadas por Carlos Pérez")


@pytest.mark.parametrize("metodo", AJUSTES)
def test_los_ajustes_del_lider_no_respetan_el_bloqueo_manual(servicio_pt, repo_pt, metodo):
    repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo()
    _con_stock(repo_pt, 10)

    getattr(servicio_pt, metodo)(_solicitud(1), id_usuario=ID_OPERADOR)

    repo_pt.ObtenerBloqueoActivo.assert_not_called()
    repo_pt.RegistrarMovimientos.assert_called_once()


@pytest.mark.parametrize("metodo", AJUSTES)
def test_ajuste_con_conteo_en_curso_usa_mensaje_de_ajustes(servicio_pt, repo_conteo, metodo):
    repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()

    error = _error(servicio_pt, metodo, _solicitud(1))

    assert error.detail.startswith("Los ajustes de producto terminado están bloqueados: hay un conteo físico en curso")
