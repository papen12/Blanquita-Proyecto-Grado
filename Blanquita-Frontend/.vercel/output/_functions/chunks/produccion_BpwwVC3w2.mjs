import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { i as SeccionResumenLineas, o as TarjetaFila, t as CantidadUnidad } from "./comunes_CSK1dv5A.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { n as PILDORA_FILTRO } from "./Acentos_7-zo-5xR.mjs";
import { c as DERECHA, f as FiltroTipos, g as TarjetaFiltros, r as BotonInforme, s as CampoFiltro, y as contar } from "./comunes_LNdSvMvL.mjs";
import { t as aFechaISO } from "./dates_DZEitlnj.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { t as DoubleDatePicker } from "./DoubleDatePicker_CRKNWKhn.mjs";
import { i as verResumenProduccionDiaria, n as descargarReporteProduccionDiaria } from "./Reportes_CsP8pHUy.mjs";
import { t as PaginaReporte } from "./PaginaReporte_DPBrjsGC.mjs";
import { t as LINEA_PRODUCTO } from "./filtros_g6cBza48.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { endOfMonth, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
//#region src/components/Reportes/Producto/Produccion.jsx
var ATAJOS = [
	{
		valor: "hoy",
		texto: "Hoy",
		rango: (hoy) => ({
			from: hoy,
			to: hoy
		})
	},
	{
		valor: "ayer",
		texto: "Ayer",
		rango: (hoy) => {
			const ayer = subDays(hoy, 1);
			return {
				from: ayer,
				to: ayer
			};
		}
	},
	{
		valor: "semana",
		texto: "Esta semana",
		rango: (hoy) => ({
			from: startOfWeek(hoy, { weekStartsOn: 1 }),
			to: hoy
		})
	},
	{
		valor: "mes",
		texto: "Este mes",
		rango: (hoy) => ({
			from: startOfMonth(hoy),
			to: hoy
		})
	},
	{
		valor: "mes-anterior",
		texto: "Mes anterior",
		rango: (hoy) => {
			const mes = subMonths(hoy, 1);
			return {
				from: startOfMonth(mes),
				to: endOfMonth(mes)
			};
		}
	}
];
var mismoRango = (rango, otro) => aFechaISO(rango?.from) === aFechaISO(otro.from) && aFechaISO(rango?.to) === aFechaISO(otro.to);
var consultarResumen = (parametros) => parametros.FechaInicio && parametros.FechaFin ? verResumenProduccionDiaria(parametros) : Promise.resolve(null);
function TotalLinea({ linea }) {
	if (!linea.NumeroRegistros) return /* @__PURE__ */ jsx("span", {
		className: "text-slate-400",
		children: "Sin producción"
	});
	return /* @__PURE__ */ jsx(CantidadUnidad, {
		valor: linea.Total,
		unidad: linea.Unidad
	});
}
var COLUMNAS = [
	{
		titulo: "Línea",
		clase: "font-bold text-slate-900",
		valor: (l) => l.NombreProducto
	},
	{
		titulo: "Total",
		...DERECHA,
		valor: (l) => /* @__PURE__ */ jsx(TotalLinea, { linea: l })
	},
	{
		titulo: "Días con producción",
		...DERECHA,
		valor: (l) => l.DiasConProduccion
	},
	{
		titulo: "Promedio por día",
		...DERECHA,
		valor: (l) => formatearNumero(l.PromedioPorDia, { vacio: "-" })
	},
	{
		titulo: "Registros",
		...DERECHA,
		valor: (l) => l.NumeroRegistros
	}
];
function tarjetaProduccion(linea) {
	const conProduccion = linea.NumeroRegistros > 0;
	return /* @__PURE__ */ jsx(TarjetaFila, {
		nombre: linea.NombreProducto,
		detalle: conProduccion ? `${contar(linea.DiasConProduccion, "día", "días")} · ${formatearNumero(linea.PromedioPorDia, { vacio: "-" })} por día · ${contar(linea.NumeroRegistros, "registro", "registros")}` : "Sin producción",
		children: conProduccion && /* @__PURE__ */ jsx(CantidadUnidad, {
			valor: linea.Total,
			unidad: linea.Unidad
		})
	});
}
function ProduccionReporteProducto({ usuario }) {
	const reporte = useReporte(consultarResumen, {
		Rango: ATAJOS[0].rango(/* @__PURE__ */ new Date()),
		[LINEA_PRODUCTO.campo]: []
	});
	const { filtros, catalogo: resumen } = reporte;
	const { Rango } = filtros;
	const lineas = filtros[LINEA_PRODUCTO.campo];
	const [verMovimientos, setVerMovimientos] = useState(false);
	const rangoCompleto = Boolean(Rango?.from && Rango?.to);
	const hayProduccion = Boolean(resumen?.Lineas.some((linea) => linea.NumeroRegistros > 0));
	const hoy = /* @__PURE__ */ new Date();
	const atajoActivo = ATAJOS.find((atajo) => mismoRango(Rango, atajo.rango(hoy)))?.valor;
	return /* @__PURE__ */ jsxs(PaginaReporte, {
		usuario,
		titulo: "Reportes · Productos",
		subtitulo: "Producción diaria",
		contador: resumen ? {
			valor: resumen.DiasConProduccion,
			singular: "día con producción",
			plural: "días con producción"
		} : null,
		children: [/* @__PURE__ */ jsxs(TarjetaFiltros, {
			reporte: {
				...reporte,
				hayFiltros: atajoActivo !== "hoy" || lineas.length > 0
			},
			informe: /* @__PURE__ */ jsx(BotonInforme, {
				disponible: rangoCompleto && hayProduccion,
				ayuda: "PDF con el resumen por línea, la producción por día y el detalle por presentación del período elegido",
				ayudaNoDisponible: rangoCompleto ? "No hay producción registrada en el período y las líneas elegidas" : void 0,
				exito: "Informe de producción descargado",
				descargar: () => descargarReporteProduccionDiaria(aFechaISO(Rango.from), aFechaISO(Rango.to), lineas, verMovimientos)
			}),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ jsx(DoubleDatePicker, {
						id: "rango-produccion-producto",
						label: "Fecha de producción",
						value: Rango,
						onChange: (valor) => reporte.cambiar("Rango", valor)
					}), /* @__PURE__ */ jsx(CampoFiltro, {
						etiqueta: "Atajos",
						children: /* @__PURE__ */ jsx(ToggleGroup, {
							value: atajoActivo ? [atajoActivo] : [],
							className: "flex flex-wrap justify-start gap-2",
							children: ATAJOS.map((atajo) => /* @__PURE__ */ jsx(ToggleGroupItem, {
								value: atajo.valor,
								onClick: () => reporte.cambiar("Rango", atajo.rango(/* @__PURE__ */ new Date())),
								className: PILDORA_FILTRO,
								children: atajo.texto
							}, atajo.valor))
						})
					})]
				}),
				/* @__PURE__ */ jsx(FiltroTipos, {
					reporte,
					tipo: LINEA_PRODUCTO
				}),
				/* @__PURE__ */ jsx(CampoFiltro, {
					etiqueta: "Informe PDF",
					children: /* @__PURE__ */ jsxs("label", {
						className: "flex w-fit cursor-pointer items-center gap-2 text-[12.5px] font-bold text-slate-600",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: verMovimientos,
							onChange: (e) => setVerMovimientos(e.target.checked),
							className: "h-4 w-4 rounded border-slate-300 accent-c3"
						}), "Incluir el detalle de movimientos"]
					})
				})
			]
		}), /* @__PURE__ */ jsx(SeccionResumenLineas, {
			reporte,
			titulo: "Producción del período",
			columnas: COLUMNAS,
			tarjeta: tarjetaProduccion,
			pie: resumen && `Días con producción: ${resumen.DiasConProduccion} de ${resumen.DiasPeriodo}`,
			mensajeVacio: "Elegí una fecha de inicio y una de fin para ver la producción."
		})]
	});
}
//#endregion
//#region src/pages/encargado/reportes/producto/produccion.astro
var produccion_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Produccion,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Produccion = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Produccion;
	const { usuario } = Astro.locals;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="md:hidden">${renderComponent($$result, "NavBar", NavBar, {
		"client:media": "(max-width: 767.98px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"seccion": "reportes",
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/NavBar",
		"client:component-export": "default"
	})}</div><div class="hidden md:block">${renderComponent($$result, "SideBar", SideBar, {
		"client:media": "(min-width: 768px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"seccion": "reportes",
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/SideBar",
		"client:component-export": "default"
	})}</div>${renderComponent($$result, "ProduccionReporteProducto", ProduccionReporteProducto, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/Producto/Produccion",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/producto/produccion.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/producto/produccion.astro";
var $$url = "/encargado/reportes/producto/produccion";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/producto/produccion@_@astro
var page = () => produccion_exports;
//#endregion
export { page };
