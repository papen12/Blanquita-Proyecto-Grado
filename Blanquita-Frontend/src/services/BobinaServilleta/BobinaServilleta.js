import {
  IngresoBobinaServilletaRequest,
  IngresoBobinaServilletaResponse,
  TipoBobinaServilletaIngreso
} from "../../models/BobinaServilleta/BobinaServilleta";
import { pedirJson } from "@/utils/api";

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
