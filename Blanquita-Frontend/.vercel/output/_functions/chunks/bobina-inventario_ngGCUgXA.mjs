import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as BottomBar } from "./BottomBar_C056loei.mjs";
import { t as EmpaqueBobinaInventario } from "./EmpaqueBobinaInventario_CXJKum_0.mjs";
//#region src/pages/encargado/empaque/bobina-inventario.astro
var bobina_inventario_exports = /* @__PURE__ */ __exportAll({
	default: () => $$BobinaInventario,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$BobinaInventario = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BobinaInventario;
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
	})}</div>${renderComponent($$result, "EmpaqueBobinaInventario", EmpaqueBobinaInventario, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Empaque/EmpaqueBobinaInventario",
		"client:component-export": "default"
	})}${renderComponent($$result, "BottomBar", BottomBar, {
		"idRol": usuario.IdRol,
		"subRuta": "empaque",
		"idOpcionSelect": 3,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/Qr/BottomBar",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/empaque/bobina-inventario.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/empaque/bobina-inventario.astro";
var $$url = "/encargado/empaque/bobina-inventario";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/empaque/bobina-inventario@_@astro
var page = () => bobina_inventario_exports;
//#endregion
export { page };
