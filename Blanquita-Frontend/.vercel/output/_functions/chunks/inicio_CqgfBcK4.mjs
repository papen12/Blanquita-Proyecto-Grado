import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar, v as RutasReportes } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { ArrowRight, Icon } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/InicioReportes.jsx
function IconoRuta({ item, size = 20, className }) {
	if (item.esIconoLab) return /* @__PURE__ */ jsx(Icon, {
		iconNode: item.icono,
		size,
		className
	});
	const Comp = item.icono;
	return /* @__PURE__ */ jsx(Comp, {
		size,
		className
	});
}
function TileReporte({ seccion, sub, href }) {
	return /* @__PURE__ */ jsxs("a", {
		href,
		className: "group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-c4/10",
				children: /* @__PURE__ */ jsx(IconoRuta, {
					item: sub,
					size: 20,
					className: "text-c3"
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[15px] font-extrabold leading-tight text-slate-900 break-words",
					children: sub.titulo
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[13px] leading-snug text-slate-500",
					children: seccion.titulo
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-auto flex items-center gap-1 text-xs font-bold text-c3",
				children: ["Ver reporte", /* @__PURE__ */ jsx(ArrowRight, {
					size: 14,
					strokeWidth: 2.75,
					className: "transition-transform group-hover:translate-x-0.5"
				})]
			})
		]
	});
}
function InicioReportes({ usuario }) {
	const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";
	const secciones = RutasReportes.filter((item) => item.subrutas);
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar mt-20 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 md:mt-0",
		children: [/* @__PURE__ */ jsx("header", {
			className: "bg-gradient-to-r from-c3 to-c4 px-5 py-5 text-white sm:px-7",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto w-full max-w-5xl",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-white/80",
					children: "Reportes"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-0.5 text-xl font-extrabold",
					children: "¿Qué reporte necesitas?"
				})]
			})
		}), /* @__PURE__ */ jsx("main", {
			className: "mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6",
			children: secciones.map((seccion) => /* @__PURE__ */ jsxs("section", {
				className: "mb-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(IconoRuta, {
						item: seccion,
						size: 18,
						className: "text-c3"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-base font-extrabold text-slate-900",
						children: seccion.titulo
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: seccion.subrutas.map((sub) => /* @__PURE__ */ jsx(TileReporte, {
						seccion,
						sub,
						href: `/${prefijo}/reportes/${seccion.ruta}/${sub.ruta}`
					}, sub.ruta))
				})]
			}, seccion.ruta))
		})]
	});
}
//#endregion
//#region src/pages/encargado/reportes/inicio.astro
var inicio_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Inicio,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Inicio = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Inicio;
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
	})}</div>${renderComponent($$result, "InicioReportes", InicioReportes, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/InicioReportes",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/inicio.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/inicio.astro";
var $$url = "/encargado/reportes/inicio";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/inicio@_@astro
var page = () => inicio_exports;
//#endregion
export { page };
