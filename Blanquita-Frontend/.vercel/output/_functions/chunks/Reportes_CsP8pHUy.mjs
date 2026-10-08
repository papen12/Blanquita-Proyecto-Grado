import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as construirQueryParams, t as conQueryParams } from "./params_JvteIAPo.mjs";
import { t as descargarReportePDF } from "./downloadFile_DxGT_R9d.mjs";
//#region src/models/Inventario/Reportes.js
var ResumenProduccionDiariaRequest = (filtros = {}) => ({
	FechaInicio: filtros.FechaInicio ?? null,
	FechaFin: filtros.FechaFin ?? null,
	IdsProducto: filtros.IdsProducto ?? null
});
var ProduccionPresentacionResponse = (data) => ({
	IdPresentacion: data.IdPresentacion,
	CodigoPresentacion: data.CodigoPresentacion,
	NombrePresentacion: data.NombrePresentacion,
	Entradas: data.Entradas,
	Aumentos: data.Aumentos,
	Descuentos: data.Descuentos,
	Correcciones: data.Correcciones,
	Total: data.Total,
	NumeroRegistros: data.NumeroRegistros
});
var ProduccionLineaResponse = (data) => ({
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	Unidad: data.Unidad,
	Entradas: data.Entradas,
	Correcciones: data.Correcciones,
	Total: data.Total,
	NumeroRegistros: data.NumeroRegistros,
	DiasConProduccion: data.DiasConProduccion,
	PromedioPorDia: data.PromedioPorDia ?? null,
	Presentaciones: (data.Presentaciones ?? []).map(ProduccionPresentacionResponse)
});
var ProduccionDiaResponse = (data) => ({
	Fecha: data.Fecha,
	TotalesPorLinea: data.TotalesPorLinea ?? {}
});
var ResumenProduccionDiariaResponse = (data) => ({
	PeriodoInicio: data.PeriodoInicio,
	PeriodoFin: data.PeriodoFin,
	DiasPeriodo: data.DiasPeriodo,
	DiasConProduccion: data.DiasConProduccion,
	TodasLasLineas: data.TodasLasLineas,
	Lineas: (data.Lineas ?? []).map(ProduccionLineaResponse),
	ProduccionPorDia: (data.ProduccionPorDia ?? []).map(ProduccionDiaResponse)
});
var ResumenInventarioRequest = (filtros = {}) => ({ IdsProducto: filtros.IdsProducto ?? null });
var InventarioPresentacionResponse = (data) => ({
	IdPresentacion: data.IdPresentacion,
	CodigoPresentacion: data.CodigoPresentacion,
	NombrePresentacion: data.NombrePresentacion,
	TipoContenedor: data.TipoContenedor,
	CantidadRollosUnidades: data.CantidadRollosUnidades ?? null,
	CantidadPorUnidadTerminada: data.CantidadPorUnidadTerminada ?? null,
	CantidadActual: data.CantidadActual,
	FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});
var InventarioLineaResponse = (data) => ({
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	Unidad: data.Unidad,
	Total: data.Total,
	Presentaciones: (data.Presentaciones ?? []).map(InventarioPresentacionResponse)
});
var ResumenInventarioResponse = (data) => ({
	FechaGeneracion: data.FechaGeneracion,
	TodasLasLineas: data.TodasLasLineas,
	Lineas: (data.Lineas ?? []).map(InventarioLineaResponse)
});
//#endregion
//#region src/services/Inventario/Reportes.js
var BASE_URL = "/api/productofinal/reportes";
async function verResumenProduccionDiaria(filtros) {
	return ResumenProduccionDiariaResponse(await pedirJson(`${BASE_URL}/produccion/diaria/resumen?${construirQueryParams(ResumenProduccionDiariaRequest(filtros)).toString()}`));
}
async function descargarReporteProduccionDiaria(fechaInicio, fechaFin, idsProducto, verMovimientos) {
	await descargarReportePDF(`${BASE_URL}/produccion/diaria?${construirQueryParams({
		FechaInicio: fechaInicio,
		FechaFin: fechaFin,
		IdsProducto: idsProducto,
		VerMovimientos: verMovimientos ?? false
	}).toString()}`, `produccion-diaria-${fechaInicio}-${fechaFin}.pdf`);
}
async function verResumenInventario(filtros) {
	return ResumenInventarioResponse(await pedirJson(`${BASE_URL}/inventario/resumen?${construirQueryParams(ResumenInventarioRequest(filtros)).toString()}`));
}
async function descargarReporteInventarioProducto(idsProducto) {
	await descargarReportePDF(conQueryParams(`${BASE_URL}/inventario`, { IdsProducto: idsProducto }), "reporte-inventario-producto-terminado.pdf");
}
//#endregion
export { verResumenProduccionDiaria as i, descargarReporteProduccionDiaria as n, verResumenInventario as r, descargarReporteInventarioProducto as t };
