export const prerender = false;

import { login } from "../../../services/LogInService";

const RUTA_POR_ROL = {
  1: "/operador/inicio",
  2: "/encargado/inicio"
};

export async function POST({ request, cookies }) {
  try {
    const { Ci, Clave } = await request.json();

    if (!Ci || !Clave) {
      return new Response(
        JSON.stringify({ detail: "Ci y Clave son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const usuario = await login(Ci, Clave);

    cookies.set("token", usuario.access_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return new Response(
      JSON.stringify({
        IdUsuario: usuario.IdUsuario,
        IdRol: usuario.IdRol,
        NombreRol: usuario.NombreRol,
        PrimerNombre: usuario.PrimerNombre,
        ApellidoPaterno: usuario.ApellidoPaterno,
        rutaRedirect: RUTA_POR_ROL[usuario.IdRol] || "/"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ detail: error.message || "Error al iniciar sesión" }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
}