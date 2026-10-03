import {
  ResumenInventarioRodelaResponse,
  DetalleInventarioRodelaResponse,
  RodelaEnAlmacenResponse,
  TrasladarRodelaRequest,
  TrasladarRodelaResponse,
  CorregirTrasladoRodelaRequest,
  CorregirTrasladoRodelaResponse,
  DeshacerTrasladoRodelaRequest,
  DeshacerTrasladoRodelaResponse,
  EditarRodelaRequest,
  EditarRodelaResponse,
  RodelaReingresableResponse
} from "../../models/Rodela/Inventario";
import { pedirJson } from "@/utils/api";

export async function verResumenInventarioRodela() {
  const data = await pedirJson("/api/rodela/inventario/resumen");

  return data.map(ResumenInventarioRodelaResponse);
}

export async function verDetalleInventarioRodela(idTipoRodela) {
  const params = new URLSearchParams({ IdTipoRodela: idTipoRodela });

  const data = await pedirJson(`/api/rodela/inventario/detalle?${params.toString()}`);

  return data.map(DetalleInventarioRodelaResponse);
}

export async function listarRodelasEnAlmacen(idTipoRodela) {
  const params = new URLSearchParams({ IdTipoRodela: idTipoRodela });

  const data = await pedirJson(`/api/rodela/inventario/enalmacen?${params.toString()}`);

  return data.map(RodelaEnAlmacenResponse);
}

export async function trasladarRodelaAProduccion(idRodela, observacion) {
  const payload = TrasladarRodelaRequest(idRodela, observacion);

  const data = await pedirJson("/api/rodela/inventario/trasladar", {
    method: "POST",
    body: payload
  });

  return TrasladarRodelaResponse(data);
}

export async function corregirTrasladoRodela(idRodela, observacion) {
  const payload = CorregirTrasladoRodelaRequest(idRodela, observacion);

  const data = await pedirJson("/api/rodela/inventario/corregir", {
    method: "POST",
    body: payload
  });

  return CorregirTrasladoRodelaResponse(data);
}

export async function listarRodelasReingresables() {
  const data = await pedirJson("/api/rodela/inventario/reingresables");

  return data.map(RodelaReingresableResponse);
}

export async function deshacerTrasladoRodela(idRodela, observacion) {
  const payload = DeshacerTrasladoRodelaRequest(idRodela, observacion);

  const data = await pedirJson("/api/rodela/inventario/deshacer", {
    method: "POST",
    body: payload
  });

  return DeshacerTrasladoRodelaResponse(data);
}

export async function editarRodela(idRodela, codigoRodela, observacion) {
  const payload = EditarRodelaRequest(idRodela, codigoRodela, observacion);

  const data = await pedirJson("/api/rodela/inventario/editar", {
    method: "POST",
    body: payload
  });

  return EditarRodelaResponse(data);
}
