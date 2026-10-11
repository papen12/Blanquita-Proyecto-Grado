import { o as obtenerProductos } from "./Inventario_DSn0sOXY.mjs";
//#region src/components/Reportes/Producto/filtros.js
var LINEA_PRODUCTO = {
	cargar: obtenerProductos,
	campo: "IdsProducto",
	campoValor: "IdProducto",
	campoEtiqueta: "NombreProducto",
	etiqueta: "Líneas"
};
//#endregion
export { LINEA_PRODUCTO as t };
