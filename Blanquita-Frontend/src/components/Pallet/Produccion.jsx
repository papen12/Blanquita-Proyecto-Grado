import { useState, useEffect } from "react";
import {
  Pause,
  Play,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  verProduccionPallet,
  verPausasProduccionPalletActivas,
  pausarProduccionPallet,
  reanudarProduccionPallet,
  finalizarProduccionPallet,
  cancelarProduccionPallet,
} from "../../services/Pallet/Produccion";
import { dateFormatter } from "@/utils/dates";
import Header from "../../components/layout/Header";

const SEPARADOR = ". ";

const MOTIVOS_PAUSA = [
  "Falta de pegamento",
  "Falta de personal para continuar la producción",
  "Falla en la máquina",
  "Cambio de turno",
];

export default function ProduccionPalletTubo({ usuario }) {
  const [vista, setVista] = useState("activas");

  const [activas, setActivas] = useState([]);
  const [loadingActivas, setLoadingActivas] = useState(true);
  const [errorActivas, setErrorActivas] = useState("");

  const [pausadas, setPausadas] = useState([]);
  const [loadingPausadas, setLoadingPausadas] = useState(true);
  const [errorPausadas, setErrorPausadas] = useState("");

  const [procesandoId, setProcesandoId] = useState(null);

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
      const data = await verProduccionPallet();
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
      const data = await verPausasProduccionPalletActivas();
      setPausadas(data);
    } catch (e) {
      setErrorPausadas(e.message);
      setPausadas([]);
    } finally {
      setLoadingPausadas(false);
    }
  };

  const abrirPausar = (produccion) => {
    setFormMotivoPausa("");
    setModalPausar({ open: true, produccion });
  };

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
      await pausarProduccionPallet(
        modalPausar.produccion.IdProduccionPalletTubo,
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
      await cancelarProduccionPallet(
        modalCancelar.produccion.IdProduccionPalletTubo,
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
      await finalizarProduccionPallet(alertFinalizar.produccion.IdProduccionPalletTubo);
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
    setProcesandoId(produccion.IdProduccionPalletTubo);
    try {
      await reanudarProduccionPallet(produccion.IdProduccionPalletTubo);
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
      <Header titulo={"Producción"} subtitulo={"Producción de Pallet Tubo"} />

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
                  <Skeleton key={i} className="h-52 rounded-2xl" />
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
                  <div
                    key={p.IdProduccionPalletTubo}
                    className="flex flex-col gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="text-[17px] font-extrabold text-slate-900">Pallet</div>
                        <div className="font-mono text-sm font-bold text-c3">{p.CodigoPallet}</div>
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

                    <div className="flex flex-wrap items-center justify-around gap-2">
                      <Button
                        onClick={() => abrirPausar(p)}
                        variant="outline"
                        className="h-11 min-w-[100px] flex-1 basis-[45%] justify-center gap-1.5 border-amber-300 font-bold text-amber-600 hover:bg-amber-50"
                      >
                        <Pause size={15} strokeWidth={2.75} />
                        Pausar
                      </Button>
                      <Button
                        onClick={() => abrirFinalizar(p)}
                        variant="outline"
                        className="h-11 min-w-[100px] flex-1 basis-[45%] justify-center gap-1.5 border-emerald-300 font-bold text-emerald-600 hover:bg-emerald-50"
                      >
                        <CheckCircle2 size={15} strokeWidth={2.75} />
                        Finalizar
                      </Button>
                    </div>
                  </div>
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
                  <Skeleton key={i} className="h-52 rounded-2xl" />
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
                  <div
                    key={p.IdPausaProduccionPalletTubo}
                    className="flex flex-col gap-3.5 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="font-mono text-[15px] font-extrabold text-slate-900">
                          {p.CodigoPallet}
                        </div>
                      </div>
                      <Badge className="border-0 bg-amber-100 font-bold text-amber-700">
                        {p.NombreEstadoProduccion}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Pause size={13} strokeWidth={2.75} />
                        Pausada: {dateFormatter(p.FechaHoraPausa)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-around gap-2">
                      <Button
                        onClick={() => handleReanudar(p)}
                        disabled={procesandoId === p.IdProduccionPalletTubo}
                        variant="outline"
                        className="h-11 min-w-[100px] flex-1 basis-[45%] justify-center gap-1.5 border-c3/30 font-bold text-c3 hover:bg-c4/8"
                      >
                        {procesandoId === p.IdProduccionPalletTubo ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <>
                            <Play size={15} strokeWidth={2.75} />
                            Reanudar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => abrirCancelar(p)}
                        variant="outline"
                        className="h-11 min-w-[100px] flex-1 basis-[45%] justify-center gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
                      >
                        <Ban size={15} strokeWidth={2.75} />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

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
                  {modalPausar.produccion.CodigoPallet}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Motivos frecuentes
              </Label>
              <ToggleGroup
                type="multiple"
                value={MOTIVOS_PAUSA.filter(motivoEstaEnTexto)}
                className="flex flex-wrap justify-start gap-2"
              >
                {MOTIVOS_PAUSA.map((motivo) => (
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
                  {modalCancelar.produccion.CodigoPallet}
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
                placeholder="Ej. Pallet dañado, error de registro..."
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
                  Se marcará como finalizada la producción del pallet{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {alertFinalizar.produccion.CodigoPallet}
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