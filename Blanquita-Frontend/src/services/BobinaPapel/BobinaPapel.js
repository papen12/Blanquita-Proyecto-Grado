import {
  IngresoModelo,
  IngresoLoteBobinaPapelResponse,
  TipoBobinaPapelIngreso,
  EditarBobinaPapelRequest,
  EditarBobinaPapelResponse,
} from "../../models/BobinaPapel/BobinaPapel";
import { pedirJson } from "@/utils/api";
export async function cargarLoteBobinaPapel(idProveedor, idTipoBobina, bobinas) {
  const payload = IngresoModelo({
    IdProveedor: idProveedor,
    IdTipoBobina: idTipoBobina,
    Bobinas: bobinas
  });

  const data = await pedirJson("/api/bobinapapel/cargarlote", {
    method: "POST",
    body: payload
  });

  return IngresoLoteBobinaPapelResponse(data);
}


export async function ObtenerTiposPapelBobina(){
  const data = await pedirJson("/api/bobinapapel/obtenertipos");
  return data.map(TipoBobinaPapelIngreso)
}

export async function editarBobinaPapel(datos) {
  const payload = EditarBobinaPapelRequest(datos);

  const data = await pedirJson("/api/bobinapapel/editar", {
    method: "PATCH",
    body: payload
  });

  return EditarBobinaPapelResponse(data);
}