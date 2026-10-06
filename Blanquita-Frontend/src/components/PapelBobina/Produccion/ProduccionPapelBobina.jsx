import { useState, useEffect } from "react";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { descargarReporteProduccionPorPeriodo } from "../../../services/BobinaPapel/Reportes";
import { movimientosOperador, ObservacionesInsertarLogs } from "../../../constants/OperadorConfig";
import { Roles } from "@/constants/Values";
import { alternarMotivoEnTexto } from "@/utils/handlers";
import { extraerMensajeError, limpiarObservacion } from "@/utils/validators";
import { useProduccion } from "@/hooks/useProduccion";
import {
  ResumenProduccion,
  TabsProduccion,
  ListaProducciones,
  BotonReporteDia,
} from "@/components/Produccion/comunes";
import {
  DialogoPausar,
  DialogoCancelar,
  AlertaFinalizar,
} from "@/components/Produccion/Dialogos";
import Header from "../../layout/Header";
import { CardActiva, CardPausada } from "./Tarjetas";

const ID_TIPO_INGRESO = 1;
const ID_TIPO_DESCUENTO = 2;

const MOTIVOS_PAUSA = [
  "Falta de pegamento",
  "Falta de personal para continuar la producción",
];

const codigosDe = (p) => `${p.CodigoBobina1} + ${p.CodigoBobina2}`;

export default function ProduccionBobinaTubo({ usuario }) {
  const [vista, setVista] = useState("activas");

  const [tiposBobina, setTiposBobina] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [buscarCodigoBobina, setBuscarCodigoBobina] = useState("");

  const idTipoFiltro = filtroTipo === "" ? undefined : Number(filtroTipo);

  const {
    activas,
    pausadas,
    recargarTodo,
    pausa,
    cancelacion,
    finalizacion,
    procesandoId,
    reanudar,
  } = useProduccion({
    verActivas: () => verProduccionBobinaTubo(idTipoFiltro),
    verPausadas: () => verPausasProduccionBobinaTuboActivas(idTipoFiltro),
    idDe: (p) => p.IdProduccionBobinaTubo,
    pausar: pausarProduccion,
    cancelar: cancelarProduccion,
    finalizar: finalizarProduccion,
    reanudar: reanudarProduccion,
    dependencias: [filtroTipo],
  });

  const [modalInsertar, setModalInsertar] = useState({ open: false, produccion: null });
  const [formTipoMovimiento, setFormTipoMovimiento] = useState("");
  const [formCantidadLogs, setFormCantidadLogs] = useState("");
  const [formObservacionLog, setFormObservacionLog] = useState("");
  const [errorInsertar, setErrorInsertar] = useState("");
  const [enviandoInsertar, setEnviandoInsertar] = useState(false);

  useEffect(() => {
    ObtenerTiposPapelBobina()
      .then(setTiposBobina)
      .catch(() => setTiposBobina([]));
  }, []);

  const requiereObservacion =
    formTipoMovimiento !== "" && Number(formTipoMovimiento) !== ID_TIPO_INGRESO;

  const movimientoSeleccionado = movimientosOperador.find(
    (m) => String(m.IdTipoMovimientoOperadorLogs) === String(formTipoMovimiento),
  );

  const motivosObservacion =
    ObservacionesInsertarLogs.find((o) => o.id === Number(formTipoMovimiento))
      ?.motivos.filter(Boolean) ?? [];

  const logsActuales = Number(modalInsertar.produccion?.CantidadLogsActual ?? 0);
  const esDescuento = Number(formTipoMovimiento) === ID_TIPO_DESCUENTO;
  const descuentoExcedeTotal =
    esDescuento && Number(formCantidadLogs) > logsActuales;

  const seleccionarTipoMovimiento = (idMovimiento) => {
    const yaSeleccionado = Number(formTipoMovimiento) === idMovimiento;
    setFormTipoMovimiento(yaSeleccionado ? "" : String(idMovimiento));
    setFormObservacionLog("");
  };

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
    if (esDescuento && cantidad > logsActuales) {
      setErrorInsertar(
        `No se puede descontar ${cantidad} logs, el total actual es ${logsActuales}.`,
      );
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
      recargarTodo();
    } catch (e) {
      setErrorInsertar(extraerMensajeError(e, e.message));
    } finally {
      setEnviandoInsertar(false);
    }
  };

  const motivoObservacionEnTexto = (motivo) => formObservacionLog.includes(motivo);

  const alternarMotivoObservacion = (motivo) => {
    setFormObservacionLog((actual) => alternarMotivoEnTexto(motivo, actual));
  };

  const opcionesPausa = pausa.produccion
    ? [
        ...MOTIVOS_PAUSA,
        ...(pausa.produccion.CodigoBobina1
          ? [`Empalme en la Bobina: ${pausa.produccion.CodigoBobina1}`]
          : []),
        ...(pausa.produccion.CodigoBobina2
          ? [`Empalme en la Bobina: ${pausa.produccion.CodigoBobina2}`]
          : []),
      ]
    : MOTIVOS_PAUSA;

  const coincideCodigoBobina = (p) => {
    const q = buscarCodigoBobina.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.CodigoBobina1 ?? "").toLowerCase().includes(q) ||
      (p.CodigoBobina2 ?? "").toLowerCase().includes(q)
    );
  };

  const activasFiltradas = activas.datos.filter(coincideCodigoBobina);
  const pausadasFiltradas = pausadas.datos.filter(coincideCodigoBobina);

  const sinCoincidencias = (estado) =>
    `Ninguna producción ${estado} con el código «${buscarCodigoBobina.trim()}».`;

  return (
    <TooltipProvider>
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header titulo={"Producción"} subtitulo={"Producción de Bobina Tubo"}>
        {usuario?.IdRol === Roles.Encargado && (
          <BotonReporteDia descargar={descargarReporteProduccionPorPeriodo} />
        )}
      </Header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <TabsProduccion
          vista={vista}
          onCambio={setVista}
          totalActivas={activasFiltradas.length}
          totalPausadas={pausadasFiltradas.length}
        />

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

        <div className="mb-5 flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Buscar por código de bobina
          </span>
          <div className="relative">
            <Search
              size={16}
              strokeWidth={2.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={buscarCodigoBobina}
              onChange={(e) => setBuscarCodigoBobina(e.target.value)}
              placeholder="Ej. 967 R20"
              maxLength={15}
              className="pl-9 pr-9"
            />
            {buscarCodigoBobina && (
              <button
                type="button"
                onClick={() => setBuscarCodigoBobina("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Limpiar búsqueda"
              >
                <X size={15} strokeWidth={2.75} />
              </button>
            )}
          </div>
        </div>

        {vista === "activas" && (
          <ListaProducciones
            lista={activas}
            elementos={activasFiltradas}
            altoSkeleton="h-64"
            mensajeVacio="No hay producciones activas."
            mensajeSinCoincidencias={sinCoincidencias("activa")}
            renderizar={(p) => (
              <CardActiva
                key={p.IdProduccionBobinaTubo}
                p={p}
                onInsertar={() => abrirInsertar(p)}
                onPausar={() => pausa.abrir(p)}
                onFinalizar={() => finalizacion.abrir(p)}
              />
            )}
          />
        )}

        {vista === "pausadas" && (
          <ListaProducciones
            lista={pausadas}
            elementos={pausadasFiltradas}
            altoSkeleton="h-64"
            mensajeVacio="No hay producciones pausadas."
            mensajeSinCoincidencias={sinCoincidencias("pausada")}
            renderizar={(p) => (
              <CardPausada
                key={p.IdPausaProduccionBobinaTubo}
                p={p}
                procesando={procesandoId === p.IdProduccionBobinaTubo}
                onInsertar={() => abrirInsertar(p)}
                onReanudar={() => reanudar(p)}
                onCancelar={() => cancelacion.abrir(p)}
              />
            )}
          />
        )}
      </main>

      <Dialog
        open={modalInsertar.open}
        onOpenChange={(open) => setModalInsertar({ open, produccion: open ? modalInsertar.produccion : null })}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Insertar movimiento de logs</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {modalInsertar.produccion && (
              <ResumenProduccion
                titulo={codigosDe(modalInsertar.produccion)}
                produccion={modalInsertar.produccion}
              />
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
                    onClick={() => seleccionarTipoMovimiento(m.IdTipoMovimientoOperadorLogs)}
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
                max={esDescuento ? logsActuales : undefined}
                className="h-11"
              />
              {esDescuento && (
                <span
                  className={`text-xs font-semibold ${
                    descuentoExcedeTotal ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  Disponible para descontar: {logsActuales} logs
                </span>
              )}
            </div>

            {requiereObservacion && (
              <div className="flex flex-col gap-3">
                {motivosObservacion.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Motivos frecuentes
                    </Label>
                    <ToggleGroup
                      type="multiple"
                      value={motivosObservacion.filter(motivoObservacionEnTexto)}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    >
                      {motivosObservacion.map((motivo) => (
                        <ToggleGroupItem
                          key={motivo}
                          value={motivo}
                          onClick={() => alternarMotivoObservacion(motivo)}
                          className="h-full w-full whitespace-normal rounded-xl border-2 border-slate-200 px-3 py-2 text-left text-[12.5px] font-bold leading-snug text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                        >
                          {motivo}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="observacion-log" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Observación
                  </Label>
                  <Textarea
                    id="observacion-log"
                    value={formObservacionLog}
                    onChange={(e) => setFormObservacionLog(limpiarObservacion(e.target.value))}
                    placeholder="Motivo de la corrección..."
                    className="min-h-20"
                  />
                </div>
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
              disabled={enviandoInsertar || descuentoExcedeTotal}
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

      <DialogoPausar dialogo={pausa} tituloDe={codigosDe} opciones={opcionesPausa} />

      <DialogoCancelar
        dialogo={cancelacion}
        tituloDe={codigosDe}
        placeholder="Ej. Bobina dañada, error de registro..."
      />

      <AlertaFinalizar dialogo={finalizacion} prefijo="de" codigoDe={codigosDe} />
    </div>
    </TooltipProvider>
  );
}
