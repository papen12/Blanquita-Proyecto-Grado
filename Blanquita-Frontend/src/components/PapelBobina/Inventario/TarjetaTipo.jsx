import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RolloIcono } from "./Iconos";
import { fmt } from "./constantes";

export function TarjetaTipo({ tipo: t, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        activo ? t.border : "border-slate-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <RolloIcono className={cn("h-8 w-8 shrink-0", t.text)} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoBobina}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("border-0 font-bold", t.soft, t.text)}
        >
          {t.badge}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadBobinas}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          bobinas en almacén
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Peso neto
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.PesoNetoTotalKg)} kg
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Gramaje prom.
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.GramajePromedio)} g/m²
          </div>
        </div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver bobinas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}