import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as construirQueryParams, t as conQueryParams } from "./params_JvteIAPo.mjs";
import { t as descargarReportePDF } from "./downloadFile_DxGT_R9d.mjs";
//#region src/models/BobinaPapel/Reportes.js
var VerProduccionesBobinaTuboRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdTurno: filtros.IdTurno ?? null,
	IdsProducto: filtros.IdsProducto ?? null,
	CodigoBobina: filtros.CodigoBobina ?? null,
	Operador: filtros.Operador ?? null,
	IdEstadoProduccion: filtros.IdEstadoProduccion ?? null,
	IdsEstadoProduccion: filtros.IdsEstadoProduccion ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var ProduccionBobinaTuboCatalogoResponse = (data) => ({
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	NombreEstadoProduccion: data.NombreEstadoProduccion,
	NombreTurno: data.NombreTurno,
	Operador: data.Operador,
	Ci: data.Ci,
	NombreRol: data.NombreRol,
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	CodigoBobina1: data.CodigoBobina1,
	CodigoBobina2: data.CodigoBobina2,
	FechaInicioProduccion: data.FechaInicioProduccion,
	FechaFinProduccion: data.FechaFinProduccion ?? null,
	DuracionTotal: data.DuracionTotal ?? null,
	CantidadLogsActual: data.CantidadLogsActual,
	CantidadCargada: data.CantidadCargada ?? 1
});
var VerProduccionesBobinaTuboResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Producciones: (data.Producciones ?? []).map(ProduccionBobinaTuboCatalogoResponse)
});
var VerLotesBobinaPapelRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdsTipoBobina: filtros.IdsTipoBobina ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var LoteBobinaPapelCatalogoResponse = (data) => ({
	IdLoteBobina: data.IdLoteBobina,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	CantidadBobinas: data.CantidadBobinas
});
var VerLotesBobinaPapelResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Lotes: (data.Lotes ?? []).map(LoteBobinaPapelCatalogoResponse)
});
var VerBobinasPapelRequest = (filtros = {}) => ({
	CodigoBobina: filtros.CodigoBobina ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdsTipoBobina: filtros.IdsTipoBobina ?? null,
	IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
	IdBobinaPapel: filtros.IdBobinaPapel ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var BobinaPapelCatalogoResponse = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	CodigoBobina: data.CodigoBobina,
	PesoBrutoKg: data.PesoBrutoKg ?? null,
	Gramaje: data.Gramaje ?? null,
	NombreTipoBobina: data.NombreTipoBobina,
	TipoEstado: data.TipoEstado,
	NombreProveedor: data.NombreProveedor
});
var VerBobinasPapelResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Bobinas: (data.Bobinas ?? []).map(BobinaPapelCatalogoResponse)
});
//#endregion
//#region src/services/BobinaPapel/Reportes.js
var BASE_URL = "/api/papelbobina/reportes";
async function descargarReporteInventarioBobinaPapel(idsTipoBobina) {
	await descargarReportePDF(conQueryParams(`${BASE_URL}/inventario`, { tipos: idsTipoBobina }), "reporte-inventario-bobina-papel.pdf");
}
async function verProduccionesBobinaTubo(filtros) {
	return VerProduccionesBobinaTuboResponse(await pedirJson(`${BASE_URL}/produccion/catalogo?${construirQueryParams(VerProduccionesBobinaTuboRequest(filtros)).toString()}`));
}
async function descargarReporteDetalleProduccion(idProduccion, verPausas, verMovimientos) {
	await descargarReportePDF(`${BASE_URL}/produccion/detalle/${idProduccion}?${construirQueryParams({
		VerPausas: verPausas ?? false,
		VerMovimientos: verMovimientos ?? false
	}).toString()}`, `reporte-produccion-${idProduccion}.pdf`);
}
async function descargarReporteProduccionCancelada(idProduccion) {
	await descargarReportePDF(`${BASE_URL}/produccion/cancelada/${idProduccion}`, `reporte-produccion-cancelada-${idProduccion}.pdf`);
}
async function verLotesBobinaPapel(filtros) {
	return VerLotesBobinaPapelResponse(await pedirJson(`${BASE_URL}/lote/catalogo?${construirQueryParams(VerLotesBobinaPapelRequest(filtros)).toString()}`));
}
async function descargarReporteLoteDetalle(idLoteBobina) {
	await descargarReportePDF(`${BASE_URL}/lote/detalle/${idLoteBobina}`, `reporte-lote-${idLoteBobina}.pdf`);
}
async function descargarReporteLotesPorPeriodo(fechaInicio, fechaFin) {
	await descargarReportePDF(`${BASE_URL}/lote/periodo?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin
	}).toString()}`, `ingresos-lotes-periodo-${fechaInicio}-${fechaFin}.pdf`);
}
async function descargarReporteProduccionPorPeriodo(fechaInicio, fechaFin, verCancelaciones) {
	await descargarReportePDF(`${BASE_URL}/produccion/periodo?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin,
		VerCancelaciones: verCancelaciones ?? false
	}).toString()}`, `reporte-produccion-periodo-${fechaInicio}-${fechaFin}.pdf`);
}
async function verBobinasPapelReporte(filtros) {
	return VerBobinasPapelResponse(await pedirJson(`${BASE_URL}/movimientos/catalogo?${construirQueryParams(VerBobinasPapelRequest(filtros)).toString()}`));
}
async function descargarReporteMovimientosBobina(idBobinaPapel) {
	await descargarReportePDF(`${BASE_URL}/movimientos/reporte/${idBobinaPapel}`, `reporte-movimientos-bobina-${idBobinaPapel}.pdf`);
}
//#endregion
export { descargarReporteMovimientosBobina as a, verBobinasPapelReporte as c, descargarReporteLotesPorPeriodo as i, verLotesBobinaPapel as l, descargarReporteInventarioBobinaPapel as n, descargarReporteProduccionCancelada as o, descargarReporteLoteDetalle as r, descargarReporteProduccionPorPeriodo as s, descargarReporteDetalleProduccion as t, verProduccionesBobinaTubo as u };
