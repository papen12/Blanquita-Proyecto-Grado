import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { t as conQueryParams } from "./params_JvteIAPo.mjs";
//#region src/models/BobinaServilleta/Produccion.js
var AbrirBobinaServilletaRequest = (idBobinaServilleta, observacion) => ({
	IdBobinaServilleta: idBobinaServilleta,
	Observacion: observacion ?? null
});
var AbrirBobinaServilletaResponse = (data) => ({
	IdBobinaServilleta: data.IdBobinaServilleta,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	CantidadSubBobinas435: data.CantidadSubBobinas435,
	CantidadSubBobinas220: data.CantidadSubBobinas220,
	CantidadSubBobinasTotal: data.CantidadSubBobinasTotal
});
var IniciarProduccionServilletaRequest = (idSubBobina) => ({ IdSubBobina: idSubBobina });
var IniciarProduccionServilletaResponse = (data) => ({
	IdProduccionServilleta: data.IdProduccionServilleta,
	FechaInicioProduccion: data.FechaInicioProduccion,
	IdTurno: data.IdTurno,
	NombreTurno: data.NombreTurno
});
var PausaProduccionServilletaRequest = (idProduccionServilleta, motivoPausaProduccion) => ({
	IdProduccionServilleta: idProduccionServilleta,
	MotivoPausaProduccion: motivoPausaProduccion ?? null
});
var PausaProduccionServilletaResponse = (data) => ({
	IdPausaProduccionServilleta: data.IdPausaProduccionServilleta,
	IdProduccionServilleta: data.IdProduccionServilleta,
	FechaHoraPausa: data.FechaHoraPausa,
	MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
	FechaHoraReanudacion: data.FechaHoraReanudacion ?? null,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var ReanudarProduccionServilletaRequest = (idProduccionServilleta) => ({ IdProduccionServilleta: idProduccionServilleta });
var ReanudarProduccionServilletaResponse = (data) => ({
	IdPausaProduccionServilleta: data.IdPausaProduccionServilleta,
	IdProduccionServilleta: data.IdProduccionServilleta,
	FechaHoraPausa: data.FechaHoraPausa,
	MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
	FechaHoraReanudacion: data.FechaHoraReanudacion,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var FinalizarProduccionServilletaRequest = (idProduccionServilleta) => ({ IdProduccionServilleta: idProduccionServilleta });
var FinalizarProduccionServilletaResponse = (data) => ({
	IdProduccionServilleta: data.IdProduccionServilleta,
	FechaFinProduccion: data.FechaFinProduccion,
	IdEstadoProduccion: data.IdEstadoProduccion,
	NombreEstadoProduccion: data.NombreEstadoProduccion
});
var CancelarProduccionServilletaRequest = (idProduccionServilleta, motivoCancelacion) => ({
	IdProduccionServilleta: idProduccionServilleta,
	MotivoCancelacion: motivoCancelacion ?? null
});
var CancelarProduccionServilletaResponse = (data) => ({
	IdCancelacionProduccionServilleta: data.IdCancelacionProduccionServilleta,
	IdProduccionServilleta: data.IdProduccionServilleta,
	FechaHoraCancelacion: data.FechaHoraCancelacion,
	MotivoCancelacion: data.MotivoCancelacion ?? null,
	IdEstadoProduccion: data.IdEstadoProduccion
});
var VerProduccionServilletaActivasResponse = (data) => ({
	IdProduccionServilleta: data.IdProduccionServilleta,
	NombreEstadoProduccion: data.NombreEstadoProduccion,
	IdSubBobina: data.IdSubBobina,
	CodigoUnidadOrigen: data.CodigoUnidadOrigen,
	IdTipoMedidaSubBobina: data.IdTipoMedidaSubBobina,
	NombreTurno: data.NombreTurno,
	FechaInicioProduccion: data.FechaInicioProduccion
});
var VerPausasProduccionServilletaActivasResponse = (data) => ({
	IdPausaProduccionServilleta: data.IdPausaProduccionServilleta,
	IdProduccionServilleta: data.IdProduccionServilleta,
	IdSubBobina: data.IdSubBobina,
	CodigoUnidadOrigen: data.CodigoUnidadOrigen,
	FechaHoraPausa: data.FechaHoraPausa,
	NombreEstadoProduccion: data.NombreEstadoProduccion
});
//#endregion
//#region src/services/BobinaServilleta/Produccion.js
async function abrirBobinaServilleta(idBobinaServilleta, observacion) {
	return AbrirBobinaServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/abrir", {
		method: "POST",
		body: AbrirBobinaServilletaRequest(idBobinaServilleta, observacion)
	}));
}
async function iniciarProduccionServilleta(idSubBobina) {
	return IniciarProduccionServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/iniciar", {
		method: "POST",
		body: IniciarProduccionServilletaRequest(idSubBobina)
	}));
}
async function pausarProduccionServilleta(idProduccionServilleta, motivoPausaProduccion) {
	return PausaProduccionServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/pausar", {
		method: "POST",
		body: PausaProduccionServilletaRequest(idProduccionServilleta, motivoPausaProduccion)
	}));
}
async function reanudarProduccionServilleta(idProduccionServilleta) {
	return ReanudarProduccionServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/reanudar", {
		method: "POST",
		body: ReanudarProduccionServilletaRequest(idProduccionServilleta)
	}));
}
async function finalizarProduccionServilleta(idProduccionServilleta) {
	return FinalizarProduccionServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/finalizar", {
		method: "POST",
		body: FinalizarProduccionServilletaRequest(idProduccionServilleta)
	}));
}
async function cancelarProduccionServilleta(idProduccionServilleta, motivoCancelacion) {
	return CancelarProduccionServilletaResponse(await pedirJson("/api/bobinaservilleta/produccion/cancelar", {
		method: "POST",
		body: CancelarProduccionServilletaRequest(idProduccionServilleta, motivoCancelacion)
	}));
}
async function verProduccionServilletaActivas(idTipoMedidaSubBobina) {
	return (await pedirJson(conQueryParams("/api/bobinaservilleta/produccion/activas", { IdTipoMedidaSubBobina: idTipoMedidaSubBobina }))).map(VerProduccionServilletaActivasResponse);
}
async function verPausasProduccionServilletaActivas() {
	return (await pedirJson("/api/bobinaservilleta/produccion/pausadas")).map(VerPausasProduccionServilletaActivasResponse);
}
//#endregion
export { pausarProduccionServilleta as a, verProduccionServilletaActivas as c, iniciarProduccionServilleta as i, cancelarProduccionServilleta as n, reanudarProduccionServilleta as o, finalizarProduccionServilleta as r, verPausasProduccionServilletaActivas as s, abrirBobinaServilleta as t };
