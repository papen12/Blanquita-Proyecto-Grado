import { IngresoModelo, IngresoLoteBobinaPapelResponse } from "../../models/BobinaPapel/BobinaPapel";
import { manejarErrorBackend } from "@/utils/Error";
export async function cargarLoteBobinaPapel(idProveedor, idTipoBobina, bobinas) {
  const payload = IngresoModelo({
    IdProveedor: idProveedor,
    IdTipoBobina: idTipoBobina,
    Bobinas: bobinas
  });

  const response = await fetch("/api/bobinapapel/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoLoteBobinaPapelResponse(data);
}