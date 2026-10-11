import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
//#region src/pages/sidebar-test.astro
var sidebar_test_exports = /* @__PURE__ */ __exportAll({
	default: () => $$SidebarTest,
	file: () => $$file,
	url: () => $$url
});
var $$SidebarTest = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "SideBar", SideBar, {
		"client:load": true,
		"idRol": 1,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/SideBar",
		"client:component-export": "default"
	})}${maybeRenderHead($$result)}<div class="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0"><header class="bg-gradient-to-r from-c3 to-c4 px-5 py-5 text-white sm:px-7"><div class="text-xl font-extrabold">Contenido de prueba</div></header><div class="p-6">Area de contenido - se reajusta al plegar el sidebar.</div></div>` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/sidebar-test.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/sidebar-test.astro";
var $$url = "/sidebar-test";
//#endregion
//#region \0virtual:astro:page:src/pages/sidebar-test@_@astro
var page = () => sidebar_test_exports;
//#endregion
export { page };
