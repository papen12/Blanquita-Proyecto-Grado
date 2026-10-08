import { n as Button } from "./input_fNj7IM-d.mjs";
import { a as TooltipTrigger, n as Tooltip, r as TooltipContent } from "./SideBar_kUHPnrT4.mjs";
import { t as useDescarga } from "./useDescarga_B6TO3Led.mjs";
import { Download, Loader2 } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/layout/BotonDescarga.jsx
function BotonDescarga({ texto, ayuda, exito, descargar }) {
	const { descargando, iniciar } = useDescarga(descargar, exito);
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { render: /* @__PURE__ */ jsxs(Button, {
		onClick: iniciar,
		disabled: descargando,
		className: "h-11 gap-2 bg-white font-bold text-c3 shadow-md hover:bg-slate-100",
		children: [descargando ? /* @__PURE__ */ jsx(Loader2, {
			size: 16,
			className: "animate-spin"
		}) : /* @__PURE__ */ jsx(Download, {
			size: 16,
			strokeWidth: 2.75
		}), texto]
	}) }), /* @__PURE__ */ jsx(TooltipContent, { children: ayuda })] });
}
//#endregion
export { BotonDescarga as t };
