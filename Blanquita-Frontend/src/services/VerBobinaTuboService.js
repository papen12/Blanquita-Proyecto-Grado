import { VerProduccionBobinaTuboResponse } from "../models/BobinaPapel/VerProduccionBobinaTubo";

export async function VerProduccionBobinaTubo(IdTipoBobina) {
  const params = new URLSearchParams();

  if (IdTipoBobina !== null && IdTipoBobina !== undefined) {
    params.append("IdTipoBobina", IdTipoBobina);
  }

  const response = await fetch(`/api/papelbobina/verproduccionbobinatubo?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Error al obtener la producción de bobina tubo");
  }

  return data.map((item) => new VerProduccionBobinaTuboResponse(item));
}