import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { _ as TarjetaReporte, a as COLUMNA_ESTADO, c as DERECHA, l as Dato, n as BotonDescargaFila, o as COLUMNA_PROVEEDOR, p as PieTarjeta, v as columnaCodigo, y as contar } from "./comunes_LNdSvMvL.mjs";
import { a as descargarReporteLoteServilletaDetalle, d as verLotesBobinaServilleta, o as descargarReporteLotesServilletaPorPeriodo, r as descargarReporteInventarioBobinaServilleta, s as descargarReporteMovimientosUnidadServilleta, t as descargarReporteDetalleBobinaServilleta, u as verBobinasServilletaReporte } from "./Reportes_cTv_nrMT.mjs";
import { r as TIPO_BOBINA_SERVILLETA, t as CODIGO_UNIDAD } from "./filtros_D_ob7k2j.mjs";
import { n as PaginaReportesPestanas } from "./PaginaReporte_DPBrjsGC.mjs";
import { n as ReporteInventario, t as ReporteLotes } from "./ReporteLotes_B9vK8DWW.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/BobinaServilleta/Bobina.jsx
function UnidadCelda({ bobina, numero }) {
	const codigo = bobina[`CodigoUnidad${numero}`];
	if (!codigo) return /* @__PURE__ */ jsx("span", {
		className: "text-slate-300",
		children: "-"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-0.5",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "font-mono text-[13px] font-bold text-slate-900",
				children: codigo
			}),
			/* @__PURE__ */ jsx("span", {
				className: "text-[11.5px] text-slate-500",
				children: bobina[`DescripcionFormato${numero}`]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "text-[11.5px] text-slate-500",
				children: [
					formatearNumero(bobina[`PesoBrutoKg${numero}`], { vacio: "-" }),
					" kg ·",
					" ",
					formatearNumero(bobina[`GramajeGr${numero}`], { vacio: "-" }),
					" gr"
				]
			})
		]
	});
}
function BotonDetalle({ bobina, ayuda, className }) {
	return /* @__PURE__ */ jsx(BotonDescargaFila, {
		className,
		ayuda,
		descargar: () => descargarReporteDetalleBobinaServilleta(bobina.IdBobinaServilleta)
	});
}
var COLUMNAS$1 = [
	{
		titulo: "Lote",
		clase: "font-mono text-slate-700",
		valor: (b) => b.CodigoLote
	},
	{
		titulo: "Recepción",
		valor: (b) => b.FechaRecepcion
	},
	COLUMNA_PROVEEDOR,
	{
		titulo: "Tipo",
		valor: (b) => b.NombreTipoBobinaServilleta
	},
	COLUMNA_ESTADO,
	{
		titulo: "Unidad 1",
		valor: (b) => /* @__PURE__ */ jsx(UnidadCelda, {
			bobina: b,
			numero: 1
		})
	},
	{
		titulo: "Unidad 2",
		valor: (b) => /* @__PURE__ */ jsx(UnidadCelda, {
			bobina: b,
			numero: 2
		})
	}
];
function BobinaReporteServilleta() {
	return /* @__PURE__ */ jsx(ReporteInventario, {
		consultar: verBobinasServilletaReporte,
		elementos: (catalogo) => catalogo.Bobinas,
		clave: (b) => b.IdBobinaServilleta,
		nombres: ["bobina", "bobinas"],
		codigo: CODIGO_UNIDAD,
		tipo: TIPO_BOBINA_SERVILLETA,
		informe: {
			ayuda: "PDF con el resumen y detalle de las bobinas en almacén, según el tipo marcado abajo (todos si no marcás ninguno)",
			descargar: descargarReporteInventarioBobinaServilleta
		},
		columnas: COLUMNAS$1,
		accion: (b) => /* @__PURE__ */ jsx(BotonDetalle, {
			bobina: b,
			ayuda: "Descargar detalle de esta bobina (movimientos de la bobina, unidades y sub-bobinas)"
		}),
		tarjeta: (b) => /* @__PURE__ */ jsxs(TarjetaReporte, {
			titulo: /* @__PURE__ */ jsxs(Fragment, { children: ["Lote ", b.CodigoLote] }),
			tamanoTitulo: "text-[13px]",
			subtitulo: /* @__PURE__ */ jsxs(Fragment, { children: [
				b.NombreTipoBobinaServilleta,
				" · ",
				b.NombreProveedor
			] }),
			estado: b.TipoEstado,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 border-t border-slate-200 pt-2.5",
				children: [/* @__PURE__ */ jsx(UnidadCelda, {
					bobina: b,
					numero: 1
				}), /* @__PURE__ */ jsx(UnidadCelda, {
					bobina: b,
					numero: 2
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-[12.5px] text-slate-500",
					children: ["Recepción ", b.FechaRecepcion]
				}), /* @__PURE__ */ jsx(BotonDetalle, {
					bobina: b,
					ayuda: "Descargar detalle de esta bobina",
					className: "shrink-0"
				})]
			})]
		})
	});
}
//#endregion
//#region src/components/Reportes/BobinaServilleta/UnidadBobina.jsx
function aplanarUnidades(bobinas) {
	return bobinas.flatMap((b) => [1, 2].filter((numero) => b[`IdUnidad${numero}`]).map((numero) => ({
		IdUnidad: b[`IdUnidad${numero}`],
		CodigoUnidad: b[`CodigoUnidad${numero}`],
		DescripcionFormato: b[`DescripcionFormato${numero}`],
		PesoBrutoKg: b[`PesoBrutoKg${numero}`],
		GramajeGr: b[`GramajeGr${numero}`],
		IdBobinaServilleta: b.IdBobinaServilleta,
		CodigoLote: b.CodigoLote,
		FechaRecepcion: b.FechaRecepcion,
		NombreProveedor: b.NombreProveedor,
		NombreTipoBobinaServilleta: b.NombreTipoBobinaServilleta,
		TipoEstado: b.TipoEstado
	})));
}
var COLUMNAS = [
	columnaCodigo("CodigoUnidad"),
	{
		titulo: "Formato",
		valor: (u) => u.DescripcionFormato
	},
	{
		titulo: "Lote",
		clase: "font-mono text-slate-700",
		valor: (u) => u.CodigoLote
	},
	{
		titulo: "Tipo",
		valor: (u) => u.NombreTipoBobinaServilleta
	},
	COLUMNA_PROVEEDOR,
	COLUMNA_ESTADO,
	{
		titulo: "Bruto (kg)",
		...DERECHA,
		valor: (u) => formatearNumero(u.PesoBrutoKg, { vacio: "-" })
	},
	{
		titulo: "Gramaje",
		...DERECHA,
		valor: (u) => formatearNumero(u.GramajeGr, { vacio: "-" })
	}
];
function BotonMovimientos({ unidad, ayuda, className }) {
	return /* @__PURE__ */ jsx(BotonDescargaFila, {
		className,
		ayuda,
		descargar: () => descargarReporteMovimientosUnidadServilleta(unidad.IdUnidad)
	});
}
function UnidadBobinaReporteServilleta() {
	return /* @__PURE__ */ jsx(ReporteInventario, {
		consultar: verBobinasServilletaReporte,
		elementos: (catalogo) => aplanarUnidades(catalogo.Bobinas),
		clave: (u) => u.IdUnidad,
		nombres: ["unidad", "unidades"],
		resumen: (unidades) => `${contar(unidades.length, "unidad", "unidades")} en esta página`,
		codigo: CODIGO_UNIDAD,
		tipo: TIPO_BOBINA_SERVILLETA,
		columnas: COLUMNAS,
		accion: (u) => /* @__PURE__ */ jsx(BotonMovimientos, {
			unidad: u,
			ayuda: "Descargar historial de movimientos de esta unidad"
		}),
		tarjeta: (u) => /* @__PURE__ */ jsx(TarjetaReporte, {
			titulo: u.CodigoUnidad,
			subtitulo: /* @__PURE__ */ jsxs(Fragment, { children: [
				u.DescripcionFormato,
				" · ",
				u.NombreProveedor
			] }),
			estado: u.TipoEstado,
			children: /* @__PURE__ */ jsxs(PieTarjeta, {
				accion: /* @__PURE__ */ jsx(BotonMovimientos, {
					unidad: u,
					ayuda: "Descargar historial de movimientos",
					className: "shrink-0"
				}),
				children: [/* @__PURE__ */ jsxs(Dato, {
					etiqueta: "Bruto",
					children: [formatearNumero(u.PesoBrutoKg, { vacio: "-" }), " kg"]
				}), /* @__PURE__ */ jsx(Dato, {
					etiqueta: "Gramaje",
					children: formatearNumero(u.GramajeGr, { vacio: "-" })
				})]
			})
		})
	});
}
//#endregion
//#region src/components/Reportes/BobinaServilleta/Lote.jsx
function LoteReporteServilleta() {
	return /* @__PURE__ */ jsx(ReporteLotes, {
		consultar: verLotesBobinaServilleta,
		descargarDetalle: descargarReporteLoteServilletaDetalle,
		descargarPeriodo: descargarReporteLotesServilletaPorPeriodo,
		campoId: "IdLoteBobinaServilleta",
		cantidad: {
			campo: "CantidadBobinas",
			titulo: "Bobinas",
			nombres: ["bobina", "bobinas"]
		},
		idCalendario: "rango-recepcion-lotes-servilleta",
		ayudaInforme: "PDF con una tabla por lote del rango elegido (bobinas y sus 2 unidades) más el total general"
	});
}
//#endregion
//#region src/components/Reportes/BobinaServilleta/BobinaServilleta.jsx
var PESTANAS = [
	{
		valor: "bobina",
		texto: "Bobina",
		subtitulo: "Bobina",
		componente: BobinaReporteServilleta
	},
	{
		valor: "unidad",
		texto: "Unidad Bobina",
		subtitulo: "Unidad Bobina",
		componente: UnidadBobinaReporteServilleta
	},
	{
		valor: "lote",
		texto: "Lote",
		subtitulo: "Lote",
		componente: LoteReporteServilleta
	}
];
function ServilletaBobinaReportes({ usuario }) {
	return /* @__PURE__ */ jsx(PaginaReportesPestanas, {
		usuario,
		titulo: "Reportes · Inventario Bobina Servilleta",
		pestanas: PESTANAS
	});
}
//#endregion
//#region src/pages/encargado/reportes/bobina-servilleta/inventario.astro
var inventario_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Inventario,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Inventario = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Inventario;
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
	})}</div>${renderComponent($$result, "ServilletaBobinaReportes", ServilletaBobinaReportes, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/BobinaServilleta/BobinaServilleta",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-servilleta/inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-servilleta/inventario.astro";
var $$url = "/encargado/reportes/bobina-servilleta/inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/bobina-servilleta/inventario@_@astro
var page = () => inventario_exports;
//#endregion
export { page };
