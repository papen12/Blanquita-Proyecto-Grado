import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { endOfMonth, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DoubleDatePicker from "@/components/layout/dates/DoubleDatePicker";
import { PaginaReporte } from "@/components/Reportes/PaginaReporte";
import {
  TarjetaFiltros,
  BotonInforme,
  CampoFiltro,
  FiltroTipos,
  DERECHA,
  contar,
} from "@/components/Reportes/comunes";
import { useReporte } from "@/hooks/useReporte";
import { PILDORA_FILTRO } from "@/constants/Acentos";
import { aFechaISO } from "@/utils/dates";
import { formatearNumero } from "@/utils/numeros";
import {
  verResumenProduccionDiaria,
  descargarReporteProduccionDiaria,
} from "@/services/Inventario/Reportes";
import { LINEA_PRODUCTO } from "./filtros";

const ATAJOS = [
  { valor: "hoy", texto: "Hoy", rango: (hoy) => ({ from: hoy, to: hoy }) },
  {
    valor: "ayer",
    texto: "Ayer",
    rango: (hoy) => {
      const ayer = subDays(hoy, 1);
      return { from: ayer, to: ayer };
    },
  },
  {
    valor: "semana",
    texto: "Esta semana",
    rango: (hoy) => ({ from: startOfWeek(hoy, { weekStartsOn: 1 }), to: hoy }),
  },
  { valor: "mes", texto: "Este mes", rango: (hoy) => ({ from: startOfMonth(hoy), to: hoy }) },
  {
    valor: "mes-anterior",
    texto: "Mes anterior",
    rango: (hoy) => {
      const mes = subMonths(hoy, 1);
      return { from: startOfMonth(mes), to: endOfMonth(mes) };
    },
  },
];

const mismoRango = (rango, otro) =>
  aFechaISO(rango?.from) === aFechaISO(otro.from) && aFechaISO(rango?.to) === aFechaISO(otro.to);

const consultarResumen = (parametros) =>
  parametros.FechaInicio && parametros.FechaFin
    ? verResumenProduccionDiaria(parametros)
    : Promise.resolve(null);

function TotalLinea({ linea }) {
  if (!linea.NumeroRegistros) {
    return <span className="text-slate-400">Sin producción</span>;
  }

  return (
    <>
      <strong className="text-slate-900">{formatearNumero(linea.Total, { decimales: 0 })}</strong>{" "}
      <span className="text-slate-500">{linea.Unidad}</span>
    </>
  );
}

const COLUMNAS = [
  { titulo: "Línea", clase: "font-bold text-slate-900", valor: (l) => l.NombreProducto },
  { titulo: "Total", ...DERECHA, valor: (l) => <TotalLinea linea={l} /> },
  { titulo: "Días con producción", ...DERECHA, valor: (l) => l.DiasConProduccion },
  {
    titulo: "Promedio por día",
    ...DERECHA,
    valor: (l) => formatearNumero(l.PromedioPorDia, { vacio: "-" }),
  },
  { titulo: "Registros", ...DERECHA, valor: (l) => l.NumeroRegistros },
];

function TarjetaLinea({ linea }) {
  const conProduccion = linea.NumeroRegistros > 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold text-slate-900">{linea.NombreProducto}</span>
        <span className="text-[12.5px] text-slate-500">
          {conProduccion
            ? `${contar(linea.DiasConProduccion, "día", "días")} · ${formatearNumero(linea.PromedioPorDia, { vacio: "-" })} por día · ${contar(linea.NumeroRegistros, "registro", "registros")}`
            : "Sin producción"}
        </span>
      </div>
      {conProduccion && (
        <span className="shrink-0 text-right text-[15px] tabular-nums">
          <TotalLinea linea={linea} />
        </span>
      )}
    </div>
  );
}

function ResumenProduccion({ reporte }) {
  const { catalogo: resumen, cargando, error, recargar } = reporte;
  const listo = !cargando && !error;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 px-5 py-4 text-base font-extrabold text-slate-900">
        Producción del período
      </div>

      {cargando && (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!cargando && error && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 text-sm font-semibold text-red-600">
          {error}
          <Button
            variant="outline"
            onClick={recargar}
            className="h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
          >
            <RefreshCcw size={14} strokeWidth={2.5} />
            Reintentar
          </Button>
        </div>
      )}

      {listo && !resumen && (
        <div className="p-10 text-center text-sm text-slate-400">
          Elegí una fecha de inicio y una de fin para ver la producción.
        </div>
      )}

      {listo && resumen && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNAS.map((columna) => (
                    <TableHead key={columna.titulo} className={columna.claseTitulo}>
                      {columna.titulo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumen.Lineas.map((linea) => (
                  <TableRow key={linea.IdProducto}>
                    {COLUMNAS.map((columna) => (
                      <TableCell key={columna.titulo} className={columna.clase}>
                        {columna.valor(linea)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 p-4 md:hidden">
            {resumen.Lineas.map((linea) => (
              <TarjetaLinea key={linea.IdProducto} linea={linea} />
            ))}
          </div>

          <div className="border-t border-slate-100 px-5 py-3.5 text-[12.5px] font-semibold text-slate-500">
            Días con producción: {resumen.DiasConProduccion} de {resumen.DiasPeriodo}
          </div>
        </>
      )}
    </section>
  );
}

export default function ProduccionReporteProducto({ usuario }) {
  const reporte = useReporte(consultarResumen, {
    Rango: ATAJOS[0].rango(new Date()),
    [LINEA_PRODUCTO.campo]: [],
  });
  const { filtros, catalogo: resumen } = reporte;
  const { Rango } = filtros;
  const lineas = filtros[LINEA_PRODUCTO.campo];

  const [verMovimientos, setVerMovimientos] = useState(false);

  const rangoCompleto = Boolean(Rango?.from && Rango?.to);
  const hayProduccion = Boolean(resumen?.Lineas.some((linea) => linea.NumeroRegistros > 0));
  const hoy = new Date();
  const atajoActivo = ATAJOS.find((atajo) => mismoRango(Rango, atajo.rango(hoy)))?.valor;

  return (
    <PaginaReporte
      usuario={usuario}
      titulo="Reportes · Productos"
      subtitulo="Producción diaria"
      contador={
        resumen
          ? {
              valor: resumen.DiasConProduccion,
              singular: "día con producción",
              plural: "días con producción",
            }
          : null
      }
    >
      <TarjetaFiltros
        reporte={{ ...reporte, hayFiltros: atajoActivo !== "hoy" || lineas.length > 0 }}
        informe={
          <BotonInforme
            disponible={rangoCompleto && hayProduccion}
            ayuda="PDF con el resumen por línea, la producción por día y el detalle por presentación del período elegido"
            ayudaNoDisponible={
              rangoCompleto
                ? "No hay producción registrada en el período y las líneas elegidas"
                : undefined
            }
            exito="Informe de producción descargado"
            descargar={() =>
              descargarReporteProduccionDiaria(
                aFechaISO(Rango.from),
                aFechaISO(Rango.to),
                lineas,
                verMovimientos,
              )
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DoubleDatePicker
            id="rango-produccion-producto"
            label="Fecha de producción"
            value={Rango}
            onChange={(valor) => reporte.cambiar("Rango", valor)}
          />
          <CampoFiltro etiqueta="Atajos">
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

        <FiltroTipos reporte={reporte} tipo={LINEA_PRODUCTO} />

        <CampoFiltro etiqueta="Informe PDF">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-[12.5px] font-bold text-slate-600">
            <input
              type="checkbox"
              checked={verMovimientos}
              onChange={(e) => setVerMovimientos(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-c3"
            />
            Incluir el detalle de movimientos
          </label>
        </CampoFiltro>
      </TarjetaFiltros>

      <ResumenProduccion reporte={reporte} />
    </PaginaReporte>
  );
}
