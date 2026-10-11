import { a as limpiarObservacion } from "./api_B8jC8QYh.mjs";
import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { t as ACENTOS } from "./Acentos_7-zo-5xR.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, PackageX, RotateCcw, Search, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/hooks/useDetalleInventario.js
function useDetalleInventario(cargar, igual = (a, b) => a === b) {
	const [sel, setSel] = useState(null);
	const [datos, setDatos] = useState([]);
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState("");
	const [busqueda, setBusqueda] = useState("");
	const [marcadas, setMarcadas] = useState([]);
	const recargar = async (valor = sel) => {
		if (valor === null) return;
		setCargando(true);
		setError("");
		try {
			setDatos(await cargar(valor));
		} catch (e) {
			setError(e.message);
			setDatos([]);
		} finally {
			setCargando(false);
		}
	};
	const cerrar = () => {
		setSel(null);
		setDatos([]);
		setMarcadas([]);
		setBusqueda("");
	};
	const seleccionar = (valor) => {
		if (sel !== null && igual(sel, valor)) {
			cerrar();
			return;
		}
		setSel(valor);
		setMarcadas([]);
		setBusqueda("");
		recargar(valor);
	};
	return {
		sel,
		datos,
		setDatos,
		cargando,
		error,
		busqueda,
		setBusqueda,
		marcadas,
		setMarcadas,
		seleccionar,
		cerrar,
		recargar
	};
}
//#endregion
//#region src/hooks/useEjecutar.js
function useEjecutar() {
	const [enProceso, setEnProceso] = useState(null);
	const ejecutar = async (clave, accion, exito, alTerminar) => {
		setEnProceso(clave);
		try {
			const resultado = await accion();
			toast.success(typeof exito === "function" ? exito(resultado) : exito);
			alTerminar?.(resultado);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setEnProceso(null);
		}
	};
	return {
		enProceso,
		ejecutar
	};
}
//#endregion
//#region src/components/Inventario/comunes.jsx
var GRID_TARJETAS = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
var TARJETA = "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md";
var MENSAJE = "p-8 text-center text-sm text-slate-400";
var etiquetaStock = (cantidad, umbral) => cantidad === 0 ? "Sin stock" : cantidad < umbral ? "Stock bajo" : "Disponible";
var conAcentos = (lista, { cantidadDe, umbral = 6, desplazamiento = 0 } = {}) => lista.map((t, i) => ({
	...t,
	...ACENTOS[(i + desplazamiento) % ACENTOS.length],
	...cantidadDe ? { badge: etiquetaStock(cantidadDe(t), umbral) } : {}
}));
var coincide = (busqueda, ...valores) => {
	const q = busqueda.trim().toLowerCase();
	return !q || valores.some((v) => String(v ?? "").toLowerCase().includes(q));
};
function TarjetaTipo({ acento, activo, onClick, icono: Icono, claseIcono = "h-8 w-8", grosorIcono = 2, nombre, etiqueta, cantidad, unidad, textoVer, children }) {
	return /* @__PURE__ */ jsxs("button", {
		onClick,
		className: cn(TARJETA, activo ? acento.border : "border-slate-200"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx(Icono, {
						className: cn(claseIcono, "shrink-0", acento.text),
						strokeWidth: grosorIcono
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[17px] font-extrabold text-slate-900",
						children: nombre
					})]
				}), /* @__PURE__ */ jsx(Badge, {
					variant: "outline",
					className: cn("border-0 font-bold", acento.soft, acento.text),
					children: etiqueta
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-baseline gap-1.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: cn("text-4xl font-extrabold tabular-nums", acento.text),
					children: cantidad
				}), /* @__PURE__ */ jsx("div", {
					className: "text-sm font-semibold text-slate-500",
					children: unidad
				})]
			}),
			children,
			/* @__PURE__ */ jsxs("div", {
				className: cn("flex items-center justify-end gap-1.5 text-xs font-bold", acento.text),
				children: [textoVer, /* @__PURE__ */ jsx(ArrowRight, {
					size: 14,
					strokeWidth: 2.75
				})]
			})
		]
	});
}
function DatoTarjeta({ etiqueta, tabular = false, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg bg-slate-50 px-3 py-2.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
			children: etiqueta
		}), /* @__PURE__ */ jsx("div", {
			className: cn("text-sm font-bold text-slate-900", tabular && "tabular-nums"),
			children
		})]
	});
}
function TarjetaFueraInventario({ cantidad, activo, onClick, unidad, textoVer }) {
	return /* @__PURE__ */ jsxs("button", {
		onClick,
		className: cn(TARJETA, activo ? "border-amber-400" : "border-slate-200"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx(PackageX, {
						className: "h-8 w-8 shrink-0 text-amber-600",
						strokeWidth: 2
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[17px] font-extrabold text-slate-900",
						children: "Fuera de inventario"
					})]
				}), /* @__PURE__ */ jsx(Badge, {
					variant: "outline",
					className: "border-0 bg-amber-100 font-bold text-amber-700",
					children: cantidad === 0 ? "Vacío" : "Requiere acción"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-baseline gap-1.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-4xl font-extrabold tabular-nums text-amber-600",
					children: cantidad
				}), /* @__PURE__ */ jsx("div", {
					className: "text-sm font-semibold text-slate-500",
					children: unidad
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg bg-amber-50 px-3 py-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[11px] font-semibold uppercase tracking-wide text-amber-700",
					children: "Acciones disponibles"
				}), /* @__PURE__ */ jsx("div", {
					className: "text-sm font-bold text-slate-900",
					children: "Reingresar al almacén"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-end gap-1.5 text-xs font-bold text-amber-600",
				children: [activo ? "Ocultar lista" : textoVer, /* @__PURE__ */ jsx(ArrowRight, {
					size: 14,
					strokeWidth: 2.75
				})]
			})
		]
	});
}
function EncabezadoCatalogo({ titulo, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-4 flex flex-wrap items-baseline justify-between gap-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-sm font-bold text-slate-700",
			children: titulo
		}), /* @__PURE__ */ jsx("div", {
			className: "text-sm text-slate-500",
			children
		})]
	});
}
function EstadoCatalogo({ cargando, error, vacio = false, mensajeVacio, altoSkeleton, children }) {
	if (cargando) return /* @__PURE__ */ jsx("div", {
		className: GRID_TARJETAS,
		children: [
			0,
			1,
			2
		].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: cn(altoSkeleton, "rounded-2xl") }, i))
	});
	if (error) return /* @__PURE__ */ jsx("div", {
		className: "rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600",
		children: error
	});
	if (vacio) return /* @__PURE__ */ jsx("div", {
		className: "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200",
		children: mensajeVacio
	});
	return children;
}
function BotonCerrar({ onClick }) {
	return /* @__PURE__ */ jsxs(Button, {
		variant: "ghost",
		onClick,
		className: "h-11 gap-1.5 font-bold text-slate-500 hover:text-slate-900",
		children: [/* @__PURE__ */ jsx(X, {
			size: 15,
			strokeWidth: 2.75
		}), "Cerrar"]
	});
}
function PanelDetalle({ acento, icono: Icono, claseIcono = "h-7 w-7", grosorIcono = 2, titulo, subtitulo, etiqueta, onCerrar, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: cn("flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4", acento.soft),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ jsx(Icono, {
						className: cn(claseIcono, "shrink-0", acento.text),
						strokeWidth: grosorIcono
					}),
					/* @__PURE__ */ jsx("div", {
						className: cn("text-base font-extrabold", acento.text),
						children: titulo
					}),
					/* @__PURE__ */ jsx("div", {
						className: "text-sm font-semibold text-slate-500",
						children: subtitulo
					}),
					etiqueta && /* @__PURE__ */ jsx(Badge, {
						variant: "outline",
						className: cn("border font-bold", acento.text, acento.border),
						children: etiqueta
					})
				]
			}), /* @__PURE__ */ jsx(BotonCerrar, { onClick: onCerrar })]
		}), children]
	});
}
function PanelFuera({ titulo, onCerrar, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-amber-50 px-5 py-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-base font-extrabold text-amber-700",
				children: titulo
			}), /* @__PURE__ */ jsx(BotonCerrar, { onClick: onCerrar })]
		}), children]
	});
}
function BuscadorCodigo({ valor, onCambio, placeholder = "Buscar por código..." }) {
	return /* @__PURE__ */ jsx("div", {
		className: "border-b border-slate-100 px-5 py-3.5",
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative max-w-xs",
			children: [
				/* @__PURE__ */ jsx(Search, {
					size: 16,
					strokeWidth: 2.5,
					className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
				}),
				/* @__PURE__ */ jsx(Input, {
					value: valor,
					onChange: (e) => onCambio(e.target.value),
					placeholder,
					className: "h-10 pl-9"
				}),
				valor && /* @__PURE__ */ jsx("button", {
					onClick: () => onCambio(""),
					className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700",
					children: /* @__PURE__ */ jsx(X, {
						size: 15,
						strokeWidth: 2.75
					})
				})
			]
		})
	});
}
function ContenidoLista({ cargando, error, total, cantidadFiltrada = total, buscador = null, mensajeVacio, mensajeSinCoincidencias, filasSkeleton = 3, altoSkeleton = "h-10", children }) {
	const listo = !cargando && !error;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		listo && total > 0 && buscador,
		cargando && /* @__PURE__ */ jsx("div", {
			className: "space-y-2 p-5",
			children: Array.from({ length: filasSkeleton }, (_, i) => /* @__PURE__ */ jsx(Skeleton, { className: cn(altoSkeleton, "w-full") }, i))
		}),
		error && /* @__PURE__ */ jsx("div", {
			className: "p-5 text-center text-sm font-semibold text-red-600",
			children: error
		}),
		listo && total === 0 && /* @__PURE__ */ jsx("div", {
			className: MENSAJE,
			children: mensajeVacio
		}),
		listo && total > 0 && cantidadFiltrada === 0 && /* @__PURE__ */ jsx("div", {
			className: MENSAJE,
			children: mensajeSinCoincidencias
		}),
		listo && cantidadFiltrada > 0 && children
	] });
}
function CasillaSeleccion({ marcada, acento, grande = false, onClick }) {
	const clase = cn("flex items-center justify-center border-2", grande ? "h-6 w-6 shrink-0 rounded-lg" : "h-5 w-5 rounded-md", marcada ? cn(acento.bg, "border-transparent text-white") : "border-slate-300");
	const marca = marcada && /* @__PURE__ */ jsx(Check, {
		size: grande ? 14 : 13,
		strokeWidth: 3.5
	});
	if (onClick) return /* @__PURE__ */ jsx("button", {
		onClick,
		className: clase,
		children: marca
	});
	return /* @__PURE__ */ jsx("span", {
		className: clase,
		children: marca
	});
}
function BadgeReingresada({ fecha }) {
	return /* @__PURE__ */ jsx(Badge, {
		variant: "outline",
		title: fecha ? `Reingresada el ${dateFormatter(fecha)}` : void 0,
		className: "border-amber-300 bg-amber-50 font-sans font-bold text-amber-700",
		children: "Reingresada"
	});
}
function BarraSeleccion({ chips, estado, listo = true, enviando, onEnviar, textoAccion, textoEnviando }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "sticky bottom-0 flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center gap-2.5",
			children: [chips.map((chip) => /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold text-white",
				children: [chip.texto, /* @__PURE__ */ jsx("button", {
					onClick: chip.onQuitar,
					className: "opacity-70 hover:opacity-100",
					children: /* @__PURE__ */ jsx(X, {
						size: 13,
						strokeWidth: 3
					})
				})]
			}, chip.clave)), /* @__PURE__ */ jsx("div", {
				className: "text-sm font-semibold text-slate-400",
				children: estado
			})]
		}), /* @__PURE__ */ jsx(Button, {
			onClick: onEnviar,
			disabled: !listo || enviando,
			className: cn("h-11 gap-2 bg-white/15 font-extrabold text-white hover:bg-white/15", listo && "bg-gradient-to-r from-c3 to-c4 hover:opacity-90"),
			children: enviando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
				size: 16,
				className: "animate-spin"
			}), textoEnviando] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [textoAccion, /* @__PURE__ */ jsx(ArrowRight, {
				size: 16,
				strokeWidth: 2.75
			})] })
		})]
	});
}
function ItemFueraInventario({ codigo, etiqueta, extra, detalle, observacion, fechaMovimiento, procesando, onReingresar, contenidoReingresar = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(RotateCcw, {
	size: 14,
	strokeWidth: 2.75
}), "Reingresar"] }) }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-1.5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-mono text-[15px] font-extrabold text-slate-900",
							children: codigo
						}),
						/* @__PURE__ */ jsx(Badge, {
							variant: "outline",
							className: "border-slate-300 font-bold text-slate-600",
							children: etiqueta
						}),
						extra
					]
				}),
				detalle,
				observacion && /* @__PURE__ */ jsxs("div", {
					className: "text-[12.5px] italic text-slate-500",
					children: [
						"\"",
						observacion,
						"\""
					]
				}),
				fechaMovimiento && /* @__PURE__ */ jsxs("div", {
					className: "text-[11px] text-slate-400",
					children: ["Último movimiento: ", dateFormatter(fechaMovimiento)]
				})
			]
		}), /* @__PURE__ */ jsx(Button, {
			onClick: onReingresar,
			disabled: procesando,
			className: "h-10 gap-2 self-start bg-emerald-600 font-bold text-white hover:bg-emerald-700 sm:self-auto",
			children: procesando ? /* @__PURE__ */ jsx(Loader2, {
				size: 15,
				className: "animate-spin"
			}) : contenidoReingresar
		})]
	});
}
function DialogReingreso({ abierto, titulo, procesando, onCancelar, onConfirmar }) {
	const [observacion, setObservacion] = useState("");
	const observacionLimpia = observacion.trim();
	const valida = observacionLimpia.length >= 5 && observacionLimpia.length <= 150;
	useEffect(() => {
		if (abierto) setObservacion("");
	}, [abierto]);
	return /* @__PURE__ */ jsx(Dialog, {
		open: abierto,
		onOpenChange: (open) => !open && !procesando && onCancelar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs(DialogTitle, { children: ["Reingresar ", titulo] }), /* @__PURE__ */ jsx(DialogDescription, { children: "Vuelve al almacén y queda disponible para producción. Indica cómo llega, por ejemplo si conserva su ficha." })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ jsx(Label, {
							htmlFor: "observacion-reingreso",
							className: "text-xs font-bold uppercase tracking-wide text-slate-600",
							children: "Observación"
						}),
						/* @__PURE__ */ jsx(Textarea, {
							id: "observacion-reingreso",
							value: observacion,
							onChange: (e) => setObservacion(limpiarObservacion(e.target.value)),
							placeholder: "Ej. Llega sin ficha, se identificó por el peso y el tipo...",
							className: "min-h-20",
							maxLength: 150
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500",
							children: [
								observacionLimpia.length,
								"/",
								150,
								" · mínimo",
								" ",
								5,
								" caracteres"
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
					variant: "outline",
					onClick: onCancelar,
					disabled: procesando,
					children: "Cancelar"
				}), /* @__PURE__ */ jsxs(Button, {
					onClick: () => onConfirmar(observacionLimpia),
					disabled: !valida || procesando,
					className: "gap-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700",
					children: [procesando ? /* @__PURE__ */ jsx(Loader2, {
						size: 15,
						className: "animate-spin"
					}) : /* @__PURE__ */ jsx(RotateCcw, {
						size: 14,
						strokeWidth: 2.75
					}), "Reingresar"]
				})] })
			]
		})
	});
}
//#endregion
export { conAcentos as _, ContenidoLista as a, EncabezadoCatalogo as c, ItemFueraInventario as d, PanelDetalle as f, coincide as g, TarjetaTipo as h, CasillaSeleccion as i, EstadoCatalogo as l, TarjetaFueraInventario as m, BarraSeleccion as n, DatoTarjeta as o, PanelFuera as p, BuscadorCodigo as r, DialogReingreso as s, BadgeReingresada as t, GRID_TARJETAS as u, useEjecutar as v, useDetalleInventario as y };
