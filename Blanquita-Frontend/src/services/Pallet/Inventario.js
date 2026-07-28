import {
  ResumenInventarioPalletResponse,
  DetalleInventarioPalletResponse,
  ReingresarPalletInventarioRequest,
  ReingresarPalletInventarioResponse,
  DarDeBajaPalletRequest,
  DarDeBajaPalletResponse,
  PalletFueraInventarioResponse
} from "../../models/Pallet/Inventario";
import { manejarErrorBackend } from "@/utils/Error";

export async function verResumenInventarioPallet() {
  const response = await fetch("/api/pallet/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioPalletResponse);
}

export async function verDetalleInventarioPallet(idTipoPallet) {
  const response = await fetch(`/api/pallet/inventario/detalle/${idTipoPallet}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioPalletResponse);
}

export async function reingresarPalletInventario(idPallet, observacion) {
  const payload = ReingresarPalletInventarioRequest(idPallet, observacion);

  const response = await fetch("/api/pallet/inventario/reingresar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReingresarPalletInventarioResponse(data);
}

export async function darDeBajaPallet(idPallet, observacion) {
  const payload = DarDeBajaPalletRequest(idPallet, observacion);

  const response = await fetch("/api/pallet/inventario/dardebaja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DarDeBajaPalletResponse(data);
}

export async function verPalletsFueraInventario() {
  const response = await fetch("/api/pallet/inventario/fuera");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(PalletFueraInventarioResponse);
}