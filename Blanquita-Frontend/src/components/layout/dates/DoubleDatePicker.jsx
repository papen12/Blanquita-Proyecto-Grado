import * as React from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const claveFecha = (fecha) => format(fecha, "yyyy-MM-dd");

export default function DoubleDatePicker({
  id = "date-picker-range",
  label = "Rango de fechas",
  value,
  onChange,
  numberOfMonths = 2,
  diasDestacados,
  onRangoVisibleChange,
  className,
}) {
  // Controlado cuando el padre pasa onChange (aunque value sea undefined,
  // p. ej. al limpiar filtros); si no, se maneja con estado interno.
  const controlado = onChange !== undefined;
  const [rangoInterno, setRangoInterno] = React.useState(undefined);
  const rango = controlado ? value : rangoInterno;

  const cambiarRango = (nuevoRango) => {
    if (!controlado) setRangoInterno(nuevoRango);
    onChange?.(nuevoRango);
  };

  // Mes base de los `numberOfMonths` calendarios visibles, para poder avisar
  // al padre qué rango de fechas debe consultar (p. ej. lotes de ese mes).
  const [mesBase, setMesBase] = React.useState(() => rango?.from ?? new Date());

  React.useEffect(() => {
    if (!onRangoVisibleChange) return;
    onRangoVisibleChange({
      inicio: startOfMonth(mesBase),
      fin: endOfMonth(addMonths(mesBase, numberOfMonths - 1)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesBase, numberOfMonths]);

  const esDestacado = React.useCallback(
    (fecha) => Boolean(diasDestacados?.get(claveFecha(fecha))?.length),
    [diasDestacados],
  );

  const DayButtonPersonalizado = React.useMemo(() => {
    return function DayButtonConDestacado({ day, modifiers, ...props }) {
      const boton = (
        <CalendarDayButton
          day={day}
          modifiers={modifiers}
          locale={es}
          {...props}
        />
      );

      const etiquetas = diasDestacados?.get(claveFecha(day.date));
      if (!etiquetas?.length) return boton;

      return (
        <Tooltip>
          <TooltipTrigger render={boton} />
          <TooltipContent>
            {etiquetas.map((linea) => (
              <div key={linea}>{linea}</div>
            ))}
          </TooltipContent>
        </Tooltip>
      );
    };
  }, [diasDestacados]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wide text-slate-600"
      >
        {label}
      </Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id={id}
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {rango?.from ? (
                rango.to ? (
                  <>
                    {format(rango.from, "d LLL, y", { locale: es })} -{" "}
                    {format(rango.to, "d LLL, y", { locale: es })}
                  </>
                ) : (
                  format(rango.from, "d LLL, y", { locale: es })
                )
              ) : (
                <span>Elige un rango de fechas</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={es}
            defaultMonth={rango?.from}
            onMonthChange={setMesBase}
            selected={rango}
            onSelect={cambiarRango}
            numberOfMonths={numberOfMonths}
            modifiers={{ destacado: esDestacado }}
            modifiersClassNames={{
              destacado: "bg-amber-100 text-amber-900 font-bold",
            }}
            components={{ DayButton: DayButtonPersonalizado }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
