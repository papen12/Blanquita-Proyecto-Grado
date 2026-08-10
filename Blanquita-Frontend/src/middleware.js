import { defineMiddleware } from "astro/middleware";
import { resolverSesion, limpiarSesion } from "./lib/auth-server";

const PREFIJO_POR_ROL = {
  1: "/operador",
  2: "/encargado"
};

const RUTA_POR_ROL = {
  1: "/operador/inicio",
  2: "/encargado/inicio"
};

const RUTAS_PROTEGIDAS = ["/operador", "/encargado", "/scan"];
const RUTAS_SIN_PREFIJO_ROL = ["/scan"];
const RUTAS_PUBLICAS_AUTH = ["/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const esRutaProtegida = RUTAS_PROTEGIDAS.some((prefijo) =>
    pathname.startsWith(prefijo)
  );
  const esRutaPublicaAuth = RUTAS_PUBLICAS_AUTH.includes(pathname);

  if (!esRutaProtegida && !esRutaPublicaAuth) {
    return next();
  }

  const sesion = await resolverSesion(context.cookies);

  if (esRutaPublicaAuth) {
    if (sesion) {
      return context.redirect(RUTA_POR_ROL[sesion.IdRol] || "/");
    }
    limpiarSesion(context.cookies);
    return next();
  }

  if (!sesion) {
    limpiarSesion(context.cookies);
    const destino = encodeURIComponent(pathname + context.url.search);
    return context.redirect(`/?redirigir=${destino}`);
  }

  const omitePrefijoRol = RUTAS_SIN_PREFIJO_ROL.some((prefijo) =>
    pathname.startsWith(prefijo)
  );

  if (!omitePrefijoRol) {
    const prefijoPermitido = PREFIJO_POR_ROL[sesion.IdRol];
    if (!prefijoPermitido || !pathname.startsWith(prefijoPermitido)) {
      return context.redirect(RUTA_POR_ROL[sesion.IdRol] || "/");
    }
  }

  context.locals.usuario = sesion;

  return next();
});