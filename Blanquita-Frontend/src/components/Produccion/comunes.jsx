import {
  Plus,
  Pause,
  Play,
  Ban,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  ArrowLeftRight,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dateFormatter } from "@/utils/dates";

const GRID = "grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3";
const VACIO = "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200";

export function ResumenProduccion({ titulo, produccion }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
      <span className="font-mono font-bold text-slate-900">{titulo}</span>
      {(produccion.FechaHoraPausa || produccion.FechaInicioProduccion) && (
        <span className="flex items-center gap-1 text-[12px] text-slate-500">
          <Clock size={12} strokeWidth={2.75} />
          {produccion.FechaHoraPausa
            ? `Pausada: ${dateFormatter(produccion.FechaHoraPausa)}`
            : `Inicio: ${dateFormatter(produccion.FechaInicioProduccion)}`}
        </span>
      )}
      {produccion.FechaHoraPosposicion && (
        <span className="flex items-center gap-1 text-[12px] text-slate-500">
          <CalendarClock size={12} strokeWidth={2.75} />
          Pospuesta: {dateFormatter(produccion.FechaHoraPosposicion)}
        </span>
      )}
    </div>
  );
}

const ACCIONES = {
  insertar: {
    texto: "Insertar",
    icono: Plus,
    variant: "default",
    clase: "bg-gradient-to-r from-c3 to-c4 font-bold hover:opacity-90",
  },
  pausar: {
    texto: "Pausar",
    icono: Pause,
    variant: "outline",
    clase: "border-amber-300 font-bold text-amber-600 hover:bg-amber-50",
  },
  finalizar: {
    texto: "Finalizar",
    icono: CheckCircle2,
    variant: "outline",
    clase: "border-emerald-300 font-bold text-emerald-600 hover:bg-emerald-50",
  },
  reanudar: {
    texto: "Reanudar",
    icono: Play,
    variant: "outline",
    clase: "border-c3/30 font-bold text-c3 hover:bg-c4/8",
  },
  cancelar: {
    texto: "Cancelar",
    icono: Ban,
    variant: "outline",
    clase: "border-red-300 font-bold text-red-600 hover:bg-red-50",
  },
  cambiarLinea: {
    texto: "Cambiar línea",
    icono: ArrowLeftRight,
    variant: "outline",
    clase: "border-c3/30 font-bold text-c3 hover:bg-c4/8",
  },
  posponer: {
    texto: "Posponer",
    icono: CalendarClock,
    variant: "outline",
    clase: "border-slate-300 font-bold text-slate-700 hover:bg-slate-50",
  },
  retomar: {
    texto: "Retomar",
    icono: RotateCcw,
    variant: "outline",
    clase: "border-c3/30 font-bold text-c3 hover:bg-c4/8",
  },
};

const ESTILO_ESTADO = {
  activa: { borde: "border-slate-200", badge: "bg-emerald-100 text-emerald-700" },
  pausada: { borde: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  pospuesta: { borde: "border-dashed border-slate-300", badge: "bg-slate-200 text-slate-700" },
};

export function TarjetaProduccion({
  produccion,
  pausada = false,
  pospuesta = false,
  encabezado,
  children,
  acciones,
}) {
  const disponibles = acciones.filter((accion) => accion.onClick);
  const ancho = disponibles.length >= 3 ? "basis-[30%]" : "basis-[45%]";
  const estilo = ESTILO_ESTADO[pospuesta ? "pospuesta" : pausada ? "pausada" : "activa"];

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 shadow-sm",
        estilo.borde,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">{encabezado}</div>
        <Badge
          className={cn(
            "border-0 font-bold",
            estilo.badge,
          )}
        >
          {produccion.NombreEstadoProduccion}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
        {pausada || pospuesta ? (
          <>
            <span className="flex items-center gap-1">
              <Pause size={13} strokeWidth={2.75} />
              Pausada: {dateFormatter(produccion.FechaHoraPausa)}
            </span>
            {pospuesta && (
              <span className="flex items-center gap-1">
                <CalendarClock size={13} strokeWidth={2.75} />
                Pospuesta: {dateFormatter(produccion.FechaHoraPosposicion)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Clock size={13} strokeWidth={2.75} />
              {dateFormatter(produccion.FechaInicioProduccion)}
            </span>
            <span>Turno: {produccion.NombreTurno}</span>
          </>
        )}
      </div>

      {pospuesta && produccion.MotivoPosposicion && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">
          <span className="font-bold text-slate-700">Motivo: </span>
          {produccion.MotivoPosposicion}
        </p>
      )}

      {children}

      {disponibles.length > 0 && (
        <div className="flex flex-wrap items-center justify-around gap-2">
          {disponibles.map(({ tipo, onClick, disabled = false, procesando = false }) => {
            const { texto, icono: Icono, variant, clase } = ACCIONES[tipo];
            return (
              <Button
                key={tipo}
                onClick={onClick}
                disabled={disabled}
                variant={variant}
                className={cn("h-11 min-w-[100px] flex-1 justify-center gap-1.5", ancho, clase)}
              >
                {procesando ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Icono size={15} strokeWidth={2.75} />
                    {texto}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TabsProduccion({
  vista,
  onCambio,
  totalActivas,
  totalPausadas,
  totalPospuestas = 0,
  mostrarConcluidas = false,
  totalConcluidas = 0,
}) {
  const columnas = mostrarConcluidas
    ? "grid-cols-2 gap-1 group-data-horizontal/tabs:h-auto sm:w-[40rem] sm:grid-cols-4 sm:gap-0"
    : "grid-cols-3 sm:w-[30rem]";
  const compacto = mostrarConcluidas ? "h-8 sm:h-[calc(100%-1px)]" : "";

  return (
    <Tabs value={vista} onValueChange={onCambio} className="mb-5">
      <TabsList className={cn("grid w-full", columnas)}>
        <TabsTrigger value="activas" className={cn("gap-1.5 font-bold", compacto)}>
          <Layers size={15} strokeWidth={2.75} />
          Activas
          {totalActivas > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
              {totalActivas}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="pausadas" className={cn("gap-1.5 font-bold", compacto)}>
          <Pause size={15} strokeWidth={2.75} />
          Pausadas
          {totalPausadas > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
              {totalPausadas}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="pospuestas" className={cn("gap-1.5 font-bold", compacto)}>
          <CalendarClock size={15} strokeWidth={2.75} />
          Pospuestas
          {totalPospuestas > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
              {totalPospuestas}
            </Badge>
          )}
        </TabsTrigger>
        {mostrarConcluidas && (
          <TabsTrigger value="concluidas" className={cn("gap-1.5 font-bold", compacto)}>
            <CheckCircle2 size={15} strokeWidth={2.75} />
            Concluidas
            {totalConcluidas > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5">
                {totalConcluidas}
              </Badge>
            )}
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
}

export function ListaProducciones({
  lista,
  elementos = lista.datos,
  altoSkeleton,
  mensajeVacio,
  mensajeSinCoincidencias,
  renderizar,
}) {
  if (lista.cargando) {
    return (
      <div className={GRID}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className={cn(altoSkeleton, "rounded-2xl")} />
        ))}
      </div>
    );
  }

  if (lista.error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
        {lista.error}
      </div>
    );
  }

  if (lista.datos.length === 0) {
    return <div className={VACIO}>{mensajeVacio}</div>;
  }

  if (elementos.length === 0) {
    return <div className={VACIO}>{mensajeSinCoincidencias}</div>;
  }

  return <div className={GRID}>{elementos.map(renderizar)}</div>;
}
