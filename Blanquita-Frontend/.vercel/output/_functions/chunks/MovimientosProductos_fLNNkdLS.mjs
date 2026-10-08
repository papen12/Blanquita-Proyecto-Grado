import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion, r as aEntero } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { i as insertarIngresoProductoTerminado, n as ajustePositivoInventarioProductoTerminado, r as corregirInventarioProductoTerminado, s as verInventarioProductoTerminado, t as ajusteNegativoInventarioProductoTerminado } from "./Inventario_DSn0sOXY.mjs";
import { a as MotivosAjustePositivoProductoTerminado, i as MotivosAjusteNegativoProductoTerminado, o as MotivosCorreccionProductoTerminado } from "./OperadorConfig_tt2Z91F-.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs_DwRtTS0P.mjs";
import { a as PildorasLinea, c as descripcionContenido, i as OpcionPresentacion, n as ControlCantidad, o as ResumenStock, s as SinLineaSeleccionada, t as BadgeEstado } from "./comunes_BIPOnEVR.mjs";
import { useEffect, useMemo, useState } from "react";
import { ClipboardMinus, ClipboardPlus, ListChecks, Loader2, PackageCheck, PackageMinus, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/InventarioProductos/IngresoProductos.jsx
var CANTIDAD_MAXIMA_INGRESO = 100;
var construirObservacion = (lineas) => `Ingreso a inventario: ${lineas.map((l) => `${l.cantidadNum} ${l.nombreProducto} (${l.codigo})`).join(", ")}`;
function CardIngreso({ presentacion, valor, autoFocus, invalido, onChange, onQuitar }) {
	const cantidad = aEntero(valor);
	const actual = Number(presentacion.CantidadActual || 0);
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-4 shadow-sm", cantidad > 0 ? "border-emerald-300" : "border-slate-200"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-2.5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 flex-col gap-1",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-mono text-[16px] font-extrabold text-c3",
								children: presentacion.CodigoPresentacion
							}), /* @__PURE__ */ jsx(BadgeEstado, { cantidad: presentacion.CantidadActual })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-[13px] font-semibold text-slate-900",
							children: presentacion.NombreProducto
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-[12.5px] text-slate-600",
							children: [
								presentacion.TipoContenedor,
								" · ",
								descripcionContenido(presentacion)
							]
						})
					]
				}), /* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onQuitar(presentacion.IdPresentacion),
					"aria-label": `Quitar ${presentacion.CodigoPresentacion}`,
					className: "h-9 w-9 shrink-0 p-0 text-slate-400 hover:text-red-600",
					children: /* @__PURE__ */ jsx(X, {
						size: 17,
						strokeWidth: 2.75
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
					children: "Cantidad a ingresar"
				}), /* @__PURE__ */ jsx(ControlCantidad, {
					valor,
					onChange,
					maximo: CANTIDAD_MAXIMA_INGRESO,
					autoFocus,
					invalido,
					etiqueta: "Cantidad a ingresar"
				})]
			}),
			/* @__PURE__ */ jsx(ResumenStock, {
				actual,
				nuevo: cantidad > 0 ? actual + cantidad : null
			})
		]
	});
}
function IngresoProductoTerminado({ inventario, onStockActualizado }) {
	const [linea, setLinea] = useState("");
	const [items, setItems] = useState([]);
	const [ultimoAgregado, setUltimoAgregado] = useState(null);
	const [tocado, setTocado] = useState(false);
	const [confirmando, setConfirmando] = useState(false);
	const [enviando, setEnviando] = useState(false);
	const lineas = useMemo(() => Array.from(new Set(inventario.map((p) => p.NombreProducto))), [inventario]);
	const presentacionesLinea = useMemo(() => inventario.filter((p) => p.NombreProducto === linea), [inventario, linea]);
	const presentacionDe = (idPresentacion) => inventario.find((p) => p.IdPresentacion === idPresentacion);
	const idsAgregados = useMemo(() => new Set(items.map((i) => i.IdPresentacion)), [items]);
	const agregadasPorLinea = useMemo(() => {
		const conteo = /* @__PURE__ */ new Map();
		items.forEach((i) => {
			const nombre = presentacionDe(i.IdPresentacion)?.NombreProducto;
			if (nombre) conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
		});
		return conteo;
	}, [items, inventario]);
	const lineasValidas = items.map((i) => ({
		...i,
		cantidadNum: aEntero(i.cantidad)
	})).filter((i) => i.cantidadNum > 0);
	const totalUnidades = lineasValidas.reduce((s, i) => s + i.cantidadNum, 0);
	const observacion = construirObservacion(lineasValidas.map((i) => {
		const p = presentacionDe(i.IdPresentacion);
		return {
			cantidadNum: i.cantidadNum,
			nombreProducto: p?.NombreProducto ?? "",
			codigo: p?.CodigoPresentacion ?? ""
		};
	}));
	const hayIncompletas = items.length > lineasValidas.length;
	const agregarPresentacion = (presentacion) => {
		if (idsAgregados.has(presentacion.IdPresentacion)) return;
		setItems((prev) => [...prev, {
			IdPresentacion: presentacion.IdPresentacion,
			cantidad: ""
		}]);
		setUltimoAgregado(presentacion.IdPresentacion);
	};
	const cambiarCantidad = (idPresentacion, valor) => setItems((prev) => prev.map((i) => i.IdPresentacion === idPresentacion ? {
		...i,
		cantidad: valor
	} : i));
	const quitarPresentacion = (idPresentacion) => setItems((prev) => prev.filter((i) => i.IdPresentacion !== idPresentacion));
	const limpiar = () => {
		setItems([]);
		setTocado(false);
		setUltimoAgregado(null);
	};
	const solicitarConfirmacion = () => {
		setTocado(true);
		if (items.length === 0) return;
		if (hayIncompletas) {
			toast.error("Ingresa una cantidad en todas las tarjetas o quita las que no uses");
			return;
		}
		setConfirmando(true);
	};
	const confirmarIngreso = async () => {
		const payload = lineasValidas.map((i) => ({
			IdPresentacion: i.IdPresentacion,
			Cantidad: i.cantidadNum,
			Observacion: observacion
		}));
		setEnviando(true);
		try {
			const respuesta = await insertarIngresoProductoTerminado(payload);
			onStockActualizado(respuesta);
			toast.success(`Ingreso registrado: ${respuesta.length} presentación(es), ${totalUnidades} unidades`);
			limpiar();
			setConfirmando(false);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200",
				children: [/* @__PURE__ */ jsx(PildorasLinea, {
					lineas,
					linea,
					onCambio: setLinea,
					contadores: agregadasPorLinea
				}), linea ? /* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex flex-col gap-2.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
						children: ["Presentaciones de ", linea]
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
						children: presentacionesLinea.map((p) => /* @__PURE__ */ jsx(OpcionPresentacion, {
							presentacion: p,
							marcada: idsAgregados.has(p.IdPresentacion),
							onSeleccionar: agregarPresentacion
						}, p.IdPresentacion))
					})]
				}) : /* @__PURE__ */ jsx(SinLineaSeleccionada, {})]
			}),
			items.length > 0 && /* @__PURE__ */ jsxs("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 px-1",
						children: [/* @__PURE__ */ jsx(ListChecks, {
							size: 17,
							strokeWidth: 2.5,
							className: "text-c3"
						}), /* @__PURE__ */ jsx("h2", {
							className: "text-[15px] font-extrabold text-slate-900",
							children: "Ingreso a registrar"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
						children: items.map((i) => {
							const p = presentacionDe(i.IdPresentacion);
							if (!p) return null;
							return /* @__PURE__ */ jsx(CardIngreso, {
								presentacion: p,
								valor: i.cantidad,
								autoFocus: ultimoAgregado === i.IdPresentacion,
								invalido: tocado,
								onChange: (v) => cambiarCantidad(i.IdPresentacion, v),
								onQuitar: quitarPresentacion
							}, i.IdPresentacion);
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-2 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "text-[14px] font-extrabold text-slate-900",
								children: [
									lineasValidas.length,
									" ",
									lineasValidas.length === 1 ? "presentación" : "presentaciones",
									" ",
									"· ",
									totalUnidades,
									" u.",
									/* @__PURE__ */ jsxs("span", {
										className: "ml-2 text-[12px] font-semibold text-slate-400",
										children: [
											"Máx. ",
											CANTIDAD_MAXIMA_INGRESO,
											" por presentación"
										]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									onClick: limpiar,
									className: "h-11 font-bold text-slate-500 hover:text-slate-900",
									children: "Limpiar"
								}), /* @__PURE__ */ jsxs(Button, {
									onClick: solicitarConfirmacion,
									className: "h-11 gap-2 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700",
									children: [/* @__PURE__ */ jsx(PackageCheck, {
										size: 16,
										strokeWidth: 2.75
									}), "Registrar ingreso"]
								})]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: confirmando,
				onOpenChange: (abierto) => !enviando && setConfirmando(abierto),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, {
							className: "text-lg font-extrabold",
							children: "Confirmar ingreso"
						}), /* @__PURE__ */ jsxs(DialogDescription, { children: [
							lineasValidas.length,
							" ",
							lineasValidas.length === 1 ? "presentación" : "presentaciones",
							" ·",
							" ",
							totalUnidades,
							" unidades. Esta acción no se puede deshacer desde aquí."
						] })] }),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12.5px] text-slate-600",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-500",
								children: "Observación: "
							}), observacion]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200",
							children: lineasValidas.map((l) => {
								const p = presentacionDe(l.IdPresentacion);
								if (!p) return null;
								const actual = Number(p.CantidadActual || 0);
								return /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between gap-3 px-3.5 py-2.5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-col",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-mono text-[13.5px] font-extrabold text-c3",
											children: p.CodigoPresentacion
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[12px] text-slate-500",
											children: p.NombreProducto
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-right",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "text-[15px] font-extrabold tabular-nums text-emerald-700",
											children: ["+", l.cantidadNum]
										}), /* @__PURE__ */ jsxs("div", {
											className: "text-[11.5px] tabular-nums text-slate-400",
											children: [
												actual,
												" → ",
												actual + l.cantidadNum
											]
										})]
									})]
								}, l.IdPresentacion);
							})
						}),
						/* @__PURE__ */ jsxs(DialogFooter, {
							className: "gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								onClick: () => setConfirmando(false),
								disabled: enviando,
								className: "h-11 font-bold text-slate-500 hover:text-slate-900",
								children: "Volver"
							}), /* @__PURE__ */ jsx(Button, {
								onClick: confirmarIngreso,
								disabled: enviando,
								className: "h-11 gap-2 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700",
								children: enviando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}), "Registrando..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(PackageCheck, {
									size: 16,
									strokeWidth: 2.75
								}), "Confirmar"] })
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/components/InventarioProductos/CorreccionProductos.jsx
var CANTIDAD_MAXIMA_CORRECCION = 50;
var CLASES_RESTA = {
	borde: "border-red-300",
	motivo: "border-red-400 bg-red-50 text-red-700",
	boton: "bg-red-600 hover:bg-red-700",
	cantidad: "text-red-700"
};
var TIPOS = {
	descuento: {
		signo: -1,
		tono: "correccion",
		Icono: PackageMinus,
		motivos: MotivosCorreccionProductoTerminado,
		registrar: corregirInventarioProductoTerminado,
		titulo: "Corrección",
		nombre: "corrección",
		accion: "descontar",
		confirmacion: (cantidad) => `Se descontarán ${cantidad} unidades del inventario.`,
		exito: "Corrección registrada",
		cantidadMaxima: CANTIDAD_MAXIMA_CORRECCION,
		clases: CLASES_RESTA
	},
	ajustePositivo: {
		signo: 1,
		tono: "ingreso",
		Icono: ClipboardPlus,
		motivos: MotivosAjustePositivoProductoTerminado,
		registrar: ajustePositivoInventarioProductoTerminado,
		titulo: "Ajuste positivo",
		nombre: "ajuste positivo",
		accion: "sumar",
		confirmacion: (cantidad) => `Se sumarán ${cantidad} unidades al inventario.`,
		exito: "Ajuste positivo registrado",
		cantidadMaxima: 500,
		clases: {
			borde: "border-emerald-300",
			motivo: "border-emerald-400 bg-emerald-50 text-emerald-700",
			boton: "bg-emerald-600 hover:bg-emerald-700",
			cantidad: "text-emerald-700"
		}
	},
	ajusteNegativo: {
		signo: -1,
		tono: "correccion",
		Icono: ClipboardMinus,
		motivos: MotivosAjusteNegativoProductoTerminado,
		registrar: ajusteNegativoInventarioProductoTerminado,
		titulo: "Ajuste negativo",
		nombre: "ajuste negativo",
		accion: "restar",
		confirmacion: (cantidad) => `Se restarán ${cantidad} unidades del inventario.`,
		exito: "Ajuste negativo registrado",
		cantidadMaxima: 500,
		clases: CLASES_RESTA
	}
};
var esObservacionValida = (texto) => {
	const largo = texto.trim().length;
	return largo >= 5 && largo <= 150;
};
function CardCorreccion({ config, presentacion, valor, maximo, observacion, invalido, onCantidad, onObservacion, onQuitar }) {
	const cantidad = aEntero(valor);
	const actual = Number(presentacion.CantidadActual || 0);
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-4 shadow-sm", cantidad > 0 ? config.clases.borde : "border-slate-200"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-2.5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 flex-col gap-1",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-mono text-[16px] font-extrabold text-c3",
								children: presentacion.CodigoPresentacion
							}), /* @__PURE__ */ jsx(BadgeEstado, { cantidad: presentacion.CantidadActual })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-[13px] font-semibold text-slate-900",
							children: presentacion.NombreProducto
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-[12.5px] text-slate-600",
							children: [
								presentacion.TipoContenedor,
								" · ",
								descripcionContenido(presentacion)
							]
						})
					]
				}), /* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "ghost",
					onClick: onQuitar,
					"aria-label": `Quitar ${presentacion.CodigoPresentacion}`,
					className: "h-9 w-9 shrink-0 p-0 text-slate-400 hover:text-red-600",
					children: /* @__PURE__ */ jsx(X, {
						size: 17,
						strokeWidth: 2.75
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
						children: ["Cantidad a ", config.accion]
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-[12px] font-semibold text-slate-400",
						children: ["Máx. ", maximo]
					})]
				}), /* @__PURE__ */ jsx(ControlCantidad, {
					valor,
					onChange: onCantidad,
					maximo,
					tono: config.tono,
					autoFocus: true,
					invalido,
					etiqueta: `Cantidad a ${config.accion}`
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
						children: "Observación"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-2",
						children: config.motivos.map((m) => {
							const activo = observacion.trim() === m;
							return /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => onObservacion(m),
								"aria-pressed": activo,
								className: cn("min-h-10 rounded-xl border-2 px-3 py-1.5 text-left text-[13px] font-bold transition-colors", activo ? config.clases.motivo : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"),
								children: m
							}, m);
						})
					}),
					/* @__PURE__ */ jsx(Textarea, {
						value: observacion,
						onChange: (e) => onObservacion(limpiarObservacion(e.target.value)),
						placeholder: "Elige una opción o escribe la observación",
						maxLength: 150,
						"aria-label": "Observación",
						className: cn("min-h-20", invalido && !esObservacionValida(observacion) && "border-red-400 ring-1 ring-red-200")
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-slate-500",
						children: [
							observacion.trim().length,
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
			/* @__PURE__ */ jsx(ResumenStock, {
				actual,
				nuevo: cantidad > 0 ? actual + config.signo * cantidad : null,
				tono: config.tono
			})
		]
	});
}
function CorreccionProductoTerminado({ inventario, onStockActualizado, tipo = "descuento" }) {
	const config = TIPOS[tipo];
	const { Icono } = config;
	const signoTexto = config.signo > 0 ? "+" : "-";
	const [linea, setLinea] = useState("");
	const [idSeleccionada, setIdSeleccionada] = useState(null);
	const [cantidad, setCantidad] = useState("");
	const [observacion, setObservacion] = useState("");
	const [tocado, setTocado] = useState(false);
	const [confirmando, setConfirmando] = useState(false);
	const [enviando, setEnviando] = useState(false);
	const lineas = useMemo(() => Array.from(new Set(inventario.map((p) => p.NombreProducto))), [inventario]);
	const presentacionesLinea = useMemo(() => inventario.filter((p) => p.NombreProducto === linea), [inventario, linea]);
	const seleccionada = idSeleccionada === null ? null : inventario.find((p) => p.IdPresentacion === idSeleccionada) ?? null;
	const actual = Number(seleccionada?.CantidadActual || 0);
	const maximo = config.signo < 0 ? Math.min(actual, config.cantidadMaxima) : config.cantidadMaxima;
	const cantidadNum = aEntero(cantidad);
	const observacionLimpia = observacion.trim();
	const sinStockParaDescontar = (presentacion) => config.signo < 0 && Number(presentacion.CantidadActual || 0) === 0;
	const seleccionar = (presentacion) => {
		if (sinStockParaDescontar(presentacion)) return;
		setIdSeleccionada(presentacion.IdPresentacion);
		setCantidad("");
		setObservacion("");
		setTocado(false);
	};
	const limpiar = () => {
		setIdSeleccionada(null);
		setCantidad("");
		setObservacion("");
		setTocado(false);
	};
	const solicitarConfirmacion = () => {
		setTocado(true);
		if (!seleccionada) return;
		if (cantidadNum === 0) {
			toast.error(`Ingresa la cantidad a ${config.accion}`);
			return;
		}
		if (cantidadNum > maximo) {
			toast.error(`La cantidad máxima a ${config.accion} es ${maximo}`);
			return;
		}
		if (!esObservacionValida(observacion)) {
			toast.error(`La observación debe tener entre 5 y 150 caracteres`);
			return;
		}
		setConfirmando(true);
	};
	const confirmarCorreccion = async () => {
		setEnviando(true);
		try {
			const respuesta = await config.registrar(seleccionada.IdPresentacion, cantidadNum, observacionLimpia);
			onStockActualizado([respuesta]);
			toast.success(`${config.exito}: ${signoTexto}${respuesta.CantidadAplicada} ${respuesta.CodigoPresentacion}`);
			limpiar();
			setConfirmando(false);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200",
				children: [/* @__PURE__ */ jsx(PildorasLinea, {
					lineas,
					linea,
					onCambio: setLinea
				}), linea ? /* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex flex-col gap-2.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
						children: ["Presentaciones de ", linea]
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
						children: presentacionesLinea.map((p) => /* @__PURE__ */ jsx(OpcionPresentacion, {
							presentacion: p,
							tono: config.tono,
							marcada: p.IdPresentacion === idSeleccionada,
							textoMarcada: "Seleccionada",
							deshabilitada: sinStockParaDescontar(p),
							onSeleccionar: seleccionar
						}, p.IdPresentacion))
					})]
				}) : /* @__PURE__ */ jsx(SinLineaSeleccionada, {})]
			}),
			seleccionada && /* @__PURE__ */ jsxs("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 px-1",
						children: [/* @__PURE__ */ jsx(ListChecks, {
							size: 17,
							strokeWidth: 2.5,
							className: "text-c3"
						}), /* @__PURE__ */ jsxs("h2", {
							className: "text-[15px] font-extrabold text-slate-900",
							children: [config.titulo, " a registrar"]
						})]
					}),
					/* @__PURE__ */ jsx(CardCorreccion, {
						config,
						presentacion: seleccionada,
						valor: cantidad,
						maximo,
						observacion,
						invalido: tocado,
						onCantidad: setCantidad,
						onObservacion: setObservacion,
						onQuitar: limpiar
					}, seleccionada.IdPresentacion),
					/* @__PURE__ */ jsx("div", {
						className: "mt-2 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "text-[14px] font-extrabold text-slate-900",
								children: [cantidadNum > 0 ? `${signoTexto}${cantidadNum} u. de ${seleccionada.CodigoPresentacion}` : seleccionada.CodigoPresentacion, /* @__PURE__ */ jsxs("span", {
									className: "ml-2 text-[12px] font-semibold text-slate-400",
									children: ["Una presentación por ", config.nombre]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									onClick: limpiar,
									className: "h-11 font-bold text-slate-500 hover:text-slate-900",
									children: "Limpiar"
								}), /* @__PURE__ */ jsxs(Button, {
									onClick: solicitarConfirmacion,
									className: cn("h-11 gap-2 font-extrabold text-white", config.clases.boton),
									children: [
										/* @__PURE__ */ jsx(Icono, {
											size: 16,
											strokeWidth: 2.75
										}),
										"Registrar ",
										config.nombre
									]
								})]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: confirmando,
				onOpenChange: (abierto) => !enviando && setConfirmando(abierto),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs(DialogTitle, {
							className: "text-lg font-extrabold",
							children: ["Confirmar ", config.nombre]
						}), /* @__PURE__ */ jsxs(DialogDescription, { children: [config.confirmacion(cantidadNum), " Esta acción no se puede deshacer desde aquí."] })] }),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12.5px] text-slate-600",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-500",
								children: "Observación: "
							}), observacionLimpia]
						}),
						seleccionada && /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-mono text-[13.5px] font-extrabold text-c3",
									children: seleccionada.CodigoPresentacion
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[12px] text-slate-500",
									children: seleccionada.NombreProducto
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-right",
								children: [/* @__PURE__ */ jsxs("div", {
									className: cn("text-[15px] font-extrabold tabular-nums", config.clases.cantidad),
									children: [signoTexto, cantidadNum]
								}), /* @__PURE__ */ jsxs("div", {
									className: "text-[11.5px] tabular-nums text-slate-400",
									children: [
										actual,
										" → ",
										actual + config.signo * cantidadNum
									]
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(DialogFooter, {
							className: "gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								onClick: () => setConfirmando(false),
								disabled: enviando,
								className: "h-11 font-bold text-slate-500 hover:text-slate-900",
								children: "Volver"
							}), /* @__PURE__ */ jsx(Button, {
								onClick: confirmarCorreccion,
								disabled: enviando,
								className: cn("h-11 gap-2 font-extrabold text-white", config.clases.boton),
								children: enviando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}), "Registrando..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Icono, {
									size: 16,
									strokeWidth: 2.75
								}), "Confirmar"] })
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/components/InventarioProductos/MovimientosProductos.jsx
var SUBTITULO_POR_VISTA = {
	ingreso: "Registrar ingreso",
	correccion: "Registrar corrección",
	ajustePositivo: "Registrar ajuste positivo",
	ajusteNegativo: "Registrar ajuste negativo"
};
function MovimientosProductoTerminado({ usuario }) {
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const [inventario, setInventario] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [vista, setVista] = useState("ingreso");
	useEffect(() => {
		cargarInventario();
	}, []);
	const cargarInventario = async () => {
		setLoading(true);
		setError("");
		try {
			setInventario(await verInventarioProductoTerminado());
		} catch (e) {
			setError(e.message);
			setInventario([]);
		} finally {
			setLoading(false);
		}
	};
	const actualizarStock = (filas) => {
		const actuales = new Map(filas.map((f) => [f.IdPresentacion, f.CantidadActual]));
		setInventario((prev) => prev.map((p) => actuales.has(p.IdPresentacion) ? {
			...p,
			CantidadActual: actuales.get(p.IdPresentacion)
		} : p));
	};
	const claseTab = "gap-1.5 font-bold";
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0",
		children: [/* @__PURE__ */ jsx(Header, {
			titulo: "Movimientos producto terminado",
			subtitulo: SUBTITULO_POR_VISTA[vista],
			volver: `/${esEncargado ? "encargado" : "operador"}/producto/inventario`
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6",
			children: [
				/* @__PURE__ */ jsx(Tabs, {
					value: vista,
					onValueChange: setVista,
					className: "mb-5",
					children: /* @__PURE__ */ jsxs(TabsList, {
						className: cn("grid w-full", esEncargado ? "grid-cols-2 gap-y-[3px] group-data-horizontal/tabs:h-auto md:grid-cols-4" : "grid-cols-2 sm:w-80"),
						children: [
							/* @__PURE__ */ jsxs(TabsTrigger, {
								value: "ingreso",
								className: claseTab,
								children: [/* @__PURE__ */ jsx(PackageCheck, {
									size: 15,
									strokeWidth: 2.75
								}), "Ingreso"]
							}),
							/* @__PURE__ */ jsxs(TabsTrigger, {
								value: "correccion",
								className: claseTab,
								children: [/* @__PURE__ */ jsx(PackageMinus, {
									size: 15,
									strokeWidth: 2.75
								}), "Corrección"]
							}),
							esEncargado && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(TabsTrigger, {
								value: "ajustePositivo",
								className: claseTab,
								children: [/* @__PURE__ */ jsx(ClipboardPlus, {
									size: 15,
									strokeWidth: 2.75
								}), "Ajuste positivo"]
							}), /* @__PURE__ */ jsxs(TabsTrigger, {
								value: "ajusteNegativo",
								className: claseTab,
								children: [/* @__PURE__ */ jsx(ClipboardMinus, {
									size: 15,
									strokeWidth: 2.75
								}), "Ajuste negativo"]
							})] })
						]
					})
				}),
				loading && /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-44 w-full" }), /* @__PURE__ */ jsx(Skeleton, { className: "h-32 w-full" })]
				}),
				error && /* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl bg-white p-6 text-center text-sm font-semibold text-red-600 ring-1 ring-slate-200",
					children: [error, /* @__PURE__ */ jsx("div", {
						className: "mt-3",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							onClick: cargarInventario,
							children: "Reintentar"
						})
					})]
				}),
				!loading && !error && /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsx("div", {
						hidden: vista !== "ingreso",
						children: /* @__PURE__ */ jsx(IngresoProductoTerminado, {
							inventario,
							onStockActualizado: actualizarStock
						})
					}),
					/* @__PURE__ */ jsx("div", {
						hidden: vista !== "correccion",
						children: /* @__PURE__ */ jsx(CorreccionProductoTerminado, {
							tipo: "descuento",
							inventario,
							onStockActualizado: actualizarStock
						})
					}),
					esEncargado && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
						hidden: vista !== "ajustePositivo",
						children: /* @__PURE__ */ jsx(CorreccionProductoTerminado, {
							tipo: "ajustePositivo",
							inventario,
							onStockActualizado: actualizarStock
						})
					}), /* @__PURE__ */ jsx("div", {
						hidden: vista !== "ajusteNegativo",
						children: /* @__PURE__ */ jsx(CorreccionProductoTerminado, {
							tipo: "ajusteNegativo",
							inventario,
							onStockActualizado: actualizarStock
						})
					})] })
				] })
			]
		})]
	});
}
//#endregion
export { MovimientosProductoTerminado as t };
