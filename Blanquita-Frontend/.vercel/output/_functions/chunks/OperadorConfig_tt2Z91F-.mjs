import { Boxes, Combine, Container, Database, Factory, PackagePlus, ShelvingUnit, SquareStack } from "lucide-react";
import { toiletRoll } from "@lucide/lab";
//#region src/constants/OperadorConfig.js
var movimientosOperador = [{
	IdTipoMovimientoOperadorLogs: 1,
	NombreMovimiento: "Ingreso",
	DescripcionTipoMovimientoOperadorLogs: "Registro de logs producidos por el operador durante el turno"
}, {
	IdTipoMovimientoOperadorLogs: 2,
	NombreMovimiento: "Descuento",
	DescripcionTipoMovimientoOperadorLogs: "Corrección que resta logs registrados por error"
}];
var ObservacionesInsertarLogs = [{
	id: 2,
	motivos: [
		"Error de registro de logs",
		"Doble registro del mismo movimiento",
		"Cantidad ingresada mayor a la real",
		"Logs contabilizados de otra producción"
	]
}];
var CLAVE_AREA_TRABAJO = "operador.areaTrabajo";
var AREA_POR_DEFECTO = "bobina-papel";
var AREAS_TRABAJO = [
	{
		id: "bobina-papel",
		titulo: "Bobina Papel",
		descripcion: "Higiénico, toalla y económico",
		icono: toiletRoll,
		esIconoLab: true,
		ruta: "bobina-papel",
		idConjunto: 1,
		subrutas: [{
			titulo: "Inventario",
			descripcion: "Ver stock y enviar bobinas a producción",
			icono: Boxes,
			ruta: "Inventario"
		}, {
			titulo: "Producción",
			descripcion: "Activas, pausas y registro de logs",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		id: "bobina-servilleta",
		titulo: "Bobina Servilleta",
		descripcion: "Servilletera grande y pequeña",
		icono: SquareStack,
		ruta: "bobina-servilleta",
		idConjunto: 1,
		subrutas: [{
			titulo: "Inventario",
			descripcion: "Ver stock y enviar bobinas a producción",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			descripcion: "Activas, pausas y registro",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		id: "rodela",
		titulo: "Rodela",
		descripcion: "Materia prima para tubos",
		icono: Database,
		ruta: "rodela",
		idConjunto: 2,
		subrutas: [{
			titulo: "Inventario",
			descripcion: "Palets y rodelas disponibles",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Registrar ingreso",
			descripcion: "Ingreso de rodelas recibidas",
			icono: PackagePlus,
			ruta: "ingreso"
		}]
	},
	{
		id: "empaque",
		titulo: "Empaque",
		descripcion: "Bolsas y bobinas de empaque",
		icono: Container,
		ruta: "empaque",
		idConjunto: 3,
		subrutas: [{
			titulo: "Inventario",
			descripcion: "Stock de empaque",
			icono: Boxes,
			ruta: "bobina-inventario"
		}, {
			titulo: "Registrar ingreso",
			descripcion: "Ingreso de empaque recibido",
			icono: PackagePlus,
			ruta: "bobina-ingreso"
		}]
	},
	{
		id: "producto",
		titulo: "Producto terminado",
		descripcion: "Inventario final",
		icono: ShelvingUnit,
		ruta: "producto",
		idConjunto: null,
		subrutas: [{
			titulo: "Inventario final",
			descripcion: "Existencias por presentación",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Movimientos",
			descripcion: "Ingresos y correcciones de producto terminado",
			icono: Combine,
			ruta: "movimientos"
		}]
	}
];
var ObservacionesRodela = [
	"Error en registro de envío de Rodela a producción",
	"Se escaneó el código de una rodela equivocada",
	"Rodela enviada a un tipo de producción incorrecto",
	"Traslado duplicado de la misma rodela",
	"La producción se canceló antes de usar la rodela"
];
var MotivosCorreccionProductoTerminado = [
	"Cantidad ingresada mayor a la real",
	"Ingreso duplicado",
	"Presentación equivocada",
	"Producto registrado por error"
];
var MotivosAjustePositivoProductoTerminado = ["Conteo físico mayor al registrado", "Producto encontrado en otra ubicación"];
var MotivosAjusteNegativoProductoTerminado = [
	"Conteo físico menor al registrado",
	"Producto dañado en almacén",
	"Producto extraviado"
];
var ObservacionServilleta = [
	"Empalme sub bobina",
	"Error en la máquina",
	"Falta de personal para producción"
];
//#endregion
export { MotivosAjustePositivoProductoTerminado as a, ObservacionesInsertarLogs as c, MotivosAjusteNegativoProductoTerminado as i, ObservacionesRodela as l, AREA_POR_DEFECTO as n, MotivosCorreccionProductoTerminado as o, CLAVE_AREA_TRABAJO as r, ObservacionServilleta as s, AREAS_TRABAJO as t, movimientosOperador as u };
