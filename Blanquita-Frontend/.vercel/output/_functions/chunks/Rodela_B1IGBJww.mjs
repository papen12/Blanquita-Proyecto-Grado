import { n as pedirJson } from "./api_B8jC8QYh.mjs";
//#region src/models/Rodela/Rodela.js
var RodelaItem = (codigoRodela) => ({ CodigoRodela: codigoRodela });
var IngresoRodelaRequest = (idProveedor, idTipoRodela, rodelas) => ({
	IdProveedor: idProveedor,
	IdTipoRodela: idTipoRodela,
	Rodelas: rodelas.map(RodelaItem)
});
var IngresoRodelaResponse = (data) => ({
	FechaRecepcion: data.FechaRecepcion,
	CantidadRodelas: data.CantidadRodelas
});
var TipoRodelaIngreso = (data) => ({
	IdTipoRodela: data.IdTipoRodela,
	NombreTipoRodela: data.NombreTipoRodela,
	Descripcion: data.Descripcion ?? null
});
//#endregion
//#region src/services/Rodela/Rodela.js
async function cargarLoteRodela(idProveedor, idTipoRodela, rodelas) {
	return IngresoRodelaResponse(await pedirJson("/api/rodela/cargarlote", {
		method: "POST",
		body: IngresoRodelaRequest(idProveedor, idTipoRodela, rodelas)
	}));
}
async function ObtenerTiposRodela() {
	return (await pedirJson("/api/rodela/obtenertipos")).map(TipoRodelaIngreso);
}
//#endregion
export { cargarLoteRodela as n, ObtenerTiposRodela as t };
