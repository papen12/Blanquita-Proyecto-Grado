import { r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import { i as TooltipProvider } from "./SideBar_kUHPnrT4.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs_DwRtTS0P.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/PaginaReporte.jsx
function PaginaReporte({ usuario, titulo, subtitulo, contador, children }) {
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsx(Header, {
			volver: `/${PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado"}/reportes/inicio`,
			titulo,
			subtitulo,
			contador
		}), /* @__PURE__ */ jsx("main", {
			className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
			children
		})]
	}) });
}
function PaginaReportesPestanas({ usuario, titulo, pestanas }) {
	const [activa, setActiva] = useState(pestanas[0].valor);
	return /* @__PURE__ */ jsx(PaginaReporte, {
		usuario,
		titulo,
		subtitulo: pestanas.find((pestana) => pestana.valor === activa).subtitulo,
		children: /* @__PURE__ */ jsxs(Tabs, {
			value: activa,
			onValueChange: setActiva,
			children: [/* @__PURE__ */ jsx(TabsList, {
				className: "mb-5 h-11 w-full sm:w-auto",
				children: pestanas.map((pestana) => /* @__PURE__ */ jsx(TabsTrigger, {
					value: pestana.valor,
					className: "flex-1 font-bold sm:flex-none sm:px-6",
					children: pestana.texto
				}, pestana.valor))
			}), pestanas.map(({ valor, componente: Componente }) => /* @__PURE__ */ jsx(TabsContent, {
				value: valor,
				children: /* @__PURE__ */ jsx(Componente, {})
			}, valor))]
		})
	});
}
//#endregion
export { PaginaReportesPestanas as n, PaginaReporte as t };
