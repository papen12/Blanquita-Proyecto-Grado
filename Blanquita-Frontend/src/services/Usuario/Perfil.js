import { PerfilResponse, PerfilUpdateRequest } from "../../models/Usuario/Perfil";
import { pedirJson } from "@/utils/api";

export async function obtenerPerfil() {
  return PerfilResponse(await pedirJson("/api/Usuario/ver"));
}

export async function editarPerfil(datos) {
  return PerfilResponse(await pedirJson("/api/Usuario/editar", {
    method: "POST",
    body: PerfilUpdateRequest(datos)
  }));
}
