import { Plus, Pause, Play, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dateFormatter } from "@/utils/dates";

export default function CardPausada({ p, procesando, onInsertar, onReanudar, onCancelar }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[15px] font-extrabold text-slate-900">
            {p.CodigoBobina1} + {p.CodigoBobina2}
          </div>
        </div>
        <Badge className="border-0 bg-amber-100 font-bold text-amber-700">
          {p.NombreEstadoProduccion}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
        <span className="flex items-center gap-1">
          <Pause size={13} strokeWidth={2.75} />
          Pausada: {dateFormatter(p.FechaHoraPausa)}
        </span>
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Logs registrados
        </div>
        <div className="text-2xl font-extrabold tabular-nums text-slate-900">
          {p.CantidadLogsActual}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-around gap-2">
        <Button
          onClick={onInsertar}
          className="h-11 min-w-[100px] flex-1 basis-[30%] justify-center gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold hover:opacity-90"
        >
          <Plus size={15} strokeWidth={2.75} />
          Insertar
        </Button>
        <Button
          onClick={onReanudar}
          disabled={procesando}
          variant="outline"
          className="h-11 min-w-[100px] flex-1 basis-[30%] justify-center gap-1.5 border-c3/30 font-bold text-c3 hover:bg-c4/8"
        >
          {procesando ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              <Play size={15} strokeWidth={2.75} />
              Reanudar
            </>
          )}
        </Button>
        <Button
          onClick={onCancelar}
          variant="outline"
          className="h-11 min-w-[100px] flex-1 basis-[30%] justify-center gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
        >
          <Ban size={15} strokeWidth={2.75} />
          Cancelar
        </Button>
      </div>
    </div>
  );
}