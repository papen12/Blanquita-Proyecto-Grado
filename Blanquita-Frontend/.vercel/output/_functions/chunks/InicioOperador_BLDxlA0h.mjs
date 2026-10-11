import { r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { r as CLAVE_AREA_TRABAJO, t as AREAS_TRABAJO } from "./OperadorConfig_tt2Z91F-.mjs";
import { useEffect, useState } from "react";
import { ArrowRight, Icon } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/utils/areaTrabajo.js
var getArea = (id) => AREAS_TRABAJO.find((a) => a.id === id) ?? null;
var idAreaPorDefecto = () => getArea("bobina-papel")?.id ?? AREAS_TRABAJO[0].id;
function leerAreaGuardada() {
	try {
		return getArea(localStorage.getItem(CLAVE_AREA_TRABAJO));
	} catch {
		return null;
	}
}
function guardarArea(id) {
	try {
		if (getArea(id)) localStorage.setItem(CLAVE_AREA_TRABAJO, id);
	} catch {}
}
function areaInicial() {
	return leerAreaGuardada() ?? getArea("bobina-papel") ?? AREAS_TRABAJO[0];
}
function rutaAcceso(idRol, area, subruta) {
	return `/${PREFIJO_POR_ROL[idRol] ?? "operador"}/${area.ruta}/${subruta.ruta}`;
}
//#endregion
//#region src/components/Usuario/InicioOperador.jsx
var DIAS = [
	"domingo",
	"lunes",
	"martes",
	"miércoles",
	"jueves",
	"viernes",
	"sábado"
];
var MESES = [
	"enero",
	"febrero",
	"marzo",
	"abril",
	"mayo",
	"junio",
	"julio",
	"agosto",
	"septiembre",
	"octubre",
	"noviembre",
	"diciembre"
];
var capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function turnoActual(fecha) {
	return fecha.getHours() < 15 ? "Mañana" : "Tarde";
}
function fechaLarga(fecha) {
	return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}
function IconoArea({ area, size = 15, className }) {
	if (area.esIconoLab) return /* @__PURE__ */ jsx(Icon, {
		iconNode: area.icono,
		size,
		className
	});
	const Comp = area.icono;
	return /* @__PURE__ */ jsx(Comp, {
		size,
		className
	});
}
function TileAcceso({ subruta, href, destacado }) {
	const Icono = subruta.icono;
	return /* @__PURE__ */ jsxs("a", {
		href,
		className: cn("group flex flex-col gap-3 rounded-2xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", destacado ? "bg-gradient-to-br from-c3 to-c4 text-white" : "bg-white text-slate-900 ring-1 ring-slate-200"),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", destacado ? "bg-white/15" : "bg-c4/10"),
				children: /* @__PURE__ */ jsx(Icono, {
					size: 20,
					strokeWidth: 2,
					className: destacado ? "text-white" : "text-c3"
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[15px] font-extrabold leading-tight break-words",
					children: subruta.titulo
				}), subruta.descripcion && /* @__PURE__ */ jsx("p", {
					className: cn("mt-1 text-[13px] leading-snug break-words", destacado ? "text-white/85" : "text-slate-500"),
					children: subruta.descripcion
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: cn("mt-auto flex items-center gap-1 text-xs font-bold", destacado ? "text-white/90" : "text-c3"),
				children: ["Abrir", /* @__PURE__ */ jsx(ArrowRight, {
					size: 14,
					strokeWidth: 2.75,
					className: "transition-transform group-hover:translate-x-0.5"
				})]
			})
		]
	});
}
function InicioOperador({ usuario }) {
	const [areaId, setAreaId] = useState(idAreaPorDefecto);
	const [ahora, setAhora] = useState(null);
	useEffect(() => {
		setAreaId(areaInicial().id);
		setAhora(/* @__PURE__ */ new Date());
	}, []);
	const area = getArea(areaId) ?? AREAS_TRABAJO[0];
	const idRol = usuario?.IdRol ?? 1;
	const seleccionar = (id) => {
		if (!id || id === areaId) return;
		setAreaId(id);
		guardarArea(id);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0",
		children: [/* @__PURE__ */ jsx("header", {
			className: "bg-gradient-to-r from-c3 to-c4 px-5 py-5 text-white sm:px-7",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto w-full max-w-5xl",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-white/80",
					children: ahora ? `Turno ${turnoActual(ahora)} · ${capitalizar(fechaLarga(ahora))}` : "\xA0"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-0.5 text-xl font-extrabold",
					children: "Hola, operador"
				})]
			})
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mb-2 text-sm font-bold text-slate-700",
					children: "¿En qué vas a trabajar?"
				}),
				/* @__PURE__ */ jsx(ToggleGroup, {
					value: [areaId],
					className: "mb-6 flex w-full flex-wrap justify-start gap-2",
					children: AREAS_TRABAJO.map((a) => /* @__PURE__ */ jsxs(ToggleGroupItem, {
						value: a.id,
						onClick: () => seleccionar(a.id),
						className: "h-auto gap-1.5 rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 bg-white hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
						children: [/* @__PURE__ */ jsx(IconoArea, { area: a }), a.titulo]
					}, a.id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(IconoArea, {
							area,
							size: 18,
							className: "text-c3"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-base font-extrabold text-slate-900",
							children: area.titulo
						}),
						area.descripcion && /* @__PURE__ */ jsxs("span", {
							className: "text-sm text-slate-500",
							children: ["· ", area.descripcion]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: area.subrutas.map((s, i) => /* @__PURE__ */ jsx(TileAcceso, {
						subruta: s,
						href: rutaAcceso(idRol, area, s),
						destacado: i === 0
					}, s.ruta))
				}, area.id)
			]
		})]
	});
}
//#endregion
export { InicioOperador as t };
