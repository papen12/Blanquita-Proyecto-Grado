import { IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse } from "../models/BobinaPapel/IniciarProduccionBobinaTubo";


export async function IniciarProduccionBobinaTubo(IniciarProduccionBobinaTuboRequest) {
  const response = await fetch(`/api/papelbobina/iniciarproduccion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(IniciarProduccionBobinaTuboRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Error al iniciar la producción de bobina tubo");
  }

  return data;
}