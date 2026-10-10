import {
  CatalogoInsumoResponse,
  MovimientoInsumoRequest,
  MovimientoInsumoResponse
} from "../../models/Insumo/Insumo";
import { pedirJson } from "@/utils/api";

export async function verCatalogoInsumo() {
  const data = await pedirJson("/api/insumo/inventario");

  return data.map(CatalogoInsumoResponse);
}

export async function ingresarInsumo(idTipoInsumo, cantidad, observacion) {
  const payload = MovimientoInsumoRequest(idTipoInsumo, cantidad, observacion);

  const data = await pedirJson("/api/insumo/ingreso", {
    method: "POST",
    body: payload
  });

  return MovimientoInsumoResponse(data);
}

export async function sacarInsumo(idTipoInsumo, cantidad, observacion) {
  const payload = MovimientoInsumoRequest(idTipoInsumo, cantidad, observacion);

  const data = await pedirJson("/api/insumo/salida", {
    method: "POST",
    body: payload
  });

  return MovimientoInsumoResponse(data);
}
