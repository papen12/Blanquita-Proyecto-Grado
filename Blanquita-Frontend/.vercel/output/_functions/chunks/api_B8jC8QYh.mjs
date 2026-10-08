//#region src/utils/validators.js
function extraerMensajeError(data, fallback = "Ocurrió un error inesperado") {
	const detail = data?.detail;
	if (typeof detail === "string") return detail;
	if (Array.isArray(detail)) return detail.map((err) => {
		const campo = Array.isArray(err?.loc) ? err.loc.filter((l) => l !== "body").join(".") : "";
		return campo ? `${campo}: ${err?.msg}` : err?.msg;
	}).filter(Boolean).join(" | ");
	if (detail && typeof detail === "object") return detail.msg || detail.message || fallback;
	if (typeof data?.message === "string") return data.message;
	return fallback;
}
async function manejarErrorBackend(response) {
	const data = await response.json().catch(() => ({}));
	const mensaje = extraerMensajeError(data, `Error ${response.status}: ${response.statusText || "solicitud fallida"}`);
	const error = new Error(mensaje);
	error.status = response.status;
	error.detail = data?.detail;
	throw error;
}
var aEntero = (valor) => {
	const n = Number(valor);
	return Number.isInteger(n) && n > 0 ? n : 0;
};
var numeroONulo = (valor) => valor === null || valor === void 0 || valor === "" ? null : Number(valor);
var NO_PERMITIDOS_OBSERVACION = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,;:()"\/#-]/g;
var limpiarObservacion = (texto) => texto.replace(/\s/g, " ").replace(NO_PERMITIDOS_OBSERVACION, "");
//#endregion
//#region src/utils/api.js
async function pedir(url, { method = "GET", body, headers = {} } = {}) {
	const init = {
		method,
		headers: { ...headers }
	};
	if (body !== void 0) {
		init.headers["Content-Type"] = "application/json";
		init.body = JSON.stringify(body);
	}
	const response = await fetch(url, init);
	if (!response.ok) await manejarErrorBackend(response);
	return response;
}
async function pedirJson(url, opciones) {
	return (await pedir(url, opciones)).json();
}
//#endregion
export { limpiarObservacion as a, extraerMensajeError as i, pedirJson as n, numeroONulo as o, aEntero as r, pedir as t };
