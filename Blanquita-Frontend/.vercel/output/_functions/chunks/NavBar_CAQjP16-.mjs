import { r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import { S as rutasVisibles, b as rutaDeItem, c as Sheet, f as SheetHeader, g as cerrarSesion, h as cn, l as SheetContent, m as SheetTrigger, p as SheetTitle, x as rutasSeccion, y as basePathSeccion } from "./SideBar_kUHPnrT4.mjs";
import { useState } from "react";
import { ChevronDown, ChevronDownIcon, ChevronUpIcon, Icon, LogOut, Menu } from "lucide-react";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { jsx, jsxs } from "react/jsx-runtime";
import { Accordion } from "@base-ui/react/accordion";
//#region src/components/ui/navigation-menu.jsx
function NavigationMenu$1({ align = "start", className, children, ...props }) {
	return /* @__PURE__ */ jsxs(NavigationMenu.Root, {
		"data-slot": "navigation-menu",
		className: cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(NavigationMenuPositioner, { align })]
	});
}
function NavigationMenuList({ className, ...props }) {
	return /* @__PURE__ */ jsx(NavigationMenu.List, {
		"data-slot": "navigation-menu-list",
		className: cn("group flex flex-1 list-none items-center justify-center gap-0", className),
		...props
	});
}
function NavigationMenuItem({ className, ...props }) {
	return /* @__PURE__ */ jsx(NavigationMenu.Item, {
		"data-slot": "navigation-menu-item",
		className: cn("relative", className),
		...props
	});
}
var navigationMenuTriggerStyle = cva("group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted");
function NavigationMenuTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(NavigationMenu.Trigger, {
		"data-slot": "navigation-menu-trigger",
		className: cn(navigationMenuTriggerStyle(), "group", className),
		...props,
		children: [
			children,
			" ",
			/* @__PURE__ */ jsx(ChevronDownIcon, {
				className: "relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180",
				"aria-hidden": "true"
			})
		]
	});
}
function NavigationMenuContent({ className, ...props }) {
	return /* @__PURE__ */ jsx(NavigationMenu.Content, {
		"data-slot": "navigation-menu-content",
		className: cn("data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] h-full w-auto p-1 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95", className),
		...props
	});
}
function NavigationMenuPositioner({ className, side = "bottom", sideOffset = 8, align = "start", alignOffset = 0, ...props }) {
	return /* @__PURE__ */ jsx(NavigationMenu.Portal, { children: /* @__PURE__ */ jsx(NavigationMenu.Positioner, {
		side,
		sideOffset,
		align,
		alignOffset,
		className: cn("isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0", className),
		...props,
		children: /* @__PURE__ */ jsx(NavigationMenu.Popup, {
			className: "data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0",
			children: /* @__PURE__ */ jsx(NavigationMenu.Viewport, { className: "relative size-full overflow-hidden" })
		})
	}) });
}
function NavigationMenuLink({ className, ...props }) {
	return /* @__PURE__ */ jsx(NavigationMenu.Link, {
		"data-slot": "navigation-menu-link",
		className: cn("flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4", className),
		...props
	});
}
//#endregion
//#region src/components/ui/accordion.jsx
function Accordion$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Accordion.Root, {
		"data-slot": "accordion",
		className: cn("flex w-full flex-col", className),
		...props
	});
}
function AccordionItem({ className, ...props }) {
	return /* @__PURE__ */ jsx(Accordion.Item, {
		"data-slot": "accordion-item",
		className: cn("not-last:border-b", className),
		...props
	});
}
function AccordionTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ jsx(Accordion.Header, {
		className: "flex",
		children: /* @__PURE__ */ jsxs(Accordion.Trigger, {
			"data-slot": "accordion-trigger",
			className: cn("group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground", className),
			...props,
			children: [
				children,
				/* @__PURE__ */ jsx(ChevronDownIcon, {
					"data-slot": "accordion-trigger-icon",
					className: "pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
				}),
				/* @__PURE__ */ jsx(ChevronUpIcon, {
					"data-slot": "accordion-trigger-icon",
					className: "pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
				})
			]
		})
	});
}
function AccordionContent({ className, children, ...props }) {
	return /* @__PURE__ */ jsx(Accordion.Panel, {
		"data-slot": "accordion-content",
		className: "overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up",
		...props,
		children: /* @__PURE__ */ jsx("div", {
			className: cn("h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", className),
			children
		})
	});
}
//#endregion
//#region src/components/layout/NavBar.jsx
function IconoItem({ item, size = 18 }) {
	if (item.esIconoLab) return /* @__PURE__ */ jsx(Icon, {
		iconNode: item.icono,
		size
	});
	const IconoComp = item.icono;
	return /* @__PURE__ */ jsx(IconoComp, { size });
}
function ItemNav({ item, basePath, prefijo }) {
	const rutaCompleta = rutaDeItem(item, basePath, prefijo);
	if (item.subrutas) return /* @__PURE__ */ jsxs(NavigationMenuItem, { children: [/* @__PURE__ */ jsx(NavigationMenuTrigger, {
		className: "bg-transparent text-white hover:!bg-[#20A7DB] focus:!bg-[#20A7DB] data-[state=open]:!bg-[#20A7DB] ",
		children: /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx(IconoItem, { item }), item.titulo]
		})
	}), /* @__PURE__ */ jsx(NavigationMenuContent, { children: /* @__PURE__ */ jsx("ul", {
		className: "grid gap-1 p-2 min-w-[180px]",
		children: item.subrutas.map((sub) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(NavigationMenuLink, {
			href: `/${rutaCompleta}/${sub.ruta}`,
			className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:!bg-[#20A7DB] hover:!text-white",
			children: [/* @__PURE__ */ jsx(IconoItem, { item: sub }), sub.titulo]
		}) }, sub.ruta))
	}) })] });
	return /* @__PURE__ */ jsx(NavigationMenuItem, { children: /* @__PURE__ */ jsxs(NavigationMenuLink, {
		href: `/${rutaCompleta}`,
		className: "flex items-center gap-2 px-3 py-2 text-lg text-white hover:!bg-[#20A7DB] focus:!bg-[#20A7DB]",
		children: [/* @__PURE__ */ jsx(IconoItem, { item }), item.titulo]
	}) });
}
function ItemNavMovil({ item, basePath, prefijo, alNavegar }) {
	const rutaCompleta = rutaDeItem(item, basePath, prefijo);
	if (!item.subrutas) return /* @__PURE__ */ jsxs("a", {
		href: `/${rutaCompleta}`,
		onClick: alNavegar,
		className: "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-white hover:bg-[#20A7DB] focus-visible:bg-[#20A7DB] focus-visible:outline-none",
		children: [/* @__PURE__ */ jsx(IconoItem, {
			item,
			size: 20
		}), item.titulo]
	});
	return /* @__PURE__ */ jsxs(AccordionItem, {
		value: item.ruta,
		className: "border-none",
		children: [/* @__PURE__ */ jsxs(AccordionTrigger, {
			className: "rounded-lg px-4 py-3 text-base font-medium text-white hover:bg-[#20A7DB] hover:no-underline focus-visible:bg-[#20A7DB] focus-visible:outline-none [&>svg]:hidden",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx(IconoItem, {
					item,
					size: 20
				}), item.titulo]
			}), /* @__PURE__ */ jsx(ChevronDown, {
				size: 18,
				className: "shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180"
			})]
		}), /* @__PURE__ */ jsx(AccordionContent, {
			className: "pb-1",
			children: /* @__PURE__ */ jsx("ul", {
				className: "ml-5 flex flex-col gap-1 border-l-2 border-[#A0D9EF] pl-3",
				children: item.subrutas.map((sub) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", {
					href: `/${rutaCompleta}/${sub.ruta}`,
					onClick: alNavegar,
					className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white hover:bg-[#20A7DB] focus-visible:bg-[#20A7DB] focus-visible:outline-none",
					children: [/* @__PURE__ */ jsx(IconoItem, {
						item: sub,
						size: 18
					}), sub.titulo]
				}) }, sub.ruta))
			})
		})]
	});
}
function NavBar({ idRol, esAdmin = false, seccion }) {
	const prefijo = PREFIJO_POR_ROL[idRol];
	const basePath = basePathSeccion(seccion, prefijo);
	const rutas = rutasVisibles(rutasSeccion(seccion), idRol, esAdmin);
	const [menuAbierto, setMenuAbierto] = useState(false);
	return /* @__PURE__ */ jsxs("nav", {
		className: "fixed top-0 left-0 z-30 flex w-full flex-row items-center justify-center px-4 h-20 md:h-30 text-white transition-all duration-300 ease-in-out",
		style: {
			backgroundColor: "#62C1E5",
			backdropFilter: "blur(10px)",
			WebkitBackdropFilter: "blur(10px)",
			boxShadow: "0 4px 20px #1c96c533",
			borderBottom: "2px solid #A0D9EF"
		},
		children: [/* @__PURE__ */ jsxs(Sheet, {
			open: menuAbierto,
			onOpenChange: setMenuAbierto,
			children: [/* @__PURE__ */ jsx(SheetTrigger, {
				"aria-label": "Abrir menú",
				className: "md:hidden absolute left-4 flex items-center justify-center rounded-lg p-2 text-white hover:bg-[#20A7DB] focus-visible:bg-[#20A7DB] focus-visible:outline-none",
				children: /* @__PURE__ */ jsx(Menu, { size: 28 })
			}), /* @__PURE__ */ jsxs(SheetContent, {
				side: "left",
				className: "w-72 max-w-[80%] border-r-2 border-[#A0D9EF] p-0 text-white [&>button]:text-white [&>button]:opacity-100",
				style: { backgroundColor: "#62C1E5" },
				children: [
					/* @__PURE__ */ jsxs(SheetHeader, {
						className: "h-20 flex-row items-center justify-start border-b-2 border-[#A0D9EF] px-4 py-0 space-y-0",
						children: [/* @__PURE__ */ jsx(SheetTitle, {
							className: "sr-only",
							children: "Menú de navegación"
						}), /* @__PURE__ */ jsx("img", {
							src: "/LogoBlanquita.webp",
							alt: "Papel Blanquita",
							className: "h-14 w-auto",
							style: { filter: "drop-shadow(0 4px 12px rgba(255,255,255,.3))" }
						})]
					}),
					/* @__PURE__ */ jsx(Accordion$1, {
						openMultiple: false,
						className: "flex flex-1 flex-col gap-1 overflow-y-auto p-3",
						children: rutas.map((item) => /* @__PURE__ */ jsx(ItemNavMovil, {
							item,
							basePath,
							prefijo,
							alNavegar: () => setMenuAbierto(false)
						}, item.ruta))
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							setMenuAbierto(false);
							cerrarSesion();
						},
						className: "mt-auto flex items-center gap-3 border-t-2 border-[#A0D9EF] px-4 py-4 text-base font-medium text-white hover:bg-red-600 focus-visible:bg-red-600 focus-visible:outline-none",
						children: [/* @__PURE__ */ jsx(LogOut, { size: 20 }), "Cerrar sesión"]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-row items-center justify-center gap-2",
			children: [/* @__PURE__ */ jsx("img", {
				src: "/LogoBlanquita.webp",
				alt: "Papel Blanquita",
				className: "h-16 md:h-25 w-auto transition-[filter] duration-300 ease-in-out",
				style: { filter: "drop-shadow(0 4px 12px rgba(255,255,255,.3))" }
			}), /* @__PURE__ */ jsx(NavigationMenu$1, {
				className: "hidden md:flex",
				children: /* @__PURE__ */ jsxs(NavigationMenuList, { children: [rutas.map((item) => /* @__PURE__ */ jsx(ItemNav, {
					item,
					basePath,
					prefijo
				}, item.ruta)), /* @__PURE__ */ jsx(NavigationMenuItem, { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: cerrarSesion,
					className: "flex items-center gap-2 rounded-md px-3 py-2 text-lg text-white hover:!bg-red-600 focus:!bg-red-600 focus-visible:outline-none",
					children: [/* @__PURE__ */ jsx(LogOut, { size: 18 }), "Cerrar sesión"]
				}) })] })
			})]
		})]
	});
}
//#endregion
export { NavBar as t };
