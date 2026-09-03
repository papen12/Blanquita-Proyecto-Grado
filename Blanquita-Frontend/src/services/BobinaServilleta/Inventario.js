import {
  ReingresarSubBobinaInventarioRequest,
  ReingresarSubBobinaInventarioResponse,
  DarDeBajaSubBobinaRequest,
  DarDeBajaSubBobinaResponse,
  ResumenInventarioBobinaServilletaResponse,
  DetalleInventarioBobinaServilletaResponse,
  ResumenInventarioSubBobinaServilletaResponse,
  DetalleInventarioSubBobinaServilletaResponse,
  SubBobinaServilletaFueraInventarioResponse
} from "../../models/BobinaServilleta/Inventario";
import { manejarErrorBackend } from "@/utils/validators";

export async function reingresarSubBobinaInventario(idSubBobina, observacion) {
  const payload = ReingresarSubBobinaInventarioRequest(idSubBobina, observacion);

  const response = await fetch("/api/bobinaservilleta/inventario/reingresar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReingresarSubBobinaInventarioResponse(data);
}

export async function darDeBajaSubBobina(idSubBobina, observacion) {
  const payload = DarDeBajaSubBobinaRequest(idSubBobina, observacion);

  const response = await fetch("/api/bobinaservilleta/inventario/dardebaja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DarDeBajaSubBobinaResponse(data);
}

export async function verResumenInventarioBobinaServilleta() {
  const response = await fetch("/api/bobinaservilleta/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioBobinaServilletaResponse);
}

export async function verDetalleInventarioBobinaServilleta(idTipoBobinaServilleta) {
  const params = new URLSearchParams({ IdTipoBobinaServilleta: idTipoBobinaServilleta });

  const response = await fetch(`/api/bobinaservilleta/inventario/detalle?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioBobinaServilletaResponse);
}

export async function verResumenInventarioSubBobinaServilleta() {
  const response = await fetch("/api/bobinaservilleta/inventario/sub/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioSubBobinaServilletaResponse);
}

export async function verDetalleInventarioSubBobinaServilleta(idTipoMedidaSubBobina) {
  const params = new URLSearchParams({ IdTipoMedidaSubBobina: idTipoMedidaSubBobina });

  const response = await fetch(`/api/bobinaservilleta/inventario/sub/detalle?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioSubBobinaServilletaResponse);
}

export async function verSubBobinasServilletaFueraInventario() {
  const response = await fetch("/api/bobinaservilleta/inventario/sub/fuera");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(SubBobinaServilletaFueraInventarioResponse);
}
