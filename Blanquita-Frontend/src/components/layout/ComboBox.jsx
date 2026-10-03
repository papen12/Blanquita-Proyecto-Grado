import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ComboBox({
  opciones = [],
  valor,
  onCambio,
  campoValor,
  campoEtiqueta,
  placeholder = "Selecciona una opción",
  disabled = false,
  invalido = false,
  className,
}) {
  const [abierto, setAbierto] = useState(false);

  const deshabilitado = disabled || opciones.length === 0;
  const vacio = valor === "" || valor === null || valor === undefined;
  const seleccionada = vacio
    ? null
    : opciones.find((o) => String(o[campoValor]) === String(valor));

  const elegir = (opcion) => {
    onCambio(String(opcion[campoValor]));
    setAbierto(false);
  };

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger
        disabled={deshabilitado}
        aria-invalid={invalido || undefined}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          invalido && "border-red-400 ring-1 ring-red-200",
          className,
        )}
      >
        <span
          className={cn("truncate", !seleccionada && "text-muted-foreground")}
        >
          {seleccionada ? String(seleccionada[campoEtiqueta]) : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            abierto && "rotate-180",
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        initialFocus={(tipo) => tipo === "keyboard"}
        className="max-h-[min(18rem,var(--available-height))] w-(--anchor-width) gap-0 overflow-y-auto overscroll-contain p-1"
      >
        {opciones.map((o) => {
          const activa =
            seleccionada !== null &&
            seleccionada !== undefined &&
            String(o[campoValor]) === String(seleccionada[campoValor]);
          return (
            <button
              key={String(o[campoValor])}
              type="button"
              onClick={() => elegir(o)}
              aria-pressed={activa}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent",
                activa && "font-semibold text-c3",
              )}
            >
              <span className="truncate">{o[campoEtiqueta]}</span>
              {activa && <Check className="size-4 shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
