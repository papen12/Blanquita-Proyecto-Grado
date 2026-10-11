import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { c as DERECHA, d as FiltroProveedor, f as FiltroTipos, g as TarjetaFiltros, h as SelectFiltro, i as BuscadorFiltro, m as ResultadosReporte, n as BotonDescargaFila, o as COLUMNA_PROVEEDOR, r as BotonInforme, y as contar } from "./comunes_LNdSvMvL.mjs";
import { r as dateOnlyFormatter, t as aFechaISO } from "./dates_DZEitlnj.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { t as EstadosMateriaPrima } from "./Estados_DlvEoiha.mjs";
import { t as DoubleDatePicker } from "./DoubleDatePicker_CRKNWKhn.mjs";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/ReporteInventario.jsx
function ReporteInventario({ consultar, elementos, codigo, estados = EstadosMateriaPrima, tipo, informe, resumen, ...resultados }) {
	const reporte = useReporte(consultar, {
		[codigo.campo]: "",
		IdProveedor: "",
		[tipo.campo]: tipo.unico ? "" : [],
		IdEstadoMateriaPrima: ""
	}, [codigo.campo]);
	const lista = reporte.catalogo ? elementos(reporte.catalogo) : void 0;
	const tiposSeleccionados = () => {
		const valor = reporte.filtros[tipo.campo];
		const ids = Array.isArray(valor) ? valor : valor ? [valor] : [];
		return ids.length ? ids : null;
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(TarjetaFiltros, {
		reporte,
		informe: informe && /* @__PURE__ */ jsx(BotonInforme, {
			ayuda: informe.ayuda,
			exito: "Informe de inventario descargado",
			descargar: () => informe.descargar(tiposSeleccionados())
		}),
		children: [/* @__PURE__ */ jsxs("div", {
			className: cn("grid grid-cols-1 gap-4", tipo.unico ? "md:grid-cols-4" : "md:grid-cols-3"),
			children: [
				/* @__PURE__ */ jsx(BuscadorFiltro, {
					reporte,
					campo: codigo.campo,
					etiqueta: codigo.etiqueta,
					placeholder: codigo.placeholder
				}),
				/* @__PURE__ */ jsx(FiltroProveedor, { reporte }),
				/* @__PURE__ */ jsx(SelectFiltro, {
					reporte,
					campo: "IdEstadoMateriaPrima",
					etiqueta: "Estado",
					opciones: estados,
					campoEtiqueta: "TipoEstado",
					placeholder: "Todos los estados"
				}),
				tipo.unico && /* @__PURE__ */ jsx(FiltroTipos, {
					reporte,
					tipo
				})
			]
		}), !tipo.unico && /* @__PURE__ */ jsx(FiltroTipos, {
			reporte,
			tipo
		})]
	}), /* @__PURE__ */ jsx(ResultadosReporte, {
		reporte,
		elementos: lista,
		resumen: resumen && lista && resumen(lista),
		...resultados
	})] });
}
//#endregion
//#region src/components/Reportes/ReporteLotes.jsx
function ReporteLotes({ consultar, descargarDetalle, descargarPeriodo, campoId, cantidad, idCalendario, ayudaInforme, tipo }) {
	const reporte = useReporte(consultar, {
		Rango: void 0,
		IdProveedor: "",
		...tipo && { [tipo.campo]: [] }
	});
	const { Rango } = reporte.filtros;
	const [diasDestacados, setDiasDestacados] = useState(/* @__PURE__ */ new Map());
	const cargarDiasDestacados = async ({ inicio, fin }) => {
		try {
			const data = await consultar({
				FechaInicio: aFechaISO(inicio),
				FechaFin: aFechaISO(fin),
				Pagina: 1,
				TamanoPagina: 200
			});
			const mapa = /* @__PURE__ */ new Map();
			for (const lote of data.Lotes) {
				const lista = mapa.get(lote.FechaRecepcion) ?? [];
				lista.push(`Lote #${lote[campoId]} - ${dateOnlyFormatter(lote.FechaRecepcion)}`);
				mapa.set(lote.FechaRecepcion, lista);
			}
			setDiasDestacados(mapa);
		} catch {
			setDiasDestacados(/* @__PURE__ */ new Map());
		}
	};
	const botonDetalle = (lote, className) => /* @__PURE__ */ jsx(BotonDescargaFila, {
		icono: FileText,
		className,
		ayuda: "Descargar el detalle en PDF de este lote",
		descargar: () => descargarDetalle(lote[campoId])
	});
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(TarjetaFiltros, {
		reporte,
		informe: /* @__PURE__ */ jsx(BotonInforme, {
			disponible: Boolean(Rango?.from && Rango?.to),
			ayuda: ayudaInforme,
			exito: "Informe de ingresos descargado",
			descargar: () => descargarPeriodo(aFechaISO(Rango.from), aFechaISO(Rango.to))
		}),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ jsx(DoubleDatePicker, {
				id: idCalendario,
				label: "Fecha de recepción",
				value: Rango,
				onChange: (valor) => reporte.cambiar("Rango", valor),
				diasDestacados,
				onRangoVisibleChange: cargarDiasDestacados
			}), /* @__PURE__ */ jsx(FiltroProveedor, { reporte })]
		}), tipo && /* @__PURE__ */ jsx(FiltroTipos, {
			reporte,
			tipo
		})]
	}), /* @__PURE__ */ jsx(ResultadosReporte, {
		reporte,
		elementos: reporte.catalogo?.Lotes,
		clave: (lote) => lote[campoId],
		nombres: ["lote", "lotes"],
		columnas: [
			{
				titulo: "Recepción",
				clase: "font-semibold text-slate-900",
				valor: (lote) => dateOnlyFormatter(lote.FechaRecepcion)
			},
			COLUMNA_PROVEEDOR,
			{
				titulo: cantidad.titulo,
				...DERECHA,
				valor: (lote) => lote[cantidad.campo]
			}
		],
		accion: (lote) => botonDetalle(lote),
		tarjeta: (lote) => /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-[15px] font-bold text-slate-900",
					children: dateOnlyFormatter(lote.FechaRecepcion)
				}), /* @__PURE__ */ jsxs("span", {
					className: "text-[12.5px] text-slate-500",
					children: [
						lote.NombreProveedor,
						" · ",
						contar(lote[cantidad.campo], ...cantidad.nombres)
					]
				})]
			}), botonDetalle(lote, "shrink-0")]
		})
	})] });
}
//#endregion
export { ReporteInventario as n, ReporteLotes as t };
