//#region src/utils/numeros.js
var formatearNumero = (valor, { decimales = 2, decimalesMinimos = decimales, vacio } = {}) => {
	if (vacio !== void 0 && (valor === null || valor === void 0)) return vacio;
	return Number(valor || 0).toLocaleString("es-BO", {
		minimumFractionDigits: decimalesMinimos,
		maximumFractionDigits: decimales
	});
};
//#endregion
export { formatearNumero as t };
