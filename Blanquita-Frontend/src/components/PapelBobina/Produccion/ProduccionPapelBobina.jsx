import { useState, useEffect } from "react";
import {
  Plus,
  Pause,
  CheckCircle2,
  Play,
  Ban,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import SelectForModal from "@/components/layout/SelectForModal";
import {
  verProduccionBobinaTubo,
  verPausasProduccionBobinaTuboActivas,
  pausarProduccion,
  reanudarProduccion,
  finalizarProduccion,
  cancelarProduccion,
  insertarMovimientoLog,
} from "../../../services/BobinaPapel/Produccion";
import { movimientosOperador } from "../../../constants/MovimientoOperador";
import { dateFormatter } from "@/utils/dates";
import Header from "../../layout/Header";
import CardActiva from "./CardActiva";
import CardPausada from "./CardPausada";

const LIMITE_CANTIDAD_LOGS = 50;
const ID_TIPO_INGRESO = 1;
const SEPARADOR = ". ";

export default function ProduccionBobinaTubo({ usuario }) {
  const [vista, setVista] = useState("activas");

  const motivosPausa = [
    "Falta de pegamento",
    "Falta de personal para continuar la producción",
  ];

  const [activas, setActivas] = useState([]);
  const [loadingActivas, setLoadingActivas] = useState(true);
  const [errorActivas, setErrorActivas] = useState("");

  const [pausadas, setPausadas] = useState([]);
  const [loadingPausadas, setLoadingPausadas] = useState(true);
  const [errorPausadas, setErrorPausadas] = useState("");

  const [procesandoId, setProcesandoId] = useState(null);

  const [modalInsertar, setModalInsertar] = useState({ open: false, produccion: null });
  const [formTipoMovimiento, setFormTipoMovimiento] = useState("");
  const [formCantidadLogs, setFormCantidadLogs] = useState("");
  const [formObservacionLog, setFormObservacionLog] = useState("");
  const [errorInsertar, setErrorInsertar] = useState("");
  const [enviandoInsertar, setEnviandoInsertar] = useState(false);

  const [modalPausar, setModalPausar] = useState({ open: false, produccion: null });
  const [formMotivoPausa, setFormMotivoPausa] = useState("");
  const [enviandoPausar, setEnviandoPausar] = useState(false);

  const [modalCancelar, setModalCancelar] = useState({ open: false, produccion: null });
  const [formMotivoCancelacion, setFormMotivoCancelacion] = useState("");
  const [enviandoCancelar, setEnviandoCancelar] = useState(false);

  const [alertFinalizar, setAlertFinalizar] = useState({ open: false, produccion: null });
  const [enviandoFinalizar, setEnviandoFinalizar] = useState(false);

  useEffect(() => {
    cargarActivas();
    cargarPausadas();
  }, []);

  const cargarActivas = async () => {
    setLoadingActivas(true);
    setErrorActivas("");
    try {
      const data = await verProduccionBobinaTubo();
      setActivas(data);
    } catch (e) {
      setErrorActivas(e.message);
      setActivas([]);
    } finally {
      setLoadingActivas(false);
    }
  };

  const cargarPausadas = async () => {
    setLoadingPausadas(true);
    setErrorPausadas("");
    try {
      const data = await verPausasProduccionBobinaTuboActivas();
      setPausadas(data);
    } catch (e) {
      setErrorPausadas(e.message);
      setPausadas([]);
    } finally {
      setLoadingPausadas(false);
    }
  };

  const requiereObservacion =
    formTipoMovimiento !== "" && Number(formTipoMovimiento) !== ID_TIPO_INGRESO;

  const abrirInsertar = (produccion) => {
    setFormTipoMovimiento("");
    setFormCantidadLogs("");
    setFormObservacionLog("");
    setErrorInsertar("");
    setModalInsertar({ open: true, produccion });
  };

  const confirmarInsertar = async () => {
    if (!formTipoMovimiento) {
      setErrorInsertar("Selecciona el tipo de movimiento.");
      return;
    }
    const cantidad = Number(formCantidadLogs);
    if (!formCantidadLogs || cantidad <= 0) {
      setErrorInsertar("Ingresa una cantidad de logs válida.");
      return;
    }
    if (cantidad > LIMITE_CANTIDAD_LOGS) {
      setErrorInsertar(`La cantidad no puede superar ${LIMITE_CANTIDAD_LOGS} logs.`);
      return;
    }

    setEnviandoInsertar(true);
    try {
      await insertarMovimientoLog(
        modalInsertar.produccion.IdProduccionBobinaTubo,
        Number(formTipoMovimiento),
        cantidad,
        requiereObservacion ? formObservacionLog.trim() || null : null,
      );
      toast.success("Movimiento de logs registrado");
      setModalInsertar({ open: false, produccion: null });
      cargarActivas();
      cargarPausadas();
    } catch (e) {
      setErrorInsertar(e.message);
    } finally {
      setEnviandoInsertar(false);
    }
  };

  const abrirPausar = (produccion) => {
    setFormMotivoPausa("");
    setModalPausar({ open: true, produccion });
  };

  const opcionesPausa = modalPausar.produccion
    ? [
        ...motivosPausa,
        ...(modalPausar.produccion.CodigoBobina1
          ? [`Empalme en la Bobina: ${modalPausar.produccion.CodigoBobina1}`]
          : []),
        ...(modalPausar.produccion.CodigoBobina2
          ? [`Empalme en la Bobina: ${modalPausar.produccion.CodigoBobina2}`]
          : []),
      ]
    : motivosPausa;

  const motivoEstaEnTexto = (motivo) => formMotivoPausa.includes(motivo);

  const alternarMotivo = (motivo) => {
    setFormMotivoPausa((actual) => {
      if (actual.includes(motivo)) {
        return actual
          .replace(motivo, "")
          .replace(/\.\s*\.\s*/g, ". ")
          .replace(/^\s*\.\s*/, "")
          .trimStart();
      }
      const texto = actual.trimEnd();
      if (!texto) return motivo;
      return texto.endsWith(".")
        ? `${texto} ${motivo}`
        : `${texto}${SEPARADOR}${motivo}`;
    });
  };

  const confirmarPausar = async () => {
    setEnviandoPausar(true);
    try {
      await pausarProduccion(
        modalPausar.produccion.IdProduccionBobinaTubo,
        formMotivoPausa.trim() || null,
      );
      toast.success("Producción pausada");
      setModalPausar({ open: false, produccion: null });
      cargarActivas();
      cargarPausadas();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoPausar(false);
    }
  };

  const abrirCancelar = (produccion) => {
    setFormMotivoCancelacion("");
    setModalCancelar({ open: true, produccion });
  };

  const confirmarCancelar = async () => {
    setEnviandoCancelar(true);
    try {
      await cancelarProduccion(
        modalCancelar.produccion.IdProduccionBobinaTubo,
        formMotivoCancelacion.trim() || null,
      );
      toast.success("Producción cancelada");
      setModalCancelar({ open: false, produccion: null });
      cargarPausadas();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoCancelar(false);
    }
  };

  const abrirFinalizar = (produccion) => {
    setAlertFinalizar({ open: true, produccion });
  };

  const confirmarFinalizar = async () => {
    setEnviandoFinalizar(true);
    try {
      await finalizarProduccion(alertFinalizar.produccion.IdProduccionBobinaTubo);
      toast.success("Producción finalizada");
      setAlertFinalizar({ open: false, produccion: null });
      cargarActivas();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoFinalizar(false);
    }
  };

  const handleReanudar = async (produccion) => {
    setProcesandoId(produccion.IdProduccionBobinaTubo);
    try {
      await reanudarProduccion(produccion.IdProduccionBobinaTubo);
      toast.success("Producción reanudada");
      cargarActivas();
      cargarPausadas();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="pt-20 md:pt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header titulo={"Producción"} subtitulo={"Producción de Bobina Tubo"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <Tabs value={vista} onValueChange={setVista} className="mb-5">
          <TabsList className="grid w-full grid-cols-2 sm:w-80">
            <TabsTrigger value="activas" className="gap-1.5 font-bold">
              <Layers size={15} strokeWidth={2.75} />
              Activas
              {activas.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
                  {activas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pausadas" className="gap-1.5 font-bold">
              <Pause size={15} strokeWidth={2.75} />
              Pausadas
              {pausadas.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
                  {pausadas.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {vista === "activas" && (
          <>
            {loadingActivas && (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            )}
            {errorActivas && (
              <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
                {errorActivas}
              </div>
            )}
            {!loadingActivas && !errorActivas && activas.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                No hay producciones activas.
              </div>
            )}
            {!loadingActivas && !errorActivas && activas.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(activas ?? []).map((p) => (
                  <CardActiva
                    key={p.IdProduccionBobinaTubo}
                    p={p}
                    onInsertar={() => abrirInsertar(p)}
                    onPausar={() => abrirPausar(p)}
                    onFinalizar={() => abrirFinalizar(p)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {vista === "pausadas" && (
          <>
            {loadingPausadas && (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            )}
            {errorPausadas && (
              <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
                {errorPausadas}
              </div>
            )}
            {!loadingPausadas && !errorPausadas && pausadas.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                No hay producciones pausadas.
              </div>
            )}
            {!loadingPausadas && !errorPausadas && pausadas.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(pausadas ?? []).map((p) => (
                  <CardPausada
                    key={p.IdPausaProduccionBobinaTubo}
                    p={p}
                    procesando={procesandoId === p.IdProduccionBobinaTubo}
                    onInsertar={() => abrirInsertar(p)}
                    onReanudar={() => handleReanudar(p)}
                    onCancelar={() => abrirCancelar(p)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog
        open={modalInsertar.open}
        onOpenChange={(open) => setModalInsertar({ open, produccion: open ? modalInsertar.produccion : null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insertar movimiento de logs</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {modalInsertar.produccion && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono font-bold text-slate-900">
                  {modalInsertar.produccion.CodigoBobina1} + {modalInsertar.produccion.CodigoBobina2}
                </span>
              </div>
            )}

            <SelectForModal
              id="tipo-movimiento"
              etiqueta="Tipo de movimiento"
              opciones={movimientosOperador}
              campoValor="IdTipoMovimientoOperadorLogs"
              campoEtiqueta="NombreMovimiento"
              campoDescripcion="DescripcionTipoMovimientoOperadorLogs"
              valor={formTipoMovimiento}
              onCambio={setFormTipoMovimiento}
              placeholder="Selecciona un tipo"
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidad-logs" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Cantidad de logs (máx. {LIMITE_CANTIDAD_LOGS})
              </Label>
              <Input
                id="cantidad-logs"
                value={formCantidadLogs}
                onChange={(e) => setFormCantidadLogs(e.target.value)}
                placeholder="0"
                type="number"
                min={1}
                max={LIMITE_CANTIDAD_LOGS}
                className="h-11"
              />
            </div>

            {requiereObservacion && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="observacion-log" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Observación
                </Label>
                <Textarea
                  id="observacion-log"
                  value={formObservacionLog}
                  onChange={(e) => setFormObservacionLog(e.target.value)}
                  placeholder="Motivo de la corrección..."
                  className="min-h-20"
                />
              </div>
            )}

            {errorInsertar && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                {errorInsertar}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarInsertar}
              disabled={enviandoInsertar}
              className="h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold hover:opacity-90 sm:w-auto"
            >
              {enviandoInsertar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Registrar movimiento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalPausar.open}
        onOpenChange={(open) => setModalPausar({ open, produccion: open ? modalPausar.produccion : null })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pausar producción</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {modalPausar.produccion && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono font-bold text-slate-900">
                  {modalPausar.produccion.CodigoBobina1} + {modalPausar.produccion.CodigoBobina2}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Motivos frecuentes
              </Label>
              <ToggleGroup
                type="multiple"
                value={opcionesPausa.filter(motivoEstaEnTexto)}
                className="flex flex-wrap justify-start gap-2"
              >
                {opcionesPausa.map((motivo) => (
                  <ToggleGroupItem
                    key={motivo}
                    value={motivo}
                    onClick={() => alternarMotivo(motivo)}
                    className="h-auto whitespace-normal rounded-full border-2 border-slate-200 px-3.5 py-2 text-left text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                  >
                    {motivo}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-pausa" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Detalle de la pausa (opcional)
              </Label>
              <Textarea
                id="motivo-pausa"
                value={formMotivoPausa}
                onChange={(e) => setFormMotivoPausa(e.target.value)}
                placeholder="Ej. Falla de máquina, cambio de turno..."
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarPausar}
              disabled={enviandoPausar}
              className="h-11 w-full gap-2 bg-amber-500 font-extrabold text-white hover:bg-amber-600 sm:w-auto"
            >
              {enviandoPausar ? <Loader2 size={16} className="animate-spin" /> : "Pausar producción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalCancelar.open}
        onOpenChange={(open) => setModalCancelar({ open, produccion: open ? modalCancelar.produccion : null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar producción</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {modalCancelar.produccion && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono font-bold text-slate-900">
                  {modalCancelar.produccion.CodigoBobina1} + {modalCancelar.produccion.CodigoBobina2}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-cancelacion" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Motivo de cancelación (opcional)
              </Label>
              <Textarea
                id="motivo-cancelacion"
                value={formMotivoCancelacion}
                onChange={(e) => setFormMotivoCancelacion(e.target.value)}
                placeholder="Ej. Bobina dañada, error de registro..."
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarCancelar}
              disabled={enviandoCancelar}
              className="h-11 w-full gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700 sm:w-auto"
            >
              {enviandoCancelar ? <Loader2 size={16} className="animate-spin" /> : "Cancelar producción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alertFinalizar.open}
        onOpenChange={(open) => setAlertFinalizar({ open, produccion: open ? alertFinalizar.produccion : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar esta producción?</AlertDialogTitle>
            <AlertDialogDescription>
              {alertFinalizar.produccion && (
                <>
                  Se marcará como finalizada la producción de{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {alertFinalizar.produccion.CodigoBobina1} + {alertFinalizar.produccion.CodigoBobina2}
                  </span>
                  . Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviandoFinalizar}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarFinalizar}
              disabled={enviandoFinalizar}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {enviandoFinalizar ? <Loader2 size={16} className="animate-spin" /> : "Finalizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}