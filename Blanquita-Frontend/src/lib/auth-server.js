import { jwtVerify } from "jose";
import { refresh } from "../services/Usuario/Auth";

export const SECRET_KEY = new TextEncoder().encode(import.meta.env.SECRET_KEY);
export const ACCESS_TOKEN_MAX_AGE_SEGUNDOS = 60 * 15;

export function limpiarSesion(cookies) {
  cookies.delete("token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
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
    const resultado = await refresh(refreshTokenCrudo);
    cookies.set("token", resultado.AccessToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SEGUNDOS
    });
    return resultado.AccessToken;
  } catch {
    return null;
  }
}