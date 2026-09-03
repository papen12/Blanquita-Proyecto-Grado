import {
  IngresoRodelaRequest,
  IngresoRodelaResponse,
  TipoRodelaIngreso
} from "../../models/Rodela/Rodela";
import { manejarErrorBackend } from "@/utils/validators";


export async function cargarLoteRodela(idProveedor, idTipoRodela, rodelas) {
  const payload = IngresoRodelaRequest(idProveedor, idTipoRodela, rodelas);

  const response = await fetch("/api/rodela/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoRodelaResponse(data);
}

export async function ObtenerTiposRodela() {
  const response = await fetch("/api/rodela/obtenertipos");
  if (!response.ok) {
    await manejarErrorBackend(response);
  }
  const data = await response.json();
  return data.map(TipoRodelaIngreso);
}
