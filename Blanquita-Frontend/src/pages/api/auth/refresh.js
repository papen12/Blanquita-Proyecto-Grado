export const prerender = false;

import { verificarAccessToken, guardarSesion, limpiarSesion } from "../../../lib/auth-server";
import { refresh } from "../../../services/Usuario/Auth";
import { SesionUsuario } from "../../../models/Usuario/Auth";

export async function POST({ cookies }) {
  const refreshTokenCrudo = cookies.get("refresh_token")?.value;

  if (!refreshTokenCrudo) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: "No hay sesión activa" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let resultado;
  try {
    resultado = await refresh(refreshTokenCrudo);
  } catch (error) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: error.message || "No se pudo renovar la sesión" }),
      { status: error.status || 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload;
  try {
    payload = await verificarAccessToken(resultado.AccessToken);
  } catch {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: "Token recibido inválido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const sesion = SesionUsuario(payload);

  if (!sesion.IdUsuario || !sesion.IdRol) {
    limpiarSesion(cookies);
    return new Response(
      JSON.stringify({ detail: "Usuario no habilitado para operar el sistema" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  guardarSesion(cookies, resultado);

  return new Response(
    JSON.stringify(sesion),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}