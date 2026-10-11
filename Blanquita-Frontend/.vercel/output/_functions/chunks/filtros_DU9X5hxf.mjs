import { n as IDS_PRODUCTO_BOBINA_PAPEL } from "./Values_CoTzCKTc.mjs";
import { t as ObtenerTiposPapelBobina } from "./BobinaPapel_DoOm6qcL.mjs";
import { o as obtenerProductos } from "./Inventario_DSn0sOXY.mjs";
//#region src/components/Reportes/PapelBobina/filtros.js
var PRODUCTO_BOBINA_PAPEL = {
	cargar: async () => (await obtenerProductos()).filter((p) => IDS_PRODUCTO_BOBINA_PAPEL.includes(p.IdProducto)),
	campo: "IdsProducto",
	campoValor: "IdProducto",
	campoEtiqueta: "NombreProducto",
	etiqueta: "Producto"
};
var TIPO_BOBINA_PAPEL = {
	cargar: ObtenerTiposPapelBobina,
	campo: "IdsTipoBobina",
	campoValor: "IdTipoBobina",
	campoEtiqueta: "NombreTipoBobina",
	etiqueta: "Tipo de bobina"
};
var CODIGO_BOBINA_PAPEL = {
	campo: "CodigoBobina",
	etiqueta: "Código de bobina",
	placeholder: "Ej. 963-R20"
};
//#endregion
export { PRODUCTO_BOBINA_PAPEL as n, TIPO_BOBINA_PAPEL as r, CODIGO_BOBINA_PAPEL as t };
