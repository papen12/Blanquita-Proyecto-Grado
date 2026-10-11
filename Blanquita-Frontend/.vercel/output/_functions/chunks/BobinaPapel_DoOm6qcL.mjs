import { n as pedirJson, o as numeroONulo } from "./api_B8jC8QYh.mjs";
//#region src/models/BobinaPapel/BobinaPapel.js
var BobinaPapelIngresoItem = (data) => ({
	CodigoBobina: data.CodigoBobina,
	PesoBrutoKg: data.PesoBrutoKg ?? null,
	Gramaje: data.Gramaje ?? null,
	PesoNetoKg: data.PesoNetoKg ?? null
});
var IngresoModelo = (data) => ({
	IdProveedor: data.IdProveedor,
	IdTipoBobina: data.IdTipoBobina,
	Bobinas: (data.Bobinas ?? []).map(BobinaPapelIngresoItem)
});
var IngresoLoteBobinaPapelResponse = (data) => ({
	FechaRecepcion: data.FechaRecepcion,
	CantidadBobinas: data.CantidadBobinas
});
var TipoBobinaPapelIngreso = (data) => ({
	IdTipoBobina: data.IdTipoBobina,
	NombreTipoBobina: data.NombreTipoBobina
});
var EditarBobinaPapelRequest = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	CodigoBobina: (data.CodigoBobina ?? "").trim(),
	PesoBrutoKg: Number(data.PesoBrutoKg),
	PesoNetoKg: Number(data.PesoNetoKg),
	Gramaje: numeroONulo(data.Gramaje),
	Observacion: (data.Observacion ?? "").trim() || null
});
var EditarBobinaPapelResponse = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	CodigoBobina: data.CodigoBobina,
	PesoBrutoKg: data.PesoBrutoKg,
	PesoNetoKg: data.PesoNetoKg,
	Gramaje: data.Gramaje ?? null,
	FechaMovimiento: data.FechaMovimiento
});
//#endregion
//#region src/models/BobinaPapel/TipoBobina.js
var TipoBobinaPapelItem = (data) => ({
	IdTipoBobina: data.IdTipoBobina,
	NombreTipoBobina: data.NombreTipoBobina,
	DiametroMm: Number(data.DiametroMm),
	Formato: Number(data.Formato),
	TaraKg: Number(data.TaraKg),
	CantidadBobinas: data.CantidadBobinas ?? 0,
	CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0
});
var TipoBobinaPapelDatos = (datos) => ({
	NombreTipoBobina: (datos.NombreTipoBobina ?? "").trim().replace(/\s+/g, " "),
	DiametroMm: Number(datos.DiametroMm),
	Formato: Number(datos.Formato),
	TaraKg: Number(datos.TaraKg)
});
var EditarTipoBobinaPapelRequest = (idTipoBobina, datos) => ({
	IdTipoBobina: idTipoBobina,
	...TipoBobinaPapelDatos(datos)
});
var TipoBobinaPapelResponse = (data) => ({
	IdTipoBobina: data.IdTipoBobina,
	NombreTipoBobina: data.NombreTipoBobina,
	DiametroMm: Number(data.DiametroMm),
	Formato: Number(data.Formato),
	TaraKg: Number(data.TaraKg)
});
//#endregion
//#region src/services/BobinaPapel/BobinaPapel.js
async function cargarLoteBobinaPapel(idProveedor, idTipoBobina, bobinas) {
	return IngresoLoteBobinaPapelResponse(await pedirJson("/api/bobinapapel/cargarlote", {
		method: "POST",
		body: IngresoModelo({
			IdProveedor: idProveedor,
			IdTipoBobina: idTipoBobina,
			Bobinas: bobinas
		})
	}));
}
async function ObtenerTiposPapelBobina() {
	return (await pedirJson("/api/bobinapapel/obtenertipos")).map(TipoBobinaPapelIngreso);
}
async function editarBobinaPapel(datos) {
	return EditarBobinaPapelResponse(await pedirJson("/api/bobinapapel/editar", {
		method: "PATCH",
		body: EditarBobinaPapelRequest(datos)
	}));
}
async function listarTiposBobinaPapel() {
	return (await pedirJson("/api/bobinapapel/tipos/listar")).map(TipoBobinaPapelItem);
}
async function crearTipoBobinaPapel(datos) {
	return TipoBobinaPapelResponse(await pedirJson("/api/bobinapapel/tipos/crear", {
		method: "POST",
		body: TipoBobinaPapelDatos(datos)
	}));
}
async function editarTipoBobinaPapel(idTipoBobina, datos) {
	return TipoBobinaPapelResponse(await pedirJson("/api/bobinapapel/tipos/editar", {
		method: "PUT",
		body: EditarTipoBobinaPapelRequest(idTipoBobina, datos)
	}));
}
//#endregion
export { editarTipoBobinaPapel as a, editarBobinaPapel as i, cargarLoteBobinaPapel as n, listarTiposBobinaPapel as o, crearTipoBobinaPapel as r, TipoBobinaPapelDatos as s, ObtenerTiposPapelBobina as t };
