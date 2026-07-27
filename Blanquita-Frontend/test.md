export const BobinaPapel = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel ?? null,
  CodigoBobina: data.CodigoBobina,
  IdTipoBobina: data.IdTipoBobina,
  IdLoteBobina: data.IdLoteBobina,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  PesoBrutoKg: data.PesoBrutoKg ?? null,
  Gramaje: data.Gramaje ?? null,
  PesoNetoKg: data.PesoNetoKg ?? null
});

export const ListaBobinasPapel = (data) => ({
  Bobinas: (data.Bobinas ?? []).map(BobinaPapel)
});

export const BobinaPapelIngresoItem = (data) => ({
  CodigoBobina: data.CodigoBobina,
  PesoBrutoKg: data.PesoBrutoKg ?? null,
  Gramaje: data.Gramaje ?? null,
  PesoNetoKg: data.PesoNetoKg ?? null
});

export const IngresoModelo = (data) => ({
  IdProveedor: data.IdProveedor,
  IdTipoBobina: data.IdTipoBobina,
  Bobinas: (data.Bobinas ?? []).map(BobinaPapelIngresoItem)
});

export const IngresoLoteBobinaPapelResponse = (data) => ({
  FechaRecepcion: data.FechaRecepcion,
  CantidadBobinas: data.CantidadBobinas
});


import { IngresoModelo, IngresoLoteBobinaPapelResponse } from "../../models/BobinaPapel/BobinaPapel";

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

export async function cargarLoteBobinaPapel(idProveedor, idTipoBobina, bobinas) {
  const payload = IngresoModelo({
    IdProveedor: idProveedor,
    IdTipoBobina: idTipoBobina,
    Bobinas: bobinas
  });

  const response = await fetch("/api/bobinapapel/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoLoteBobinaPapelResponse(data);
}

