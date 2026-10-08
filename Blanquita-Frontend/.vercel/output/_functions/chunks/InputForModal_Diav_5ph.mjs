import { t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/layout/InputForModal.jsx
function InputForModal({ id, etiqueta = "", opcional = false, valor = "", onCambio, error = "", className = "", classNameInput = "", ...props }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex min-w-0 flex-col gap-1.5", className),
		children: [
			etiqueta && /* @__PURE__ */ jsxs(Label, {
				htmlFor: id,
				className: "flex items-center gap-1 whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-600",
				children: [etiqueta, opcional && /* @__PURE__ */ jsx("span", {
					className: "font-semibold normal-case text-slate-400",
					children: "(opcional)"
				})]
			}),
			/* @__PURE__ */ jsx(Input, {
				id,
				value: valor ?? "",
				onChange: (e) => onCambio(e.target.value),
				"aria-invalid": Boolean(error),
				className: cn("h-11", classNameInput),
				...props
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "text-xs font-semibold text-red-600",
				children: error
			})
		]
	});
}
//#endregion
export { InputForModal as t };
