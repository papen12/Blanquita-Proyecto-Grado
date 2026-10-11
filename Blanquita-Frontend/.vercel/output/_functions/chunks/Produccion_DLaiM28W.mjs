import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { i as TooltipProvider } from "./SideBar_kUHPnrT4.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { s as ObservacionServilleta } from "./OperadorConfig_tt2Z91F-.mjs";
import { a as ListaProducciones, c as TarjetaProduccion, i as DialogoPausar, l as useProduccion, n as AlertaFinalizar, r as DialogoCancelar, s as TabsProduccion, t as ProduccionesConcluidas } from "./Concluidas_DAlfUJFL.mjs";
import { a as pausarProduccionServilleta, c as verProduccionServilletaActivas, n as cancelarProduccionServilleta, o as reanudarProduccionServilleta, r as finalizarProduccionServilleta, s as verPausasProduccionServilletaActivas } from "./Produccion_CAmr9iDG.mjs";
import { c as descargarReporteProduccionServilletaCancelada, f as verProduccionesServilleta, l as descargarReporteProduccionServilletaPorPeriodo, n as descargarReporteDetalleProduccionServilleta } from "./Reportes_cTv_nrMT.mjs";
import { t as CODIGO_UNIDAD } from "./filtros_D_ob7k2j.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ServilletaBobina/Concluidas.jsx
var COLUMNAS = [
	{
		titulo: "Sub-bobina",
		valor: (p) => /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "font-semibold text-slate-900",
				children: ["#", p.IdSubBobinaServilleta]
			}), /* @__PURE__ */ jsx("span", {
				className: "text-[12px] text-slate-500",
				children: p.DescripcionMedida
			})]
		})
	},
	{
		titulo: "Unidad origen",
		clase: "font-mono text-[12.5px]",
		valor: (p) => p.CodigoBobina
	},
	{
		titulo: "Turno",
		valor: (p) => p.NombreTurno
	},
	{
		titulo: "Operador",
		valor: (p) => p.Operador
	}
];
var TARJETA = {
	titulo: (p) => `Sub-bobina #${p.IdSubBobinaServilleta} · ${p.CodigoBobina}`,
	subtitulo: (p) => `${p.DescripcionMedida} · ${p.NombreTurno} · ${p.Operador}`
};
function ConcluidasServilleta({ onTotal }) {
	return /* @__PURE__ */ jsx(ProduccionesConcluidas, {
		onTotal,
		consultar: verProduccionesServilleta,
		campoId: "IdProduccionServilleta",
		idCalendario: "rango-concluidas-servilleta",
		codigo: CODIGO_UNIDAD,
		columnas: COLUMNAS,
		tarjeta: TARJETA,
		descargarDetalle: (id) => descargarReporteDetalleProduccionServilleta(id, true),
		descargarCancelada: descargarReporteProduccionServilletaCancelada,
		descargarPeriodo: descargarReporteProduccionServilletaPorPeriodo
	});
}
//#endregion
//#region src/components/ServilletaBobina/Produccion.jsx
var tituloDe = (p) => `Sub-bobina #${p.IdSubBobina} · ${p.CodigoUnidadOrigen}`;
function EncabezadoSubBobina({ p }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "text-[15px] font-extrabold text-slate-900",
		children: ["Sub-bobina #", p.IdSubBobina]
	}), /* @__PURE__ */ jsx("div", {
		className: "font-mono text-sm font-bold text-c3",
		children: p.CodigoUnidadOrigen
	})] });
}
function ProduccionBobinaServilleta({ usuario }) {
	const [vista, setVista] = useState("activas");
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const [totalConcluidas, setTotalConcluidas] = useState(0);
	const { activas, pausadas, pausa, cancelacion, finalizacion, procesandoId, reanudar } = useProduccion({
		verActivas: () => verProduccionServilletaActivas(),
		verPausadas: () => verPausasProduccionServilletaActivas(),
		idDe: (p) => p.IdProduccionServilleta,
		pausar: pausarProduccionServilleta,
		cancelar: cancelarProduccionServilleta,
		finalizar: finalizarProduccionServilleta,
		reanudar: reanudarProduccionServilleta
	});
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Producción",
				subtitulo: "Producción de Bobinas de Servilleta"
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsx(TabsProduccion, {
						vista,
						onCambio: setVista,
						totalActivas: activas.datos.length,
						totalPausadas: pausadas.datos.length,
						mostrarConcluidas: esEncargado,
						totalConcluidas
					}),
					vista === "concluidas" && esEncargado && /* @__PURE__ */ jsx(ConcluidasServilleta, { onTotal: setTotalConcluidas }),
					vista === "activas" && /* @__PURE__ */ jsx(ListaProducciones, {
						lista: activas,
						altoSkeleton: "h-52",
						mensajeVacio: "No hay producciones activas.",
						renderizar: (p) => /* @__PURE__ */ jsx(TarjetaProduccion, {
							produccion: p,
							encabezado: /* @__PURE__ */ jsx(EncabezadoSubBobina, { p }),
							acciones: [{
								tipo: "pausar",
								onClick: () => pausa.abrir(p)
							}, {
								tipo: "finalizar",
								onClick: () => finalizacion.abrir(p)
							}]
						}, p.IdProduccionServilleta)
					}),
					vista === "pausadas" && /* @__PURE__ */ jsx(ListaProducciones, {
						lista: pausadas,
						altoSkeleton: "h-52",
						mensajeVacio: "No hay producciones pausadas.",
						renderizar: (p) => {
							const procesando = procesandoId === p.IdProduccionServilleta;
							return /* @__PURE__ */ jsx(TarjetaProduccion, {
								produccion: p,
								pausada: true,
								encabezado: /* @__PURE__ */ jsx(EncabezadoSubBobina, { p }),
								acciones: [{
									tipo: "reanudar",
									onClick: () => reanudar(p),
									disabled: procesando,
									procesando
								}, {
									tipo: "cancelar",
									onClick: () => cancelacion.abrir(p),
									disabled: procesando
								}]
							}, p.IdPausaProduccionServilleta);
						}
					})
				]
			}),
			/* @__PURE__ */ jsx(DialogoPausar, {
				dialogo: pausa,
				tituloDe,
				opciones: ObservacionServilleta
			}),
			/* @__PURE__ */ jsx(DialogoCancelar, {
				dialogo: cancelacion,
				tituloDe,
				placeholder: "Ej. Sub-bobina dañada, error de registro..."
			}),
			/* @__PURE__ */ jsx(AlertaFinalizar, {
				dialogo: finalizacion,
				prefijo: "de la sub-bobina",
				codigoDe: (p) => p.CodigoUnidadOrigen
			})
		]
	}) });
}
//#endregion
export { ProduccionBobinaServilleta as t };
