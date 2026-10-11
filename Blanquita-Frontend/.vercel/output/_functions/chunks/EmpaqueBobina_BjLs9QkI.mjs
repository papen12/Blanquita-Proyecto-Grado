import { n as pedirJson } from "./api_B8jC8QYh.mjs";
//#region src/models/Empaque/EmpaqueBobina.js
var EmpaqueItem = (codigoEmpaque, idTipoEmpaque, pesoKg) => ({
	CodigoEmpaque: codigoEmpaque,
	IdTipoEmpaque: idTipoEmpaque,
	PesoKg: pesoKg
});
var IngresoEmpaqueRequest = (idProveedor, cantidadToneladasPedida, empaques) => ({
	IdProveedor: idProveedor,
	CantidadToneladasPedida: cantidadToneladasPedida,
	Empaques: empaques.map((e) => EmpaqueItem(e.CodigoEmpaque, e.IdTipoEmpaque, e.PesoKg))
});
var IngresoEmpaqueResponseItem = (data) => ({
	FechaRecepcion: data.FechaRecepcion,
	IdTipoEmpaque: data.IdTipoEmpaque,
	NombreTipoEmpaque: data.NombreTipoEmpaque,
	CantidadEmpaques: data.CantidadEmpaques
});
var IngresoEmpaqueResponse = (data) => ({ Resumen: data.Resumen.map(IngresoEmpaqueResponseItem) });
var TrasladarEmpaquesProduccionRequest = (idsEmpaque) => ({ IdsEmpaque: idsEmpaque });
var TrasladarEmpaquesProduccionResponseItem = (data) => ({
	IdEmpaque: data.IdEmpaque,
	CodigoEmpaque: data.CodigoEmpaque,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var ResumenInventarioEmpaqueResponse = (data) => ({
	IdTipoEmpaque: data.IdTipoEmpaque,
	NombreTipoEmpaque: data.NombreTipoEmpaque,
	CantidadEmpaques: data.CantidadEmpaques
});
var DetalleInventarioEmpaqueResponse = (data) => ({
	IdEmpaque: data.IdEmpaque,
	CodigoEmpaque: data.CodigoEmpaque,
	PesoKg: data.PesoKg,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor
});
var TipoEmpaqueIngreso = (data) => ({
	IdTipoEmpaque: data.IdTipoEmpaque,
	NombreTipoEmpaque: data.NombreTipoEmpaque
});
//#endregion
//#region src/services/Empaque/EmpaqueBobina.js
async function cargarLoteEmpaque(idProveedor, cantidadToneladasPedida, empaques) {
	return IngresoEmpaqueResponse(await pedirJson("/api/empaquebobina/cargarlote", {
		method: "POST",
		body: IngresoEmpaqueRequest(idProveedor, cantidadToneladasPedida, empaques)
	}));
}
async function verResumenInventarioEmpaque() {
	return (await pedirJson("/api/empaquebobina/inventario")).map(ResumenInventarioEmpaqueResponse);
}
async function verDetalleInventarioEmpaque(idTipoEmpaque) {
	return (await pedirJson(`/api/empaquebobina/inventariodetalle?${new URLSearchParams({ IdTipoEmpaque: idTipoEmpaque }).toString()}`)).map(DetalleInventarioEmpaqueResponse);
}
async function trasladarEmpaquesAProduccion(idsEmpaque) {
	return (await pedirJson("/api/empaquebobina/trasladarproduccion", {
		method: "POST",
		body: TrasladarEmpaquesProduccionRequest(idsEmpaque)
	})).map(TrasladarEmpaquesProduccionResponseItem);
}
async function obtenerTiposEmpaque() {
	return (await pedirJson("/api/empaquebobina/obtenertipos")).map(TipoEmpaqueIngreso);
}
//#endregion
export { verResumenInventarioEmpaque as a, verDetalleInventarioEmpaque as i, obtenerTiposEmpaque as n, trasladarEmpaquesAProduccion as r, cargarLoteEmpaque as t };
