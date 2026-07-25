import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
  LogoutTodosResponse
} from "../../models/Usuario/Auth";

const BACKEND_URL = import.meta.env.BACKEND_URL;

async function manejarErrorBackend(response) {
  const data = await response.json().catch(() => ({}));
  const error = new Error(data.detail || "Error en el servidor de autenticación");
  error.status = response.status;
  throw error;
}

export async function login(ci, clave) {
  const payload = LoginRequest(ci, clave);

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return {
    ...LoginResponse(data),
    SetCookie: response.headers.get("set-cookie")
  };
}

export async function refresh(refreshTokenCrudo) {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `refresh_token=${refreshTokenCrudo}`
    }
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return {
    ...RefreshResponse(data),
    SetCookie: response.headers.get("set-cookie")
  };
}

export async function logout(refreshTokenCrudo) {
  const response = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    headers: refreshTokenCrudo
      ? { Cookie: `refresh_token=${refreshTokenCrudo}` }
      : {}
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return LogoutResponse(data);
}

export async function logoutTodos(accessToken) {
  const response = await fetch(`${BACKEND_URL}/auth/logout-todos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return LogoutTodosResponse(data);
}