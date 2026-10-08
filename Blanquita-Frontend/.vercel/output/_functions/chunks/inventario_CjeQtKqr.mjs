import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { _ as TarjetaReporte, a as COLUMNA_ESTADO, c as DERECHA, l as Dato, n as BotonDescargaFila, o as COLUMNA_PROVEEDOR, p as PieTarjeta, v as columnaCodigo } from "./comunes_LNdSvMvL.mjs";
import { a as descargarReporteMovimientosBobina, c as verBobinasPapelReporte, i as descargarReporteLotesPorPeriodo, l as verLotesBobinaPapel, n as descargarReporteInventarioBobinaPapel, r as descargarReporteLoteDetalle } from "./Reportes_BJrOcONl.mjs";
import { r as TIPO_BOBINA_PAPEL, t as CODIGO_BOBINA_PAPEL } from "./filtros_DU9X5hxf.mjs";
import { n as PaginaReportesPestanas } from "./PaginaReporte_DPBrjsGC.mjs";
import { n as ReporteInventario, t as ReporteLotes } from "./ReporteLotes_B9vK8DWW.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/PapelBobina/Inventario.jsx
var COLUMNAS = [
	columnaCodigo("CodigoBobina"),
	{
		titulo: "Tipo",
		valor: (b) => b.NombreTipoBobina
	},
	COLUMNA_ESTADO,
	COLUMNA_PROVEEDOR,
	{
		titulo: "Bruto (kg)",
		...DERECHA,
		valor: (b) => formatearNumero(b.PesoBrutoKg, { vacio: "-" })
	},
	{
		titulo: "Gramaje",
		...DERECHA,
		valor: (b) => formatearNumero(b.Gramaje, { vacio: "-" })
	}
];
function BotonMovimientos({ bobina, className }) {
	return /* @__PURE__ */ jsx(BotonDescargaFila, {
		className,
		ayuda: "Descargar historial de movimientos de esta bobina",
		descargar: () => descargarReporteMovimientosBobina(bobina.IdBobinaPapel)
	});
}
function InventarioReporteBobinaPapel() {
	return /* @__PURE__ */ jsx(ReporteInventario, {
		consultar: verBobinasPapelReporte,
		elementos: (catalogo) => catalogo.Bobinas,
		clave: (b) => b.IdBobinaPapel,
		nombres: ["bobina", "bobinas"],
		codigo: CODIGO_BOBINA_PAPEL,
		tipo: TIPO_BOBINA_PAPEL,
		informe: {
			ayuda: "PDF con el resumen y detalle de las bobinas en almacén, según los tipos marcados abajo (todos si no marcás ninguno)",
			descargar: descargarReporteInventarioBobinaPapel
		},
		columnas: COLUMNAS,
		accion: (b) => /* @__PURE__ */ jsx(BotonMovimientos, { bobina: b }),
		tarjeta: (b) => /* @__PURE__ */ jsx(TarjetaReporte, {
			titulo: b.CodigoBobina,
			subtitulo: /* @__PURE__ */ jsxs(Fragment, { children: [
				b.NombreTipoBobina,
				" · ",
				b.NombreProveedor
			] }),
			estado: b.TipoEstado,
			children: /* @__PURE__ */ jsxs(PieTarjeta, {
				accion: /* @__PURE__ */ jsx(BotonMovimientos, {
					bobina: b,
					className: "shrink-0"
				}),
				children: [/* @__PURE__ */ jsxs(Dato, {
					etiqueta: "Bruto",
					children: [formatearNumero(b.PesoBrutoKg, { vacio: "-" }), " kg"]
				}), /* @__PURE__ */ jsx(Dato, {
					etiqueta: "Gramaje",
					children: formatearNumero(b.Gramaje, { vacio: "-" })
				})]
			})
		})
	});
}
//#endregion
//#region src/components/Reportes/PapelBobina/Ingreso.jsx
function IngresoReporteBobinaPapel() {
	return /* @__PURE__ */ jsx(ReporteLotes, {
		consultar: verLotesBobinaPapel,
		descargarDetalle: descargarReporteLoteDetalle,
		descargarPeriodo: descargarReporteLotesPorPeriodo,
		campoId: "IdLoteBobina",
		cantidad: {
			campo: "CantidadBobinas",
			titulo: "Bobinas",
			nombres: ["bobina", "bobinas"]
		},
		idCalendario: "rango-recepcion-lotes",
		ayudaInforme: "PDF con una tabla por lote del rango elegido (fecha, proveedor y bobinas) más el total general",
		tipo: TIPO_BOBINA_PAPEL
	});
}
//#endregion
//#region src/components/Reportes/PapelBobina/PapelBobina.jsx
var PESTANAS = [{
	valor: "inventario",
	texto: "Inventario",
	subtitulo: "Inventario",
	componente: InventarioReporteBobinaPapel
}, {
	valor: "ingresos",
	texto: "Ingresos",
	subtitulo: "Ingresos (lotes)",
	componente: IngresoReporteBobinaPapel
}];
function PapelBobinaReportes({ usuario }) {
	return /* @__PURE__ */ jsx(PaginaReportesPestanas, {
		usuario,
		titulo: "Reportes · Bobina Papel",
		pestanas: PESTANAS
	});
}
//#endregion
//#region src/pages/encargado/reportes/bobina-papel/inventario.astro
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
	})}</div>${renderComponent($$result, "PapelBobinaReportes", PapelBobinaReportes, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/PapelBobina/PapelBobina",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-papel/inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/bobina-papel/inventario.astro";
var $$url = "/encargado/reportes/bobina-papel/inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/bobina-papel/inventario@_@astro
var page = () => inventario_exports;
//#endregion
export { page };
