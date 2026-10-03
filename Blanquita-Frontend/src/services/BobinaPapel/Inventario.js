import {
  VerResumenInventarioBobinaPapelResponse,
  VerDetalleInventarioBobinaPapelResponse,
  ReingresarBobinaAInventarioRequest,
  ReingresarBobinaAInventarioResponse,
  DarDeBajaBobinaRequest,
  DarDeBajaBobinaResponse,
  VerBobinasPapelFueraInventarioResponse
} from "../../models/BobinaPapel/Inventario";
import { pedirJson } from "@/utils/api";


export async function verResumenInventarioBobinaPapel() {
  const data = await pedirJson("/api/papelbobina/inventario/resumen");

  return data.map(VerResumenInventarioBobinaPapelResponse);
}

export async function verDetalleInventarioBobinaPapel(idTipoBobina) {
  const data = await pedirJson(`/api/papelbobina/inventario/detalle/${idTipoBobina}`);

  return data.map(VerDetalleInventarioBobinaPapelResponse);
}

export async function reingresarBobinaInventario(idBobinaPapel, observacion) {
  const payload = ReingresarBobinaAInventarioRequest(idBobinaPapel, observacion);

  const data = await pedirJson("/api/papelbobina/inventario/reingresar", {
    method: "POST",
    body: payload
  });

  return ReingresarBobinaAInventarioResponse(data);
}

export async function darDeBajaBobina(idBobinaPapel, observacion) {
  const payload = DarDeBajaBobinaRequest(idBobinaPapel, observacion);

  const data = await pedirJson("/api/papelbobina/inventario/dardebaja", {
    method: "POST",
    body: payload
  });

  return DarDeBajaBobinaResponse(data);
}

export async function verBobinasPapelFueraInventario() {
  const data = await pedirJson("/api/papelbobina/inventario/fuera");

  return data.map(VerBobinasPapelFueraInventarioResponse);
}