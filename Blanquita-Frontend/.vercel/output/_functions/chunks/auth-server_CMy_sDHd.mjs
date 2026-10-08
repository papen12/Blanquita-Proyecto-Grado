import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { createRemoteJWKSet, jwtVerify } from "jose";
//#region src/models/Usuario/Auth.js
var LoginRequest = (ci, clave) => ({
	Ci: ci,
	Clave: clave
});
var RefreshRequest = (refreshToken) => ({ RefreshToken: refreshToken });
var LoginResponse = (data) => ({
	AccessToken: data.AccessToken,
	RefreshToken: data.RefreshToken,
	TokenType: data.TokenType
});
var RefreshResponse = (data) => ({
	AccessToken: data.AccessToken,
	RefreshToken: data.RefreshToken,
	TokenType: data.TokenType
});
var LogoutResponse = (data) => ({ Revocado: data.Revocado });
var SesionUsuario = (payload) => {
	const metadata = payload.app_metadata ?? {};
	return {
		IdUsuario: metadata.IdUsuario ?? null,
		IdRol: metadata.IdRol ?? null,
		IdEstadoUsuario: metadata.IdEstadoUsuario ?? null,
		IsAdmin: metadata.IsAdmin ?? false,
		AuthUserId: payload.sub ?? null,
		Correo: payload.email ?? null
	};
};
//#endregion
//#region src/services/Usuario/Auth.js
var BACKEND_URL = "https://blanquita-proyecto-grado.onrender.com/".replace(/\/+$/, "");
async function login(ci, clave, ip, userAgent) {
	const headers = {};
	if (ip) headers["X-Forwarded-For"] = ip;
	if (userAgent) headers["X-Client-User-Agent"] = userAgent;
	return LoginResponse(await pedirJson(`${BACKEND_URL}/auth/login`, {
		method: "POST",
		headers,
		body: LoginRequest(ci, clave)
	}));
}
async function refresh(refreshTokenCrudo) {
	return RefreshResponse(await pedirJson(`${BACKEND_URL}/auth/refresh`, {
		method: "POST",
		body: RefreshRequest(refreshTokenCrudo)
	}));
}
async function logoutTodos(accessToken) {
	return LogoutResponse(await pedirJson(`${BACKEND_URL}/auth/logout-todos`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` }
	}));
}
//#endregion
//#region src/lib/auth-server.js
var SUPABASE_URL = "https://pyvimfqomqjdvopzsmts.supabase.co".replace(/\/+$/, "");
var ISSUER = `${SUPABASE_URL}/auth/v1`;
var AUDIENCE = "authenticated";
var ALGORITMOS = ["ES256"];
var JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
var REFRESH_TOKEN_MAX_AGE_SEGUNDOS = 3600 * 12;
var OPCIONES_COOKIE = {
	httpOnly: true,
	secure: true,
	sameSite: "strict",
	path: "/"
};
var refrescosEnCurso = /* @__PURE__ */ new Map();
async function verificarAccessToken(token) {
	const { payload } = await jwtVerify(token, JWKS, {
		issuer: ISSUER,
		audience: AUDIENCE,
		algorithms: ALGORITMOS
	});
	return payload;
}
function guardarSesion(cookies, { AccessToken, RefreshToken }) {
	cookies.set("token", AccessToken, {
		...OPCIONES_COOKIE,
		maxAge: 900
	});
	if (RefreshToken) cookies.set("refresh_token", RefreshToken, {
		...OPCIONES_COOKIE,
		maxAge: REFRESH_TOKEN_MAX_AGE_SEGUNDOS
	});
}
function limpiarSesion(cookies) {
	cookies.delete("token", { path: "/" });
	cookies.delete("refresh_token", { path: "/" });
}
function refrescarDeduplicando(refreshTokenCrudo) {
	if (refrescosEnCurso.has(refreshTokenCrudo)) return refrescosEnCurso.get(refreshTokenCrudo);
	const promesa = refresh(refreshTokenCrudo).finally(() => {
		refrescosEnCurso.delete(refreshTokenCrudo);
	});
	refrescosEnCurso.set(refreshTokenCrudo, promesa);
	return promesa;
}
async function obtenerAccessTokenValido(cookies) {
	const token = cookies.get("token")?.value;
	if (token) try {
		await verificarAccessToken(token);
		return token;
	} catch {}
	const refreshTokenCrudo = cookies.get("refresh_token")?.value;
	if (!refreshTokenCrudo) return null;
	try {
		const resultado = await refrescarDeduplicando(refreshTokenCrudo);
		guardarSesion(cookies, resultado);
		return resultado.AccessToken;
	} catch {
		return null;
	}
}
async function resolverSesion(cookies) {
	const accessToken = await obtenerAccessTokenValido(cookies);
	if (!accessToken) return null;
	try {
		const sesion = SesionUsuario(await verificarAccessToken(accessToken));
		if (!sesion.IdUsuario || !sesion.IdRol) return null;
		return sesion;
	} catch {
		return null;
	}
}
//#endregion
export { verificarAccessToken as a, refresh as c, resolverSesion as i, SesionUsuario as l, limpiarSesion as n, login as o, obtenerAccessTokenValido as r, logoutTodos as s, guardarSesion as t };
