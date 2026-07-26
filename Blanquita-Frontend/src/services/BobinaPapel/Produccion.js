import {
  IniciarProduccionBobinaTuboRequest,
  IniciarProduccionBobinaTuboResponse,
  FinalizarProduccionBobinaTuboRequest,
  FinalizarProduccionBobinaTuboResponse,
  PausarProduccionBobinaTuboRequest,
  PausarProduccionBobinaTuboResponse,
  ReanudarProduccionBobinaTuboRequest,
  ReanudarProduccionBobinaTuboResponse,
  CancelarProduccionBobinaTuboRequest,
  CancelarProduccionBobinaTuboResponse,
  InsertarMovimientoOperadorLogsRequest,
  InsertarMovimientoOperadorLogsResponse,
  VerProduccionBobinaTuboResponse,
  VerPausasProduccionBobinaTuboActivasResponse
} from "../../models/BobinaPapel/Produccion";

async function manejarErrorBackend(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const error = new Error("Sesión no válida, inicia sesión nuevamente");
    error.status = 401;
    throw error;
  }

  const error = new Error(data.detail || "Error al procesar la solicitud");
  error.status = response.status;
  throw error;
}

export async function iniciarProduccion(idBobina1, idBobina2) {
  const payload = IniciarProduccionBobinaTuboRequest(idBobina1, idBobina2);

  const response = await fetch("/api/papelbobina/produccion/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IniciarProduccionBobinaTuboResponse(data);
}

export async function finalizarProduccion(idProduccionBobinaTubo) {
  const payload = FinalizarProduccionBobinaTuboRequest(idProduccionBobinaTubo);

  const response = await fetch("/api/papelbobina/produccion/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return FinalizarProduccionBobinaTuboResponse(data);
}

export async function pausarProduccion(idProduccionBobinaTubo, motivoPausaProduccion) {
  const payload = PausarProduccionBobinaTuboRequest(idProduccionBobinaTubo, motivoPausaProduccion);

  const response = await fetch("/api/papelbobina/produccion/pausar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return PausarProduccionBobinaTuboResponse(data);
}

export async function reanudarProduccion(idProduccionBobinaTubo) {
  const payload = ReanudarProduccionBobinaTuboRequest(idProduccionBobinaTubo);

  const response = await fetch("/api/papelbobina/produccion/reanudar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReanudarProduccionBobinaTuboResponse(data);
}

export async function cancelarProduccion(idProduccionBobinaTubo, motivoCancelacion) {
  const payload = CancelarProduccionBobinaTuboRequest(idProduccionBobinaTubo, motivoCancelacion);

  const response = await fetch("/api/papelbobina/produccion/cancelar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return CancelarProduccionBobinaTuboResponse(data);
}

export async function insertarMovimientoLog(idProduccionBobinaTubo, idTipoMovimientoOperadorLogs, cantidadLogs, observacion) {
  const payload = InsertarMovimientoOperadorLogsRequest(
    idProduccionBobinaTubo,
    idTipoMovimientoOperadorLogs,
    cantidadLogs,
    observacion
  );

  const response = await fetch("/api/papelbobina/produccion/insertarlog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return InsertarMovimientoOperadorLogsResponse(data);
}

export async function verProduccionBobinaTubo(idTipoBobina) {
  const params = new URLSearchParams();
  if (idTipoBobina !== undefined && idTipoBobina !== null) {
    params.set("IdTipoBobina", idTipoBobina);
  }
  const query = params.toString();

  const response = await fetch(
    `/api/papelbobina/produccion/activas${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerProduccionBobinaTuboResponse);
}

export async function verPausasProduccionBobinaTuboActivas(filtroIdTipoBobina) {
  const params = new URLSearchParams();
  if (filtroIdTipoBobina !== undefined && filtroIdTipoBobina !== null) {
    params.set("FiltroIdTipoBobina", filtroIdTipoBobina);
  }
  const query = params.toString();

  const response = await fetch(
    `/api/papelbobina/produccion/pausadas${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerPausasProduccionBobinaTuboActivasResponse);
}