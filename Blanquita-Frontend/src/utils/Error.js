 export async function manejarErrorBackend(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const error = new Error("Sesión no válida, inicia sesión nuevamente");
    error.status = 401;
    throw error;
  }

  const error = new Error(data.detail || "Error al procesar la solicitud");
  error.status = response.status;
  throw error;
}