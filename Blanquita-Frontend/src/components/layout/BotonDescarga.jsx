import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useDescarga } from "@/hooks/useDescarga";

export function BotonDescarga({ texto, ayuda, exito, descargar }) {
  const { descargando, iniciar } = useDescarga(descargar, exito);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={iniciar}
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
