import {
  IngresoEmpaqueRequest,
  IngresoEmpaqueResponse,
  ResumenInventarioEmpaqueResponse,
  DetalleInventarioEmpaqueResponse,
  TrasladarEmpaquesProduccionRequest,
  TrasladarEmpaquesProduccionResponseItem,
  TipoEmpaqueIngreso
} from "../../models/Empaque/EmpaqueBobina";
import { manejarErrorBackend } from "@/utils/validators";

export async function cargarLoteEmpaque(idProveedor, cantidadToneladasPedida, empaques) {
  const payload = IngresoEmpaqueRequest(idProveedor, cantidadToneladasPedida, empaques);

  const response = await fetch("/api/empaquebobina/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoEmpaqueResponse(data);
}

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

export async function obtenerTiposEmpaque() {
  const response = await fetch("/api/empaquebobina/obtenertipos");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(TipoEmpaqueIngreso);
}