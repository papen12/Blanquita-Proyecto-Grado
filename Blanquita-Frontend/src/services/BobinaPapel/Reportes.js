import {
  VerProduccionesBobinaTuboRequest,
  VerProduccionesBobinaTuboResponse,
  VerLotesBobinaPapelRequest,
  VerLotesBobinaPapelResponse,
  VerBobinasPapelRequest,
  VerBobinasPapelResponse
} from "../../models/BobinaPapel/Reportes";
import { manejarErrorBackend } from "@/utils/validators";
import { construirQueryParams } from "@/utils/params";

const BASE_URL = "/api/papelbobina/reportes";

function obtenerNombreArchivo(response, nombrePorDefecto) {
  const disposicion = response.headers.get("Content-Disposition");
  const coincidencia = disposicion?.match(/filename="?([^"]+)"?/);

  return coincidencia?.[1] ?? nombrePorDefecto;
}

function descargarArchivo(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}

async function descargarReportePDF(url, nombrePorDefecto) {
  const response = await fetch(url);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const blob = await response.blob();
  const nombreArchivo = obtenerNombreArchivo(response, nombrePorDefecto);

  descargarArchivo(blob, nombreArchivo);
}

export async function descargarReporteInventarioBobinaPapel(idsTipoBobina) {
  const params = construirQueryParams({ tipos: idsTipoBobina });
  const query = params.toString();

  await descargarReportePDF(
    `${BASE_URL}/inventario${query ? `?${query}` : ""}`,
    "reporte-inventario-bobina-papel.pdf"
  );
}

export async function verProduccionesBobinaTubo(filtros) {
  const payload = VerProduccionesBobinaTuboRequest(filtros);
  const params = construirQueryParams(payload);

  const response = await fetch(`${BASE_URL}/produccion/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

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

  const response = await fetch(`${BASE_URL}/lote/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

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

  const response = await fetch(`${BASE_URL}/movimientos/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerBobinasPapelResponse(data);
}

export async function descargarReporteMovimientosBobina(idBobinaPapel) {
  await descargarReportePDF(
    `${BASE_URL}/movimientos/reporte/${idBobinaPapel}`,
    `reporte-movimientos-bobina-${idBobinaPapel}.pdf`
  );
}
