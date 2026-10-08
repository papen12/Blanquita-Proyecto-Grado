import {
  IngresoBobinaServilletaRequest,
  IngresoBobinaServilletaResponse,
  TipoBobinaServilletaIngreso
} from "../../models/BobinaServilleta/BobinaServilleta";
import {
  ListarTiposBobinaServilletaRequest,
  ListarTiposBobinaServilletaResponse,
  TipoBobinaServilletaDatos,
  EditarTipoBobinaServilletaRequest,
  TipoBobinaServilletaResponse,
} from "../../models/BobinaServilleta/TipoBobinaServilleta";
import { pedirJson } from "@/utils/api";
import { conQueryParams } from "@/utils/params";

export async function cargarLoteBobinaServilleta(idProveedor, idTipoBobinaServilleta, bobinas) {
  const payload = IngresoBobinaServilletaRequest(idProveedor, idTipoBobinaServilleta, bobinas);

  const data = await pedirJson("/api/bobinaservilleta/cargarlote", {
    method: "POST",
    body: payload
  });

  return IngresoBobinaServilletaResponse(data);
}

export async function ObtenerTiposBobinaServilleta() {
  const data = await pedirJson("/api/bobinaservilleta/obtenertipos");

  return data.map(TipoBobinaServilletaIngreso);
}

export async function listarTiposBobinaServilleta(filtros) {
  const data = await pedirJson(
    conQueryParams("/api/bobinaservilleta/tipos/listar", ListarTiposBobinaServilletaRequest(filtros)),
  );
  return ListarTiposBobinaServilletaResponse(data);
}

export async function crearTipoBobinaServilleta(datos) {
  const data = await pedirJson("/api/bobinaservilleta/tipos/crear", {
    method: "POST",
    body: TipoBobinaServilletaDatos(datos),
  });
  return TipoBobinaServilletaResponse(data);
}

export async function editarTipoBobinaServilleta(idTipoBobinaServilleta, datos) {
  const data = await pedirJson("/api/bobinaservilleta/tipos/editar", {
    method: "PUT",
    body: EditarTipoBobinaServilletaRequest(idTipoBobinaServilleta, datos),
  });
  return TipoBobinaServilletaResponse(data);
}
