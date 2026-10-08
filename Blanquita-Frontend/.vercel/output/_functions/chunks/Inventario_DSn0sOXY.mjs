import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { t as conQueryParams } from "./params_JvteIAPo.mjs";
//#region src/models/Inventario/inventario.js
var IngresoProductoTerminadoItem = ({ IdPresentacion, Cantidad, Observacion = null }) => ({
	IdPresentacion,
	Cantidad,
	Observacion
});
var IngresoProductoTerminadoRequest = ({ Presentaciones = [] }) => ({ Presentaciones: Presentaciones.map((item) => IngresoProductoTerminadoItem(item)) });
var IngresoProductoTerminadoResponse = ({ IdPresentacion, CodigoPresentacion, NombreProducto, CantidadIngresada, CantidadActual }) => ({
	IdPresentacion,
	CodigoPresentacion,
	NombreProducto,
	CantidadIngresada,
	CantidadActual
});
var IngresoProductoTerminadoResponseList = (jsonList) => (jsonList ?? []).map((item) => IngresoProductoTerminadoResponse(item));
var SalidaProductoTerminadoItem = ({ IdPresentacion, Cantidad, Observacion = null }) => ({
	IdPresentacion,
	Cantidad,
	Observacion
});
var SalidaProductoTerminadoRequest = ({ Presentaciones = [] }) => ({ Presentaciones: Presentaciones.map((item) => SalidaProductoTerminadoItem(item)) });
var SalidaProductoTerminadoResponse = ({ IdPresentacion, CodigoPresentacion, NombreProducto, CantidadSalida, CantidadActual }) => ({
	IdPresentacion,
	CodigoPresentacion,
	NombreProducto,
	CantidadSalida,
	CantidadActual
});
var SalidaProductoTerminadoResponseList = (jsonList) => (jsonList ?? []).map((item) => SalidaProductoTerminadoResponse(item));
var CorreccionProductoTerminadoRequest = ({ IdPresentacion, Cantidad, Observacion }) => ({
	IdPresentacion,
	Cantidad,
	Observacion
});
var CorreccionProductoTerminadoResponse = ({ IdPresentacion, CodigoPresentacion, NombreProducto, NombreTipoMovimientoInventario, CantidadAplicada, CantidadActual }) => ({
	IdPresentacion,
	CodigoPresentacion,
	NombreProducto,
	NombreTipoMovimientoInventario,
	CantidadAplicada,
	CantidadActual
});
var VerInventarioProductoTerminadoResponse = ({ IdPresentacion, CodigoPresentacion, NombreProducto, TipoContenedor, CantidadRollosUnidades, CantidadPorUnidadTerminada, CantidadActual }) => ({
	IdPresentacion,
	CodigoPresentacion,
	NombreProducto,
	TipoContenedor,
	CantidadRollosUnidades,
	CantidadPorUnidadTerminada,
	CantidadActual
});
var VerInventarioProductoTerminadoResponseList = (jsonList) => (jsonList ?? []).map((item) => VerInventarioProductoTerminadoResponse(item));
var ProductoResponse = ({ IdProducto, NombreProducto }) => ({
	IdProducto,
	NombreProducto
});
//#endregion
//#region src/services/Inventario/Inventario.js
async function insertarIngresoProductoTerminado(presentaciones) {
	return IngresoProductoTerminadoResponseList(await pedirJson("/api/productofinal/insertar", {
		method: "POST",
		body: IngresoProductoTerminadoRequest({ Presentaciones: presentaciones })
	}));
}
async function insertarSalidaProductoTerminado(presentaciones) {
	return SalidaProductoTerminadoResponseList(await pedirJson("/api/productofinal/salida", {
		method: "POST",
		body: SalidaProductoTerminadoRequest({ Presentaciones: presentaciones })
	}));
}
async function ajustePositivoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
	return CorreccionProductoTerminadoResponse(await pedirJson("/api/productofinal/ajuste/positivo", {
		method: "POST",
		body: CorreccionProductoTerminadoRequest({
			IdPresentacion: idPresentacion,
			Cantidad: cantidad,
			Observacion: observacion
		})
	}));
}
async function ajusteNegativoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
	return CorreccionProductoTerminadoResponse(await pedirJson("/api/productofinal/ajuste/negativo", {
		method: "POST",
		body: CorreccionProductoTerminadoRequest({
			IdPresentacion: idPresentacion,
			Cantidad: cantidad,
			Observacion: observacion
		})
	}));
}
async function corregirInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
	return CorreccionProductoTerminadoResponse(await pedirJson("/api/productofinal/correccion", {
		method: "POST",
		body: CorreccionProductoTerminadoRequest({
			IdPresentacion: idPresentacion,
			Cantidad: cantidad,
			Observacion: observacion
		})
	}));
}
async function verInventarioProductoTerminado(idProducto) {
	return VerInventarioProductoTerminadoResponseList(await pedirJson(conQueryParams("/api/productofinal/inventario/ver", { IdProducto: idProducto })));
}
async function obtenerProductos() {
	return (await pedirJson("/api/productofinal/obtenerproductos")).map(ProductoResponse);
}
//#endregion
export { insertarSalidaProductoTerminado as a, insertarIngresoProductoTerminado as i, ajustePositivoInventarioProductoTerminado as n, obtenerProductos as o, corregirInventarioProductoTerminado as r, verInventarioProductoTerminado as s, ajusteNegativoInventarioProductoTerminado as t };
