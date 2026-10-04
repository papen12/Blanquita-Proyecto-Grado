import { useState } from "react";
import { FileText } from "lucide-react";
import DoubleDatePicker from "@/components/layout/dates/DoubleDatePicker";
import { useReporte } from "@/hooks/useReporte";
import { dateOnlyFormatter, aFechaISO } from "@/utils/dates";
import {
  TarjetaFiltros,
  BotonInforme,
  FiltroProveedor,
  FiltroTipos,
  ResultadosReporte,
  BotonDescargaFila,
  COLUMNA_PROVEEDOR,
  DERECHA,
  contar,
} from "@/components/Reportes/comunes";

export default function ReporteLotes({
  consultar,
  descargarDetalle,
  descargarPeriodo,
  campoId,
  cantidad,
  idCalendario,
  ayudaInforme,
  tipo,
}) {
  const reporte = useReporte(consultar, {
    Rango: undefined,
    IdProveedor: "",
    ...(tipo && { [tipo.campo]: [] }),
  });
  const { Rango } = reporte.filtros;
  const [diasDestacados, setDiasDestacados] = useState(new Map());

  const cargarDiasDestacados = async ({ inicio, fin }) => {
    try {
      const data = await consultar({
        FechaInicio: aFechaISO(inicio),
        FechaFin: aFechaISO(fin),
        Pagina: 1,
        TamanoPagina: 200,
      });

      const mapa = new Map();
      for (const lote of data.Lotes) {
        const lista = mapa.get(lote.FechaRecepcion) ?? [];
        lista.push(`Lote #${lote[campoId]} - ${dateOnlyFormatter(lote.FechaRecepcion)}`);
        mapa.set(lote.FechaRecepcion, lista);
      }
      setDiasDestacados(mapa);
    } catch {
      setDiasDestacados(new Map());
    }
  };

  const botonDetalle = (lote, className) => (
    <BotonDescargaFila
      icono={FileText}
      className={className}
      ayuda="Descargar el detalle en PDF de este lote"
      descargar={() => descargarDetalle(lote[campoId])}
    />
  );

  return (
    <>
      <TarjetaFiltros
        reporte={reporte}
        informe={
          <BotonInforme
            disponible={Boolean(Rango?.from && Rango?.to)}
            ayuda={ayudaInforme}
            exito="Informe de ingresos descargado"
            descargar={() => descargarPeriodo(aFechaISO(Rango.from), aFechaISO(Rango.to))}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DoubleDatePicker
            id={idCalendario}
            label="Fecha de recepción"
            value={Rango}
            onChange={(valor) => reporte.cambiar("Rango", valor)}
            diasDestacados={diasDestacados}
            onRangoVisibleChange={cargarDiasDestacados}
          />
          <FiltroProveedor reporte={reporte} />
        </div>

        {tipo && <FiltroTipos reporte={reporte} tipo={tipo} />}
      </TarjetaFiltros>

      <ResultadosReporte
        reporte={reporte}
        elementos={reporte.catalogo?.Lotes}
        clave={(lote) => lote[campoId]}
        nombres={["lote", "lotes"]}
        columnas={[
          {
            titulo: "Recepción",
            clase: "font-semibold text-slate-900",
            valor: (lote) => dateOnlyFormatter(lote.FechaRecepcion),
          },
          COLUMNA_PROVEEDOR,
          { titulo: cantidad.titulo, ...DERECHA, valor: (lote) => lote[cantidad.campo] },
        ]}
        accion={(lote) => botonDetalle(lote)}
        tarjeta={(lote) => (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold text-slate-900">
                {dateOnlyFormatter(lote.FechaRecepcion)}
              </span>
              <span className="text-[12.5px] text-slate-500">
                {lote.NombreProveedor} · {contar(lote[cantidad.campo], ...cantidad.nombres)}
              </span>
            </div>
            {botonDetalle(lote, "shrink-0")}
          </div>
        )}
      />
    </>
  );
}
