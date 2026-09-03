import {
  AbrirBobinaServilletaRequest,
  AbrirBobinaServilletaResponse,
  IniciarProduccionServilletaRequest,
  IniciarProduccionServilletaResponse,
  PausaProduccionServilletaRequest,
  PausaProduccionServilletaResponse,
  ReanudarProduccionServilletaRequest,
  ReanudarProduccionServilletaResponse,
  FinalizarProduccionServilletaRequest,
  FinalizarProduccionServilletaResponse,
  CancelarProduccionServilletaRequest,
  CancelarProduccionServilletaResponse,
  VerProduccionServilletaActivasResponse,
  VerPausasProduccionServilletaActivasResponse
} from "../../models/BobinaServilleta/Produccion";
import { manejarErrorBackend } from "@/utils/validators";

export async function abrirBobinaServilleta(idBobinaServilleta, observacion) {
  const payload = AbrirBobinaServilletaRequest(idBobinaServilleta, observacion);

  const response = await fetch("/api/bobinaservilleta/produccion/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return AbrirBobinaServilletaResponse(data);
}

export async function iniciarProduccionServilleta(idSubBobina) {
  const payload = IniciarProduccionServilletaRequest(idSubBobina);

  const response = await fetch("/api/bobinaservilleta/produccion/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IniciarProduccionServilletaResponse(data);
}

export async function pausarProduccionServilleta(idProduccionServilleta, motivoPausaProduccion) {
  const payload = PausaProduccionServilletaRequest(idProduccionServilleta, motivoPausaProduccion);

  const response = await fetch("/api/bobinaservilleta/produccion/pausar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return PausaProduccionServilletaResponse(data);
}

export async function reanudarProduccionServilleta(idProduccionServilleta) {
  const payload = ReanudarProduccionServilletaRequest(idProduccionServilleta);

  const response = await fetch("/api/bobinaservilleta/produccion/reanudar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReanudarProduccionServilletaResponse(data);
}

export async function finalizarProduccionServilleta(idProduccionServilleta) {
  const payload = FinalizarProduccionServilletaRequest(idProduccionServilleta);

  const response = await fetch("/api/bobinaservilleta/produccion/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return FinalizarProduccionServilletaResponse(data);
}

export async function cancelarProduccionServilleta(idProduccionServilleta, motivoCancelacion) {
  const payload = CancelarProduccionServilletaRequest(idProduccionServilleta, motivoCancelacion);

  const response = await fetch("/api/bobinaservilleta/produccion/cancelar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return CancelarProduccionServilletaResponse(data);
}

export async function verProduccionServilletaActivas(idTipoMedidaSubBobina) {
  const params = new URLSearchParams();
  if (idTipoMedidaSubBobina !== undefined && idTipoMedidaSubBobina !== null) {
    params.set("IdTipoMedidaSubBobina", idTipoMedidaSubBobina);
  }
  const query = params.toString();

  const response = await fetch(
    `/api/bobinaservilleta/produccion/activas${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerProduccionServilletaActivasResponse);
}

export async function verPausasProduccionServilletaActivas() {
  const response = await fetch("/api/bobinaservilleta/produccion/pausadas");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerPausasProduccionServilletaActivasResponse);
}
