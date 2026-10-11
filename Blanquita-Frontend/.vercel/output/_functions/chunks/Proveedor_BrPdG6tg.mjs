import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { t as conQueryParams } from "./params_JvteIAPo.mjs";
//#region src/models/Proveedor/Proveedor.js
var ProveedorForm = (data) => ({
	IdProveedor: data.IdProveedor,
	NombreProveedor: data.NombreProveedor
});
var ProveedorItem = (data) => ({
	IdProveedor: data.IdProveedor,
	NombreProveedor: data.NombreProveedor,
	CelularProveedor: data.CelularProveedor ?? null,
	CorreoProveedor: data.CorreoProveedor ?? null,
	IdEstadoProveedor: data.IdEstadoProveedor,
	NombreEstadoProveedor: data.NombreEstadoProveedor
});
var ListarProveedoresRequest = (filtros = {}) => ({
	Busqueda: filtros.Busqueda ?? null,
	IdEstadoProveedor: filtros.IdEstadoProveedor ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 20
});
var ListarProveedoresResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Proveedores: (data.Proveedores ?? []).map(ProveedorItem)
});
var ProveedorDatos = (datos) => ({
	NombreProveedor: (datos.NombreProveedor ?? "").trim().replace(/\s+/g, " "),
	CelularProveedor: (datos.CelularProveedor ?? "").trim() || null,
	CorreoProveedor: (datos.CorreoProveedor ?? "").trim().toLowerCase() || null
});
var CrearProveedorRequest = ProveedorDatos;
var EditarProveedorRequest = (idProveedor, datos) => ({
	IdProveedor: idProveedor,
	...ProveedorDatos(datos)
});
var ProveedorResponse = ProveedorItem;
var CambiarEstadoProveedorRequest = (idProveedor, idEstadoProveedor, motivo) => ({
	IdProveedor: idProveedor,
	IdEstadoProveedor: idEstadoProveedor,
	Motivo: (motivo ?? "").trim()
});
var CambiarEstadoProveedorResponse = (data) => ({
	IdProveedor: data.IdProveedor,
	NombreProveedor: data.NombreProveedor,
	IdEstadoAnterior: data.IdEstadoAnterior,
	NombreEstadoAnterior: data.NombreEstadoAnterior,
	IdEstadoProveedor: data.IdEstadoProveedor,
	NombreEstadoProveedor: data.NombreEstadoProveedor
});
//#endregion
//#region src/services/Proveedor/Proveedor.js
var BASE_URL = "/api/proveedor";
async function ObtenerProveedoresForm() {
	return (await pedirJson(`${BASE_URL}/formulario`)).map(ProveedorForm);
}
async function listarProveedores(filtros) {
	return ListarProveedoresResponse(await pedirJson(conQueryParams(`${BASE_URL}/listar`, ListarProveedoresRequest(filtros))));
}
async function crearProveedor(datos) {
	return ProveedorResponse(await pedirJson(`${BASE_URL}/crear`, {
		method: "POST",
		body: CrearProveedorRequest(datos)
	}));
}
async function editarProveedor(idProveedor, datos) {
	return ProveedorResponse(await pedirJson(`${BASE_URL}/editar`, {
		method: "PUT",
		body: EditarProveedorRequest(idProveedor, datos)
	}));
}
async function cambiarEstadoProveedor(idProveedor, idEstadoProveedor, motivo) {
	return CambiarEstadoProveedorResponse(await pedirJson(`${BASE_URL}/estado`, {
		method: "PATCH",
		body: CambiarEstadoProveedorRequest(idProveedor, idEstadoProveedor, motivo)
	}));
}
//#endregion
export { listarProveedores as a, editarProveedor as i, cambiarEstadoProveedor as n, ProveedorDatos as o, crearProveedor as r, ObtenerProveedoresForm as t };
