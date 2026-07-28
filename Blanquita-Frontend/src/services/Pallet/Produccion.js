import {
  IniciarProduccionPalletRequest,
  IniciarProduccionPalletResponse,
  PausaProduccionPalletRequest,
  PausaProduccionPalletResponse,
  ReanudarProduccionPalletRequest,
  ReanudarProduccionPalletResponse,
  FinalizarProduccionPalletRequest,
  FinalizarProduccionPalletResponse,
  CancelarProduccionPalletRequest,
  CancelarProduccionPalletResponse,
  VerProduccionPalletRequest,
  VerProduccionPalletResponse,
  VerPausasProduccionPalletActivasRequest,
  VerPausasProduccionPalletActivasResponse
} from "../../models/Pallet/ProduccionPallet";

import { manejarErrorBackend } from "@/utils/Error";

export async function iniciarProduccionPallet(idPallet) {
  const payload = IniciarProduccionPalletRequest(idPallet);

  const response = await fetch("/api/pallet/produccion/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IniciarProduccionPalletResponse(data);
}

export async function pausarProduccionPallet(idProduccionPalletTubo, motivoPausaProduccion) {
  const payload = PausaProduccionPalletRequest(idProduccionPalletTubo, motivoPausaProduccion);

  const response = await fetch("/api/pallet/produccion/pausar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return PausaProduccionPalletResponse(data);
}

export async function reanudarProduccionPallet(idProduccionPalletTubo) {
  const payload = ReanudarProduccionPalletRequest(idProduccionPalletTubo);

  const response = await fetch("/api/pallet/produccion/reanudar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReanudarProduccionPalletResponse(data);
}

export async function finalizarProduccionPallet(idProduccionPalletTubo) {
  const payload = FinalizarProduccionPalletRequest(idProduccionPalletTubo);

  const response = await fetch("/api/pallet/produccion/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return FinalizarProduccionPalletResponse(data);
}

export async function cancelarProduccionPallet(idProduccionPalletTubo, motivoCancelacion) {
  const payload = CancelarProduccionPalletRequest(idProduccionPalletTubo, motivoCancelacion);

  const response = await fetch("/api/pallet/produccion/cancelar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return CancelarProduccionPalletResponse(data);
}

export async function verProduccionPallet(idTipoPallet) {
  const params = new URLSearchParams();

  if (idTipoPallet !== undefined && idTipoPallet !== null) {
    params.append("IdTipoPallet", idTipoPallet);
  }

  const query = params.toString();
  const url = query
    ? `/api/pallet/produccion/ver?${query}`
    : "/api/pallet/produccion/ver";

  const response = await fetch(url);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerProduccionPalletResponse);
}

export async function verPausasProduccionPalletActivas(idTipoPallet) {
  const params = new URLSearchParams();

  if (idTipoPallet !== undefined && idTipoPallet !== null) {
    params.append("IdTipoPallet", idTipoPallet);
  }

  const query = params.toString();
  const url = query
    ? `/api/pallet/produccion/pausas-activas?${query}`
    : "/api/pallet/produccion/pausas-activas";

  const response = await fetch(url);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerPausasProduccionPalletActivasResponse);
}