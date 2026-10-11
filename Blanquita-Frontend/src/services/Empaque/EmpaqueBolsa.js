import {
  InventarioEmpaqueBolsaResponse,
  IngresoEmpaqueBolsaRequest,
  IngresoEmpaqueBolsaResponse,
  SalidaEmpaqueBolsaRequest,
  SalidaEmpaqueBolsaResponse
} from "../../models/Empaque/EmpaqueBolsa";
import { pedirJson } from "@/utils/api";

const BASE_URL = "/api/empaquebolsa";

export async function verInventarioEmpaqueBolsa() {
  const data = await pedirJson(`${BASE_URL}/inventario`);

  return data.map(InventarioEmpaqueBolsaResponse);
}

export async function cargarLoteEmpaqueBolsa(idProveedor, cantidadToneladasPedida, empaquesBolsa) {
  const data = await pedirJson(`${BASE_URL}/cargarlote`, {
    method: "POST",
    body: IngresoEmpaqueBolsaRequest(idProveedor, cantidadToneladasPedida, empaquesBolsa)
  });

  return IngresoEmpaqueBolsaResponse(data);
}

export async function sacarEmpaqueBolsa(idTipoEmpaqueBolsa, cantidad, observacion) {
  const data = await pedirJson(`${BASE_URL}/salida`, {
    method: "POST",
    body: SalidaEmpaqueBolsaRequest(idTipoEmpaqueBolsa, cantidad, observacion)
  });

  return SalidaEmpaqueBolsaResponse(data);
}
