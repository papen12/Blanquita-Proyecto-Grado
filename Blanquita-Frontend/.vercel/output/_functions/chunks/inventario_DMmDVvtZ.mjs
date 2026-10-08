import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { _ as TarjetaReporte, a as COLUMNA_ESTADO, c as DERECHA, l as Dato, n as BotonDescargaFila, o as COLUMNA_PROVEEDOR, p as PieTarjeta, v as columnaCodigo } from "./comunes_LNdSvMvL.mjs";
import { r as dateOnlyFormatter } from "./dates_DZEitlnj.mjs";
import { t as EstadosMateriaPrima } from "./Estados_DlvEoiha.mjs";
import { t as ArrayFilter } from "./handlers_w7fuW24c.mjs";
import { n as PaginaReportesPestanas } from "./PaginaReporte_DPBrjsGC.mjs";
import { n as ReporteInventario, t as ReporteLotes } from "./ReporteLotes_B9vK8DWW.mjs";
import { a as verLotesRodela, i as descargarReporteMovimientosRodela, n as descargarReporteLoteRodelaDetalle, o as verRodelasReporte, r as descargarReporteLotesRodelaPorPeriodo, t as descargarReporteInventarioRodela } from "./Reportes_B8aPqdfn.mjs";
import { t as ObtenerTiposRodela } from "./Rodela_B1IGBJww.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/Rodela/filtros.js
var TIPO_RODELA = {
	cargar: ObtenerTiposRodela,
	campo: "IdsTipoRodela",
	campoValor: "IdTipoRodela",
	campoEtiqueta: "NombreTipoRodela",
	etiqueta: "Tipo de rodela"
};
//#endregion
//#region src/components/Reportes/Rodela/Inventario.jsx
var ESTADOS_RODELA = ArrayFilter([1, 6], EstadosMateriaPrima);
var COLUMNAS = [
	columnaCodigo("CodigoRodela"),
	{
		titulo: "Tipo",
		valor: (r) => r.NombreTipoRodela
	},
	COLUMNA_ESTADO,
	COLUMNA_PROVEEDOR,
	{
		titulo: "Recepción",
		valor: (r) => dateOnlyFormatter(r.FechaRecepcion)
	},
	{
		titulo: "Lote",
		...DERECHA,
		valor: (r) => /* @__PURE__ */ jsxs(Fragment, { children: ["#", r.IdLoteRodela] })
	}
];
function BotonMovimientos({ rodela, className }) {
	return /* @__PURE__ */ jsx(BotonDescargaFila, {
		className,
		ayuda: "Descargar historial de movimientos de esta rodela",
		descargar: () => descargarReporteMovimientosRodela(rodela.IdRodela)
	});
}
function InventarioReporteRodela() {
	return /* @__PURE__ */ jsx(ReporteInventario, {
		consultar: verRodelasReporte,
		elementos: (catalogo) => catalogo.Rodelas,
		clave: (r) => r.IdRodela,
		nombres: ["rodela", "rodelas"],
		codigo: {
			campo: "CodigoRodela",
			etiqueta: "Código de rodela",
			placeholder: "Ej. 963-R20"
		},
		estados: ESTADOS_RODELA,
		tipo: TIPO_RODELA,
		informe: {
			ayuda: "PDF con el resumen y detalle de las rodelas en almacén, según los tipos marcados abajo (todos si no marcás ninguno)",
			descargar: descargarReporteInventarioRodela
		},
		columnas: COLUMNAS,
		accion: (r) => /* @__PURE__ */ jsx(BotonMovimientos, { rodela: r }),
		tarjeta: (r) => /* @__PURE__ */ jsx(TarjetaReporte, {
			titulo: r.CodigoRodela,
			subtitulo: /* @__PURE__ */ jsxs(Fragment, { children: [
				r.NombreTipoRodela,
				" · ",
				r.NombreProveedor
			] }),
			estado: r.TipoEstado,
			children: /* @__PURE__ */ jsxs(PieTarjeta, {
				accion: /* @__PURE__ */ jsx(BotonMovimientos, {
					rodela: r,
					className: "shrink-0"
				}),
				children: [/* @__PURE__ */ jsx("span", { children: dateOnlyFormatter(r.FechaRecepcion) }), /* @__PURE__ */ jsxs(Dato, {
					etiqueta: "Lote",
					children: ["#", r.IdLoteRodela]
				})]
			})
		})
	});
}
//#endregion
//#region src/components/Reportes/Rodela/Ingreso.jsx
function IngresoReporteRodela() {
	return /* @__PURE__ */ jsx(ReporteLotes, {
		consultar: verLotesRodela,
		descargarDetalle: descargarReporteLoteRodelaDetalle,
		descargarPeriodo: descargarReporteLotesRodelaPorPeriodo,
		campoId: "IdLoteRodela",
		cantidad: {
			campo: "CantidadRodelas",
			titulo: "Rodelas",
			nombres: ["rodela", "rodelas"]
		},
		idCalendario: "rango-recepcion-lotes-rodela",
		ayudaInforme: "PDF con una tabla por lote del rango elegido (fecha, proveedor y rodelas) más el total general",
		tipo: TIPO_RODELA
	});
}
//#endregion
//#region src/components/Reportes/Rodela/Rodela.jsx
var PESTANAS = [{
	valor: "inventario",
	texto: "Inventario",
	subtitulo: "Inventario",
	componente: InventarioReporteRodela
}, {
	valor: "ingresos",
	texto: "Ingresos",
	subtitulo: "Ingresos (lotes)",
	componente: IngresoReporteRodela
}];
function RodelaReportes({ usuario }) {
	return /* @__PURE__ */ jsx(PaginaReportesPestanas, {
		usuario,
		titulo: "Reportes · Rodela",
		pestanas: PESTANAS
	});
}
//#endregion
//#region src/pages/encargado/reportes/rodela/inventario.astro
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
	})}</div>${renderComponent($$result, "RodelaReportes", RodelaReportes, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/Rodela/Rodela",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/rodela/inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/rodela/inventario.astro";
var $$url = "/encargado/reportes/rodela/inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/rodela/inventario@_@astro
var page = () => inventario_exports;
//#endregion
export { page };
