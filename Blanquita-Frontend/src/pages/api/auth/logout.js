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