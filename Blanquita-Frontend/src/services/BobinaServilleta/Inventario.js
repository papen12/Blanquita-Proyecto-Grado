import {
  ReingresarSubBobinaInventarioRequest,
  ReingresarSubBobinaInventarioResponse,
  ResumenInventarioBobinaServilletaResponse,
  DetalleInventarioBobinaServilletaResponse,
  ResumenInventarioSubBobinaServilletaResponse,
  DetalleInventarioSubBobinaServilletaResponse,
  SubBobinaServilletaFueraInventarioResponse,
  EditarBobinaServilletaRequest,
  EditarBobinaServilletaResponse
} from "../../models/BobinaServilleta/Inventario";
import { pedirJson } from "@/utils/api";

export async function reingresarSubBobinaInventario(idSubBobina, observacion) {
  const payload = ReingresarSubBobinaInventarioRequest(idSubBobina, observacion);

  const data = await pedirJson("/api/bobinaservilleta/inventario/reingresar", {
    method: "POST",
    body: payload
  });

  return ReingresarSubBobinaInventarioResponse(data);
}

export async function verResumenInventarioBobinaServilleta() {
  const data = await pedirJson("/api/bobinaservilleta/inventario/resumen");

  return data.map(ResumenInventarioBobinaServilletaResponse);
}

export async function verDetalleInventarioBobinaServilleta(idTipoBobinaServilleta) {
  const params = new URLSearchParams({ IdTipoBobinaServilleta: idTipoBobinaServilleta });

  const data = await pedirJson(`/api/bobinaservilleta/inventario/detalle?${params.toString()}`);

  return data.map(DetalleInventarioBobinaServilletaResponse);
}

export async function verResumenInventarioSubBobinaServilleta() {
  const data = await pedirJson("/api/bobinaservilleta/inventario/sub/resumen");

  return data.map(ResumenInventarioSubBobinaServilletaResponse);
}

export async function verDetalleInventarioSubBobinaServilleta(idTipoMedidaSubBobina) {
  const params = new URLSearchParams({ IdTipoMedidaSubBobina: idTipoMedidaSubBobina });

  const data = await pedirJson(`/api/bobinaservilleta/inventario/sub/detalle?${params.toString()}`);

  return data.map(DetalleInventarioSubBobinaServilletaResponse);
}

export async function verSubBobinasServilletaFueraInventario() {
  const data = await pedirJson("/api/bobinaservilleta/inventario/sub/fuera");

  return data.map(SubBobinaServilletaFueraInventarioResponse);
}


export async function editarBobinaServilleta(idBobinaServilleta, unidades, observacion) {
  const payload = EditarBobinaServilletaRequest(idBobinaServilleta, unidades, observacion);

  const data = await pedirJson("/api/bobinaservilleta/inventario/editar", {
    method: "POST",
    body: payload
  });

  return data.map(EditarBobinaServilletaResponse);
}
