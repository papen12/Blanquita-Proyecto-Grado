import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { t as SelectEntidad } from "./Selectentidad_BdaWuz7z.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, PackageCheck, Plus, Trash2 } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/hooks/useIngresoLote.js
var codigosRepetidos = (codigos) => {
	const cuenta = {};
	codigos.forEach((c) => {
		const valor = c.trim().toLowerCase();
		if (valor) cuenta[valor] = (cuenta[valor] || 0) + 1;
	});
	return new Set(Object.keys(cuenta).filter((c) => cuenta[c] > 1));
};
var erroresPorFila = (filas, validar) => filas.reduce((acc, f) => {
	const error = validar(f);
	if (error) acc[f.id] = error;
	return acc;
}, {});
function useFilasLote(filaVacia, alCambiar) {
	const secuencia = useRef(1);
	const refs = useRef({});
	const [filas, setFilas] = useState(() => [{
		id: 0,
		...filaVacia()
	}]);
	const nuevaFila = () => ({
		id: secuencia.current++,
		...filaVacia()
	});
	const actualizarFila = (id, campo, valor) => {
		setFilas((prev) => prev.map((f) => f.id === id ? {
			...f,
			[campo]: valor
		} : f));
		alCambiar();
	};
	const agregarFila = () => {
		const fila = nuevaFila();
		setFilas((prev) => [...prev, fila]);
		alCambiar();
		requestAnimationFrame(() => refs.current[fila.id]?.focus());
	};
	const quitarFila = (id) => {
		setFilas((prev) => prev.length === 1 ? prev : prev.filter((f) => f.id !== id));
		delete refs.current[id];
	};
	const registrarRef = (id) => (el) => {
		refs.current[id] = el;
	};
	const reiniciar = () => setFilas([nuevaFila()]);
	return {
		filas,
		actualizarFila,
		agregarFila,
		quitarFila,
		registrarRef,
		reiniciar
	};
}
function useEnvioLote() {
	const [tocado, setTocado] = useState(false);
	const [enviando, setEnviando] = useState(false);
	const [errorEnvio, setErrorEnvio] = useState("");
	const [resultado, setResultado] = useState(null);
	const guardar = async ({ validar, enviar, alGuardar }) => {
		setTocado(true);
		setErrorEnvio("");
		const error = validar();
		if (error) {
			setErrorEnvio(error);
			return;
		}
		setEnviando(true);
		try {
			const data = await enviar();
			setResultado(data);
			setTocado(false);
			alGuardar(data);
			window.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		} catch (e) {
			setErrorEnvio(e.message);
			toast.error(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return {
		tocado,
		enviando,
		errorEnvio,
		resultado,
		setResultado,
		guardar
	};
}
//#endregion
//#region src/components/IngresoLote/comunes.jsx
var ETIQUETA = "text-xs font-bold uppercase tracking-wide text-slate-600";
function ResultadoLote({ descripcion, children, onCerrar }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3.5",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100",
				children: /* @__PURE__ */ jsx(CheckCircle2, {
					size: 22,
					strokeWidth: 2.5,
					className: "text-emerald-600"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: cn("flex flex-col", children ? "gap-1" : "gap-0.5"),
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-base font-extrabold text-slate-900",
						children: "Lote registrado"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "text-sm text-slate-600",
						children: descripcion
					}),
					children
				]
			})]
		}), /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			onClick: onCerrar,
			className: "h-10 font-bold text-slate-500 hover:text-slate-900",
			children: "Registrar otro lote"
		})]
	});
}
function DatosLote({ descripcion, className = "flex flex-col gap-5 p-5", children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-base font-extrabold text-slate-900",
				children: "Datos del lote"
			}), /* @__PURE__ */ jsx("div", {
				className: "text-sm text-slate-500",
				children: descripcion
			})]
		}), /* @__PURE__ */ jsx("div", {
			className,
			children
		})]
	});
}
function ErrorReintentar({ mensaje, onReintentar, className }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-600", className),
		children: [mensaje, /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			onClick: onReintentar,
			className: "h-9 border-red-300 font-bold text-red-600 hover:bg-red-100",
			children: "Reintentar"
		})]
	});
}
function SelectorProveedor({ catalogo, valor, onCambio, invalido, className = "flex flex-col gap-1.5" }) {
	const { datos, cargando, error, recargar } = catalogo;
	return /* @__PURE__ */ jsxs("div", {
		className,
		children: [
			/* @__PURE__ */ jsx(Label, {
				className: ETIQUETA,
				children: "Proveedor"
			}),
			cargando && /* @__PURE__ */ jsx(Skeleton, { className: "h-11 w-full rounded-lg" }),
			!cargando && error && /* @__PURE__ */ jsx(ErrorReintentar, {
				mensaje: error,
				onReintentar: recargar,
				className: "py-2.5"
			}),
			!cargando && !error && datos.length === 0 && /* @__PURE__ */ jsx("div", {
				className: "rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400",
				children: "No hay proveedores registrados."
			}),
			!cargando && !error && datos.length > 0 && /* @__PURE__ */ jsx(SelectEntidad, {
				opciones: datos,
				valor,
				onCambio,
				campoValor: "IdProveedor",
				campoEtiqueta: "NombreProveedor",
				placeholder: "Selecciona el proveedor",
				invalido
			})
		]
	});
}
function SelectorTipo({ catalogo, valor, onCambio, campoValor, campoEtiqueta, campoDescripcion, etiqueta, mensajeVacio, cantidadSkeleton = 4 }) {
	const { datos, cargando, error, recargar } = catalogo;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsx(Label, {
				className: ETIQUETA,
				children: etiqueta
			}),
			cargando && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: Array.from({ length: cantidadSkeleton }, (_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 rounded-lg" }, i))
			}),
			!cargando && error && /* @__PURE__ */ jsx(ErrorReintentar, {
				mensaje: error,
				onReintentar: recargar,
				className: "py-3"
			}),
			!cargando && !error && datos.length === 0 && /* @__PURE__ */ jsx("div", {
				className: "rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400",
				children: mensajeVacio
			}),
			!cargando && !error && datos.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: datos.map((t) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => onCambio(t[campoValor]),
					className: cn("rounded-lg border-2 px-3 text-sm font-bold transition-colors", campoDescripcion ? "flex h-14 flex-col items-center justify-center" : "h-12", valor === t[campoValor] ? "border-c3 bg-c1/15 text-c3" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
					children: campoDescripcion ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", { children: t[campoEtiqueta] }), t[campoDescripcion] && /* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-semibold text-slate-500",
						children: t[campoDescripcion]
					})] }) : t[campoEtiqueta]
				}, t[campoValor]))
			})
		]
	});
}
function EncabezadoFilas({ titulo, tipo, nota, textoAgregar, onAgregar }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "text-base font-extrabold text-slate-900",
					children: titulo
				}),
				tipo && /* @__PURE__ */ jsx(Badge, {
					variant: "outline",
					className: "border-c3 font-bold text-c3",
					children: tipo
				}),
				nota && /* @__PURE__ */ jsx("div", {
					className: "text-sm text-slate-500",
					children: nota
				})
			]
		}), /* @__PURE__ */ jsxs(Button, {
			onClick: onAgregar,
			className: "h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90",
			children: [/* @__PURE__ */ jsx(Plus, {
				size: 16,
				strokeWidth: 2.75
			}), textoAgregar]
		})]
	});
}
function BotonQuitarFila({ onClick, disabled, className = "h-10 w-10" }) {
	return /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		onClick,
		disabled,
		className: cn("p-0 text-slate-400 hover:bg-red-50 hover:text-red-600", className),
		children: /* @__PURE__ */ jsx(Trash2, {
			size: 16,
			strokeWidth: 2.5
		})
	});
}
function CabeceraFila({ titulo, onQuitar, deshabilitado }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-xs font-bold uppercase tracking-wide text-slate-500",
			children: titulo
		}), /* @__PURE__ */ jsx(BotonQuitarFila, {
			onClick: onQuitar,
			disabled: deshabilitado,
			className: "h-9 w-9"
		})]
	});
}
function ErroresFilas({ filas, errores }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-1 border-t border-slate-100 bg-red-50 px-5 py-3",
		children: filas.map((f, i) => errores[f.id] ? /* @__PURE__ */ jsxs("div", {
			className: "text-[12.5px] font-semibold text-red-600",
			children: [
				"Fila ",
				i + 1,
				": ",
				errores[f.id]
			]
		}, f.id) : null)
	});
}
function ErrorFila({ mensaje }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-1.5 text-[12.5px] font-semibold text-red-600",
		children: [/* @__PURE__ */ jsx(AlertCircle, {
			size: 14,
			strokeWidth: 2.5
		}), mensaje]
	});
}
function ErrorEnvio({ mensaje }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600",
		children: [/* @__PURE__ */ jsx(AlertCircle, {
			size: 16,
			strokeWidth: 2.5
		}), mensaje]
	});
}
function BarraGuardarLote({ listo, enviando, onGuardar, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "mt-6 rounded-2xl bg-slate-900 px-5 py-4 shadow-sm sm:px-7",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex w-full flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-center gap-x-5 gap-y-1 text-sm",
				children
			}), /* @__PURE__ */ jsx(Button, {
				onClick: onGuardar,
				disabled: enviando,
				className: cn("h-11 gap-2 bg-white/15 font-extrabold text-white hover:bg-white/15", listo && "bg-gradient-to-r from-c3 to-c4 hover:opacity-90"),
				children: enviando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
					size: 16,
					className: "animate-spin"
				}), "Guardando..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(PackageCheck, {
					size: 16,
					strokeWidth: 2.75
				}), "Guardar lote"] })
			})]
		})
	});
}
//#endregion
export { EncabezadoFilas as a, ErroresFilas as c, SelectorTipo as d, codigosRepetidos as f, useFilasLote as h, DatosLote as i, ResultadoLote as l, useEnvioLote as m, BotonQuitarFila as n, ErrorEnvio as o, erroresPorFila as p, CabeceraFila as r, ErrorFila as s, BarraGuardarLote as t, SelectorProveedor as u };
