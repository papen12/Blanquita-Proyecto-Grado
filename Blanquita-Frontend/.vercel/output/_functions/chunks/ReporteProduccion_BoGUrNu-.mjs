import { s as turnos } from "./Values_CoTzCKTc.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { n as PILDORA_FILTRO } from "./Acentos_7-zo-5xR.mjs";
import { _ as TarjetaReporte, c as DERECHA, f as FiltroTipos, g as TarjetaFiltros, h as SelectFiltro, i as BuscadorFiltro, m as ResultadosReporte, n as BotonDescargaFila, r as BotonInforme, s as CampoFiltro, t as BadgeEstado, u as ESTADOS_PRODUCCION } from "./comunes_LNdSvMvL.mjs";
import { i as formatearDuracion, n as dateFormatter, t as aFechaISO } from "./dates_DZEitlnj.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { n as EstadosProduccion } from "./Estados_DlvEoiha.mjs";
import { t as DoubleDatePicker } from "./DoubleDatePicker_CRKNWKhn.mjs";
import { t as PaginaReporte } from "./PaginaReporte_DPBrjsGC.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/ReporteProduccion.jsx
var COLUMNAS_INICIALES = [{
	titulo: "Estado",
	valor: (p) => /* @__PURE__ */ jsx(BadgeEstado, {
		estado: p.NombreEstadoProduccion,
		estilos: ESTADOS_PRODUCCION
	})
}, {
	titulo: "Turno",
	valor: (p) => p.NombreTurno
}];
var COLUMNAS_TIEMPO = [
	{
		titulo: "Inicio",
		clase: "text-[12.5px]",
		valor: (p) => dateFormatter(p.FechaInicioProduccion)
	},
	{
		titulo: "Fin",
		clase: "text-[12.5px]",
		valor: (p) => p.FechaFinProduccion ? dateFormatter(p.FechaFinProduccion) : "-"
	},
	{
		titulo: "Duración",
		...DERECHA,
		valor: (p) => formatearDuracion(p.DuracionTotal)
	}
];
function ReporteProduccion({ usuario, titulo, idCalendario, consultar, campoId, tipo, codigo, descargarPeriodo, descargarDetalle, descargarCancelada, opcionMovimientos = false, columnas, columnasFinales = [], anchoAccion, tarjeta, estados = EstadosProduccion }) {
	const reporte = useReporte(consultar, {
		Rango: void 0,
		IdTurno: "",
		[tipo.campo]: [],
		CodigoBobina: "",
		Operador: "",
		IdEstadoProduccion: ""
	}, ["CodigoBobina", "Operador"]);
	const { filtros, catalogo } = reporte;
	const { Rango } = filtros;
	const [verCancelaciones, setVerCancelaciones] = useState(false);
	const [verMovimientos, setVerMovimientos] = useState(false);
	const botonDetalle = (p) => {
		const cancelada = p.NombreEstadoProduccion === "Cancelada";
		return /* @__PURE__ */ jsx(BotonDescargaFila, {
			ayuda: cancelada ? `Descargar detalle de la cancelación (incluye pausas${opcionMovimientos ? " y movimientos" : ""})` : `Descargar detalle de esta producción (con pausas${verMovimientos ? " y movimientos" : ""})`,
			descargar: () => cancelada ? descargarCancelada(p[campoId]) : descargarDetalle(p[campoId], verMovimientos)
		});
	};
	return /* @__PURE__ */ jsxs(PaginaReporte, {
		usuario,
		titulo,
		subtitulo: "Producción",
		contador: catalogo ? {
			valor: catalogo.Total,
			singular: "producción",
			plural: "producciones"
		} : null,
		children: [/* @__PURE__ */ jsxs(TarjetaFiltros, {
			reporte,
			informe: /* @__PURE__ */ jsx(BotonInforme, {
				disponible: Boolean(Rango?.from && Rango?.to),
				ayuda: "PDF con las producciones, pausas por motivo y tiempos del rango elegido",
				exito: "Informe de producción descargado",
				descargar: () => descargarPeriodo(aFechaISO(Rango.from), aFechaISO(Rango.to), verCancelaciones)
			}),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ jsx(DoubleDatePicker, {
							id: idCalendario,
							label: "Fecha de producción",
							value: Rango,
							onChange: (valor) => reporte.cambiar("Rango", valor)
						}),
						/* @__PURE__ */ jsx(SelectFiltro, {
							reporte,
							campo: "IdTurno",
							etiqueta: "Turno",
							opciones: turnos,
							campoEtiqueta: "NombreTurno",
							placeholder: "Todos los turnos"
						}),
						/* @__PURE__ */ jsx(SelectFiltro, {
							reporte,
							campo: "IdEstadoProduccion",
							etiqueta: "Estado",
							opciones: estados,
							campoEtiqueta: "NombreEstadoProduccion",
							placeholder: "Todos los estados"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ jsx(BuscadorFiltro, {
						reporte,
						campo: "CodigoBobina",
						etiqueta: codigo.etiqueta,
						placeholder: codigo.placeholder
					}), /* @__PURE__ */ jsx(BuscadorFiltro, {
						reporte,
						campo: "Operador",
						etiqueta: "Operador",
						placeholder: "Nombre del operador",
						mono: false
					})]
				}),
				/* @__PURE__ */ jsx(FiltroTipos, {
					reporte,
					tipo
				}),
				/* @__PURE__ */ jsx(CampoFiltro, {
					etiqueta: "Informe por período",
					children: /* @__PURE__ */ jsx(ToggleGroup, {
						value: verCancelaciones ? ["on"] : [],
						className: "flex flex-wrap justify-start gap-2",
						children: /* @__PURE__ */ jsx(ToggleGroupItem, {
							value: "on",
							onClick: () => setVerCancelaciones((v) => !v),
							className: PILDORA_FILTRO,
							children: "Incluir cancelaciones en el informe"
						})
					})
				}),
				opcionMovimientos && /* @__PURE__ */ jsx(CampoFiltro, {
					etiqueta: "Detalle por producción",
					children: /* @__PURE__ */ jsxs("label", {
						className: "flex w-fit cursor-pointer items-center gap-2 text-[12.5px] font-bold text-slate-600",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: verMovimientos,
							onChange: (e) => setVerMovimientos(e.target.checked),
							className: "h-4 w-4 rounded border-slate-300 accent-c3"
						}), "Incluir movimientos de logs al descargar el detalle"]
					})
				})
			]
		}), /* @__PURE__ */ jsx(ResultadosReporte, {
			reporte,
			elementos: catalogo?.Producciones,
			clave: (p) => p[campoId],
			nombres: ["producción", "producciones"],
			columnas: [
				...COLUMNAS_INICIALES,
				...columnas,
				...COLUMNAS_TIEMPO,
				...columnasFinales
			],
			anchoAccion,
			accion: botonDetalle,
			tarjeta: (p) => /* @__PURE__ */ jsxs(TarjetaReporte, {
				titulo: tarjeta.titulo(p),
				tamanoTitulo: "text-[13.5px]",
				subtitulo: tarjeta.subtitulo(p),
				estado: p.NombreEstadoProduccion,
				estilos: ESTADOS_PRODUCCION,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-slate-600",
					children: [
						/* @__PURE__ */ jsxs("span", { children: ["Inicio ", dateFormatter(p.FechaInicioProduccion)] }),
						p.FechaFinProduccion && /* @__PURE__ */ jsxs("span", { children: ["Fin ", dateFormatter(p.FechaFinProduccion)] }),
						/* @__PURE__ */ jsxs("span", { children: ["Duración ", formatearDuracion(p.DuracionTotal)] }),
						tarjeta.extra?.(p)
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-end gap-1 border-t border-slate-200 pt-2.5",
					children: botonDetalle(p)
				})]
			})
		})]
	});
}
//#endregion
export { ReporteProduccion as t };
