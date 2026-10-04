import ReporteLotes from "@/components/Reportes/ReporteLotes";
import {
  verLotesRodela,
  descargarReporteLoteRodelaDetalle,
  descargarReporteLotesRodelaPorPeriodo,
} from "@/services/Rodela/Reportes";
import { TIPO_RODELA } from "./filtros";

export default function IngresoReporteRodela() {
  return (
    <ReporteLotes
      consultar={verLotesRodela}
      descargarDetalle={descargarReporteLoteRodelaDetalle}
      descargarPeriodo={descargarReporteLotesRodelaPorPeriodo}
      campoId="IdLoteRodela"
      cantidad={{ campo: "CantidadRodelas", titulo: "Rodelas", nombres: ["rodela", "rodelas"] }}
      idCalendario="rango-recepcion-lotes-rodela"
      ayudaInforme="PDF con una tabla por lote del rango elegido (fecha, proveedor y rodelas) más el total general"
      tipo={TIPO_RODELA}
    />
  );
}
