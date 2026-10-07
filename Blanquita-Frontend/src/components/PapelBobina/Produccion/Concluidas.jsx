import { useEffect } from "react";
import { startOfMonth, startOfWeek } from "date-fns";
import { Layers } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import DoubleDatePicker from "@/components/layout/dates/DoubleDatePicker";
import {
  TarjetaFiltros,
  BotonInforme,
  CampoFiltro,
  BuscadorFiltro,
  FiltroTipos,
  ResultadosReporte,
  BotonDescargaFila,
  TarjetaReporte,
  BadgeEstado,
  ESTADOS_PRODUCCION,
  DERECHA,
} from "@/components/Reportes/comunes";
import { PRODUCTO_BOBINA_PAPEL, CODIGO_BOBINA_PAPEL } from "@/components/Reportes/PapelBobina/filtros";
import {
  verProduccionesBobinaTubo,
  descargarReporteDetalleProduccion,
  descargarReporteProduccionCancelada,
  descargarReporteProduccionPorPeriodo,
} from "@/services/BobinaPapel/Reportes";
import { useReporte } from "@/hooks/useReporte";
import { PILDORA_FILTRO } from "@/constants/Acentos";
import { aFechaISO, dateFormatter, formatearDuracion } from "@/utils/dates";

const ID_FINALIZADO = 3;
const ID_CANCELADA = 4;
const ID_CAMBIO_LINEA = 5;
const ESTADOS_CONCLUIDOS = [ID_FINALIZADO, ID_CAMBIO_LINEA, ID_CANCELADA];

const FILTROS_ESTADO = [
  { valor: "todas", texto: "Todas", ids: ESTADOS_CONCLUIDOS },
  { valor: "finalizadas", texto: "Finalizadas", ids: [ID_FINALIZADO] },
  { valor: "cambio", texto: "Cambio de línea", ids: [ID_CAMBIO_LINEA] },
  { valor: "canceladas", texto: "Canceladas", ids: [ID_CANCELADA] },
];

const ATAJOS = [
  { valor: "hoy", texto: "Hoy", rango: (hoy) => ({ from: hoy, to: hoy }) },
  {
    valor: "semana",
    texto: "Esta semana",
    rango: (hoy) => ({ from: startOfWeek(hoy, { weekStartsOn: 1 }), to: hoy }),
  },
  { valor: "mes", texto: "Este mes", rango: (hoy) => ({ from: startOfMonth(hoy), to: hoy }) },
];

const mismoRango = (rango, otro) =>
  aFechaISO(rango?.from) === aFechaISO(otro.from) && aFechaISO(rango?.to) === aFechaISO(otro.to);

const mismosIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

const bobinas = (p) => `${p.CodigoBobina1} + ${p.CodigoBobina2}`;

function EtiquetaCargada({ cantidad }) {
  if (cantidad <= 1) return null;
  return (
    <Badge
      variant="outline"
      className="gap-1 border-c3/30 bg-c4/5 font-bold text-c3"
      title="Producciones hechas con el mismo par de bobinas"
    >
      <Layers size={12} strokeWidth={2.75} />
      Cargada: {cantidad}
    </Badge>
  );
}

function BotonDetalle({ p }) {
  const cancelada = p.NombreEstadoProduccion === "Cancelada";
  return (
    <BotonDescargaFila
      ayuda={
        cancelada
          ? "Descargar el reporte de la cancelación (pausas, logs y cargada)"
          : "Descargar el detalle de la producción (pausas, logs y cargada)"
      }
      descargar={() =>
        cancelada
          ? descargarReporteProduccionCancelada(p.IdProduccionBobinaTubo)
          : descargarReporteDetalleProduccion(p.IdProduccionBobinaTubo, true, true)
      }
    />
  );
}

const COLUMNAS = [
  {
    titulo: "Estado",
    valor: (p) => <BadgeEstado estado={p.NombreEstadoProduccion} estilos={ESTADOS_PRODUCCION} />,
  },
  {
    titulo: "Producto",
    valor: (p) => (
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold text-slate-900">{p.NombreProducto}</span>
        <EtiquetaCargada cantidad={p.CantidadCargada} />
      </div>
    ),
  },
  { titulo: "Bobinas", clase: "font-mono text-[12.5px]", valor: bobinas },
  { titulo: "Turno", valor: (p) => p.NombreTurno },
  { titulo: "Operador", valor: (p) => p.Operador },
  { titulo: "Inicio", clase: "text-[12.5px]", valor: (p) => dateFormatter(p.FechaInicioProduccion) },
  {
    titulo: "Fin",
    clase: "text-[12.5px]",
    valor: (p) => (p.FechaFinProduccion ? dateFormatter(p.FechaFinProduccion) : "-"),
  },
  { titulo: "Duración", ...DERECHA, valor: (p) => formatearDuracion(p.DuracionTotal) },
  { titulo: "Logs", ...DERECHA, valor: (p) => p.CantidadLogsActual },
];

export default function ProduccionesConcluidas({ onTotal }) {
  const reporte = useReporte(
    verProduccionesBobinaTubo,
    {
      Rango: ATAJOS[0].rango(new Date()),
      IdsEstadoProduccion: ESTADOS_CONCLUIDOS,
      [PRODUCTO_BOBINA_PAPEL.campo]: [],
      CodigoBobina: "",
    },
    ["CodigoBobina"],
  );
  const { filtros, catalogo } = reporte;
  const { Rango } = filtros;

  useEffect(() => {
    if (catalogo) onTotal?.(catalogo.Total);
  }, [catalogo]);

  const hoy = new Date();
  const atajoActivo = ATAJOS.find((atajo) => mismoRango(Rango, atajo.rango(hoy)))?.valor;
  const estadoActivo = FILTROS_ESTADO.find((f) =>
    mismosIds(f.ids, filtros.IdsEstadoProduccion),
  )?.valor;
  const rangoCompleto = Boolean(Rango?.from && Rango?.to);

  const hayFiltros =
    atajoActivo !== "hoy" ||
    estadoActivo !== "todas" ||
    filtros[PRODUCTO_BOBINA_PAPEL.campo].length > 0 ||
    reporte.textos.CodigoBobina.trim() !== "";

  return (
    <>
      <TarjetaFiltros
        reporte={{ ...reporte, hayFiltros }}
        informe={
          <BotonInforme
            disponible={rangoCompleto}
            ayuda="PDF del período: resumen por producto, producciones, pausas y cancelaciones"
            exito="Reporte del período descargado"
            descargar={() =>
              descargarReporteProduccionPorPeriodo(aFechaISO(Rango.from), aFechaISO(Rango.to), true)
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DoubleDatePicker
            id="rango-producciones-concluidas"
            label="Fecha de conclusión"
            value={Rango}
            onChange={(valor) => reporte.cambiar("Rango", valor)}
          />
          <CampoFiltro etiqueta="Período">
            <ToggleGroup
              value={atajoActivo ? [atajoActivo] : []}
              className="flex flex-wrap justify-start gap-2"
            >
              {ATAJOS.map((atajo) => (
                <ToggleGroupItem
                  key={atajo.valor}
                  value={atajo.valor}
                  onClick={() => reporte.cambiar("Rango", atajo.rango(new Date()))}
                  className={PILDORA_FILTRO}
                >
                  {atajo.texto}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CampoFiltro>
        </div>

        <CampoFiltro etiqueta="Estado">
          <ToggleGroup
            value={estadoActivo ? [estadoActivo] : []}
            className="flex flex-wrap justify-start gap-2"
          >
            {FILTROS_ESTADO.map((f) => (
              <ToggleGroupItem
                key={f.valor}
                value={f.valor}
                onClick={() => reporte.cambiar("IdsEstadoProduccion", f.ids)}
                className={PILDORA_FILTRO}
              >
                {f.texto}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CampoFiltro>

        <FiltroTipos reporte={reporte} tipo={PRODUCTO_BOBINA_PAPEL} />

        <BuscadorFiltro
          reporte={reporte}
          campo="CodigoBobina"
          etiqueta={CODIGO_BOBINA_PAPEL.etiqueta}
          placeholder={CODIGO_BOBINA_PAPEL.placeholder}
        />
      </TarjetaFiltros>

      <ResultadosReporte
        reporte={reporte}
        elementos={catalogo?.Producciones}
        clave={(p) => p.IdProduccionBobinaTubo}
        nombres={["producción concluida", "producciones concluidas"]}
        columnas={COLUMNAS}
        accion={(p) => <BotonDetalle p={p} />}
        tarjeta={(p) => (
          <TarjetaReporte
            titulo={bobinas(p)}
            tamanoTitulo="text-[13.5px]"
            subtitulo={`${p.NombreProducto} · ${p.NombreTurno} · ${p.Operador}`}
            estado={p.NombreEstadoProduccion}
            estilos={ESTADOS_PRODUCCION}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-600">
              <span>Inicio {dateFormatter(p.FechaInicioProduccion)}</span>
              {p.FechaFinProduccion && <span>Fin {dateFormatter(p.FechaFinProduccion)}</span>}
              <span>Duración {formatearDuracion(p.DuracionTotal)}</span>
              <span>Logs {p.CantidadLogsActual}</span>
              <EtiquetaCargada cantidad={p.CantidadCargada} />
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 pt-2.5">
              <BotonDetalle p={p} />
            </div>
          </TarjetaReporte>
        )}
      />
    </>
  );
}
