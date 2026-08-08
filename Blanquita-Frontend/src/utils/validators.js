import { Roles } from "@/constants/Roles";
export const EsEncargado=(idRol)=> idRol===Roles.Encargado

export function extraerMensajeError(data, fallback = "Ocurrió un error inesperado") {
  const detail = data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const campo = Array.isArray(err?.loc)
          ? err.loc.filter((l) => l !== "body").join(".")
          : "";
        return campo ? `${campo}: ${err?.msg}` : err?.msg;
      })
      .filter(Boolean)
      .join(" | ");
  }

  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || fallback;
  }

  if (typeof data?.message === "string") return data.message;

  return fallback;
}

export async function manejarErrorBackend(response) {
  const data = await response.json().catch(() => ({}));

  const mensaje = extraerMensajeError(
    data,
    `Error ${response.status}: ${response.statusText || "solicitud fallida"}`,
  );

  const error = new Error(mensaje);
  error.status = response.status;
  error.detail = data?.detail;

  throw error;
}