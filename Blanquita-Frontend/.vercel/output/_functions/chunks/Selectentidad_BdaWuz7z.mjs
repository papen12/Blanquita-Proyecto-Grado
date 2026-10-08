import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Select } from "@base-ui/react/select";
//#region src/components/ui/select.jsx
var Select$1 = Select.Root;
function SelectGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.Group, {
		"data-slot": "select-group",
		className: cn("scroll-my-1 p-1", className),
		...props
	});
}
function SelectValue({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.Value, {
		"data-slot": "select-value",
		className: cn("flex flex-1 text-left", className),
		...props
	});
}
function SelectTrigger({ className, size = "default", children, ...props }) {
	return /* @__PURE__ */ jsxs(Select.Trigger, {
		"data-slot": "select-trigger",
		"data-size": size,
		className: cn("flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(Select.Icon, { render: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "pointer-events-none size-4 text-muted-foreground" }) })]
	});
}
function SelectContent({ className, children, side = "bottom", sideOffset = 4, align = "center", alignOffset = 0, alignItemWithTrigger = true, ...props }) {
	return /* @__PURE__ */ jsx(Select.Portal, { children: /* @__PURE__ */ jsx(Select.Positioner, {
		side,
		sideOffset,
		align,
		alignOffset,
		alignItemWithTrigger,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsxs(Select.Popup, {
			"data-slot": "select-content",
			"data-align-trigger": alignItemWithTrigger,
			className: cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props,
			children: [
				/* @__PURE__ */ jsx(SelectScrollUpButton, {}),
				/* @__PURE__ */ jsx(Select.List, { children }),
				/* @__PURE__ */ jsx(SelectScrollDownButton, {})
			]
		})
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(Select.Item, {
		"data-slot": "select-item",
		className: cn("relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
		...props,
		children: [/* @__PURE__ */ jsx(Select.ItemText, {
			className: "flex flex-1 shrink-0 gap-2 whitespace-nowrap",
			children
		}), /* @__PURE__ */ jsx(Select.ItemIndicator, {
			render: /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }),
			children: /* @__PURE__ */ jsx(CheckIcon, { className: "pointer-events-none" })
		})]
	});
}
function SelectScrollUpButton({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.ScrollUpArrow, {
		"data-slot": "select-scroll-up-button",
		className: cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ jsx(ChevronUpIcon, {})
	});
}
function SelectScrollDownButton({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.ScrollDownArrow, {
		"data-slot": "select-scroll-down-button",
		className: cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ jsx(ChevronDownIcon, {})
	});
}
//#endregion
//#region src/components/layout/Selectentidad.jsx
function SelectEntidad({ opciones = [], valor, onCambio, campoValor, campoEtiqueta, placeholder = "Selecciona una opción", disabled = false, invalido = false, className }) {
	const valorActual = valor === "" || valor === null || valor === void 0 ? null : String(valor);
	const items = [{
		label: placeholder,
		value: null
	}, ...opciones.map((o) => ({
		label: String(o[campoEtiqueta]),
		value: String(o[campoValor])
	}))];
	const etiquetaDe = (v) => items.find((i) => i.value === v)?.label ?? placeholder;
	return /* @__PURE__ */ jsxs(Select$1, {
		items,
		value: valorActual,
		onValueChange: (v) => onCambio(v ?? ""),
		disabled: disabled || opciones.length === 0,
		children: [/* @__PURE__ */ jsx(SelectTrigger, {
			className: cn("h-11! w-full", invalido && "border-red-400 ring-1 ring-red-200", className),
			children: /* @__PURE__ */ jsx(SelectValue, { children: (v) => etiquetaDe(v) })
		}), /* @__PURE__ */ jsx(SelectContent, { children: opciones.map((o) => /* @__PURE__ */ jsx(SelectItem, {
			value: String(o[campoValor]),
			children: o[campoEtiqueta]
		}, o[campoValor])) })]
	});
}
//#endregion
export { SelectItem as a, SelectGroup as i, Select$1 as n, SelectTrigger as o, SelectContent as r, SelectValue as s, SelectEntidad as t };
