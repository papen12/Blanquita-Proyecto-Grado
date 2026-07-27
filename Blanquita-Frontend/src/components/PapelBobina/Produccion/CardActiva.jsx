import { Plus, Pause, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dateFormatter } from "@/utils/dateFormater";

export default function CardActiva({ p, onInsertar, onPausar, onFinalizar }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="text-[17px] font-extrabold text-slate-900">
            {p.NombreTipoBobina}
          </div>
          <div className="font-mono text-sm font-bold text-c3">
            {p.CodigoBobina1} + {p.CodigoBobina2}
          </div>
        </div>
        <Badge className="border-0 bg-emerald-100 font-bold text-emerald-700">
          {p.NombreEstadoProduccion}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
        <span className="flex items-center gap-1">
          <Clock size={13} strokeWidth={2.75} />
          {dateFormatter(p.FechaInicioProduccion)}
        </span>
        <span>Turno: {p.NombreTurno}</span>
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
          onClick={onPausar}
          variant="outline"
          className="h-11 min-w-[100px] flex-1 basis-[30%] justify-center gap-1.5 border-amber-300 font-bold text-amber-600 hover:bg-amber-50"
        >
          <Pause size={15} strokeWidth={2.75} />
          Pausar
        </Button>
        <Button
          onClick={onFinalizar}
          variant="outline"
          className="h-11 min-w-[100px] flex-1 basis-[30%] justify-center gap-1.5 border-emerald-300 font-bold text-emerald-600 hover:bg-emerald-50"
        >
          <CheckCircle2 size={15} strokeWidth={2.75} />
          Finalizar
        </Button>
      </div>
    </div>
  );
}