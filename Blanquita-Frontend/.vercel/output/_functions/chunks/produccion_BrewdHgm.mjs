import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { c as DERECHA } from "./comunes_LNdSvMvL.mjs";
import { o as descargarReporteProduccionCancelada, s as descargarReporteProduccionPorPeriodo, t as descargarReporteDetalleProduccion, u as verProduccionesBobinaTubo } from "./Reportes_BJrOcONl.mjs";
import { n as PRODUCTO_BOBINA_PAPEL, t as CODIGO_BOBINA_PAPEL } from "./filtros_DU9X5hxf.mjs";
import { t as ReporteProduccion } from "./ReporteProduccion_BoGUrNu-.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/PapelBobina/Produccion.jsx
var bobinas = (p) => /* @__PURE__ */ jsxs(Fragment, { children: [
	p.CodigoBobina1,
	" + ",
	p.CodigoBobina2
] });
var COLUMNAS = [{
	titulo: "Producto",
	valor: (p) => p.NombreProducto
}, {
	titulo: "Bobinas",
	clase: "font-mono text-[12.5px]",
	valor: bobinas
}];
var COLUMNAS_FINALES = [{
	titulo: "Logs",
	...DERECHA,
	valor: (p) => p.CantidadLogsActual
}];
var TARJETA = {
	titulo: bobinas,
	subtitulo: (p) => /* @__PURE__ */ jsxs(Fragment, { children: [
		p.NombreProducto,
		" · ",
		p.NombreTurno
	] }),
	extra: (p) => /* @__PURE__ */ jsxs("span", { children: ["Logs ", p.CantidadLogsActual] })
};
function ProduccionReporteBobinaPapel({ usuario }) {
	return /* @__PURE__ */ jsx(ReporteProduccion, {
		usuario,
		titulo: "Reportes · Bobina Papel",
		idCalendario: "rango-produccion",
		consultar: verProduccionesBobinaTubo,
		campoId: "IdProduccionBobinaTubo",
		tipo: PRODUCTO_BOBINA_PAPEL,
		codigo: CODIGO_BOBINA_PAPEL,
		descargarPeriodo: descargarReporteProduccionPorPeriodo,
		descargarCancelada: descargarReporteProduccionCancelada,
		descargarDetalle: (id, conMovimientos) => descargarReporteDetalleProduccion(id, true, conMovimientos),
		opcionMovimientos: true,
		columnas: COLUMNAS,
		columnasFinales: COLUMNAS_FINALES,
		anchoAccion: "w-20",
		tarjeta: TARJETA
	});
}
//#endregion
//#region src/pages/encargado/reportes/bobina-papel/produccion.astro
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
	})}</div>${renderComponent($$result, "ProduccionReporteBobinaPapel", ProduccionReporteBobinaPapel, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/PapelBobina/Produccion",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-papel/produccion.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-papel/produccion.astro";
var $$url = "/encargado/reportes/bobina-papel/produccion";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/bobina-papel/produccion@_@astro
var page = () => produccion_exports;
//#endregion
export { page };
