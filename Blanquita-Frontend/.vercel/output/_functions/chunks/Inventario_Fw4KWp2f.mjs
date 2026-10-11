import { n as pedirJson } from "./api_B8jC8QYh.mjs";
//#region src/models/Rodela/Inventario.js
var ResumenInventarioRodelaResponse = (data) => ({
	IdTipoRodela: data.IdTipoRodela,
	NombreTipoRodela: data.NombreTipoRodela,
	Descripcion: data.Descripcion ?? null,
	CantidadEnAlmacen: data.CantidadEnAlmacen,
	CantidadAbiertas: data.CantidadAbiertas
});
var DetalleInventarioRodelaResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoRodela: data.CodigoRodela,
	CodigoLote: data.CodigoLote,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	TipoEstado: data.TipoEstado
});
var TrasladarRodelaRequest = (idRodela, observacion) => ({
	IdRodela: idRodela,
	Observacion: observacion ?? null
});
var TrasladarRodelaResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoRodela: data.CodigoRodela,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var DeshacerTrasladoRodelaRequest = (idRodela, observacion) => ({
	IdRodela: idRodela,
	Observacion: observacion ?? null
});
var DeshacerTrasladoRodelaResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoRodela: data.CodigoRodela,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var EditarRodelaRequest = (idRodela, codigoRodela, observacion) => ({
	IdRodela: idRodela,
	CodigoRodela: (codigoRodela ?? "").trim(),
	Observacion: (observacion ?? "").trim()
});
var EditarRodelaResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoAnterior: data.CodigoAnterior,
	CodigoRodela: data.CodigoRodela,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var RodelaReingresableResponse = (data) => ({
	IdRodela: data.IdRodela,
	CodigoRodela: data.CodigoRodela,
	IdTipoRodela: data.IdTipoRodela,
	NombreTipoRodela: data.NombreTipoRodela,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	FechaTraslado: data.FechaTraslado,
	MinutosRestantes: data.MinutosRestantes
});
//#endregion
//#region src/services/Rodela/Inventario.js
async function verResumenInventarioRodela() {
	return (await pedirJson("/api/rodela/inventario/resumen")).map(ResumenInventarioRodelaResponse);
}
async function verDetalleInventarioRodela(idTipoRodela) {
	return (await pedirJson(`/api/rodela/inventario/detalle?${new URLSearchParams({ IdTipoRodela: idTipoRodela }).toString()}`)).map(DetalleInventarioRodelaResponse);
}
async function trasladarRodelaAProduccion(idRodela, observacion) {
	return TrasladarRodelaResponse(await pedirJson("/api/rodela/inventario/trasladar", {
		method: "POST",
		body: TrasladarRodelaRequest(idRodela, observacion)
	}));
}
async function listarRodelasReingresables() {
	return (await pedirJson("/api/rodela/inventario/reingresables")).map(RodelaReingresableResponse);
}
async function deshacerTrasladoRodela(idRodela, observacion) {
	return DeshacerTrasladoRodelaResponse(await pedirJson("/api/rodela/inventario/deshacer", {
		method: "POST",
		body: DeshacerTrasladoRodelaRequest(idRodela, observacion)
	}));
}
async function editarRodela(idRodela, codigoRodela, observacion) {
	return EditarRodelaResponse(await pedirJson("/api/rodela/inventario/editar", {
		method: "POST",
		body: EditarRodelaRequest(idRodela, codigoRodela, observacion)
	}));
}
//#endregion
export { verDetalleInventarioRodela as a, trasladarRodelaAProduccion as i, editarRodela as n, verResumenInventarioRodela as o, listarRodelasReingresables as r, deshacerTrasladoRodela as t };
