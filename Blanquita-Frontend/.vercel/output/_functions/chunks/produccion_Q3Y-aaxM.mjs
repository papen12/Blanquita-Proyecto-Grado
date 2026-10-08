import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { n as EstadosProduccion } from "./Estados_DlvEoiha.mjs";
import { t as ArrayFilter } from "./handlers_w7fuW24c.mjs";
import { c as descargarReporteProduccionServilletaCancelada, f as verProduccionesServilleta, l as descargarReporteProduccionServilletaPorPeriodo, n as descargarReporteDetalleProduccionServilleta } from "./Reportes_cTv_nrMT.mjs";
import { n as TIPOS_BOBINA_SERVILLETA, t as CODIGO_UNIDAD } from "./filtros_D_ob7k2j.mjs";
import { t as ReporteProduccion } from "./ReporteProduccion_BoGUrNu-.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/BobinaServilleta/Produccion.jsx
var ESTADOS_SERVILLETA = ArrayFilter([
	1,
	2,
	3,
	4
], EstadosProduccion);
var COLUMNAS = [
	{
		titulo: "Tipo",
		valor: (p) => p.NombreTipoBobinaServilleta
	},
	{
		titulo: "Código",
		clase: "font-mono text-[12.5px]",
		valor: (p) => p.CodigoBobina
	},
	{
		titulo: "Formato",
		valor: (p) => p.DescripcionMedida
	}
];
var TARJETA = {
	titulo: (p) => p.CodigoBobina,
	subtitulo: (p) => /* @__PURE__ */ jsxs(Fragment, { children: [
		p.NombreTipoBobinaServilleta,
		" · ",
		p.DescripcionMedida,
		" · ",
		p.NombreTurno
	] })
};
function ProduccionReporteServilleta({ usuario }) {
	return /* @__PURE__ */ jsx(ReporteProduccion, {
		usuario,
		titulo: "Reportes · Produccion Bobina Servilleta",
		idCalendario: "rango-produccion-servilleta",
		consultar: verProduccionesServilleta,
		campoId: "IdProduccionServilleta",
		tipo: TIPOS_BOBINA_SERVILLETA,
		codigo: CODIGO_UNIDAD,
		descargarPeriodo: descargarReporteProduccionServilletaPorPeriodo,
		descargarCancelada: descargarReporteProduccionServilletaCancelada,
		descargarDetalle: (id) => descargarReporteDetalleProduccionServilleta(id, true),
		columnas: COLUMNAS,
		tarjeta: TARJETA,
		estados: ESTADOS_SERVILLETA
	});
}
//#endregion
//#region src/pages/encargado/reportes/bobina-servilleta/produccion.astro
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
	})}</div>${renderComponent($$result, "ProduccionReporteServilleta", ProduccionReporteServilleta, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/BobinaServilleta/Produccion",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-servilleta/produccion.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-servilleta/produccion.astro";
var $$url = "/encargado/reportes/bobina-servilleta/produccion";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/bobina-servilleta/produccion@_@astro
var page = () => produccion_exports;
//#endregion
export { page };
