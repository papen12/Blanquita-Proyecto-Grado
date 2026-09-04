import {
  ResumenInventarioEmpaqueResponse,
  DetalleInventarioEmpaqueResponse,
  TrasladarEmpaquesProduccionRequest,
  TrasladarEmpaquesProduccionResponseItem
} from "../../models/Empaque/EmpaqueBobina";
import { manejarErrorBackend } from "@/utils/validators";

export async function verResumenInventarioEmpaque() {
  const response = await fetch("/api/empaquebobina/inventario");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioEmpaqueResponse);
}

export async function verDetalleInventarioEmpaque(idTipoEmpaque) {
  const params = new URLSearchParams({ IdTipoEmpaque: idTipoEmpaque });

  const response = await fetch(`/api/empaquebobina/inventariodetalle?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioEmpaqueResponse);
}

export async function trasladarEmpaquesAProduccion(idsEmpaque) {
  const payload = TrasladarEmpaquesProduccionRequest(idsEmpaque);

  const response = await fetch("/api/empaquebobina/trasladarproduccion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(TrasladarEmpaquesProduccionResponseItem);
}