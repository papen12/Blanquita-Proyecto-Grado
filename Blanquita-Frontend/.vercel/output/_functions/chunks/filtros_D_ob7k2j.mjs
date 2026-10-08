import { t as ObtenerTiposBobinaServilleta } from "./BobinaServilleta_CEietmcz.mjs";
//#region src/components/Reportes/BobinaServilleta/filtros.js
var TIPO = {
	cargar: ObtenerTiposBobinaServilleta,
	campoValor: "IdTipoBobinaServilleta",
	campoEtiqueta: "NombreTipoBobinaServilleta",
	etiqueta: "Tipo de bobina"
};
var TIPO_BOBINA_SERVILLETA = {
	...TIPO,
	campo: "IdTipoBobinaServilleta",
	unico: true
};
var TIPOS_BOBINA_SERVILLETA = {
	...TIPO,
	campo: "IdsTipoBobinaServilleta"
};
var CODIGO_UNIDAD = {
	campo: "CodigoBobina",
	etiqueta: "Código de unidad",
	placeholder: "Ej. BSERV-260903-01A"
};
//#endregion
export { TIPOS_BOBINA_SERVILLETA as n, TIPO_BOBINA_SERVILLETA as r, CODIGO_UNIDAD as t };
