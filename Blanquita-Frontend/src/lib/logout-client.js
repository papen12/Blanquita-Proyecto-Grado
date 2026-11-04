import { desuscribirPush } from "@/services/Notificacion/Push";

let cerrandoSesion = false;

async function retirarSuscripcionPush() {
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    const suscripcion = await registro?.pushManager.getSubscription();
    if (!suscripcion) return;
    await desuscribirPush(suscripcion);
    await suscripcion.unsubscribe();
  } catch {
  }
}

export async function cerrarSesion() {
  if (cerrandoSesion) return;
  cerrandoSesion = true;

  await retirarSuscripcionPush();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
  }

  window.location.replace("/");
}
