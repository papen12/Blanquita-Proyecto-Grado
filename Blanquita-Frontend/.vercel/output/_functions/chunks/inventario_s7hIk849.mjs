import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as BottomBar } from "./BottomBar_C056loei.mjs";
import { t as InventarioBobinaServilleta } from "./Inventario_CafuVisU.mjs";
//#region src/pages/operador/bobina-servilleta/inventario.astro
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
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/NavBar",
		"client:component-export": "default"
	})}</div><div class="hidden md:block">${renderComponent($$result, "SideBar", SideBar, {
		"client:media": "(min-width: 768px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/SideBar",
		"client:component-export": "default"
	})}</div>${renderComponent($$result, "InventarioBobinaServilleta", InventarioBobinaServilleta, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/ServilletaBobina/Inventario",
		"client:component-export": "default"
	})}${renderComponent($$result, "BottomBar", BottomBar, {
		"idRol": usuario.IdRol,
		"subRuta": "bobina-servilleta",
		"idOpcionSelect": 1,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/Qr/BottomBar",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/operador/bobina-servilleta/inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/operador/bobina-servilleta/inventario.astro";
var $$url = "/operador/bobina-servilleta/inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/operador/bobina-servilleta/inventario@_@astro
var page = () => inventario_exports;
//#endregion
export { page };
