import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function SelectForModal({
  id,
  etiqueta = "",
  opciones = [],
  campoValor = "id",
  campoEtiqueta = "nombre",
  campoDescripcion = null,
  valor = "",
  onCambio,
  placeholder = "Selecciona una opción",
  deshabilitado = false,
  className = "",
  classNameContenido = "",
}) {
  const opcionesValidas = (opciones ?? []).filter(
    (o) =>
      o?.[campoValor] !== null &&
      o?.[campoValor] !== undefined &&
      String(o[campoValor]) !== "",
  );

  const opcionSeleccionada = opcionesValidas.find(
    (o) => String(o[campoValor]) === String(valor ?? ""),
  );

  return (
    <div className="flex flex-col gap-1.5">
      {etiqueta && (
        <Label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wide text-slate-600"
        >
          {etiqueta}
        </Label>
      )}

      <Select
        value={valor === null || valor === undefined ? "" : String(valor)}
        onValueChange={onCambio}
        disabled={deshabilitado}
      >
        <SelectTrigger id={id} className={cn("h-11 w-full", className)}>
          <SelectValue placeholder={placeholder}>
            {opcionSeleccionada ? String(opcionSeleccionada[campoEtiqueta]) : null}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          position="popper"
          className={cn(
            "w-(--radix-select-trigger-width) max-w-none",
            classNameContenido,
          )}
        >
          <SelectGroup>
            {opcionesValidas.map((o) => (
              <SelectItem
                key={String(o[campoValor])}
                value={String(o[campoValor])}
                className="whitespace-normal py-2.5"
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-semibold text-slate-900">
                    {o[campoEtiqueta]}
                  </span>
                  {campoDescripcion && o[campoDescripcion] && (
                    <span className="text-[11.5px] leading-snug text-slate-500">
                      {o[campoDescripcion]}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}