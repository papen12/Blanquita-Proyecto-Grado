//#region src/constants/Values.js
var PREFIJO_POR_ROL = {
	1: "operador",
	2: "encargado"
};
var RUTA_POR_ROL = {
	1: "/operador/inicio",
	2: "/encargado/inicio"
};
var Roles = {
	Operador: 1,
	Encargado: 2
};
var turnos = [
	{
		"IdTurno": 1,
		"NombreTurno": "Mañana"
	},
	{
		"IdTurno": 2,
		"NombreTurno": "Tarde"
	},
	{
		"IdTurno": 3,
		"NombreTurno": "Horas Extra"
	}
];
var IDS_PRODUCTO_BOBINA_HIGIENICO = [
	1,
	2,
	4
];
var IDS_PRODUCTO_BOBINA_PAPEL = [
	1,
	2,
	4,
	5,
	7
];
var RolesUsuario = [{
	IdRol: 1,
	NombreRol: "Operador"
}, {
	IdRol: 2,
	NombreRol: "Líder de Inventario y Producción"
}];
//#endregion
export { Roles as a, RUTA_POR_ROL as i, IDS_PRODUCTO_BOBINA_PAPEL as n, RolesUsuario as o, PREFIJO_POR_ROL as r, turnos as s, IDS_PRODUCTO_BOBINA_HIGIENICO as t };
