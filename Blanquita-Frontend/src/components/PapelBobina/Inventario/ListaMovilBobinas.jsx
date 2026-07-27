import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateFormatter } from "@/utils/dateFormater";
import { fmt } from "./constantes";
import { MiniStat } from "./MiniStat";

export function ListaMovilBobinas({ bobinas, tipoSel, marcadas, onToggle }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {bobinas.map((b) => {
        const on = marcadas.includes(b.CodigoBobina);
        return (
          <div
            key={b.IdBobinaPapel}
            onClick={() => onToggle(b.CodigoBobina)}
            className={cn(
              "flex flex-col gap-2.5 rounded-2xl border-2 p-3.5",
              on ? tipoSel.soft : "border-slate-200 bg-white",
              on && tipoSel.border,
            )}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                {b.CodigoBobina}
              </div>
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                  on
                    ? cn(tipoSel.bg, "border-transparent text-white")
                    : "border-slate-300",
                )}
              >
                {on && <Check size={14} strokeWidth={3.5} />}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
              <span>
                <strong className="text-slate-900">{b.CodigoLote}</strong> ·{" "}
                {dateFormatter(b.FechaRecepcion)}
              </span>
              <span>{b.NombreProveedor}</span>
            </div>
            <div className="flex gap-2">
              <MiniStat label="Bruto" value={`${fmt(b.PesoBrutoKg)} kg`} />
              <MiniStat label="Neto" value={`${fmt(b.PesoNetoKg)} kg`} />
              <MiniStat label="Gramaje" value={`${fmt(b.Gramaje)} g/m²`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}