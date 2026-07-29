import { defineMiddleware } from "astro/middleware";
import { obtenerAccessTokenValido, limpiarSesion, SECRET_KEY } from "./lib/auth-server";
import { jwtVerify } from "jose";
import { SesionUsuario } from "./models/Usuario/Auth";

const PREFIJO_POR_ROL = {
  1: "/operador",
  2: "/encargado"
};

const RUTA_POR_ROL = {
  1: "/operador/inicio",
  2: "/encargado/inicio"
};

const RUTAS_PROTEGIDAS = ["/operador", "/encargado"];
const RUTAS_PUBLICAS_AUTH = ["/"];

async function resolverSesion(context) {
  const accessToken = await obtenerAccessTokenValido(context.cookies);
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, SECRET_KEY);
    const sesion = SesionUsuario(payload);
    if (!sesion.IdRol || !sesion.IdUsuario) return null;
    return sesion;
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const esRutaProtegida = RUTAS_PROTEGIDAS.some((prefijo) =>
    pathname.startsWith(prefijo)
  );
  const esRutaPublicaAuth = RUTAS_PUBLICAS_AUTH.includes(pathname);

  if (!esRutaProtegida && !esRutaPublicaAuth) {
    return next();
  }

  const sesion = await resolverSesion(context);

  if (esRutaPublicaAuth) {
    if (sesion) {
      return context.redirect(RUTA_POR_ROL[sesion.IdRol] || "/");
    }
    limpiarSesion(context.cookies);
    return next();
  }

  if (!sesion) {
    limpiarSesion(context.cookies);
    return context.redirect("/");
  }

  const prefijoPermitido = PREFIJO_POR_ROL[sesion.IdRol];

  if (!prefijoPermitido || !pathname.startsWith(prefijoPermitido)) {
    return context.redirect(RUTA_POR_ROL[sesion.IdRol] || "/");
  }

  context.locals.usuario = sesion;

  return next();
}); 





export const LoginRequest = (ci, clave) => ({
  Ci: ci,
  Clave: clave
});

export const LoginResponse = (data) => ({
  AccessToken: data.AccessToken,
  TokenType: data.TokenType
});

export const RefreshResponse = (data) => ({
  AccessToken: data.AccessToken,
  TokenType: data.TokenType
});

export const LogoutResponse = (data) => ({
  Revocado: data.Revocado
});

export const LogoutTodosResponse = (data) => ({
  SesionesRevocadas: data.SesionesRevocadas
});

export const SesionUsuario = (payload) => ({
  IdUsuario: Number(payload.sub),
  IdRol: Number(payload.rol_id),
  NombreRol: payload.rol
});








export const prerender = false;

import { obtenerAccessTokenValido, limpiarSesion } from "../../lib/auth-server";

const BACKEND_URL = import.meta.env.BACKEND_URL;

export const ALL = async ({ request, params, cookies }) => {
  const accessToken = await obtenerAccessTokenValido(cookies);

  if (!accessToken) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: "No autenticado" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${params.path}${url.search}`;

  const headers = {
    Authorization: `Bearer ${accessToken}`
  };

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const init = {
    method: request.method,
    headers
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  const backendResponse = await fetch(targetUrl, init);
  const data = await backendResponse.text();

  return new Response(data, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") || "application/json"
    }
  });
};






export const prerender = false;

import { jwtVerify } from "jose";
import { login } from "../../../services/Usuario/Auth";
import { SesionUsuario } from "../../../models/Usuario/Auth";

const SECRET_KEY = new TextEncoder().encode(import.meta.env.SECRET_KEY);
const ACCESS_TOKEN_MAX_AGE_SEGUNDOS = 60 * 15;

const RUTA_POR_ROL = {
  1: "/operador/inicio",
  2: "/encargado/inicio"
};

function obtenerIpReal(request, clientAddress) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  try {
    return clientAddress ?? null;
  } catch {
    return null;
  }
}

export async function POST({ request, cookies, clientAddress }) {
  let Ci, Clave;

  try {
    ({ Ci, Clave } = await request.json());
  } catch {
    return new Response(
      JSON.stringify({ detail: "Cuerpo de la petición inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!Ci || !Clave) {
    return new Response(
      JSON.stringify({ detail: "Ci y Clave son requeridos" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip = obtenerIpReal(request, clientAddress);
  const userAgent = request.headers.get("user-agent");

  let resultado;
  try {
    resultado = await login(Ci, Clave, ip, userAgent);
  } catch (error) {
    return new Response(
      JSON.stringify({ detail: error.message || "Error al iniciar sesión" }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { AccessToken, SetCookie } = resultado;

  let payload;
  try {
    ({ payload } = await jwtVerify(AccessToken, SECRET_KEY));
  } catch {
    return new Response(
      JSON.stringify({ detail: "Token recibido inválido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const sesion = SesionUsuario(payload);

  cookies.set("token", AccessToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SEGUNDOS
  });

  const response = new Response(
    JSON.stringify({
      ...sesion,
      rutaRedirect: RUTA_POR_ROL[sesion.IdRol] || "/"
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );

  if (SetCookie) {
    response.headers.append("Set-Cookie", SetCookie);
  }

  return response;
}







export const prerender = false;

import { obtenerAccessTokenValido, limpiarSesion } from "../../../lib/auth-server";
import { logoutTodos } from "../../../services/Usuario/Auth";

export async function POST({ cookies }) {
  const accessToken = await obtenerAccessTokenValido(cookies);

  if (!accessToken) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: "No hay sesión activa" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const resultado = await logoutTodos(accessToken);
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify(resultado),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: error.message || "Error al cerrar sesión" }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
}








export const prerender = false;

import { jwtVerify } from "jose";
import { refresh } from "../../../services/Usuario/Auth";
import { SesionUsuario } from "../../../models/Usuario/Auth";

const SECRET_KEY = new TextEncoder().encode(import.meta.env.SECRET_KEY);
const ACCESS_TOKEN_MAX_AGE_SEGUNDOS = 60 * 15;

export async function POST({ cookies }) {
  const refreshTokenCrudo = cookies.get("refresh_token")?.value;

  if (!refreshTokenCrudo) {
    return new Response(
      JSON.stringify({ detail: "No hay sesión activa" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let resultado;
  try {
    resultado = await refresh(refreshTokenCrudo);
  } catch (error) {
    cookies.delete("token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });

    return new Response(
      JSON.stringify({ detail: error.message || "No se pudo renovar la sesión" }),
      { status: error.status || 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { AccessToken } = resultado;

  let payload;
  try {
    ({ payload } = await jwtVerify(AccessToken, SECRET_KEY));
  } catch {
    return new Response(
      JSON.stringify({ detail: "Token recibido inválido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const sesion = SesionUsuario(payload);

  cookies.set("token", AccessToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SEGUNDOS
  });

  return new Response(
    JSON.stringify(sesion),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}









import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
  LogoutTodosResponse
} from "../../models/Usuario/Auth";
import { manejarErrorBackend } from "@/utils/Error";
const BACKEND_URL = import.meta.env.BACKEND_URL;

export async function login(ci, clave, ip, userAgent) {
  const payload = LoginRequest(ci, clave);

  const headers = { "Content-Type": "application/json" };
  if (ip) headers["X-Forwarded-For"] = ip;
  if (userAgent) headers["X-Client-User-Agent"] = userAgent;

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return {
    ...LoginResponse(data),
    SetCookie: response.headers.get("set-cookie")
  };
}

export async function refresh(refreshTokenCrudo) {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `refresh_token=${refreshTokenCrudo}`
    }
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return RefreshResponse(data);
}

export async function logout(refreshTokenCrudo) {
  const response = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    headers: refreshTokenCrudo
      ? { Cookie: `refresh_token=${refreshTokenCrudo}` }
      : {}
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return LogoutResponse(data);
}

export async function logoutTodos(accessToken) {
  const response = await fetch(`${BACKEND_URL}/auth/logout-todos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return LogoutTodosResponse(data);
}