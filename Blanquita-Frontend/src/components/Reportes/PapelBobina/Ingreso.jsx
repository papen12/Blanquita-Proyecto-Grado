import ReporteLotes from "@/components/Reportes/ReporteLotes";
import {
  verLotesBobinaPapel,
  descargarReporteLoteDetalle,
  descargarReporteLotesPorPeriodo,
} from "@/services/BobinaPapel/Reportes";
import { TIPO_BOBINA_PAPEL } from "./filtros";

export default function IngresoReporteBobinaPapel() {
  return (
    <ReporteLotes
      consultar={verLotesBobinaPapel}
      descargarDetalle={descargarReporteLoteDetalle}
      descargarPeriodo={descargarReporteLotesPorPeriodo}
      campoId="IdLoteBobina"
      cantidad={{ campo: "CantidadBobinas", titulo: "Bobinas", nombres: ["bobina", "bobinas"] }}
      idCalendario="rango-recepcion-lotes"
      ayudaInforme="PDF con una tabla por lote del rango elegido (fecha, proveedor y bobinas) más el total general"
      tipo={TIPO_BOBINA_PAPEL}
    />
  );
}
