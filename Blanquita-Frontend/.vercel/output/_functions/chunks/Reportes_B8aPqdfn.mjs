import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as construirQueryParams, t as conQueryParams } from "./params_JvteIAPo.mjs";
import { t as descargarReportePDF } from "./downloadFile_DxGT_R9d.mjs";
//#region src/models/Rodela/Reportes.js
var VerRodelasRequest = (filtros = {}) => ({
	CodigoRodela: filtros.CodigoRodela ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdsTipoRodela: filtros.IdsTipoRodela ?? null,
	IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
	IdLoteRodela: filtros.IdLoteRodela ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var RodelaCatalogoResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoRodela: data.CodigoRodela,
	TipoEstado: data.TipoEstado,
	NombreTipoRodela: data.NombreTipoRodela,
	NombreProveedor: data.NombreProveedor,
	FechaRecepcion: data.FechaRecepcion,
	IdLoteRodela: data.IdLoteRodela
});
var VerRodelasResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Rodelas: (data.Rodelas ?? []).map(RodelaCatalogoResponse)
});
var VerLotesRodelaRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdsTipoRodela: filtros.IdsTipoRodela ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var LoteRodelaCatalogoResponse = (data) => ({
	IdLoteRodela: data.IdLoteRodela,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	CantidadRodelas: data.CantidadRodelas
});
var VerLotesRodelaResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Lotes: (data.Lotes ?? []).map(LoteRodelaCatalogoResponse)
});
//#endregion
//#region src/services/Rodela/Reportes.js
var BASE_URL = "/api/rodela/reportes";
async function verRodelasReporte(filtros) {
	return VerRodelasResponse(await pedirJson(`${BASE_URL}/inventario/catalogo?${construirQueryParams(VerRodelasRequest(filtros)).toString()}`));
}
async function descargarReporteInventarioRodela(idsTipoRodela) {
	await descargarReportePDF(conQueryParams(`${BASE_URL}/inventario`, { tipos: idsTipoRodela }), "reporte-inventario-rodela.pdf");
}
async function descargarReporteMovimientosRodela(idRodela) {
	await descargarReportePDF(`${BASE_URL}/movimientos/reporte/${idRodela}`, `reporte-movimientos-rodela-${idRodela}.pdf`);
}
async function verLotesRodela(filtros) {
	return VerLotesRodelaResponse(await pedirJson(`${BASE_URL}/lote/catalogo?${construirQueryParams(VerLotesRodelaRequest(filtros)).toString()}`));
}
async function descargarReporteLoteRodelaDetalle(idLoteRodela) {
	await descargarReportePDF(`${BASE_URL}/lote/detalle/${idLoteRodela}`, `reporte-lote-rodela-${idLoteRodela}.pdf`);
}
async function descargarReporteLotesRodelaPorPeriodo(fechaInicio, fechaFin) {
	await descargarReportePDF(`${BASE_URL}/lote/periodo?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin
	}).toString()}`, `ingresos-lotes-rodela-periodo-${fechaInicio}-${fechaFin}.pdf`);
}
//#endregion
export { verLotesRodela as a, descargarReporteMovimientosRodela as i, descargarReporteLoteRodelaDetalle as n, verRodelasReporte as o, descargarReporteLotesRodelaPorPeriodo as r, descargarReporteInventarioRodela as t };
