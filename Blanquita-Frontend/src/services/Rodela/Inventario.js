import {
  ResumenInventarioRodelaResponse,
  DetalleInventarioRodelaResponse,
  RodelaEnAlmacenResponse,
  TrasladarRodelaRequest,
  TrasladarRodelaResponse,
  CorregirTrasladoRodelaRequest,
  CorregirTrasladoRodelaResponse,
  DeshacerTrasladoRodelaRequest,
  DeshacerTrasladoRodelaResponse,
  RodelaReingresableResponse
} from "../../models/Rodela/Inventario";
import { manejarErrorBackend } from "@/utils/validators";

export async function verResumenInventarioRodela() {
  const response = await fetch("/api/rodela/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioRodelaResponse);
}

export async function verDetalleInventarioRodela(idTipoRodela) {
  const params = new URLSearchParams({ IdTipoRodela: idTipoRodela });

  const response = await fetch(`/api/rodela/inventario/detalle?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioRodelaResponse);
}

export async function listarRodelasEnAlmacen(idTipoRodela) {
  const params = new URLSearchParams({ IdTipoRodela: idTipoRodela });

  const response = await fetch(`/api/rodela/inventario/enalmacen?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(RodelaEnAlmacenResponse);
}

export async function trasladarRodelaAProduccion(idRodela, observacion) {
  const payload = TrasladarRodelaRequest(idRodela, observacion);

  const response = await fetch("/api/rodela/inventario/trasladar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return TrasladarRodelaResponse(data);
}

export async function corregirTrasladoRodela(idRodela, observacion) {
  const payload = CorregirTrasladoRodelaRequest(idRodela, observacion);

  const response = await fetch("/api/rodela/inventario/corregir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return CorregirTrasladoRodelaResponse(data);
}

export async function listarRodelasReingresables() {
  const response = await fetch("/api/rodela/inventario/reingresables");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(RodelaReingresableResponse);
}

export async function deshacerTrasladoRodela(idRodela, observacion) {
  const payload = DeshacerTrasladoRodelaRequest(idRodela, observacion);

  const response = await fetch("/api/rodela/inventario/deshacer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DeshacerTrasladoRodelaResponse(data);
}
