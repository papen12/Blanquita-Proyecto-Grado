import {
  IngresoRodelaRequest,
  IngresoRodelaResponse,
  TipoRodelaIngreso
} from "../../models/Rodela/Rodela";
import { pedirJson } from "@/utils/api";


export async function cargarLoteRodela(idProveedor, idTipoRodela, rodelas) {
  const payload = IngresoRodelaRequest(idProveedor, idTipoRodela, rodelas);

  const data = await pedirJson("/api/rodela/cargarlote", {
    method: "POST",
    body: payload
  });

  return IngresoRodelaResponse(data);
}

export async function ObtenerTiposRodela() {
  const data = await pedirJson("/api/rodela/obtenertipos");
  return data.map(TipoRodelaIngreso);
}
