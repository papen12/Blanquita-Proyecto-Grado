import {
  IngresoBobinaServilletaRequest,
  IngresoBobinaServilletaResponse
} from "../../models/BobinaServilleta/BobinaServilleta";
import { manejarErrorBackend } from "@/utils/validators";

export async function cargarLoteBobinaServilleta(idProveedor, idTipoBobinaServilleta, bobinas) {
  const payload = IngresoBobinaServilletaRequest(idProveedor, idTipoBobinaServilleta, bobinas);

  const response = await fetch("/api/bobinaservilleta/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoBobinaServilletaResponse(data);
}
