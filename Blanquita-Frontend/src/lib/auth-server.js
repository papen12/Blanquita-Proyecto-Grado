import { jwtVerify } from "jose";
import { refresh } from "../services/Usuario/Auth";

export const SECRET_KEY = new TextEncoder().encode(import.meta.env.SECRET_KEY);
export const ACCESS_TOKEN_MAX_AGE_SEGUNDOS = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 30;

const refrescosEnCurso = new Map();

export function limpiarSesion(cookies) {
  cookies.delete("token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
}

function extraerRefreshTokenCrudo(setCookieHeader) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/refresh_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function refrescarDeduplicando(refreshTokenCrudo) {
  if (refrescosEnCurso.has(refreshTokenCrudo)) {
    return refrescosEnCurso.get(refreshTokenCrudo);
  }

  const promesa = refresh(refreshTokenCrudo).finally(() => {
    refrescosEnCurso.delete(refreshTokenCrudo);
  });

  refrescosEnCurso.set(refreshTokenCrudo, promesa);
  return promesa;
}

export async function obtenerAccessTokenValido(cookies) {
  const token = cookies.get("token")?.value;

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      return token;
    } catch {
    }
  }

  const refreshTokenCrudo = cookies.get("refresh_token")?.value;
  if (!refreshTokenCrudo) return null;

  try {
    const resultado = await refrescarDeduplicando(refreshTokenCrudo);

    cookies.set("token", resultado.AccessToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SEGUNDOS
    });

    const nuevoRefreshTokenCrudo = extraerRefreshTokenCrudo(resultado.SetCookie);
    if (nuevoRefreshTokenCrudo) {
      cookies.set("refresh_token", nuevoRefreshTokenCrudo, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "strict",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SEGUNDOS
      });
    }

    return resultado.AccessToken;
  } catch {
    return null;
  }
}