import { n as Button } from "./input_fNj7IM-d.mjs";
import { ArrowLeft } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/layout/Header.jsx
var CLASES_ACCION = "h-11 gap-2 bg-white font-bold text-c3 shadow-md hover:bg-slate-100";
function Header({ titulo, subtitulo, volver = false, accion = null, contador = null, children = null }) {
	const IconoAccion = accion?.icono;
	const manejarVolver = () => {
		if (window.history.length > 1) window.history.back();
		else if (typeof volver === "string") window.location.href = volver;
	};
	const textoContador = typeof contador === "string" ? contador : contador ? `${contador.valor} ${contador.valor === 1 ? contador.singular : contador.plural}` : null;
	let botonAccion = null;
	if (accion) {
		const contenido = /* @__PURE__ */ jsxs(Fragment, { children: [IconoAccion && /* @__PURE__ */ jsx(IconoAccion, {
			size: 16,
			strokeWidth: 2.75
		}), accion.texto] });
		botonAccion = accion.href ? /* @__PURE__ */ jsx(Button, {
			asChild: true,
			className: CLASES_ACCION,
			children: /* @__PURE__ */ jsx("a", {
				href: accion.href,
				className: "inline-flex items-center gap-2 whitespace-nowrap",
				children: contenido
			})
		}) : /* @__PURE__ */ jsx(Button, {
			onClick: accion.onClick,
			className: CLASES_ACCION,
			children: contenido
		});
	}
	return /* @__PURE__ */ jsxs("header", {
		className: "flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-c3 to-c4 px-5 py-4 text-white sm:px-7",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [volver && /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				onClick: manejarVolver,
				"aria-label": "Volver",
				className: "h-11 w-11 shrink-0 rounded-full p-0 text-white hover:bg-white/15 hover:text-white",
				children: /* @__PURE__ */ jsx(ArrowLeft, {
					size: 19,
					strokeWidth: 2.75
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-white/80",
					children: titulo
				}), /* @__PURE__ */ jsx("div", {
					className: "text-xl font-extrabold",
					children: subtitulo
				})]
			})]
		}), (children || botonAccion || textoContador) && /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-3 sm:flex-row sm:justify-end",
			children: [
				children,
				textoContador && /* @__PURE__ */ jsx("div", {
					className: "rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold",
					children: textoContador
				}),
				botonAccion
			]
		})]
	});
}
//#endregion
export { Header as t };
