import { n as pedirJson } from "./api_B8jC8QYh.mjs";
//#region src/models/BobinaServilleta/BobinaServilleta.js
var UnidadBobinaServilletaItem = (data) => ({
	CodigoBobina: data.CodigoBobina,
	IdFormatoSubBobina: data.IdFormatoSubBobina,
	PesoBrutoKg: data.PesoBrutoKg ?? null,
	GramajeGr: data.GramajeGr ?? null
});
var BobinaServilletaItem = (data) => ({ Unidades: (data.Unidades ?? []).map(UnidadBobinaServilletaItem) });
var IngresoBobinaServilletaRequest = (idProveedor, idTipoBobinaServilleta, bobinas) => ({
	IdProveedor: idProveedor,
	IdTipoBobinaServilleta: idTipoBobinaServilleta,
	Bobinas: (bobinas ?? []).map(BobinaServilletaItem)
});
var IngresoBobinaServilletaResponse = (data) => ({
	FechaRecepcion: data.FechaRecepcion,
	CantidadBobinasServilleta: data.CantidadBobinasServilleta,
	CantidadUnidades: data.CantidadUnidades
});
var TipoBobinaServilletaIngreso = (data) => ({
	IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta
});
//#endregion
//#region src/models/BobinaServilleta/TipoBobinaServilleta.js
var TipoBobinaServilletaItem = (data) => ({
	IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
	DiametroMm: Number(data.DiametroMm),
	CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
	ResistenciaKgf: Number(data.ResistenciaKgf),
	CantidadBobinas: data.CantidadBobinas ?? 0,
	CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0
});
var TipoBobinaServilletaDatos = (datos) => ({
	NombreTipoBobinaServilleta: (datos.NombreTipoBobinaServilleta ?? "").trim().replace(/\s+/g, " "),
	DiametroMm: Number(datos.DiametroMm),
	CrepadoPorcentaje: Number(datos.CrepadoPorcentaje),
	ResistenciaKgf: Number(datos.ResistenciaKgf)
});
var EditarTipoBobinaServilletaRequest = (idTipoBobinaServilleta, datos) => ({
	IdTipoBobinaServilleta: idTipoBobinaServilleta,
	...TipoBobinaServilletaDatos(datos)
});
var TipoBobinaServilletaResponse = (data) => ({
	IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
	DiametroMm: Number(data.DiametroMm),
	CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
	ResistenciaKgf: Number(data.ResistenciaKgf)
});
//#endregion
//#region src/services/BobinaServilleta/BobinaServilleta.js
async function cargarLoteBobinaServilleta(idProveedor, idTipoBobinaServilleta, bobinas) {
	return IngresoBobinaServilletaResponse(await pedirJson("/api/bobinaservilleta/cargarlote", {
		method: "POST",
		body: IngresoBobinaServilletaRequest(idProveedor, idTipoBobinaServilleta, bobinas)
	}));
}
async function ObtenerTiposBobinaServilleta() {
	return (await pedirJson("/api/bobinaservilleta/obtenertipos")).map(TipoBobinaServilletaIngreso);
}
async function listarTiposBobinaServilleta() {
	return (await pedirJson("/api/bobinaservilleta/tipos/listar")).map(TipoBobinaServilletaItem);
}
async function crearTipoBobinaServilleta(datos) {
	return TipoBobinaServilletaResponse(await pedirJson("/api/bobinaservilleta/tipos/crear", {
		method: "POST",
		body: TipoBobinaServilletaDatos(datos)
	}));
}
async function editarTipoBobinaServilleta(idTipoBobinaServilleta, datos) {
	return TipoBobinaServilletaResponse(await pedirJson("/api/bobinaservilleta/tipos/editar", {
		method: "PUT",
		body: EditarTipoBobinaServilletaRequest(idTipoBobinaServilleta, datos)
	}));
}
//#endregion
export { listarTiposBobinaServilleta as a, editarTipoBobinaServilleta as i, cargarLoteBobinaServilleta as n, TipoBobinaServilletaDatos as o, crearTipoBobinaServilleta as r, ObtenerTiposBobinaServilleta as t };
