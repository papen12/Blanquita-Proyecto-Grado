import { PerfilResponse } from "../../models/Usuario/Perfil";
import { pedirJson } from "@/utils/api";

export async function obtenerPerfil() {
  return PerfilResponse(await pedirJson("/api/Usuario/ver"));
}
