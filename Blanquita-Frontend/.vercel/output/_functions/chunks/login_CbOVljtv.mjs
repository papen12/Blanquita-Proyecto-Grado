import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as verificarAccessToken, l as SesionUsuario, n as limpiarSesion, o as login, t as guardarSesion } from "./auth-server_CMy_sDHd.mjs";
import { i as RUTA_POR_ROL } from "./Values_CoTzCKTc.mjs";
//#region src/pages/api/auth/login.js
var login_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
function obtenerIpReal(request, clientAddress) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) return forwardedFor.split(",")[0].trim();
	try {
		return clientAddress ?? null;
	} catch {
		return null;
	}
}
async function POST({ request, cookies, clientAddress }) {
	let Ci, Clave;
	try {
		({Ci, Clave} = await request.json());
	} catch {
		return new Response(JSON.stringify({ detail: "Cuerpo de la petición inválido" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
	if (!Ci || !Clave) return new Response(JSON.stringify({ detail: "Ci y Clave son requeridos" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const ip = obtenerIpReal(request, clientAddress);
	const userAgent = request.headers.get("user-agent");
	let resultado;
	try {
		resultado = await login(Ci, Clave, ip, userAgent);
	} catch (error) {
		return new Response(JSON.stringify({ detail: error.message || "Error al iniciar sesión" }), {
			status: error.status || 500,
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
	return new Response(JSON.stringify({
		...sesion,
		rutaRedirect: RUTA_POR_ROL[sesion.IdRol] || "/"
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/login@_@js
var page = () => login_exports;
//#endregion
export { page };
