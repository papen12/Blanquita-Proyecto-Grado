import { a as Roles, r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import * as React$1 from "react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Boxes, ChevronDown, ChevronLeft, CircleUserRound, ClipboardList, Combine, Container, Cylinder, Database, Factory, Home, Icon, LogOut, QrCode, ShelvingUnit, SquareStack, Truck, UserShield, Users, XIcon } from "lucide-react";
import { toiletRoll } from "@lucide/lab";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { jsx, jsxs } from "react/jsx-runtime";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "cn";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Separator } from "@base-ui/react/separator";
import { Tooltip } from "@base-ui/react/tooltip";
//#region src/constants/NavBarRoutes.js
function rutaDeItem(item, basePath, prefijo) {
	if (item.absoluta) return item.ruta;
	if (item.ruta === "") return `${prefijo}/inicio`;
	return `${basePath}/${item.ruta}`;
}
function rutasVisibles(rutas, idRol, esAdmin) {
	return rutas.filter((item) => (!item.isLider || idRol === Roles.Encargado) && (!item.soloAdmin || esAdmin));
}
var RutasNavBar = [
	{
		titulo: "Inicio",
		icono: Home,
		ruta: "inicio"
	},
	{
		titulo: "Bobina Papel",
		icono: toiletRoll,
		esIconoLab: true,
		ruta: "bobina-papel",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Bobina Servilleta",
		icono: SquareStack,
		ruta: "bobina-servilleta",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Rodela",
		icono: Database,
		ruta: "rodela",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Empaque",
		icono: Container,
		ruta: "empaque",
		subrutas: [{
			titulo: "Bobina",
			icono: Database,
			ruta: "bobina-inventario"
		}]
	},
	{
		titulo: "Productos",
		icono: ShelvingUnit,
		ruta: "producto",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Movimientos",
			icono: Combine,
			ruta: "movimientos"
		}]
	},
	{
		titulo: "Reportes",
		icono: ClipboardList,
		ruta: "reportes/inicio",
		isLider: true
	},
	{
		titulo: "Administrador",
		icono: UserShield,
		ruta: "admin/inicio",
		absoluta: true,
		soloAdmin: true
	},
	{
		titulo: "Perfil",
		icono: CircleUserRound,
		ruta: "perfil"
	}
];
var RutasReportes = [
	{
		titulo: "Inicio",
		icono: Home,
		ruta: "inicio"
	},
	{
		titulo: "Bobina Papel",
		icono: toiletRoll,
		esIconoLab: true,
		ruta: "bobina-papel",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Bobina Servilleta",
		icono: SquareStack,
		ruta: "bobina-servilleta",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Rodela",
		icono: Database,
		ruta: "rodela",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}]
	},
	{
		titulo: "Productos",
		icono: ShelvingUnit,
		ruta: "producto",
		subrutas: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Producción",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		titulo: "Códigos Qr",
		icono: QrCode,
		ruta: "qr"
	},
	{
		titulo: "Volver a la Planta",
		icono: Factory,
		ruta: ""
	}
];
var RutasAdmin = [
	{
		titulo: "Inicio",
		icono: Home,
		ruta: "inicio"
	},
	{
		titulo: "Usuarios",
		icono: Users,
		ruta: "usuarios",
		descripcion: "Registrar usuarios, cambiar su estado y restablecer claves"
	},
	{
		titulo: "Proveedores",
		icono: Truck,
		ruta: "proveedores",
		descripcion: "Registrar Proveedores y cambiar su estado"
	},
	{
		titulo: "Bobina Papel",
		icono: Cylinder,
		ruta: "tipos-bobina-papel",
		descripcion: "Crear tipos de bobina papel y editar sus medidas y tara"
	},
	{
		titulo: "Bobina Servilleta",
		icono: SquareStack,
		ruta: "tipos-bobina-servilleta",
		descripcion: "Crear tipos de bobina servilleta y editar su diámetro, crepado y resistencia"
	},
	{
		titulo: "Líneas y Productos",
		icono: Boxes,
		ruta: "catalogo",
		descripcion: "Crear líneas de producción y sus productos con su código"
	},
	{
		titulo: "Volver a la Planta",
		icono: Factory,
		ruta: ""
	}
];
function basePathSeccion(seccion, prefijo) {
	if (seccion === "reportes") return `${prefijo}/reportes`;
	if (seccion === "admin") return "admin";
	return prefijo;
}
function rutasSeccion(seccion) {
	if (seccion === "reportes") return RutasReportes;
	if (seccion === "admin") return RutasAdmin;
	return RutasNavBar;
}
//#endregion
//#region src/lib/logout-client.js
var cerrandoSesion = false;
async function cerrarSesion() {
	if (cerrandoSesion) return;
	cerrandoSesion = true;
	try {
		await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/json" },
			cache: "no-store"
		});
	} catch {}
	try {
		window.localStorage.clear();
		window.sessionStorage.clear();
	} catch {}
	window.location.replace("/");
}
//#endregion
//#region src/lib/utils.ts
function cn$1(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/sheet.jsx
function Sheet({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Root, {
		"data-slot": "sheet",
		...props
	});
}
function SheetTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Trigger, {
		"data-slot": "sheet-trigger",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Backdrop, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(Dialog.Popup, {
		"data-slot": "sheet-content",
		"data-side": side,
		className: cn("fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsxs(Dialog.Close, {
			"data-slot": "sheet-close",
			render: /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				className: "absolute top-3 right-3",
				size: "icon-sm"
			}),
			children: [/* @__PURE__ */ jsx(XIcon, {}), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-0.5 p-4", className),
		...props
	});
}
function SheetFooter({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-footer",
		className: cn("mt-auto flex flex-col gap-2 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Title, {
		"data-slot": "sheet-title",
		className: cn("font-heading text-base font-medium text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Description, {
		"data-slot": "sheet-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
//#endregion
//#region src/hooks/use-mobile.js
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = React$1.useState(void 0);
	React$1.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
//#endregion
//#region src/components/ui/separator.jsx
function Separator$1({ className, orientation = "horizontal", ...props }) {
	return /* @__PURE__ */ jsx(Separator, {
		"data-slot": "separator",
		orientation,
		className: cn("shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch", className),
		...props
	});
}
//#endregion
//#region src/components/ui/skeleton.jsx
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "skeleton",
		className: cn("animate-pulse rounded-md bg-muted", className),
		...props
	});
}
//#endregion
//#region src/components/ui/tooltip.jsx
function TooltipProvider({ delay = 0, ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Provider, {
		"data-slot": "tooltip-provider",
		delay,
		...props
	});
}
function Tooltip$1({ ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Root, {
		"data-slot": "tooltip",
		...props
	});
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Trigger, {
		"data-slot": "tooltip-trigger",
		...props
	});
}
function TooltipContent({ className, side = "top", sideOffset = 4, align = "center", alignOffset = 0, children, ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Portal, { children: /* @__PURE__ */ jsx(Tooltip.Positioner, {
		align,
		alignOffset,
		side,
		sideOffset,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsxs(Tooltip.Popup, {
			"data-slot": "tooltip-content",
			className: cn("z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props,
			children: [children, /* @__PURE__ */ jsx(Tooltip.Arrow, { className: "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })]
		})
	}) });
}
//#endregion
//#region src/components/ui/sidebar.jsx
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 3600 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React$1.createContext(null);
function useSidebar() {
	const context = React$1.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React$1.useState(false);
	const [_open, _setOpen] = React$1.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React$1.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = React$1.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	React$1.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = React$1.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ jsx(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsx("div", {
			"data-slot": "sidebar-wrapper",
			style: {
				"--sidebar-width": SIDEBAR_WIDTH,
				"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
				...style
			},
			className: cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", className),
			...props,
			children
		})
	});
}
function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, dir, ...props }) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar",
		className: cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className),
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ jsx(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			dir,
			"data-sidebar": "sidebar",
			"data-slot": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: [/* @__PURE__ */ jsxs(SheetHeader, {
				className: "sr-only",
				children: [/* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex h-full w-full flex-col",
				children
			})]
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "group peer hidden text-sidebar-foreground md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		"data-slot": "sidebar",
		children: [/* @__PURE__ */ jsx("div", {
			"data-slot": "sidebar-gap",
			className: cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")
		}), /* @__PURE__ */ jsx("div", {
			"data-slot": "sidebar-container",
			"data-side": side,
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ jsx("div", {
				"data-sidebar": "sidebar",
				"data-slot": "sidebar-inner",
				className: "flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border",
				children
			})
		})]
	});
}
function SidebarHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-header",
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
}
function SidebarFooter({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-footer",
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
}
function SidebarContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-content",
		"data-sidebar": "content",
		className: cn("no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
}
function SidebarMenu({ className, ...props }) {
	return /* @__PURE__ */ jsx("ul", {
		"data-slot": "sidebar-menu",
		"data-sidebar": "menu",
		className: cn("flex w-full min-w-0 flex-col gap-0", className),
		...props
	});
}
function SidebarMenuItem({ className, ...props }) {
	return /* @__PURE__ */ jsx("li", {
		"data-slot": "sidebar-menu-item",
		"data-sidebar": "menu-item",
		className: cn("group/menu-item relative", className),
		...props
	});
}
var sidebarMenuButtonVariants = cva("peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function SidebarMenuButton({ render, isActive = false, variant = "default", size = "default", tooltip, className, ...props }) {
	const { isMobile, state } = useSidebar();
	const comp = useRender({
		defaultTagName: "button",
		props: mergeProps({ className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className) }, props),
		render: !tooltip ? render : /* @__PURE__ */ jsx(TooltipTrigger, { render }),
		state: {
			slot: "sidebar-menu-button",
			sidebar: "menu-button",
			size,
			active: isActive
		}
	});
	if (!tooltip) return comp;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ jsxs(Tooltip$1, { children: [comp, /* @__PURE__ */ jsx(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
}
function SidebarMenuSub({ className, ...props }) {
	return /* @__PURE__ */ jsx("ul", {
		"data-slot": "sidebar-menu-sub",
		"data-sidebar": "menu-sub",
		className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden", className),
		...props
	});
}
function SidebarMenuSubItem({ className, ...props }) {
	return /* @__PURE__ */ jsx("li", {
		"data-slot": "sidebar-menu-sub-item",
		"data-sidebar": "menu-sub-item",
		className: cn("group/menu-sub-item relative", className),
		...props
	});
}
function SidebarMenuSubButton({ render, size = "md", isActive = false, className, ...props }) {
	return useRender({
		defaultTagName: "a",
		props: mergeProps({ className: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", className) }, props),
		render,
		state: {
			slot: "sidebar-menu-sub-button",
			sidebar: "menu-sub-button",
			size,
			active: isActive
		}
	});
}
//#endregion
//#region src/components/layout/SideBar.jsx
var PALETA_NAVBAR = {
	"--sidebar": "#62C1E5",
	"--sidebar-foreground": "#ffffff",
	"--sidebar-accent": "#20A7DB",
	"--sidebar-accent-foreground": "#ffffff",
	"--sidebar-primary": "#20A7DB",
	"--sidebar-primary-foreground": "#ffffff",
	"--sidebar-border": "#A0D9EF",
	"--sidebar-ring": "#A0D9EF"
};
var ANCHO_SIDEBAR = "17rem";
var CLAVE_ESTADO = "sidebar-abierto";
var CLASE_ITEM = "h-10 gap-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent [&_svg]:size-5";
var CLASE_SUBITEM = "h-8 gap-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent [&>svg]:size-4 [&>svg]:text-sidebar-foreground";
function IconoItem({ item, size = 22 }) {
	if (item.esIconoLab) return /* @__PURE__ */ jsx(Icon, {
		iconNode: item.icono,
		size
	});
	const IconoComp = item.icono;
	return /* @__PURE__ */ jsx(IconoComp, { size });
}
function EntradaSimple({ item, basePath, prefijo }) {
	return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(SidebarMenuButton, {
		size: "lg",
		render: /* @__PURE__ */ jsx("a", { href: `/${rutaDeItem(item, basePath, prefijo)}` }),
		className: CLASE_ITEM,
		children: [/* @__PURE__ */ jsx(IconoItem, {
			item,
			size: 20
		}), /* @__PURE__ */ jsx("span", { children: item.titulo })]
	}) });
}
function GrupoColapsable({ item, basePath }) {
	const rutaCompleta = `${basePath}/${item.ruta}`;
	const [abierto, setAbierto] = useState(false);
	return /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [/* @__PURE__ */ jsxs(SidebarMenuButton, {
		size: "lg",
		onClick: () => setAbierto((v) => !v),
		"aria-expanded": abierto,
		className: cn$1(CLASE_ITEM, abierto && "bg-sidebar-accent text-sidebar-accent-foreground"),
		children: [
			/* @__PURE__ */ jsx(IconoItem, {
				item,
				size: 20
			}),
			/* @__PURE__ */ jsx("span", {
				className: "flex-1 text-left",
				children: item.titulo
			}),
			/* @__PURE__ */ jsx(ChevronDown, {
				size: 16,
				className: cn$1("shrink-0 transition-transform duration-200", abierto && "rotate-180")
			})
		]
	}), abierto && /* @__PURE__ */ jsx(SidebarMenuSub, {
		className: "mt-1 gap-1 border-sidebar-border",
		children: item.subrutas.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsxs(SidebarMenuSubButton, {
			render: /* @__PURE__ */ jsx("a", { href: `/${rutaCompleta}/${sub.ruta}` }),
			className: CLASE_SUBITEM,
			children: [/* @__PURE__ */ jsx(IconoItem, {
				item: sub,
				size: 16
			}), /* @__PURE__ */ jsx("span", { children: sub.titulo })]
		}) }, sub.ruta))
	})] });
}
function SideBar({ idRol, esAdmin = false, seccion }) {
	const prefijo = PREFIJO_POR_ROL[idRol];
	const basePath = basePathSeccion(seccion, prefijo);
	const rutas = rutasVisibles(rutasSeccion(seccion), idRol, esAdmin);
	const [abierto, setAbierto] = useState(true);
	useEffect(() => {
		try {
			if (window.localStorage.getItem(CLAVE_ESTADO) === "false") setAbierto(false);
		} catch {}
	}, []);
	const alternar = () => {
		setAbierto((v) => {
			const siguiente = !v;
			try {
				window.localStorage.setItem(CLAVE_ESTADO, String(siguiente));
			} catch {}
			return siguiente;
		});
	};
	useEffect(() => {
		const raiz = document.documentElement;
		raiz.style.setProperty("--hueco-sidebar", abierto ? ANCHO_SIDEBAR : "0px");
		return () => raiz.style.removeProperty("--hueco-sidebar");
	}, [abierto]);
	return /* @__PURE__ */ jsxs(SidebarProvider, {
		style: PALETA_NAVBAR,
		className: "contents",
		children: [/* @__PURE__ */ jsxs(Sidebar, {
			collapsible: "none",
			className: "fixed inset-y-0 left-0 z-50 h-svh border-r-2 border-sidebar-border",
			style: {
				width: ANCHO_SIDEBAR,
				transform: abierto ? void 0 : "translateX(-100%)",
				transition: "transform 0.3s ease-in-out",
				backdropFilter: "blur(10px)",
				WebkitBackdropFilter: "blur(10px)",
				boxShadow: "0 4px 20px #1c96c533"
			},
			children: [
				/* @__PURE__ */ jsx(SidebarHeader, {
					className: "h-16 items-center justify-center border-b-2 border-sidebar-border md:h-20",
					children: /* @__PURE__ */ jsx("img", {
						src: "/LogoBlanquita.webp",
						alt: "Papel Blanquita",
						className: "h-10 w-auto md:h-12",
						style: { filter: "drop-shadow(0 4px 12px rgba(255,255,255,.3))" }
					})
				}),
				/* @__PURE__ */ jsx(SidebarContent, {
					className: "p-3",
					children: /* @__PURE__ */ jsx(SidebarMenu, {
						className: "gap-1.5",
						children: rutas.map((item) => item.subrutas ? /* @__PURE__ */ jsx(GrupoColapsable, {
							item,
							basePath
						}, item.ruta) : /* @__PURE__ */ jsx(EntradaSimple, {
							item,
							basePath,
							prefijo
						}, item.ruta))
					})
				}),
				/* @__PURE__ */ jsx(SidebarFooter, {
					className: "border-t-2 border-sidebar-border p-3",
					children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(SidebarMenuButton, {
						size: "lg",
						onClick: cerrarSesion,
						className: cn$1(CLASE_ITEM, "hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white"),
						children: [/* @__PURE__ */ jsx(LogOut, { size: 20 }), /* @__PURE__ */ jsx("span", { children: "Cerrar sesión" })]
					}) }) })
				})
			]
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: alternar,
			"aria-label": abierto ? "Plegar menu" : "Desplegar menu",
			"aria-expanded": abierto,
			className: "fixed top-1/2 z-50 flex h-20 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl border-2 border-l-0 border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_4px_20px_#1c96c533] backdrop-blur transition-[left] duration-300 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
			style: { left: abierto ? ANCHO_SIDEBAR : "0rem" },
			children: /* @__PURE__ */ jsx(ChevronLeft, {
				size: 20,
				className: cn$1("transition-transform duration-300", !abierto && "rotate-180")
			})
		})]
	});
}
//#endregion
export { rutasVisibles as S, RutasAdmin as _, TooltipTrigger as a, rutaDeItem as b, Sheet as c, SheetFooter as d, SheetHeader as f, cerrarSesion as g, cn$1 as h, TooltipProvider as i, SheetContent as l, SheetTrigger as m, Tooltip$1 as n, Skeleton as o, SheetTitle as p, TooltipContent as r, Separator$1 as s, SideBar as t, SheetDescription as u, RutasReportes as v, rutasSeccion as x, basePathSeccion as y };
