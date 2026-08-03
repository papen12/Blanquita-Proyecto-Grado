import {
  IngresoPalletRequest,
  IngresoPalletResponse
} from "../../models/Pallet/Pallet";
import { manejarErrorBackend } from "@/utils/validators";


export async function cargarLotePallet(idProveedor, idTipoPallet, pallets) {
  const payload = IngresoPalletRequest(idProveedor, idTipoPallet, pallets);

  const response = await fetch("/api/pallet/cargarlote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return IngresoPalletResponse(data);
}