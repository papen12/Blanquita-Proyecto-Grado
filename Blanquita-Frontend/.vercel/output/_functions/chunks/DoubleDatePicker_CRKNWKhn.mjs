import { n as Button, r as buttonVariants } from "./input_fNj7IM-d.mjs";
import { a as TooltipTrigger, h as cn$1, n as Tooltip, r as TooltipContent } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import * as React$1 from "react";
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { cn } from "cn";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { Popover } from "@base-ui/react/popover";
//#region src/components/ui/calendar.jsx
function Calendar({ className, classNames, showOutsideDays = true, captionLayout = "label", buttonVariant = "ghost", locale, formatters, components, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	return /* @__PURE__ */ jsx(DayPicker, {
		showOutsideDays,
		className: cn$1("group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent", String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`, String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`, className),
		captionLayout,
		locale,
		formatters: {
			formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
			...formatters
		},
		classNames: {
			root: cn$1("w-fit", defaultClassNames.root),
			months: cn$1("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
			month: cn$1("flex w-full flex-col gap-4", defaultClassNames.month),
			nav: cn$1("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
			button_previous: cn$1(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50", defaultClassNames.button_previous),
			button_next: cn$1(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50", defaultClassNames.button_next),
			month_caption: cn$1("flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)", defaultClassNames.month_caption),
			dropdowns: cn$1("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", defaultClassNames.dropdowns),
			dropdown_root: cn$1("relative rounded-(--cell-radius)", defaultClassNames.dropdown_root),
			dropdown: cn$1("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
			caption_label: cn$1("font-medium select-none", captionLayout === "label" ? "text-sm" : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground", defaultClassNames.caption_label),
			month_grid: cn$1("w-full border-collapse", defaultClassNames.month_grid),
			weekdays: cn$1("flex", defaultClassNames.weekdays),
			weekday: cn$1("flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none", defaultClassNames.weekday),
			week: cn$1("mt-2 flex w-full", defaultClassNames.week),
			week_number_header: cn$1("w-(--cell-size) select-none", defaultClassNames.week_number_header),
			week_number: cn$1("text-[0.8rem] text-muted-foreground select-none", defaultClassNames.week_number),
			day: cn$1("group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)", props.showWeekNumber ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)" : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)", defaultClassNames.day),
			range_start: cn$1("relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted", defaultClassNames.range_start),
			range_middle: cn$1("rounded-none", defaultClassNames.range_middle),
			range_end: cn$1("relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted", defaultClassNames.range_end),
			today: cn$1("rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none", defaultClassNames.today),
			outside: cn$1("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
			disabled: cn$1("text-muted-foreground opacity-50", defaultClassNames.disabled),
			hidden: cn$1("invisible", defaultClassNames.hidden),
			...classNames
		},
		components: {
			Root: ({ className, rootRef, ...props }) => {
				return /* @__PURE__ */ jsx("div", {
					"data-slot": "calendar",
					ref: rootRef,
					className: cn$1(className),
					...props
				});
			},
			Chevron: ({ className, orientation, ...props }) => {
				if (orientation === "left") return /* @__PURE__ */ jsx(ChevronLeftIcon, {
					className: cn$1("size-4", className),
					...props
				});
				if (orientation === "right") return /* @__PURE__ */ jsx(ChevronRightIcon, {
					className: cn$1("size-4", className),
					...props
				});
				return /* @__PURE__ */ jsx(ChevronDownIcon, {
					className: cn$1("size-4", className),
					...props
				});
			},
			DayButton: ({ ...props }) => /* @__PURE__ */ jsx(CalendarDayButton, {
				locale,
				...props
			}),
			WeekNumber: ({ children, ...props }) => {
				return /* @__PURE__ */ jsx("td", {
					...props,
					children: /* @__PURE__ */ jsx("div", {
						className: "flex size-(--cell-size) items-center justify-center text-center",
						children
					})
				});
			},
			...components
		},
		...props
	});
}
function CalendarDayButton({ className, day, modifiers, locale, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	const ref = React$1.useRef(null);
	React$1.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);
	return /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		"data-day": day.date.toLocaleDateString(locale?.code),
		"data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
		"data-range-start": modifiers.range_start,
		"data-range-end": modifiers.range_end,
		"data-range-middle": modifiers.range_middle,
		className: cn$1("relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70", defaultClassNames.day, className),
		...props
	});
}
//#endregion
//#region src/components/ui/popover.jsx
function Popover$1({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Root, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ jsx(Popover.Portal, { children: /* @__PURE__ */ jsx(Popover.Positioner, {
		align,
		alignOffset,
		side,
		sideOffset,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsx(Popover.Popup, {
			"data-slot": "popover-content",
			className: cn("z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props
		})
	}) });
}
//#endregion
//#region src/components/layout/dates/DoubleDatePicker.jsx
var claveFecha = (fecha) => format(fecha, "yyyy-MM-dd");
function DoubleDatePicker({ id = "date-picker-range", label = "Rango de fechas", value, onChange, numberOfMonths = 2, diasDestacados, onRangoVisibleChange, className }) {
	const controlado = onChange !== void 0;
	const [rangoInterno, setRangoInterno] = React$1.useState(void 0);
	const rango = controlado ? value : rangoInterno;
	const cambiarRango = (nuevoRango) => {
		if (!controlado) setRangoInterno(nuevoRango);
		onChange?.(nuevoRango);
	};
	const [mesBase, setMesBase] = React$1.useState(() => rango?.from ?? /* @__PURE__ */ new Date());
	React$1.useEffect(() => {
		if (!onRangoVisibleChange) return;
		onRangoVisibleChange({
			inicio: startOfMonth(mesBase),
			fin: endOfMonth(addMonths(mesBase, numberOfMonths - 1))
		});
	}, [mesBase, numberOfMonths]);
	const esDestacado = React$1.useCallback((fecha) => Boolean(diasDestacados?.get(claveFecha(fecha))?.length), [diasDestacados]);
	const DayButtonPersonalizado = React$1.useMemo(() => {
		return function DayButtonConDestacado({ day, modifiers, ...props }) {
			const boton = /* @__PURE__ */ jsx(CalendarDayButton, {
				day,
				modifiers,
				locale: es,
				...props
			});
			const etiquetas = diasDestacados?.get(claveFecha(day.date));
			if (!etiquetas?.length) return boton;
			return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { render: boton }), /* @__PURE__ */ jsx(TooltipContent, { children: etiquetas.map((linea) => /* @__PURE__ */ jsx("div", { children: linea }, linea)) })] });
		};
	}, [diasDestacados]);
	return /* @__PURE__ */ jsxs("div", {
		className: cn$1("flex flex-col gap-1.5", className),
		children: [/* @__PURE__ */ jsx(Label, {
			htmlFor: id,
			className: "text-xs font-bold uppercase tracking-wide text-slate-600",
			children: label
		}), /* @__PURE__ */ jsxs(Popover$1, { children: [/* @__PURE__ */ jsx(PopoverTrigger, { render: /* @__PURE__ */ jsxs(Button, {
			variant: "outline",
			id,
			className: "justify-start px-2.5 font-normal",
			children: [/* @__PURE__ */ jsx(CalendarIcon, { "data-icon": "inline-start" }), rango?.from ? rango.to ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
				format(rango.from, "d LLL, y", { locale: es }),
				" -",
				" ",
				format(rango.to, "d LLL, y", { locale: es })
			] }) : format(rango.from, "d LLL, y", { locale: es }) : /* @__PURE__ */ jsx("span", { children: "Elige un rango de fechas" })]
		}) }), /* @__PURE__ */ jsx(PopoverContent, {
			className: "w-auto p-0",
			align: "start",
			children: /* @__PURE__ */ jsx(Calendar, {
				mode: "range",
				locale: es,
				defaultMonth: rango?.from,
				onMonthChange: setMesBase,
				selected: rango,
				onSelect: cambiarRango,
				numberOfMonths,
				modifiers: { destacado: esDestacado },
				modifiersClassNames: { destacado: "bg-amber-100 text-amber-900 font-bold" },
				components: { DayButton: DayButtonPersonalizado }
			})
		})] })]
	});
}
//#endregion
export { DoubleDatePicker as t };
