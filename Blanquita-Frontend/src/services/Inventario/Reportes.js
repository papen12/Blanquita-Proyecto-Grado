import {
  ResumenProduccionDiariaRequest,
  ResumenProduccionDiariaResponse
} from "../../models/Inventario/Reportes";
import { pedirJson } from "@/utils/api";
import { construirQueryParams } from "@/utils/params";
import { descargarReportePDF } from "@/utils/downloadFile";

const BASE_URL = "/api/productofinal/reportes";

export async function verResumenProduccionDiaria(filtros) {
  const payload = ResumenProduccionDiariaRequest(filtros);
  const params = construirQueryParams(payload);

  const data = await pedirJson(`${BASE_URL}/produccion/diaria/resumen?${params.toString()}`);

  return ResumenProduccionDiariaResponse(data);
}

export async function descargarReporteProduccionDiaria(fechaInicio, fechaFin, idsProducto, verMovimientos) {
  const params = construirQueryParams({
    FechaInicio: fechaInicio,
    FechaFin: fechaFin,
    IdsProducto: idsProducto,
    VerMovimientos: verMovimientos ?? false
  });

  await descargarReportePDF(
    `${BASE_URL}/produccion/diaria?${params.toString()}`,
    `produccion-diaria-${fechaInicio}-${fechaFin}.pdf`
  );
}
