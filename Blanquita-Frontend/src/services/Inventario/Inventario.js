import {
  IngresoProductoTerminadoRequest,
  IngresoProductoTerminadoResponseList,
  SalidaProductoTerminadoRequest,
  SalidaProductoTerminadoResponseList,
  AjustePositivoInventarioRequest,
  AjustePositivoInventarioResponse,
  AjusteNegativoInventarioRequest,
  AjusteNegativoInventarioResponse,
  VerInventarioProductoTerminadoQueryParams,
  VerInventarioProductoTerminadoResponseList
} from "../../models/Inventario/inventario";

import { manejarErrorBackend } from "@/utils/validators";

export async function insertarIngresoProductoTerminado(presentaciones) {
  const payload = IngresoProductoTerminadoRequest({ Presentaciones: presentaciones });

  const response = await fetch("/api/productofinal/insertar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoProductoTerminadoResponseList(data);
}

export async function insertarSalidaProductoTerminado(presentaciones) {
  const payload = SalidaProductoTerminadoRequest({ Presentaciones: presentaciones });

  const response = await fetch("/api/productofinal/salida", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return SalidaProductoTerminadoResponseList(data);
}

export async function ajustePositivoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = AjustePositivoInventarioRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion ?? null
  });

  const response = await fetch("/api/productofinal/ajuste/positivo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return AjustePositivoInventarioResponse(data);
}

export async function ajusteNegativoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = AjusteNegativoInventarioRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion ?? null
  });

  const response = await fetch("/api/productofinal/ajuste/negativo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return AjusteNegativoInventarioResponse(data);
}

export async function verInventarioProductoTerminado(idProducto) {
  const params = VerInventarioProductoTerminadoQueryParams({ IdProducto: idProducto ?? null });

  const query = params.toString();
  const url = query
    ? `/api/productofinal/inventario/ver?${query}`
    : "/api/productofinal/inventario/ver";

  const response = await fetch(url);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerInventarioProductoTerminadoResponseList(data);
}