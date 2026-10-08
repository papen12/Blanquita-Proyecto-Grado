import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as construirQueryParams, t as conQueryParams } from "./params_JvteIAPo.mjs";
import { t as descargarReportePDF } from "./downloadFile_DxGT_R9d.mjs";
//#region src/models/BobinaServilleta/Reportes.js
var VerBobinasServilletaRequest = (filtros = {}) => ({
	CodigoBobina: filtros.CodigoBobina ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdTipoBobinaServilleta: filtros.IdTipoBobinaServilleta ?? null,
	IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
	IdBobinaServilleta: filtros.IdBobinaServilleta ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var BobinaServilletaCatalogoResponse = (data) => ({
	IdBobinaServilleta: data.IdBobinaServilleta,
	TipoEstado: data.TipoEstado,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
	CodigoLote: data.CodigoLote,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	IdUnidad1: data.IdUnidad1 ?? null,
	CodigoUnidad1: data.CodigoUnidad1 ?? null,
	DescripcionFormato1: data.DescripcionFormato1 ?? null,
	PesoBrutoKg1: data.PesoBrutoKg1 ?? null,
	GramajeGr1: data.GramajeGr1 ?? null,
	IdUnidad2: data.IdUnidad2 ?? null,
	CodigoUnidad2: data.CodigoUnidad2 ?? null,
	DescripcionFormato2: data.DescripcionFormato2 ?? null,
	PesoBrutoKg2: data.PesoBrutoKg2 ?? null,
	GramajeGr2: data.GramajeGr2 ?? null
});
var VerBobinasServilletaResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Bobinas: (data.Bobinas ?? []).map(BobinaServilletaCatalogoResponse)
});
var VerLotesBobinaServilletaRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdProveedor: filtros.IdProveedor ?? null,
	IdsTipoBobinaServilleta: filtros.IdsTipoBobinaServilleta ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var LoteBobinaServilletaCatalogoResponse = (data) => ({
	IdLoteBobinaServilleta: data.IdLoteBobinaServilleta,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	CantidadBobinas: data.CantidadBobinas
});
var VerLotesBobinaServilletaResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Lotes: (data.Lotes ?? []).map(LoteBobinaServilletaCatalogoResponse)
});
var VerProduccionesServilletaRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdTurno: filtros.IdTurno ?? null,
	IdsTipoBobinaServilleta: filtros.IdsTipoBobinaServilleta ?? null,
	CodigoBobina: filtros.CodigoBobina ?? null,
	Operador: filtros.Operador ?? null,
	IdEstadoProduccion: filtros.IdEstadoProduccion ?? null,
	IdsEstadoProduccion: filtros.IdsEstadoProduccion ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 50
});
var ProduccionServilletaCatalogoResponse = (data) => ({
	IdProduccionServilleta: data.IdProduccionServilleta,
	NombreEstadoProduccion: data.NombreEstadoProduccion,
	NombreTurno: data.NombreTurno,
	Operador: data.Operador,
	Ci: data.Ci,
	NombreRol: data.NombreRol,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
	CodigoBobina: data.CodigoBobina,
	DescripcionMedida: data.DescripcionMedida,
	IdSubBobinaServilleta: data.IdSubBobinaServilleta,
	FechaInicioProduccion: data.FechaInicioProduccion,
	FechaFinProduccion: data.FechaFinProduccion ?? null,
	DuracionTotal: data.DuracionTotal ?? null
});
var VerProduccionesServilletaResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Producciones: (data.Producciones ?? []).map(ProduccionServilletaCatalogoResponse)
});
//#endregion
//#region src/services/BobinaServilleta/Reportes.js
var BASE_URL = "/api/bobinaservilleta/reporte";
async function descargarReporteInventarioCompletoServilleta() {
	await descargarReportePDF(`${BASE_URL}/inventario/completo`, "reporte-inventario-servilleta.pdf");
}
async function descargarReporteInventarioBobinaServilleta(idsTipoBobinaServilleta) {
	await descargarReportePDF(conQueryParams(`${BASE_URL}/bobina/inventario`, { tipos: idsTipoBobinaServilleta }), "reporte-inventario-bobina-servilleta.pdf");
}
async function verBobinasServilletaReporte(filtros) {
	return VerBobinasServilletaResponse(await pedirJson(`${BASE_URL}/bobina/catalogo?${construirQueryParams(VerBobinasServilletaRequest(filtros)).toString()}`));
}
async function descargarReporteDetalleBobinaServilleta(idBobinaServilleta) {
	await descargarReportePDF(`${BASE_URL}/bobina/detalle/${idBobinaServilleta}`, `reporte-detalle-bobina-servilleta-${idBobinaServilleta}.pdf`);
}
async function descargarReporteMovimientosUnidadServilleta(idUnidadBobinaServilleta) {
	await descargarReportePDF(`${BASE_URL}/unidad/movimientos/${idUnidadBobinaServilleta}`, `reporte-movimientos-unidad-servilleta-${idUnidadBobinaServilleta}.pdf`);
}
async function verLotesBobinaServilleta(filtros) {
	return VerLotesBobinaServilletaResponse(await pedirJson(`${BASE_URL}/lote/catalogo?${construirQueryParams(VerLotesBobinaServilletaRequest(filtros)).toString()}`));
}
async function descargarReporteLoteServilletaDetalle(idLoteBobinaServilleta) {
	await descargarReportePDF(`${BASE_URL}/lote/detalle/${idLoteBobinaServilleta}`, `reporte-lote-servilleta-${idLoteBobinaServilleta}.pdf`);
}
async function descargarReporteLotesServilletaPorPeriodo(fechaInicio, fechaFin) {
	await descargarReportePDF(`${BASE_URL}/lote/periodo?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin
	}).toString()}`, `ingresos-lotes-servilleta-periodo-${fechaInicio}-${fechaFin}.pdf`);
}
async function verProduccionesServilleta(filtros) {
	return VerProduccionesServilletaResponse(await pedirJson(`${BASE_URL}/produccion/catalogo?${construirQueryParams(VerProduccionesServilletaRequest(filtros)).toString()}`));
}
async function descargarReporteDetalleProduccionServilleta(idProduccion, verPausas) {
	await descargarReportePDF(`${BASE_URL}/produccion/detalle/${idProduccion}?${construirQueryParams({ VerPausas: verPausas ?? false }).toString()}`, `reporte-produccion-servilleta-${idProduccion}.pdf`);
}
async function descargarReporteProduccionServilletaCancelada(idProduccion) {
	await descargarReportePDF(`${BASE_URL}/produccion/cancelada/${idProduccion}`, `reporte-produccion-servilleta-cancelada-${idProduccion}.pdf`);
}
async function descargarReporteProduccionServilletaPorPeriodo(fechaInicio, fechaFin, verCancelaciones) {
	await descargarReportePDF(`${BASE_URL}/produccion/periodo?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin,
		VerCancelaciones: verCancelaciones ?? false
	}).toString()}`, `reporte-produccion-servilleta-periodo-${fechaInicio}-${fechaFin}.pdf`);
}
//#endregion
export { descargarReporteLoteServilletaDetalle as a, descargarReporteProduccionServilletaCancelada as c, verLotesBobinaServilleta as d, verProduccionesServilleta as f, descargarReporteInventarioCompletoServilleta as i, descargarReporteProduccionServilletaPorPeriodo as l, descargarReporteDetalleProduccionServilleta as n, descargarReporteLotesServilletaPorPeriodo as o, descargarReporteInventarioBobinaServilleta as r, descargarReporteMovimientosUnidadServilleta as s, descargarReporteDetalleBobinaServilleta as t, verBobinasServilletaReporte as u };
