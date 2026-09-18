import {
  VerBobinasServilletaRequest,
  VerBobinasServilletaResponse,
  VerLotesBobinaServilletaRequest,
  VerLotesBobinaServilletaResponse
} from "../../models/BobinaServilleta/Reportes";
import { manejarErrorBackend } from "@/utils/validators";
import { construirQueryParams } from "@/utils/params";

const BASE_URL = "/api/bobinaservilleta/reporte";

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

export async function descargarReporteInventarioBobinaServilleta(idsTipoBobinaServilleta) {
  const params = construirQueryParams({ tipos: idsTipoBobinaServilleta });
  const query = params.toString();

  await descargarReportePDF(
    `${BASE_URL}/bobina/inventario${query ? `?${query}` : ""}`,
    "reporte-inventario-bobina-servilleta.pdf"
  );
}

export async function verBobinasServilletaReporte(filtros) {
  const payload = VerBobinasServilletaRequest(filtros);
  const params = construirQueryParams(payload);

  const response = await fetch(`${BASE_URL}/bobina/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerBobinasServilletaResponse(data);
}

export async function descargarReporteDetalleBobinaServilleta(idBobinaServilleta) {
  await descargarReportePDF(
    `${BASE_URL}/bobina/detalle/${idBobinaServilleta}`,
    `reporte-detalle-bobina-servilleta-${idBobinaServilleta}.pdf`
  );
}

export async function descargarReporteMovimientosUnidadServilleta(idUnidadBobinaServilleta) {
  await descargarReportePDF(
    `${BASE_URL}/unidad/movimientos/${idUnidadBobinaServilleta}`,
    `reporte-movimientos-unidad-servilleta-${idUnidadBobinaServilleta}.pdf`
  );
}

export async function verLotesBobinaServilleta(filtros) {
  const payload = VerLotesBobinaServilletaRequest(filtros);
  const params = construirQueryParams(payload);

  const response = await fetch(`${BASE_URL}/lote/catalogo?${params.toString()}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return VerLotesBobinaServilletaResponse(data);
}

export async function descargarReporteLoteServilletaDetalle(idLoteBobinaServilleta) {
  await descargarReportePDF(
    `${BASE_URL}/lote/detalle/${idLoteBobinaServilleta}`,
    `reporte-lote-servilleta-${idLoteBobinaServilleta}.pdf`
  );
}

export async function descargarReporteLotesServilletaPorPeriodo(fechaInicio, fechaFin) {
  const params = construirQueryParams({
    FechaInicio: fechaInicio,
    FechaFin: fechaFin
  });

  await descargarReportePDF(
    `${BASE_URL}/lote/periodo?${params.toString()}`,
    `ingresos-lotes-servilleta-periodo-${fechaInicio}-${fechaFin}.pdf`
  );
}
