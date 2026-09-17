import {
  VerRodelasRequest,
  VerRodelasResponse,
  VerLotesRodelaRequest,
  VerLotesRodelaResponse
} from "../../models/Rodela/Reportes";
import { manejarErrorBackend } from "@/utils/validators";
import { construirQueryParams } from "@/utils/params";

const BASE_URL = "/api/rodela/reportes";

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

export async function verRodelasReporte(filtros) {
  const payload = VerRodelasRequest(filtros);
  const params = construirQueryParams(payload);

  const response = await fetch(`${BASE_URL}/inventario/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerRodelasResponse(data);
}

export async function descargarReporteInventarioRodela(idsTipoRodela) {
  const params = construirQueryParams({ tipos: idsTipoRodela });
  const query = params.toString();

  await descargarReportePDF(
    `${BASE_URL}/inventario${query ? `?${query}` : ""}`,
    "reporte-inventario-rodela.pdf"
  );
}

export async function descargarReporteMovimientosRodela(idRodela) {
  await descargarReportePDF(
    `${BASE_URL}/movimientos/reporte/${idRodela}`,
    `reporte-movimientos-rodela-${idRodela}.pdf`
  );
}

export async function verLotesRodela(filtros) {
  const payload = VerLotesRodelaRequest(filtros);
  const params = construirQueryParams(payload);

  const response = await fetch(`${BASE_URL}/lote/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerLotesRodelaResponse(data);
}

export async function descargarReporteLoteRodelaDetalle(idLoteRodela) {
  await descargarReportePDF(
    `${BASE_URL}/lote/detalle/${idLoteRodela}`,
    `reporte-lote-rodela-${idLoteRodela}.pdf`
  );
}

export async function descargarReporteLotesRodelaPorPeriodo(fechaInicio, fechaFin) {
  const params = construirQueryParams({
    FechaInicio: fechaInicio,
    FechaFin: fechaFin
  });

  await descargarReportePDF(
    `${BASE_URL}/lote/periodo?${params.toString()}`,
    `ingresos-lotes-rodela-periodo-${fechaInicio}-${fechaFin}.pdf`
  );
}
