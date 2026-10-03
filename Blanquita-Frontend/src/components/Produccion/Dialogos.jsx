import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MOTIVO_CANCELACION_MIN, MOTIVO_CANCELACION_MAX } from "@/constants/Values";
import { dateFormatter } from "@/utils/dates";
import { alternarMotivoEnTexto } from "@/utils/handlers";
import { ResumenProduccion } from "./comunes";

const ETIQUETA = "text-xs font-bold uppercase tracking-wide text-slate-600";

function ContadorMotivo({ motivo }) {
  return (
    <span className="text-xs text-slate-500">
      {motivo.trim().length}/{MOTIVO_CANCELACION_MAX} · mínimo {MOTIVO_CANCELACION_MIN}{" "}
      caracteres
    </span>
  );
}

function ErrorDialogo({ mensaje }) {
  return (
    <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
      {mensaje}
    </div>
  );
}

export function DialogoPausar({ dialogo, tituloDe, opciones }) {
  const seleccionados = opciones.filter((m) => dialogo.motivo.includes(m));

  return (
    <Dialog open={dialogo.abierto} onOpenChange={(open) => !open && dialogo.cerrar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pausar producción</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {dialogo.produccion && (
            <ResumenProduccion
              titulo={tituloDe(dialogo.produccion)}
              produccion={dialogo.produccion}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Label className={ETIQUETA}>Motivos frecuentes</Label>
            <ToggleGroup
              type="multiple"
              value={seleccionados}
              className="flex flex-wrap justify-start gap-2"
            >
              {opciones.map((motivo) => (
                <ToggleGroupItem
                  key={motivo}
                  value={motivo}
                  onClick={() =>
                    dialogo.setMotivo((actual) => alternarMotivoEnTexto(motivo, actual))
                  }
                  className="h-auto whitespace-normal rounded-full border-2 border-slate-200 px-3.5 py-2 text-left text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                >
                  {motivo}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo-pausa" className={ETIQUETA}>
              Detalle de la pausa
            </Label>
            <Textarea
              id="motivo-pausa"
              value={dialogo.motivo}
              onChange={(e) => dialogo.setMotivo(e.target.value)}
              placeholder="Ej. Falla de máquina, cambio de turno..."
              className="min-h-20"
              maxLength={MOTIVO_CANCELACION_MAX}
            />
            <ContadorMotivo motivo={dialogo.motivo} />
          </div>

          {dialogo.error && <ErrorDialogo mensaje={dialogo.error} />}
        </div>

        <DialogFooter>
          <Button
            onClick={dialogo.confirmar}
            disabled={dialogo.enviando || !dialogo.valido}
            className="h-11 w-full gap-2 bg-amber-500 font-extrabold text-white hover:bg-amber-600 sm:w-auto"
          >
            {dialogo.enviando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Pausar producción"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogoCancelar({ dialogo, tituloDe, placeholder }) {
  return (
    <Dialog open={dialogo.abierto} onOpenChange={(open) => !open && dialogo.cerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar producción</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {dialogo.produccion && (
            <ResumenProduccion
              titulo={tituloDe(dialogo.produccion)}
              produccion={dialogo.produccion}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo-cancelacion" className={ETIQUETA}>
              Motivo de cancelación
            </Label>
            <Textarea
              id="motivo-cancelacion"
              value={dialogo.motivo}
              onChange={(e) => dialogo.setMotivo(e.target.value)}
              placeholder={placeholder}
              className="min-h-20"
              maxLength={MOTIVO_CANCELACION_MAX}
            />
            <ContadorMotivo motivo={dialogo.motivo} />
          </div>

          {dialogo.error && <ErrorDialogo mensaje={dialogo.error} />}
        </div>

        <DialogFooter>
          <Button
            onClick={dialogo.confirmar}
            disabled={dialogo.enviando || !dialogo.valido}
            className="h-11 w-full gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700 sm:w-auto"
          >
            {dialogo.enviando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Cancelar producción"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AlertaFinalizar({ dialogo, prefijo, codigoDe }) {
  const p = dialogo.produccion;

  return (
    <AlertDialog open={dialogo.abierto} onOpenChange={(open) => !open && dialogo.cerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Finalizar esta producción?</AlertDialogTitle>
          <AlertDialogDescription>
            {p && (
              <>
                Se marcará como finalizada la producción {prefijo}{" "}
                <span className="font-mono font-bold text-slate-900">{codigoDe(p)}</span>
                {p.FechaInicioProduccion && (
                  <>, iniciada el {dateFormatter(p.FechaInicioProduccion)}</>
                )}
                . Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dialogo.enviando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={dialogo.confirmar}
            disabled={dialogo.enviando}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {dialogo.enviando ? <Loader2 size={16} className="animate-spin" /> : "Finalizar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
