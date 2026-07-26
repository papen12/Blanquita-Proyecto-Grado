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