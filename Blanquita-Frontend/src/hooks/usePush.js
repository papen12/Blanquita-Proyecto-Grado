import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  desuscribirPush,
  suscribirPush,
  verClavePublicaPush,
  verEstadoSuscripcionPush,
} from "@/services/Notificacion/Push";

const RUTA_SERVICE_WORKER = "/sw.js";

export const ESTADOS_PUSH = {
  CARGANDO: "cargando",
  NO_SOPORTADO: "no-soportado",
  REQUIERE_INSTALAR: "requiere-instalar",
  BLOQUEADO: "bloqueado",
  INACTIVO: "inactivo",
  ACTIVO: "activo",
};

const esIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const esAppInstalada = () =>
  window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

const soportaPush = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const claveABytes = (clave) => {
  const base64 = `${clave}${"=".repeat((4 - (clave.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
};

const estadoSinSuscripcion = () => {
  if (esIos() && !esAppInstalada()) return ESTADOS_PUSH.REQUIERE_INSTALAR;
  if (!soportaPush()) return ESTADOS_PUSH.NO_SOPORTADO;
  if (Notification.permission === "denied") return ESTADOS_PUSH.BLOQUEADO;
  return ESTADOS_PUSH.INACTIVO;
};

export function usePush() {
  const [estado, setEstado] = useState(ESTADOS_PUSH.CARGANDO);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let vigente = true;
    (async () => {
      let siguiente = estadoSinSuscripcion();
      if (siguiente === ESTADOS_PUSH.INACTIVO) {
        try {
          const registro = await navigator.serviceWorker.getRegistration();
          const suscripcion = await registro?.pushManager.getSubscription();
          if (suscripcion && (await verEstadoSuscripcionPush(suscripcion))) {
            siguiente = ESTADOS_PUSH.ACTIVO;
          }
        } catch {
          siguiente = ESTADOS_PUSH.INACTIVO;
        }
      }
      if (vigente) setEstado(siguiente);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  const activar = async () => {
    setProcesando(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? ESTADOS_PUSH.BLOQUEADO : ESTADOS_PUSH.INACTIVO);
        return;
      }
      const clave = await verClavePublicaPush();
      if (!clave) {
        toast.error("Las notificaciones todavía no están configuradas en el servidor");
        return;
      }
      await navigator.serviceWorker.register(RUTA_SERVICE_WORKER);
      const registro = await navigator.serviceWorker.ready;
      const suscripcion =
        (await registro.pushManager.getSubscription()) ??
        (await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: claveABytes(clave),
        }));
      await suscribirPush(suscripcion);
      setEstado(ESTADOS_PUSH.ACTIVO);
      toast.success("Notificaciones activadas en este dispositivo");
    } catch (e) {
      toast.error(e.message || "No se pudieron activar las notificaciones");
    } finally {
      setProcesando(false);
    }
  };

  const desactivar = async () => {
    setProcesando(true);
    try {
      const registro = await navigator.serviceWorker.getRegistration();
      const suscripcion = await registro?.pushManager.getSubscription();
      if (suscripcion) {
        await desuscribirPush(suscripcion);
        await suscripcion.unsubscribe();
      }
      setEstado(ESTADOS_PUSH.INACTIVO);
      toast.success("Notificaciones desactivadas en este dispositivo");
    } catch (e) {
      toast.error(e.message || "No se pudieron desactivar las notificaciones");
    } finally {
      setProcesando(false);
    }
  };

  return { estado, procesando, activar, desactivar };
}
