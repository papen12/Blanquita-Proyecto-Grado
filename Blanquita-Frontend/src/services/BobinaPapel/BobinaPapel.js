import {
  IngresoModelo,
  IngresoLoteBobinaPapelResponse,
  TipoBobinaPapelIngreso,
  EditarBobinaPapelRequest,
  EditarBobinaPapelResponse,
} from "../../models/BobinaPapel/BobinaPapel";
import {
  TipoBobinaPapelItem,
  TipoBobinaPapelDatos,
  EditarTipoBobinaPapelRequest,
  TipoBobinaPapelResponse,
} from "../../models/BobinaPapel/TipoBobina";
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
export async function listarTiposBobinaPapel() {
  const data = await pedirJson("/api/bobinapapel/tipos/listar");
  return data.map(TipoBobinaPapelItem);
}

export async function crearTipoBobinaPapel(datos) {
  const data = await pedirJson("/api/bobinapapel/tipos/crear", {
    method: "POST",
    body: TipoBobinaPapelDatos(datos),
  });
  return TipoBobinaPapelResponse(data);
}

export async function editarTipoBobinaPapel(idTipoBobina, datos) {
  const data = await pedirJson("/api/bobinapapel/tipos/editar", {
    method: "PUT",
    body: EditarTipoBobinaPapelRequest(idTipoBobina, datos),
  });
  return TipoBobinaPapelResponse(data);
}
