import {
  VerProduccionesBobinaTuboRequest,
  VerProduccionesBobinaTuboResponse,
  VerLotesBobinaPapelRequest,
  VerLotesBobinaPapelResponse,
  VerBobinasPapelRequest,
  VerBobinasPapelResponse
} from "../../models/BobinaPapel/Reportes";
import { pedirJson } from "@/utils/api";
import { construirQueryParams, conQueryParams } from "@/utils/params";
import { descargarReportePDF } from "@/utils/downloadFile";

const BASE_URL = "/api/papelbobina/reportes";

export async function descargarReporteInventarioBobinaPapel(idsTipoBobina) {
  await descargarReportePDF(
    conQueryParams(`${BASE_URL}/inventario`, { tipos: idsTipoBobina }),
    "reporte-inventario-bobina-papel.pdf"
  );
}

export async function verProduccionesBobinaTubo(filtros) {
  const payload = VerProduccionesBobinaTuboRequest(filtros);
  const params = construirQueryParams(payload);

  const data = await pedirJson(`${BASE_URL}/produccion/catalogo?${params.toString()}`);

  return VerProduccionesBobinaTuboResponse(data);
}

export async function descargarReporteDetalleProduccion(idProduccion, verPausas, verMovimientos) {
  const params = construirQueryParams({
    VerPausas: verPausas ?? false,
    VerMovimientos: verMovimientos ?? false
  });

  await descargarReportePDF(
    `${BASE_URL}/produccion/detalle/${idProduccion}?${params.toString()}`,
    `reporte-produccion-${idProduccion}.pdf`
  );
}

export async function descargarReporteProduccionCancelada(idProduccion) {
  await descargarReportePDF(
    `${BASE_URL}/produccion/cancelada/${idProduccion}`,
    `reporte-produccion-cancelada-${idProduccion}.pdf`
  );
}

export async function verLotesBobinaPapel(filtros) {
  const payload = VerLotesBobinaPapelRequest(filtros);
  const params = construirQueryParams(payload);

  const data = await pedirJson(`${BASE_URL}/lote/catalogo?${params.toString()}`);

  return VerLotesBobinaPapelResponse(data);
}

export async function descargarReporteLoteDetalle(idLoteBobina) {
  await descargarReportePDF(
    `${BASE_URL}/lote/detalle/${idLoteBobina}`,
    `reporte-lote-${idLoteBobina}.pdf`
  );
}

export async function descargarReporteLotesPorPeriodo(fechaInicio, fechaFin) {
  const params = construirQueryParams({
    FechaInicio: fechaInicio,
    FechaFin: fechaFin
  });

  await descargarReportePDF(
    `${BASE_URL}/lote/periodo?${params.toString()}`,
    `ingresos-lotes-periodo-${fechaInicio}-${fechaFin}.pdf`
  );
}

export async function descargarReporteProduccionPorPeriodo(fechaInicio, fechaFin, verCancelaciones) {
  const params = construirQueryParams({
    FechaInicio: fechaInicio,
    FechaFin: fechaFin,
    VerCancelaciones: verCancelaciones ?? false
  });

  await descargarReportePDF(
    `${BASE_URL}/produccion/periodo?${params.toString()}`,
    `reporte-produccion-periodo-${fechaInicio}-${fechaFin}.pdf`
  );
}

export async function verBobinasPapelReporte(filtros) {
  const payload = VerBobinasPapelRequest(filtros);
  const params = construirQueryParams(payload);

  const data = await pedirJson(`${BASE_URL}/movimientos/catalogo?${params.toString()}`);

  return VerBobinasPapelResponse(data);
}

export async function descargarReporteMovimientosBobina(idBobinaPapel) {
  await descargarReportePDF(
    `${BASE_URL}/movimientos/reporte/${idBobinaPapel}`,
    `reporte-movimientos-bobina-${idBobinaPapel}.pdf`
  );
}
