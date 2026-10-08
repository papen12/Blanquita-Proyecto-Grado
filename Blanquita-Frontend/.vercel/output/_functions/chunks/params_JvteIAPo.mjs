//#region src/utils/params.js
function construirQueryParams(filtros = {}) {
	const params = new URLSearchParams();
	Object.entries(filtros).forEach(([clave, valor]) => {
		if (valor === null || valor === void 0 || valor === "") return;
		if (Array.isArray(valor)) {
			valor.forEach((item) => params.append(clave, item));
			return;
		}
		params.set(clave, valor);
	});
	return params;
}
function conQueryParams(url, filtros = {}) {
	const query = construirQueryParams(filtros).toString();
	return query ? `${url}?${query}` : url;
}
//#endregion
export { construirQueryParams as n, conQueryParams as t };
