import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DoubleDatePicker({
  id = "date-picker-range",
  label = "Rango de fechas",
  value,
  onChange,
  numberOfMonths = 2,
  className,
}) {
  const [rangoInterno, setRangoInterno] = React.useState(undefined);
  const rango = value !== undefined ? value : rangoInterno;

  const cambiarRango = (nuevoRango) => {
    if (value === undefined) setRangoInterno(nuevoRango);
    onChange?.(nuevoRango);
  };

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
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
            selected={rango}
            onSelect={cambiarRango}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
