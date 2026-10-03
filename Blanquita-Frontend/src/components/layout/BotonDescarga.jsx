import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function BotonDescarga({ texto, ayuda, exito, descargar }) {
  const [descargando, setDescargando] = useState(false);

  const manejarDescarga = async () => {
    setDescargando(true);
    try {
      await descargar();
      toast.success(exito);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={manejarDescarga}
            disabled={descargando}
            className="h-11 gap-2 bg-white font-bold text-c3 shadow-md hover:bg-slate-100"
          >
            {descargando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} strokeWidth={2.75} />
            )}
            {texto}
          </Button>
        }
      />
      <TooltipContent>{ayuda}</TooltipContent>
    </Tooltip>
  );
}
