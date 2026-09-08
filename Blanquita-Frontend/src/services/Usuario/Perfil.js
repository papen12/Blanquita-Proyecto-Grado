import { PerfilResponse } from "../../models/Usuario/Perfil";
import { manejarErrorBackend } from "@/utils/validators";

export async function obtenerPerfil() {
  const response = await fetch("/api/Usuario/ver");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return PerfilResponse(await response.json());
}
