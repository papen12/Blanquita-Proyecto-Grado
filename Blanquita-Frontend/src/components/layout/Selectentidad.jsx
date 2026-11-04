import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectEntidad({
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
  const vacio = valor === "" || valor === null || valor === undefined;
  const valorActual = vacio ? null : String(valor);

  const items = [
    { label: placeholder, value: null },
    ...opciones.map((o) => ({
      label: String(o[campoEtiqueta]),
      value: String(o[campoValor]),
    })),
  ];

  const etiquetaDe = (v) =>
    items.find((i) => i.value === v)?.label ?? placeholder;

  return (
    <Select
      items={items}
      value={valorActual}
      onValueChange={(v) => onCambio(v ?? "")}
      disabled={disabled || opciones.length === 0}
      modal={false}
    >
      <SelectTrigger
        className={cn(
          "h-11! w-full",
          invalido && "border-red-400 ring-1 ring-red-200",
          className,
        )}
      >
        <SelectValue>{(v) => etiquetaDe(v)}</SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        className="max-h-[min(18rem,var(--available-height))] overscroll-contain"
      >
        {opciones.map((o) => (
          <SelectItem key={o[campoValor]} value={String(o[campoValor])}>
            {o[campoEtiqueta]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
