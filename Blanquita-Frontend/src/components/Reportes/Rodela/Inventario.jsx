import ReporteInventario from "@/components/Reportes/ReporteInventario";
import {
  BotonDescargaFila,
  TarjetaReporte,
  PieTarjeta,
  Dato,
  columnaCodigo,
  COLUMNA_ESTADO,
  COLUMNA_PROVEEDOR,
  DERECHA,
} from "@/components/Reportes/comunes";
import {
  verRodelasReporte,
  descargarReporteInventarioRodela,
  descargarReporteMovimientosRodela,
} from "@/services/Rodela/Reportes";
import { EstadosMateriaPrima } from "@/constants/Estados";
import { dateOnlyFormatter } from "@/utils/dates";
import { ArrayFilter } from "@/utils/handlers";
import { TIPO_RODELA } from "./filtros";

const ESTADOS_RODELA = ArrayFilter([1, 6], EstadosMateriaPrima);

const COLUMNAS = [
  columnaCodigo("CodigoRodela"),
  { titulo: "Tipo", valor: (r) => r.NombreTipoRodela },
  COLUMNA_ESTADO,
  COLUMNA_PROVEEDOR,
  { titulo: "Recepción", valor: (r) => dateOnlyFormatter(r.FechaRecepcion) },
  { titulo: "Lote", ...DERECHA, valor: (r) => <>#{r.IdLoteRodela}</> },
];

function BotonMovimientos({ rodela, className }) {
  return (
    <BotonDescargaFila
      className={className}
      ayuda="Descargar historial de movimientos de esta rodela"
      descargar={() => descargarReporteMovimientosRodela(rodela.IdRodela)}
    />
  );
}

export default function InventarioReporteRodela() {
  return (
    <ReporteInventario
      consultar={verRodelasReporte}
      elementos={(catalogo) => catalogo.Rodelas}
      clave={(r) => r.IdRodela}
      nombres={["rodela", "rodelas"]}
      codigo={{ campo: "CodigoRodela", etiqueta: "Código de rodela", placeholder: "Ej. 963-R20" }}
      estados={ESTADOS_RODELA}
      tipo={TIPO_RODELA}
      informe={{
        ayuda:
          "PDF con el resumen y detalle de las rodelas en almacén, según los tipos marcados abajo (todos si no marcás ninguno)",
        descargar: descargarReporteInventarioRodela,
      }}
      columnas={COLUMNAS}
      accion={(r) => <BotonMovimientos rodela={r} />}
      tarjeta={(r) => (
        <TarjetaReporte
          titulo={r.CodigoRodela}
          subtitulo={
            <>
              {r.NombreTipoRodela} · {r.NombreProveedor}
            </>
          }
          estado={r.TipoEstado}
        >
          <PieTarjeta accion={<BotonMovimientos rodela={r} className="shrink-0" />}>
            <span>{dateOnlyFormatter(r.FechaRecepcion)}</span>
            <Dato etiqueta="Lote">#{r.IdLoteRodela}</Dato>
          </PieTarjeta>
        </TarjetaReporte>
      )}
    />
  );
}
