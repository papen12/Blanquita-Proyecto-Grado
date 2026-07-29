import {
  LoginRequest,
  RefreshRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse
} from "../../models/Usuario/Auth";
import { manejarErrorBackend } from "@/utils/Error";

const BACKEND_URL = import.meta.env.BACKEND_URL;

export async function login(ci, clave, ip, userAgent) {
  const headers = { "Content-Type": "application/json" };
  if (ip) headers["X-Forwarded-For"] = ip;
  if (userAgent) headers["X-Client-User-Agent"] = userAgent;

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(LoginRequest(ci, clave))
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return LoginResponse(await response.json());
}

export async function refresh(refreshTokenCrudo) {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(RefreshRequest(refreshTokenCrudo))
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return RefreshResponse(await response.json());
}

export async function logout(accessToken) {
  const response = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return LogoutResponse(await response.json());
}

export async function logoutTodos(accessToken) {
  const response = await fetch(`${BACKEND_URL}/auth/logout-todos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return LogoutResponse(await response.json());
}