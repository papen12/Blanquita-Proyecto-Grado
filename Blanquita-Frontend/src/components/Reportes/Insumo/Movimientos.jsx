import { endOfMonth, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
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
import { aFechaISO, dateFormatter } from "@/utils/dates";
import { formatearNumero } from "@/utils/numeros";
import {
  verResumenMovimientosInsumo,
  descargarReporteMovimientosInsumo,
} from "@/services/Insumo/Reporte";
import {
  TarjetaSeccion,
  EsqueletoCarga,
  ErrorCarga,
  TablaFilas,
  TarjetaFila,
} from "@/components/Reportes/Producto/comunes";
import { TIPO_INSUMO } from "./filtros";

const ID_TIPO_MOVIMIENTO_INGRESO = 1;

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
    ? verResumenMovimientosInsumo(parametros)
    : Promise.resolve(null);

const entero = (valor) => formatearNumero(valor, { decimales: 0 });

const esIngreso = (m) => m.IdTipoMovimiento === ID_TIPO_MOVIMIENTO_INGRESO;

const textoMovimiento = (m) => (esIngreso(m) ? "Ingreso" : "Salida");

const textoCantidad = (m) => `${esIngreso(m) ? "+" : "-"}${entero(m.CantidadMovimiento)}`;

const textoUsuario = (m) => `${m.PrimerNombre} ${m.ApellidoPaterno}`;

const COLUMNAS_RESUMEN = [
  { titulo: "Insumo", clase: "font-bold text-slate-900", valor: (r) => r.NombreInsumo },
  { titulo: "Ingresos", ...DERECHA, valor: (r) => entero(r.Ingresos) },
  { titulo: "Salidas", ...DERECHA, valor: (r) => entero(r.Salidas) },
  { titulo: "Neto", ...DERECHA, valor: (r) => entero(r.Neto) },
  { titulo: "Movimientos", ...DERECHA, valor: (r) => r.NumeroMovimientos },
  { titulo: "Stock actual", ...DERECHA, valor: (r) => entero(r.CantidadActual) },
];

const COLUMNAS_MOVIMIENTOS = [
  { titulo: "Fecha", clase: "text-[12.5px]", valor: (m) => dateFormatter(m.FechaMovimiento) },
  { titulo: "Insumo", clase: "font-bold text-slate-900", valor: (m) => m.NombreInsumo },
  { titulo: "Movimiento", valor: textoMovimiento },
  {
    titulo: "Cantidad",
    ...DERECHA,
    valor: (m) => (
      <span className={esIngreso(m) ? "font-bold text-emerald-700" : "font-bold text-red-700"}>
        {textoCantidad(m)}
      </span>
    ),
  },
  {
    titulo: "Usuario",
    clase: "text-[12.5px]",
    valor: (m) => (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-900">{textoUsuario(m)}</span>
        <span className="text-slate-500">
          CI {m.Ci} · {m.NombreRol}
        </span>
      </div>
    ),
  },
  { titulo: "Observación", clase: "text-[12.5px] text-slate-600", valor: (m) => m.Observacion ?? "-" },
];

function tarjetaResumen(r) {
  return (
    <TarjetaFila
      nombre={r.NombreInsumo}
      detalle={`+${entero(r.Ingresos)} ingresos · -${entero(r.Salidas)} salidas · ${contar(r.NumeroMovimientos, "movimiento", "movimientos")}`}
    >
      <strong className="text-slate-900">{entero(r.CantidadActual)}</strong>{" "}
      <span className="text-slate-500">en stock</span>
    </TarjetaFila>
  );
}

function tarjetaMovimiento(m) {
  return (
    <TarjetaFila
      nombre={`${m.NombreInsumo} · ${textoMovimiento(m)}`}
      detalle={`${dateFormatter(m.FechaMovimiento)} · ${textoUsuario(m)} · ${m.Observacion ?? "-"}`}
    >
      <strong className={esIngreso(m) ? "text-emerald-700" : "text-red-700"}>
        {textoCantidad(m)}
      </strong>
    </TarjetaFila>
  );
}

function ResultadosMovimientos({ reporte }) {
  const { catalogo: resumen, cargando, error, recargar } = reporte;

  if (cargando || error) {
    return (
      <TarjetaSeccion titulo="Resumen por insumo" className="mt-6">
        {cargando ? <EsqueletoCarga /> : <ErrorCarga error={error} recargar={recargar} />}
      </TarjetaSeccion>
    );
  }

  if (!resumen) {
    return (
      <TarjetaSeccion titulo="Resumen por insumo" className="mt-6">
        <div className="p-10 text-center text-sm text-slate-400">
          Elegí una fecha de inicio y una de fin para ver los movimientos.
        </div>
      </TarjetaSeccion>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <TarjetaSeccion titulo="Resumen por insumo">
        <TablaFilas
          columnas={COLUMNAS_RESUMEN}
          filas={resumen.Resumen}
          clave={(r) => r.IdTipoInsumo}
          tarjeta={tarjetaResumen}
        />
      </TarjetaSeccion>

      <TarjetaSeccion
        titulo="Detalle de movimientos"
        extra={
          <span className="text-[12.5px] font-semibold text-slate-500">
            {contar(resumen.Movimientos.length, "movimiento", "movimientos")}
          </span>
        }
      >
        {resumen.Movimientos.length > 0 ? (
          <TablaFilas
            columnas={COLUMNAS_MOVIMIENTOS}
            filas={resumen.Movimientos}
            clave={(m) => m.IdMovimientoInsumo}
            tarjeta={tarjetaMovimiento}
          />
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">
            No hay movimientos de insumos en el período y los insumos elegidos.
          </div>
        )}
      </TarjetaSeccion>
    </div>
  );
}

export default function MovimientosReporteInsumo({ usuario }) {
  const reporte = useReporte(consultarResumen, {
    Rango: ATAJOS[0].rango(new Date()),
    [TIPO_INSUMO.campo]: [],
  });
  const { filtros, catalogo: resumen } = reporte;
  const { Rango } = filtros;
  const insumos = filtros[TIPO_INSUMO.campo];

  const rangoCompleto = Boolean(Rango?.from && Rango?.to);
  const hayMovimientos = Boolean(resumen?.Movimientos.length);
  const hoy = new Date();
  const atajoActivo = ATAJOS.find((atajo) => mismoRango(Rango, atajo.rango(hoy)))?.valor;

  return (
    <PaginaReporte
      usuario={usuario}
      titulo="Reportes · Insumos"
      subtitulo="Movimientos"
      contador={
        resumen
          ? {
              valor: resumen.Movimientos.length,
              singular: "movimiento",
              plural: "movimientos",
            }
          : null
      }
    >
      <TarjetaFiltros
        reporte={{ ...reporte, hayFiltros: atajoActivo !== "hoy" || insumos.length > 0 }}
        informe={
          <BotonInforme
            disponible={rangoCompleto && hayMovimientos}
            ayuda="PDF con el resumen por insumo y el detalle de ingresos y salidas del período elegido"
            ayudaNoDisponible={
              rangoCompleto
                ? "No hay movimientos de insumos en el período y los insumos elegidos"
                : undefined
            }
            exito="Informe de movimientos de insumos descargado"
            descargar={() =>
              descargarReporteMovimientosInsumo(
                aFechaISO(Rango.from),
                aFechaISO(Rango.to),
                insumos,
              )
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DoubleDatePicker
            id="rango-movimientos-insumo"
            label="Fecha del movimiento"
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

        <FiltroTipos reporte={reporte} tipo={TIPO_INSUMO} />
      </TarjetaFiltros>

      <ResultadosMovimientos reporte={reporte} />
    </PaginaReporte>
  );
}
