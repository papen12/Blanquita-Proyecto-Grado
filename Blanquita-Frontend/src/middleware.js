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