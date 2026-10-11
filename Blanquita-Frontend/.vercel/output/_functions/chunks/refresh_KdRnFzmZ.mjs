import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as verificarAccessToken, c as refresh, l as SesionUsuario, n as limpiarSesion, t as guardarSesion } from "./auth-server_CMy_sDHd.mjs";
//#region src/pages/api/auth/refresh.js
var refresh_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
async function POST({ cookies }) {
	const refreshTokenCrudo = cookies.get("refresh_token")?.value;
	if (!refreshTokenCrudo) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: "No hay sesión activa" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
	}
	let resultado;
	try {
		resultado = await refresh(refreshTokenCrudo);
	} catch (error) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: error.message || "No se pudo renovar la sesión" }), {
			status: error.status || 401,
			headers: { "Content-Type": "application/json" }
		});
	}
	let payload;
	try {
		payload = await verificarAccessToken(resultado.AccessToken);
	} catch {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: "Token recibido inválido" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
	const sesion = SesionUsuario(payload);
	if (!sesion.IdUsuario || !sesion.IdRol) {
		limpiarSesion(cookies);
		return new Response(JSON.stringify({ detail: "Usuario no habilitado para operar el sistema" }), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
	}
	guardarSesion(cookies, resultado);
	return new Response(JSON.stringify(sesion), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/refresh@_@js
var page = () => refresh_exports;
//#endregion
export { page };
