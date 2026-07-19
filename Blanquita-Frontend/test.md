import { defineMiddleware } from "astro/middleware";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(import.meta.env.SECRET_KEY);

const PREFIJO_POR_ROL = {
  1: "/operador",
  2: "/encargado"
};

const RUTA_POR_ROL = {
  1: "/operador/inicio",
  2: "/encargado/inicio"
};

const RUTAS_PROTEGIDAS = ["/operador", "/encargado"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const esRutaProtegida = RUTAS_PROTEGIDAS.some((prefijo) =>
    pathname.startsWith(prefijo)
  );

  if (!esRutaProtegida) {
    return next();
  }

  const token = context.cookies.get("token")?.value;

  if (!token) {
    return context.redirect("/");
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const idRol = Number(payload.rol_id);
    const idUsuario = Number(payload.sub);
    const nombreRol = payload.rol;

    if (!idRol || !idUsuario) {
      return context.redirect("/");
    }

    const prefijoPermitido = PREFIJO_POR_ROL[idRol];

    if (!prefijoPermitido || !pathname.startsWith(prefijoPermitido)) {
      return context.redirect(RUTA_POR_ROL[idRol] || "/");
    }

    context.locals.usuario = {
      IdUsuario: idUsuario,
      IdRol: idRol,
      NombreRol: nombreRol
    };

    return next();
  } catch (error) {
    context.cookies.delete("token", { path: "/" });
    return context.redirect("/");
  }
});



export class IniciarProduccionBobinaTuboRequest {
  constructor(IdBobina1, IdBobina2, IdUsuario) {
    this.IdBobina1 = IdBobina1;
    this.IdBobina2 = IdBobina2;
    this.IdUsuario = IdUsuario;
  }
}

export class IniciarProduccionBobinaTuboResponse {
  constructor(data) {
    this.IdProduccionBobinaTubo = data.IdProduccionBobinaTubo;
    this.FechaInicioProduccion = new Date(data.FechaInicioProduccion);
    this.IdTurno = data.IdTurno;
    this.NombreTurno = data.NombreTurno;
  }
}



import { IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse } from "../models/BobinaPapel/IniciarProduccionBobinaTubo";


export async function IniciarProduccionBobinaTubo(IniciarProduccionBobinaTuboRequest) {
  const response = await fetch(`/api/papelbobina/iniciarproduccion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(IniciarProduccionBobinaTuboRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Error al iniciar la producción de bobina tubo");
  }

  return data;
}




BACKEND_URL=http://localhost:8000
SECRET_KEY=963de266c0ec0398541cd54b8673c072ca3357b6315b6d67d976b9e65622eb17



export const prerender = false;

const BACKEND_URL = import.meta.env.BACKEND_URL;

export const ALL = async ({ request, params, cookies }) => {
  const token = cookies.get("token")?.value;

  if (!token) {
    return new Response(
      JSON.stringify({ detail: "No autenticado" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${params.path}${url.search}`;

  const headers = {
    Authorization: `Bearer ${token}`
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