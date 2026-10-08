import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { a as TablaFilas, n as ErrorCarga, o as TarjetaFila, r as EsqueletoCarga, s as TarjetaSeccion, t as CantidadUnidad } from "./comunes_CSK1dv5A.mjs";
import { c as DERECHA, f as FiltroTipos, g as TarjetaFiltros, r as BotonInforme, v as columnaCodigo, y as contar } from "./comunes_LNdSvMvL.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { r as verResumenInventario, t as descargarReporteInventarioProducto } from "./Reportes_CsP8pHUy.mjs";
import { t as PaginaReporte } from "./PaginaReporte_DPBrjsGC.mjs";
import { t as LINEA_PRODUCTO } from "./filtros_g6cBza48.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/Producto/Inventario.jsx
var textoPaquetes = (cantidad) => cantidad == null ? "-" : contar(cantidad, "paquete", "paquetes");
var textoUltimoMovimiento = (p) => p.FechaUltimoMovimiento ? dateFormatter(p.FechaUltimoMovimiento) : "-";
var COLUMNAS = [
	columnaCodigo("CodigoPresentacion"),
	{
		titulo: "Producto",
		valor: (p) => p.NombrePresentacion
	},
	{
		titulo: "Contenedor",
		valor: (p) => p.TipoContenedor
	},
	{
		titulo: "Contenido",
		valor: (p) => textoPaquetes(p.CantidadPorUnidadTerminada)
	},
	{
		titulo: "Stock",
		...DERECHA,
		valor: (p) => formatearNumero(p.CantidadActual, { decimales: 0 })
	},
	{
		titulo: "Último movimiento",
		clase: "text-[12.5px]",
		valor: textoUltimoMovimiento
	}
];
function tarjetaPresentacion(p) {
	return /* @__PURE__ */ jsx(TarjetaFila, {
		nombre: `${p.CodigoPresentacion} · ${p.NombrePresentacion}`,
		detalle: `${p.TipoContenedor} · ${textoPaquetes(p.CantidadPorUnidadTerminada)} · Últ. mov. ${textoUltimoMovimiento(p)}`,
		children: /* @__PURE__ */ jsx("strong", {
			className: "text-slate-900",
			children: formatearNumero(p.CantidadActual, { decimales: 0 })
		})
	});
}
function StockPorLinea({ reporte }) {
	const { catalogo: resumen, cargando, error, recargar } = reporte;
	if (cargando || error) return /* @__PURE__ */ jsx(TarjetaSeccion, {
		titulo: "Stock por línea",
		className: "mt-6",
		children: cargando ? /* @__PURE__ */ jsx(EsqueletoCarga, {}) : /* @__PURE__ */ jsx(ErrorCarga, {
			error,
			recargar
		})
	});
	if (!resumen) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-6 flex flex-col gap-4",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-[12.5px] font-semibold text-slate-500",
			children: ["Stock al ", dateFormatter(resumen.FechaGeneracion)]
		}), resumen.Lineas.map((linea) => /* @__PURE__ */ jsx(TarjetaSeccion, {
			titulo: linea.NombreProducto,
			extra: /* @__PURE__ */ jsx(CantidadUnidad, {
				valor: linea.Total,
				unidad: linea.Unidad
			}),
			children: /* @__PURE__ */ jsx(TablaFilas, {
				columnas: COLUMNAS,
				filas: linea.Presentaciones,
				clave: (p) => p.IdPresentacion,
				tarjeta: tarjetaPresentacion
			})
		}, linea.IdProducto))]
	});
}
function InventarioReporteProducto({ usuario }) {
	const reporte = useReporte(verResumenInventario, { [LINEA_PRODUCTO.campo]: [] });
	const { filtros, catalogo: resumen } = reporte;
	const presentaciones = resumen?.Lineas.reduce((total, linea) => total + linea.Presentaciones.length, 0);
	return /* @__PURE__ */ jsxs(PaginaReporte, {
		usuario,
		titulo: "Reportes · Productos",
		subtitulo: "Inventario",
		contador: resumen ? {
			valor: presentaciones,
			singular: "presentación",
			plural: "presentaciones"
		} : null,
		children: [/* @__PURE__ */ jsx(TarjetaFiltros, {
			reporte,
			informe: /* @__PURE__ */ jsx(BotonInforme, {
				ayuda: "PDF con el stock actual por línea y el detalle de cada presentación, según las líneas marcadas abajo (todas si no marcás ninguna)",
				exito: "Informe de inventario descargado",
				descargar: () => descargarReporteInventarioProducto(filtros[LINEA_PRODUCTO.campo])
			}),
			children: /* @__PURE__ */ jsx(FiltroTipos, {
				reporte,
				tipo: LINEA_PRODUCTO
			})
		}), /* @__PURE__ */ jsx(StockPorLinea, { reporte })]
	});
}
//#endregion
//#region src/pages/encargado/reportes/producto/inventario.astro
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
	})}</div>${renderComponent($$result, "InventarioReporteProducto", InventarioReporteProducto, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/Producto/Inventario",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/producto/inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/producto/inventario.astro";
var $$url = "/encargado/reportes/producto/inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/producto/inventario@_@astro
var page = () => inventario_exports;
//#endregion
export { page };
