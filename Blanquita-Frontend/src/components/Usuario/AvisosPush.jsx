import { BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ESTADOS_PUSH, usePush } from "@/hooks/usePush";

const MENSAJES = {
  [ESTADOS_PUSH.NO_SOPORTADO]: "Este navegador no admite notificaciones.",
  [ESTADOS_PUSH.REQUIERE_INSTALAR]:
    "En iPhone, primero agrega el sistema a la pantalla de inicio desde el menú Compartir de Safari y ábrelo desde ese ícono.",
  [ESTADOS_PUSH.BLOQUEADO]:
    "Las notificaciones están bloqueadas. Permítelas en la configuración del navegador para este sitio.",
  [ESTADOS_PUSH.INACTIVO]: "Recibe los avisos de la planta aunque el sistema esté cerrado.",
  [ESTADOS_PUSH.ACTIVO]: "Este dispositivo recibe los avisos de la planta.",
};

export default function AvisosPush() {
  const { estado, procesando, error, activar, desactivar } = usePush();

  if (estado === ESTADOS_PUSH.CARGANDO) {
    return <Skeleton className="my-3 h-10 w-full" />;
  }

  const activo = estado === ESTADOS_PUSH.ACTIVO;
  const disponible = activo || estado === ESTADOS_PUSH.INACTIVO;

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">{MENSAJES[estado]}</p>
        {disponible && (
          <Button
            variant={activo ? "outline" : "default"}
            disabled={procesando}
            onClick={activo ? desactivar : activar}
            className="shrink-0"
          >
            {activo ? <BellOff size={16} /> : <BellRing size={16} />}
            {procesando ? "Procesando..." : activo ? "Desactivar" : "Activar"}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="break-words rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
