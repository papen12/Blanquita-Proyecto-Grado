import { UsuarioLogin, UsuarioLoginResponse } from "../models/Usuario/UsuarioLogIn";

const BACKEND_URL = import.meta.env.BACKEND_URL;

export async function login(ci, clave) {
  const payload = UsuarioLogin(ci, clave);

  const response = await fetch(`${BACKEND_URL}/Usuario/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.detail || "Error al iniciar sesión");
    error.status = response.status;
    throw error;
  }

  return UsuarioLoginResponse(data);
}