import { r as aEntero } from "./api_B8jC8QYh.mjs";
import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { Check, Minus, PackageOpen, Plus } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/InventarioProductos/comunes.jsx
var UMBRAL_BAJO = 10;
var estadoStock = (cantidad) => {
	const valor = Number(cantidad || 0);
	if (valor === 0) return "agotado";
	if (valor < UMBRAL_BAJO) return "bajo";
	return "disponible";
};
var ESTILO_ESTADO = {
	disponible: {
		texto: "Disponible",
		clase: "bg-emerald-50 text-emerald-700"
	},
	bajo: {
		texto: "Stock bajo",
		clase: "bg-amber-50 text-amber-700"
	},
	agotado: {
		texto: "Sin stock",
		clase: "bg-slate-100 text-slate-500"
	}
};
var descripcionContenido = (p) => {
	const partes = [];
	if (p.CantidadRollosUnidades) partes.push(`${p.CantidadRollosUnidades} u/paq`);
	if (p.CantidadPorUnidadTerminada) partes.push(`${p.CantidadPorUnidadTerminada} por ${(p.TipoContenedor || "unidad").toLowerCase()}`);
	return partes.length > 0 ? partes.join(" · ") : "-";
};
var TONOS = {
	ingreso: {
		lleno: "border-emerald-400 bg-emerald-50 text-emerald-800",
		marcada: "border-emerald-300 bg-emerald-50",
		textoMarcada: "text-emerald-700",
		nuevo: "text-emerald-700"
	},
	correccion: {
		lleno: "border-red-400 bg-red-50 text-red-800",
		marcada: "border-red-300 bg-red-50",
		textoMarcada: "text-red-700",
		nuevo: "text-red-700"
	}
};
function BadgeEstado({ cantidad, className }) {
	const estado = estadoStock(cantidad);
	return /* @__PURE__ */ jsx(Badge, {
		variant: "outline",
		className: cn("border-0 text-[11px] font-bold", ESTILO_ESTADO[estado].clase, className),
		children: ESTILO_ESTADO[estado].texto
	});
}
function ControlCantidad({ valor, onChange, maximo, tono = "ingreso", autoFocus = false, invalido = false, etiqueta = "Cantidad" }) {
	const numero = aEntero(valor);
	const ajustar = (delta) => {
		const siguiente = Math.min(maximo, Math.max(0, numero + delta));
		onChange(siguiente === 0 ? "" : String(siguiente));
	};
	const manejarCambio = (e) => {
		const limpio = e.target.value.replace(/\D/g, "");
		if (limpio === "") return onChange("");
		const acotado = Math.min(maximo, Number(limpio));
		onChange(acotado === 0 ? "" : String(acotado));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-1.5",
		children: [
			/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "outline",
				onClick: () => ajustar(-1),
				disabled: numero === 0,
				"aria-label": "Restar una unidad",
				className: "h-11 w-11 shrink-0 border-2 border-slate-200 p-0 text-slate-600",
				children: /* @__PURE__ */ jsx(Minus, {
					size: 16,
					strokeWidth: 3
				})
			}),
			/* @__PURE__ */ jsx(Input, {
				inputMode: "numeric",
				value: valor,
				onChange: manejarCambio,
				placeholder: "0",
				autoFocus,
				"aria-label": etiqueta,
				className: cn("h-11 w-full min-w-0 text-center text-lg font-extrabold tabular-nums", numero > 0 && TONOS[tono].lleno, invalido && numero === 0 && "border-red-400 ring-1 ring-red-200")
			}),
			/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "outline",
				onClick: () => ajustar(1),
				disabled: numero >= maximo,
				"aria-label": "Sumar una unidad",
				className: "h-11 w-11 shrink-0 border-2 border-slate-200 p-0 text-slate-600",
				children: /* @__PURE__ */ jsx(Plus, {
					size: 16,
					strokeWidth: 3
				})
			})
		]
	});
}
function PildorasLinea({ lineas, linea, onCambio, contadores }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
			children: "Línea de producto"
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap gap-2",
			children: lineas.map((nombre) => {
				const activa = linea === nombre;
				const contador = contadores?.get(nombre) ?? 0;
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => onCambio(nombre),
					"aria-pressed": activa,
					className: cn("flex min-h-10 items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors", activa ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"),
					children: [nombre, contador > 0 && /* @__PURE__ */ jsx("span", {
						className: cn("min-w-5 rounded-full px-1.5 text-center text-[11.5px] font-extrabold tabular-nums", activa ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"),
						children: contador
					})]
				}, nombre);
			})
		})]
	});
}
function SinLineaSeleccionada() {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-5 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400",
		children: [/* @__PURE__ */ jsx(PackageOpen, {
			size: 26,
			strokeWidth: 2
		}), "Selecciona una línea para ver sus presentaciones"]
	});
}
function OpcionPresentacion({ presentacion, marcada = false, textoMarcada = "Agregada", deshabilitada = false, tono = "ingreso", onSeleccionar }) {
	const IconoAccion = tono === "correccion" ? Minus : Plus;
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onSeleccionar(presentacion),
		disabled: marcada || deshabilitada,
		className: cn("flex flex-col gap-1.5 rounded-xl border-2 px-3.5 py-3 text-left transition-colors", marcada && cn("cursor-default", TONOS[tono].marcada), deshabilitada && "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60", !marcada && !deshabilitada && "border-slate-200 bg-white hover:border-c4 hover:bg-c4/5"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-mono text-[15px] font-extrabold text-c3",
						children: presentacion.CodigoPresentacion
					}),
					marcada && /* @__PURE__ */ jsxs("span", {
						className: cn("flex items-center gap-1 text-[11.5px] font-extrabold uppercase", TONOS[tono].textoMarcada),
						children: [/* @__PURE__ */ jsx(Check, {
							size: 13,
							strokeWidth: 3
						}), textoMarcada]
					}),
					deshabilitada && !marcada && /* @__PURE__ */ jsx("span", {
						className: "text-[11.5px] font-extrabold uppercase text-slate-400",
						children: "Sin stock"
					}),
					!marcada && !deshabilitada && /* @__PURE__ */ jsx(IconoAccion, {
						size: 16,
						strokeWidth: 3,
						className: "text-slate-400"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "text-[12.5px] text-slate-600",
				children: [
					presentacion.TipoContenedor,
					" · ",
					descripcionContenido(presentacion)
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "text-[12px] font-semibold text-slate-400",
				children: [
					"Stock actual:",
					" ",
					/* @__PURE__ */ jsx("span", {
						className: "font-extrabold tabular-nums text-slate-700",
						children: presentacion.CantidadActual
					})
				]
			})
		]
	});
}
function ResumenStock({ actual, nuevo, tono = "ingreso" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 py-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-1",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
				children: "Stock actual"
			}), /* @__PURE__ */ jsx("span", {
				className: "text-2xl font-extrabold tabular-nums leading-none text-slate-900",
				children: actual
			})]
		}), nuevo !== null && /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-end gap-1",
			children: [/* @__PURE__ */ jsx("span", {
				className: cn("text-[12px] font-bold uppercase tracking-wide", TONOS[tono].nuevo),
				children: "Quedará en"
			}), /* @__PURE__ */ jsx("span", {
				className: cn("text-2xl font-extrabold tabular-nums leading-none", TONOS[tono].nuevo),
				children: nuevo
			})]
		})]
	});
}
//#endregion
export { PildorasLinea as a, descripcionContenido as c, OpcionPresentacion as i, estadoStock as l, ControlCantidad as n, ResumenStock as o, ESTILO_ESTADO as r, SinLineaSeleccionada as s, BadgeEstado as t };
