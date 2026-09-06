import { useState, useEffect } from "react";
import { Pause, Loader2, Clock, Layers } from "lucide-react";
import { toast } from "sonner";
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
import {
  verProduccionBobinaTubo,
  verPausasProduccionBobinaTuboActivas,
  pausarProduccion,
  reanudarProduccion,
  finalizarProduccion,
  cancelarProduccion,
  insertarMovimientoLog,
} from "../../../services/BobinaPapel/Produccion";
import { ObtenerTiposPapelBobina } from "../../../services/BobinaPapel/BobinaPapel";
import { movimientosOperador } from "../../../constants/MovimientoOperador";
import { MOTIVO_CANCELACION_MIN, MOTIVO_CANCELACION_MAX } from "@/constants/Values";
import { dateFormatter } from "@/utils/dates";
import { extraerMensajeError } from "@/utils/validators";
import Header from "../../layout/Header";
import CardActiva from "./CardActiva";
import CardPausada from "./CardPausada";

const ID_TIPO_INGRESO = 1;
const SEPARADOR = ". ";

export default function ProduccionBobinaTubo({ usuario }) {
  const [vista, setVista] = useState("activas");

  const [tiposBobina, setTiposBobina] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");

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
  const [errorPausar, setErrorPausar] = useState("");
  const [enviandoPausar, setEnviandoPausar] = useState(false);

  const [modalCancelar, setModalCancelar] = useState({ open: false, produccion: null });
  const [formMotivoCancelacion, setFormMotivoCancelacion] = useState("");
  const [errorCancelar, setErrorCancelar] = useState("");
  const [enviandoCancelar, setEnviandoCancelar] = useState(false);

  const [alertFinalizar, setAlertFinalizar] = useState({ open: false, produccion: null });
  const [enviandoFinalizar, setEnviandoFinalizar] = useState(false);

  useEffect(() => {
    ObtenerTiposPapelBobina()
      .then(setTiposBobina)
      .catch(() => setTiposBobina([]));
  }, []);

  useEffect(() => {
    cargarActivas();
    cargarPausadas();
  }, [filtroTipo]);

  const idTipoFiltro = filtroTipo === "" ? undefined : Number(filtroTipo);

  const cargarActivas = async () => {
    setLoadingActivas(true);
    setErrorActivas("");
    try {
      const data = await verProduccionBobinaTubo(idTipoFiltro);
      setActivas(data);
    } catch (e) {
      setErrorActivas(extraerMensajeError(e, e.message));
      setActivas([]);
    } finally {
      setLoadingActivas(false);
    }
  };

  const cargarPausadas = async () => {
    setLoadingPausadas(true);
    setErrorPausadas("");
    try {
      const data = await verPausasProduccionBobinaTuboActivas(idTipoFiltro);
      setPausadas(data);
    } catch (e) {
      setErrorPausadas(extraerMensajeError(e, e.message));
      setPausadas([]);
    } finally {
      setLoadingPausadas(false);
    }
  };

  const requiereObservacion =
    formTipoMovimiento !== "" && Number(formTipoMovimiento) !== ID_TIPO_INGRESO;

  const movimientoSeleccionado = movimientosOperador.find(
    (m) => String(m.IdTipoMovimientoOperadorLogs) === String(formTipoMovimiento),
  );

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
      setErrorInsertar(extraerMensajeError(e, e.message));
    } finally {
      setEnviandoInsertar(false);
    }
  };

  const abrirPausar = (produccion) => {
    setFormMotivoPausa("");
    setErrorPausar("");
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

  const motivoPausaValido =
    formMotivoPausa.trim().length >= MOTIVO_CANCELACION_MIN &&
    formMotivoPausa.trim().length <= MOTIVO_CANCELACION_MAX;

  const confirmarPausar = async () => {
    if (!motivoPausaValido) {
      setErrorPausar(
        `El motivo de la pausa debe tener entre ${MOTIVO_CANCELACION_MIN} y ${MOTIVO_CANCELACION_MAX} caracteres`,
      );
      return;
    }
    setEnviandoPausar(true);
    setErrorPausar("");
    try {
      await pausarProduccion(
        modalPausar.produccion.IdProduccionBobinaTubo,
        formMotivoPausa.trim(),
      );
      toast.success("Producción pausada");
      setModalPausar({ open: false, produccion: null });
      cargarActivas();
      cargarPausadas();
    } catch (e) {
      setErrorPausar(extraerMensajeError(e, e.message));
    } finally {
      setEnviandoPausar(false);
    }
  };

  const abrirCancelar = (produccion) => {
    setFormMotivoCancelacion("");
    setErrorCancelar("");
    setModalCancelar({ open: true, produccion });
  };

  const motivoCancelacionValido =
    formMotivoCancelacion.trim().length >= MOTIVO_CANCELACION_MIN &&
    formMotivoCancelacion.trim().length <= MOTIVO_CANCELACION_MAX;

  const confirmarCancelar = async () => {
    if (!motivoCancelacionValido) {
      setErrorCancelar(
        `El motivo de cancelación debe tener entre ${MOTIVO_CANCELACION_MIN} y ${MOTIVO_CANCELACION_MAX} caracteres`,
      );
      return;
    }
    setEnviandoCancelar(true);
    setErrorCancelar("");
    try {
      await cancelarProduccion(
        modalCancelar.produccion.IdProduccionBobinaTubo,
        formMotivoCancelacion.trim(),
      );
      toast.success("Producción cancelada");
      setModalCancelar({ open: false, produccion: null });
      cargarPausadas();
    } catch (e) {
      setErrorCancelar(extraerMensajeError(e, e.message));
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
      toast.error(extraerMensajeError(e, e.message));
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
      toast.error(extraerMensajeError(e, e.message));
    } finally {
      setProcesandoId(null);
    }
  };

  const ResumenProduccion = ({ produccion }) => (
    <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
      <span className="font-mono font-bold text-slate-900">
        {produccion.CodigoBobina1} + {produccion.CodigoBobina2}
      </span>
      {(produccion.FechaHoraPausa || produccion.FechaInicioProduccion) && (
        <span className="flex items-center gap-1 text-[12px] text-slate-500">
          <Clock size={12} strokeWidth={2.75} />
          {produccion.FechaHoraPausa
            ? `Pausada: ${dateFormatter(produccion.FechaHoraPausa)}`
            : `Inicio: ${dateFormatter(produccion.FechaInicioProduccion)}`}
        </span>
      )}
    </div>
  );

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

        {tiposBobina.length > 0 && (
          <div className="mb-5 flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Filtrar por tipo
            </span>
            <ToggleGroup
              type="single"
              value={filtroTipo ? [filtroTipo] : ["todos"]}
              className="flex w-full flex-wrap justify-start gap-2"
            >
              <ToggleGroupItem
                value="todos"
                onClick={() => setFiltroTipo("")}
                className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
              >
                Todos
              </ToggleGroupItem>
              {tiposBobina.map((t) => (
                <ToggleGroupItem
                  key={t.IdTipoBobina}
                  value={String(t.IdTipoBobina)}
                  onClick={() => setFiltroTipo(String(t.IdTipoBobina))}
                  className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                >
                  {t.NombreTipoBobina}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

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
              <ResumenProduccion produccion={modalInsertar.produccion} />
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de movimiento
              </Label>
              <ToggleGroup
                type="single"
                value={movimientoSeleccionado ? [movimientoSeleccionado.NombreMovimiento] : []}
                className="flex w-full flex-wrap justify-start gap-2"
              >
                {movimientosOperador.map((m) => (
                  <ToggleGroupItem
                    key={m.IdTipoMovimientoOperadorLogs}
                    value={m.NombreMovimiento}
                    onClick={() =>
                      setFormTipoMovimiento(
                        Number(formTipoMovimiento) === m.IdTipoMovimientoOperadorLogs
                          ? ""
                          : String(m.IdTipoMovimientoOperadorLogs),
                      )
                    }
                    className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                  >
                    {m.NombreMovimiento}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidad-logs" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Cantidad de logs
              </Label>
              <Input
                id="cantidad-logs"
                value={formCantidadLogs}
                onChange={(e) => setFormCantidadLogs(e.target.value)}
                placeholder="0"
                type="number"
                min={1}
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
              <ResumenProduccion produccion={modalPausar.produccion} />
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
                Detalle de la pausa
              </Label>
              <Textarea
                id="motivo-pausa"
                value={formMotivoPausa}
                onChange={(e) => setFormMotivoPausa(e.target.value)}
                placeholder="Ej. Falla de máquina, cambio de turno..."
                className="min-h-20"
                maxLength={MOTIVO_CANCELACION_MAX}
              />
              <span className="text-xs text-slate-500">
                {formMotivoPausa.trim().length}/{MOTIVO_CANCELACION_MAX} · mínimo {MOTIVO_CANCELACION_MIN} caracteres
              </span>
            </div>

            {errorPausar && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                {errorPausar}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarPausar}
              disabled={enviandoPausar || !motivoPausaValido}
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
              <ResumenProduccion produccion={modalCancelar.produccion} />
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-cancelacion" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Motivo de cancelación
              </Label>
              <Textarea
                id="motivo-cancelacion"
                value={formMotivoCancelacion}
                onChange={(e) => setFormMotivoCancelacion(e.target.value)}
                placeholder="Ej. Bobina dañada, error de registro..."
                className="min-h-20"
                maxLength={MOTIVO_CANCELACION_MAX}
              />
              <span className="text-xs text-slate-500">
                {formMotivoCancelacion.trim().length}/{MOTIVO_CANCELACION_MAX} · mínimo {MOTIVO_CANCELACION_MIN} caracteres
              </span>
            </div>

            {errorCancelar && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                {errorCancelar}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarCancelar}
              disabled={enviandoCancelar || !motivoCancelacionValido}
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
                  {alertFinalizar.produccion.FechaInicioProduccion && (
                    <>
                      , iniciada el{" "}
                      {dateFormatter(alertFinalizar.produccion.FechaInicioProduccion)}
                    </>
                  )}
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