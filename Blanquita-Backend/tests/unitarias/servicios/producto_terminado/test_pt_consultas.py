import pytest

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

FILA_INVENTARIO = {
    "IdPresentacion": 1,
    "CodigoPresentacion": "LUX-J24",
    "NombreProducto": "Luxury",
    "TipoContenedor": "Jaba",
    "CantidadRollosUnidades": 24,
    "CantidadPorUnidadTerminada": 2,
    "CantidadActual": 4,
    "Activo": True,
    "StockMinimo": 5,
    "StockPreventivo": 10,
    "NivelStock": "Crítico",
}

FILA_PRODUCTO = {
    "IdProducto": 1,
    "NombreProducto": "Luxury",
    "IdTipoBobina": 1,
    "IdTipoBobinaServilleta": None,
    "Activo": True,
}


@pytest.mark.parametrize("id_producto", [None, 1])
def test_ver_inventario_pasa_el_filtro_y_conserva_el_nivel_de_stock(servicio_pt, repo_pt, id_producto):
    repo_pt.VerInventarioProductoTerminado.return_value = [FILA_INVENTARIO]

    inventario = servicio_pt.VerInventarioProductoTerminado(id_producto)

    repo_pt.VerInventarioProductoTerminado.assert_called_once_with(id_producto)
    assert inventario[0].CantidadActual == 4
    assert inventario[0].NivelStock == "Crítico"


def test_obtener_productos(servicio_pt, repo_pt):
    repo_pt.ObtenerProductos.return_value = [FILA_PRODUCTO]

    productos = servicio_pt.ObtenerProductos()

    assert productos[0].NombreProducto == "Luxury"
    assert productos[0].IdTipoBobinaServilleta is None
