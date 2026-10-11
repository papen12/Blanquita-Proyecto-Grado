//#region src/constants/Estados.js
var EstadosMateriaPrima = [
	{
		"IdEstadoMateriaPrima": 1,
		"TipoEstado": "En almacén"
	},
	{
		"IdEstadoMateriaPrima": 2,
		"TipoEstado": "En producción"
	},
	{
		"IdEstadoMateriaPrima": 3,
		"TipoEstado": "Agotado"
	},
	{
		"IdEstadoMateriaPrima": 4,
		"TipoEstado": "Dado de baja"
	},
	{
		"IdEstadoMateriaPrima": 5,
		"TipoEstado": "Fuera de Inventario"
	},
	{
		"IdEstadoMateriaPrima": 6,
		"TipoEstado": "Abierta"
	},
	{
		"IdEstadoMateriaPrima": 7,
		"TipoEstado": "Terminada"
	}
];
var EstadosProduccion = [
	{
		"IdEstadoProduccion": 1,
		"NombreEstadoProduccion": "En Producción"
	},
	{
		"IdEstadoProduccion": 2,
		"NombreEstadoProduccion": "Pausa"
	},
	{
		"IdEstadoProduccion": 3,
		"NombreEstadoProduccion": "Finalizado"
	},
	{
		"IdEstadoProduccion": 4,
		"NombreEstadoProduccion": "Cancelada"
	},
	{
		"IdEstadoProduccion": 5,
		"NombreEstadoProduccion": "Cambio de línea"
	}
];
var EstadosUsuario = [
	{
		IdEstadoUsuario: 1,
		NombreEstadoUsuario: "Activo"
	},
	{
		IdEstadoUsuario: 2,
		NombreEstadoUsuario: "Inactivo"
	},
	{
		IdEstadoUsuario: 3,
		NombreEstadoUsuario: "Suspendido"
	}
];
var TransicionesEstadoUsuario = {
	1: [2, 3],
	2: [1, 3],
	3: []
};
var EstadosProveedor = [{
	IdEstadoProveedor: 1,
	NombreEstadoProveedor: "Activo"
}, {
	IdEstadoProveedor: 2,
	NombreEstadoProveedor: "Inactivo"
}];
//#endregion
export { TransicionesEstadoUsuario as a, EstadosUsuario as i, EstadosProduccion as n, EstadosProveedor as r, EstadosMateriaPrima as t };
