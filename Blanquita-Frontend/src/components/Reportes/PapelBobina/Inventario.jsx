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
  verBobinasPapelReporte,
  descargarReporteInventarioBobinaPapel,
  descargarReporteMovimientosBobina,
} from "@/services/BobinaPapel/Reportes";
import { formatearNumero } from "@/utils/numeros";
import { TIPO_BOBINA_PAPEL, CODIGO_BOBINA_PAPEL } from "./filtros";

const COLUMNAS = [
  columnaCodigo("CodigoBobina"),
  { titulo: "Tipo", valor: (b) => b.NombreTipoBobina },
  COLUMNA_ESTADO,
  COLUMNA_PROVEEDOR,
  {
    titulo: "Bruto (kg)",
    ...DERECHA,
    valor: (b) => formatearNumero(b.PesoBrutoKg, { vacio: "-" }),
  },
  { titulo: "Gramaje", ...DERECHA, valor: (b) => formatearNumero(b.Gramaje, { vacio: "-" }) },
];

function BotonMovimientos({ bobina, className }) {
  return (
    <BotonDescargaFila
      className={className}
      ayuda="Descargar historial de movimientos de esta bobina"
      descargar={() => descargarReporteMovimientosBobina(bobina.IdBobinaPapel)}
    />
  );
}

export default function InventarioReporteBobinaPapel() {
  return (
    <ReporteInventario
      consultar={verBobinasPapelReporte}
      elementos={(catalogo) => catalogo.Bobinas}
      clave={(b) => b.IdBobinaPapel}
      nombres={["bobina", "bobinas"]}
      codigo={CODIGO_BOBINA_PAPEL}
      tipo={TIPO_BOBINA_PAPEL}
      informe={{
        ayuda:
          "PDF con el resumen y detalle de las bobinas en almacén, según los tipos marcados abajo (todos si no marcás ninguno)",
        descargar: descargarReporteInventarioBobinaPapel,
      }}
      columnas={COLUMNAS}
      accion={(b) => <BotonMovimientos bobina={b} />}
      tarjeta={(b) => (
        <TarjetaReporte
          titulo={b.CodigoBobina}
          subtitulo={
            <>
              {b.NombreTipoBobina} · {b.NombreProveedor}
            </>
          }
          estado={b.TipoEstado}
        >
          <PieTarjeta accion={<BotonMovimientos bobina={b} className="shrink-0" />}>
            <Dato etiqueta="Bruto">{formatearNumero(b.PesoBrutoKg, { vacio: "-" })} kg</Dato>
            <Dato etiqueta="Gramaje">{formatearNumero(b.Gramaje, { vacio: "-" })}</Dato>
          </PieTarjeta>
        </TarjetaReporte>
      )}
    />
  );
}
