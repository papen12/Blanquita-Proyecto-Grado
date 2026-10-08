import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { n as imprimirPDF, t as descargarReportePDF } from "./downloadFile_DxGT_R9d.mjs";
import { t as PaginaReporte } from "./PaginaReporte_DPBrjsGC.mjs";
import { useState } from "react";
import { Download, Icon, Loader2, Printer, QrCode, ShelvingUnit, SquareStack } from "lucide-react";
import { toiletRoll } from "@lucide/lab";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/services/Qr/Carteles.js
var BASE_URL = "/api/qr";
async function imprimirCartelQr(ruta) {
	await imprimirPDF(`${BASE_URL}/${ruta}`);
}
async function descargarCartelQr(ruta) {
	await descargarReportePDF(`${BASE_URL}/${ruta}`, "cartel-qr.pdf");
}
//#endregion
//#region src/components/Reportes/Qr/TarjetaQr.jsx
function TarjetaQr({ titulo, descripcion, ruta }) {
	const [enProceso, setEnProceso] = useState(null);
	const [error, setError] = useState("");
	const ejecutar = async (clave, accion) => {
		setEnProceso(clave);
		setError("");
		try {
			await accion(ruta);
		} catch (e) {
			setError(e.message);
		} finally {
			setEnProceso(null);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex w-full flex-col items-center gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:w-80",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "text-center",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-lg font-extrabold text-slate-900",
					children: titulo
				}), descripcion && /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[13px] leading-snug text-slate-500",
					children: descripcion
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-c4/25 bg-white",
				children: /* @__PURE__ */ jsx(QrCode, {
					size: 96,
					strokeWidth: 1.75,
					className: "text-c4"
				})
			}),
			error && /* @__PURE__ */ jsx("div", {
				className: "w-full rounded-lg bg-red-50 px-3 py-2 text-center text-[13px] font-semibold text-red-600",
				children: error
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-auto flex w-full gap-2",
				children: [/* @__PURE__ */ jsxs(Button, {
					onClick: () => ejecutar("imprimir", imprimirCartelQr),
					disabled: enProceso !== null,
					className: "h-11 flex-1 gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90",
					children: [enProceso === "imprimir" ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : /* @__PURE__ */ jsx(Printer, {
						size: 16,
						strokeWidth: 2.75
					}), "Imprimir"]
				}), /* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					onClick: () => ejecutar("descargar", descargarCartelQr),
					disabled: enProceso !== null,
					className: "h-11 gap-2 border-2 border-slate-200 font-bold text-c3",
					children: [enProceso === "descargar" ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : /* @__PURE__ */ jsx(Download, {
						size: 16,
						strokeWidth: 2.75
					}), "Descargar"]
				})]
			})
		]
	});
}
//#endregion
//#region src/components/Reportes/Qr/CodigosQr.jsx
var IconoBobinaPapel = (props) => /* @__PURE__ */ jsx(Icon, {
	iconNode: toiletRoll,
	...props
});
var SECCIONES = [
	{
		titulo: "Bobina Papel",
		Icono: IconoBobinaPapel,
		carteles: [{
			titulo: "Inventario",
			descripcion: "Abre el inventario de bobinas de papel",
			ruta: "bobina-papel/inventario"
		}, {
			titulo: "Producción",
			descripcion: "Abre la producción de bobinas de papel",
			ruta: "bobina-papel/produccion"
		}]
	},
	{
		titulo: "Bobina Servilleta",
		Icono: SquareStack,
		carteles: [{
			titulo: "Inventario",
			descripcion: "Abre el inventario de bobinas de servilleta",
			ruta: "bobina-servilleta/inventario"
		}, {
			titulo: "Producción",
			descripcion: "Abre la producción de bobinas de servilleta",
			ruta: "bobina-servilleta/produccion"
		}]
	},
	{
		titulo: "Producto Terminado",
		Icono: ShelvingUnit,
		carteles: [{
			titulo: "Inventario",
			descripcion: "Abre los movimientos de producto terminado",
			ruta: "producto/inventario"
		}]
	}
];
function CodigosQr({ usuario }) {
	return /* @__PURE__ */ jsxs(PaginaReporte, {
		usuario,
		titulo: "Reportes",
		subtitulo: "Códigos QR",
		children: [/* @__PURE__ */ jsx("p", {
			className: "mb-6 text-sm text-slate-500",
			children: "Imprime cada cartel y colócalo en su área de la planta. Al escanearlo desde la aplicación se abre esa vista directamente."
		}), SECCIONES.map(({ titulo, Icono, carteles }) => /* @__PURE__ */ jsxs("section", {
			className: "mb-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-3 flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Icono, {
					size: 18,
					className: "text-c3"
				}), /* @__PURE__ */ jsx("h2", {
					className: "text-base font-extrabold text-slate-900",
					children: titulo
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-5",
				children: carteles.map((cartel) => /* @__PURE__ */ jsx(TarjetaQr, { ...cartel }, cartel.ruta))
			})]
		}, titulo))]
	});
}
//#endregion
//#region src/pages/encargado/reportes/qr.astro
var qr_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Qr,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Qr = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Qr;
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
	})}</div>${renderComponent($$result, "CodigosQr", CodigosQr, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Reportes/Qr/CodigosQr",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/qr.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/reportes/qr.astro";
var $$url = "/encargado/reportes/qr";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/reportes/qr@_@astro
var page = () => qr_exports;
//#endregion
export { page };
