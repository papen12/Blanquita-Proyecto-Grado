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
    JSON.stringify(sesion),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );

  if (SetCookie) {
    response.headers.append("Set-Cookie", SetCookie);
  }

  return response;
}