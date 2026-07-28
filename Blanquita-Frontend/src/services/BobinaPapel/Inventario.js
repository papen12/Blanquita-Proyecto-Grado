import {
  VerResumenInventarioBobinaPapelResponse,
  VerDetalleInventarioBobinaPapelResponse,
  ReingresarBobinaAInventarioRequest,
  ReingresarBobinaAInventarioResponse,
  DarDeBajaBobinaRequest,
  DarDeBajaBobinaResponse,
  VerBobinasPapelFueraInventarioResponse
} from "../../models/BobinaPapel/Inventario";
import { manejarErrorBackend } from "@/utils/Error";


export async function verResumenInventarioBobinaPapel() {
  const response = await fetch("/api/papelbobina/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerResumenInventarioBobinaPapelResponse);
}

export async function verDetalleInventarioBobinaPapel(idTipoBobina) {
  const response = await fetch(`/api/papelbobina/inventario/detalle/${idTipoBobina}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerDetalleInventarioBobinaPapelResponse);
}

export async function reingresarBobinaInventario(idBobinaPapel, observacion) {
  const payload = ReingresarBobinaAInventarioRequest(idBobinaPapel, observacion);

  const response = await fetch("/api/papelbobina/inventario/reingresar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReingresarBobinaAInventarioResponse(data);
}

export async function darDeBajaBobina(idBobinaPapel, observacion) {
  const payload = DarDeBajaBobinaRequest(idBobinaPapel, observacion);

  const response = await fetch("/api/papelbobina/inventario/dardebaja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DarDeBajaBobinaResponse(data);
}

export async function verBobinasPapelFueraInventario() {
  const response = await fetch("/api/papelbobina/inventario/fuera");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerBobinasPapelFueraInventarioResponse);
}