import {
  VerResumenInventarioBobinaPapelResponse,
  VerDetalleInventarioBobinaPapelResponse,
} from "../models/BobinaPapel/InventarioBobinaPapel";

export async function VerResumenInventarioBobinaPapel() {
  const response = await fetch(`/api/papelbobina/verinventariobobinapapel`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Error al obtener el resumen del inventario de bobinas de papel");
  }

  return data.map((item) => new VerResumenInventarioBobinaPapelResponse(item));
}

export async function VerDetalleInventarioBobinaPapel(IdTipoBobina) {
  const response = await fetch(`/api/papelbobina/verdetalleinventariobobinapapel/${IdTipoBobina}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Error al obtener el detalle del inventario de bobinas de papel");
  }

  return data.map((item) => new VerDetalleInventarioBobinaPapelResponse(item));
}