import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as limpiarSesion, r as obtenerAccessTokenValido } from "./auth-server_CMy_sDHd.mjs";
//#region src/pages/api/[...path].js
var ____path__exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	prerender: () => false
});
var BACKEND_URL = "https://blanquita-proyecto-grado.onrender.com/".replace(/\/+$/, "");
var ALL = async ({ request, params, cookies }) => {
	const accessToken = await obtenerAccessTokenValido(cookies);
	if (!accessToken) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: "No autenticado" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
	}
	const url = new URL(request.url);
	const targetUrl = `${BACKEND_URL}/${params.path}${url.search}`;
	const headers = { Authorization: `Bearer ${accessToken}` };
	const contentType = request.headers.get("content-type");
	if (contentType) headers["Content-Type"] = contentType;
	const init = {
		method: request.method,
		headers
	};
	if (!["GET", "HEAD"].includes(request.method)) init.body = await request.text();
	const backendResponse = await fetch(targetUrl, init);
	const data = await backendResponse.arrayBuffer();
	const headersRespuesta = { "Content-Type": backendResponse.headers.get("content-type") || "application/json" };
	const disposicion = backendResponse.headers.get("content-disposition");
	if (disposicion) headersRespuesta["Content-Disposition"] = disposicion;
	return new Response(data, {
		status: backendResponse.status,
		headers: headersRespuesta
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/[...path]@_@js
var page = () => ____path__exports;
//#endregion
export { page };
