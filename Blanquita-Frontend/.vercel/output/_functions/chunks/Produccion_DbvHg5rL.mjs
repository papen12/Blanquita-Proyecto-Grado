import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { t as conQueryParams } from "./params_JvteIAPo.mjs";
//#region src/models/BobinaPapel/Produccion.js
var IniciarProduccionBobinaTuboRequest = (idBobina1, idBobina2, idProducto) => ({
	IdBobina1: idBobina1,
	IdBobina2: idBobina2,
	IdProducto: idProducto ?? null
});
var IniciarProduccionBobinaTuboResponse = (data) => ({
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaInicioProduccion: data.FechaInicioProduccion,
	IdTurno: data.IdTurno,
	NombreTurno: data.NombreTurno,
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto
});
var CambiarLineaProduccionBobinaTuboRequest = (idProduccionBobinaTubo, idProducto) => ({
	IdProduccionBobinaTubo: idProduccionBobinaTubo,
	IdProducto: idProducto
});
var CambiarLineaProduccionBobinaTuboResponse = (data) => ({
	IdProduccionAnterior: data.IdProduccionAnterior,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaInicioProduccion: data.FechaInicioProduccion,
	IdTurno: data.IdTurno,
	NombreTurno: data.NombreTurno,
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto
});
var PausarProduccionBobinaTuboRequest = (idProduccionBobinaTubo, motivoPausaProduccion) => ({
	IdProduccionBobinaTubo: idProduccionBobinaTubo,
	MotivoPausaProduccion: motivoPausaProduccion ?? null
});
var PausarProduccionBobinaTuboResponse = (data) => ({
	IdPausaProduccionBobinaTubo: data.IdPausaProduccionBobinaTubo,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaHoraPausa: data.FechaHoraPausa,
	MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
	FechaHoraReanudacion: data.FechaHoraReanudacion ?? null,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var ReanudarProduccionBobinaTuboRequest = (idProduccionBobinaTubo) => ({ IdProduccionBobinaTubo: idProduccionBobinaTubo });
var ReanudarProduccionBobinaTuboResponse = (data) => ({
	IdPausaProduccionBobinaTubo: data.IdPausaProduccionBobinaTubo,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaHoraPausa: data.FechaHoraPausa,
	MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
	FechaHoraReanudacion: data.FechaHoraReanudacion,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var FinalizarProduccionBobinaTuboRequest = (idProduccionBobinaTubo) => ({ IdProduccionBobinaTubo: idProduccionBobinaTubo });
var FinalizarProduccionBobinaTuboResponse = (data) => ({
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaFinProduccion: data.FechaFinProduccion,
	IdEstadoProduccion: data.IdEstadoProduccion,
	NombreEstadoProduccion: data.NombreEstadoProduccion
});
var CancelarProduccionBobinaTuboRequest = (idProduccionBobinaTubo, motivoCancelacion) => ({
	IdProduccionBobinaTubo: idProduccionBobinaTubo,
	MotivoCancelacion: motivoCancelacion ?? null
});
var CancelarProduccionBobinaTuboResponse = (data) => ({
	IdCancelacionProduccionBobinaTubo: data.IdCancelacionProduccionBobinaTubo,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	FechaHoraCancelacion: data.FechaHoraCancelacion,
	MotivoCancelacion: data.MotivoCancelacion ?? null,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var VerProduccionBobinaTuboResponse = (data) => ({
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	IdTipoBobina: data.IdTipoBobina,
	NombreTipoBobina: data.NombreTipoBobina,
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	NombreEstadoProduccion: data.NombreEstadoProduccion,
	CodigoBobina1: data.CodigoBobina1,
	CodigoBobina2: data.CodigoBobina2,
	NombreTurno: data.NombreTurno,
	FechaInicioProduccion: data.FechaInicioProduccion,
	CantidadLogsActual: data.CantidadLogsActual
});
var VerPausasProduccionBobinaTuboActivasResponse = (data) => ({
	IdPausaProduccionBobinaTubo: data.IdPausaProduccionBobinaTubo,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	CodigoBobina1: data.CodigoBobina1,
	CodigoBobina2: data.CodigoBobina2,
	FechaHoraPausa: data.FechaHoraPausa,
	NombreEstadoProduccion: data.NombreEstadoProduccion,
	CantidadLogsActual: data.CantidadLogsActual
});
var InsertarMovimientoOperadorLogsRequest = (idProduccionBobinaTubo, idTipoMovimientoOperadorLogs, cantidadLogs, observacion) => ({
	IdProduccionBobinaTubo: idProduccionBobinaTubo,
	IdTipoMovimientoOperadorLogs: idTipoMovimientoOperadorLogs,
	CantidadLogs: cantidadLogs,
	Observacion: observacion ?? null
});
var InsertarMovimientoOperadorLogsResponse = (data) => ({
	IdMovimientoOperadorLogs: data.IdMovimientoOperadorLogs,
	IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
	IdTipoMovimientoOperadorLogs: data.IdTipoMovimientoOperadorLogs,
	CantidadLogs: data.CantidadLogs,
	CantidadTotalActual: data.CantidadTotalActual,
	FechaMovimiento: data.FechaMovimiento
});
//#endregion
//#region src/services/BobinaPapel/Produccion.js
async function iniciarProduccion(idBobina1, idBobina2, idProducto) {
	return IniciarProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/iniciar", {
		method: "POST",
		body: IniciarProduccionBobinaTuboRequest(idBobina1, idBobina2, idProducto)
	}));
}
async function cambiarLineaProduccion(idProduccionBobinaTubo, idProducto) {
	return CambiarLineaProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/cambiarlinea", {
		method: "POST",
		body: CambiarLineaProduccionBobinaTuboRequest(idProduccionBobinaTubo, idProducto)
	}));
}
async function finalizarProduccion(idProduccionBobinaTubo) {
	return FinalizarProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/finalizar", {
		method: "POST",
		body: FinalizarProduccionBobinaTuboRequest(idProduccionBobinaTubo)
	}));
}
async function pausarProduccion(idProduccionBobinaTubo, motivoPausaProduccion) {
	return PausarProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/pausar", {
		method: "POST",
		body: PausarProduccionBobinaTuboRequest(idProduccionBobinaTubo, motivoPausaProduccion)
	}));
}
async function reanudarProduccion(idProduccionBobinaTubo) {
	return ReanudarProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/reanudar", {
		method: "POST",
		body: ReanudarProduccionBobinaTuboRequest(idProduccionBobinaTubo)
	}));
}
async function cancelarProduccion(idProduccionBobinaTubo, motivoCancelacion) {
	return CancelarProduccionBobinaTuboResponse(await pedirJson("/api/papelbobina/produccion/cancelar", {
		method: "POST",
		body: CancelarProduccionBobinaTuboRequest(idProduccionBobinaTubo, motivoCancelacion)
	}));
}
async function insertarMovimientoLog(idProduccionBobinaTubo, idTipoMovimientoOperadorLogs, cantidadLogs, observacion) {
	return InsertarMovimientoOperadorLogsResponse(await pedirJson("/api/papelbobina/produccion/insertarlog", {
		method: "POST",
		body: InsertarMovimientoOperadorLogsRequest(idProduccionBobinaTubo, idTipoMovimientoOperadorLogs, cantidadLogs, observacion)
	}));
}
async function verProduccionBobinaTubo(idTipoBobina, idProducto) {
	return (await pedirJson(conQueryParams("/api/papelbobina/produccion/activas", {
		IdTipoBobina: idTipoBobina,
		IdProducto: idProducto
	}))).map(VerProduccionBobinaTuboResponse);
}
async function verPausasProduccionBobinaTuboActivas(filtroIdTipoBobina, filtroIdProducto) {
	return (await pedirJson(conQueryParams("/api/papelbobina/produccion/pausadas", {
		FiltroIdTipoBobina: filtroIdTipoBobina,
		FiltroIdProducto: filtroIdProducto
	}))).map(VerPausasProduccionBobinaTuboActivasResponse);
}
//#endregion
export { insertarMovimientoLog as a, verPausasProduccionBobinaTuboActivas as c, iniciarProduccion as i, verProduccionBobinaTubo as l, cancelarProduccion as n, pausarProduccion as o, finalizarProduccion as r, reanudarProduccion as s, cambiarLineaProduccion as t };
