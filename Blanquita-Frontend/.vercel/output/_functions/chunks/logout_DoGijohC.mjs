import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as limpiarSesion, r as obtenerAccessTokenValido, s as logoutTodos } from "./auth-server_CMy_sDHd.mjs";
//#region src/pages/api/auth/logout.js
var logout_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var HEADERS = {
	"Content-Type": "application/json",
	"Cache-Control": "no-store"
};
async function POST({ cookies }) {
	const accessToken = await obtenerAccessTokenValido(cookies);
	if (!accessToken) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: "No hay sesión activa" }), {
			status: 401,
			headers: HEADERS
		});
	}
	try {
		const resultado = await logoutTodos(accessToken);
		limpiarSesion(cookies);
		return new Response(JSON.stringify(resultado), {
			status: 200,
			headers: HEADERS
		});
	} catch (error) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: error.message || "Error al cerrar sesión" }), {
			status: error.status || 500,
			headers: HEADERS
		});
	}
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/logout@_@js
var page = () => logout_exports;
//#endregion
export { page };
