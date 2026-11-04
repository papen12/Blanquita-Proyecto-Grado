import {
  ClavePublicaPushResponse,
  DesuscribirPushRequest,
  EstadoSuscripcionPushResponse,
  SuscribirPushRequest,
} from "@/models/Notificacion/Push";
import { pedirJson } from "@/utils/api";

export async function verClavePublicaPush() {
  return ClavePublicaPushResponse(await pedirJson("/api/notificaciones/push/clave"));
}

export async function verEstadoSuscripcionPush(suscripcion) {
  const consulta = new URLSearchParams({ endpoint: suscripcion.endpoint });
  return EstadoSuscripcionPushResponse(
    await pedirJson(`/api/notificaciones/push/estado?${consulta}`),
  );
}

export async function suscribirPush(suscripcion) {
  return EstadoSuscripcionPushResponse(
    await pedirJson("/api/notificaciones/push/suscribir", {
      method: "POST",
      body: SuscribirPushRequest(suscripcion),
    }),
  );
}

export async function desuscribirPush(suscripcion) {
  return EstadoSuscripcionPushResponse(
    await pedirJson("/api/notificaciones/push/desuscribir", {
      method: "POST",
      body: DesuscribirPushRequest(suscripcion),
    }),
  );
}
