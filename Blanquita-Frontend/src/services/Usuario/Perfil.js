import { PerfilResponse, PerfilUpdateRequest } from "../../models/Usuario/Perfil";
import { manejarErrorBackend } from "@/utils/validators";

export async function obtenerPerfil() {
  const response = await fetch("/api/Usuario/ver");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return PerfilResponse(await response.json());
}

export async function editarPerfil(datos) {
  const response = await fetch("/api/Usuario/editar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(PerfilUpdateRequest(datos))
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return PerfilResponse(await response.json());
}
