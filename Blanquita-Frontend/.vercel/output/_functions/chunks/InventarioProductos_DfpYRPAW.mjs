import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion } from "./api_B8jC8QYh.mjs";
import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { c as Sheet, d as SheetFooter, f as SheetHeader, h as cn, i as TooltipProvider, l as SheetContent, o as Skeleton, p as SheetTitle, s as Separator, u as SheetDescription } from "./SideBar_kUHPnrT4.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { a as insertarSalidaProductoTerminado, i as insertarIngresoProductoTerminado, s as verInventarioProductoTerminado } from "./Inventario_DSn0sOXY.mjs";
import { t as BotonDescarga } from "./BotonDescarga_Cx_h4_wb.mjs";
import { t as descargarReporteInventarioProducto } from "./Reportes_CsP8pHUy.mjs";
import { c as descripcionContenido, l as estadoStock, r as ESTILO_ESTADO } from "./comunes_BIPOnEVR.mjs";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Layers, Loader2, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/InventarioProductos/InventarioProductos.jsx
var FILTROS = [
	{
		id: "todos",
		texto: "Todos"
	},
	{
		id: "disponible",
		texto: "Con stock"
	},
	{
		id: "bajo",
		texto: "Stock bajo"
	},
	{
		id: "agotado",
		texto: "Sin stock"
	}
];
function TarjetaResumen({ icono: Icono, valor, etiqueta, tono }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsx("div", {
			className: cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tono),
			children: /* @__PURE__ */ jsx(Icono, {
				size: 22,
				strokeWidth: 2.5
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-3xl font-extrabold tabular-nums text-slate-900",
				children: valor
			}), /* @__PURE__ */ jsx("div", {
				className: "text-[12.5px] font-semibold text-slate-500",
				children: etiqueta
			})]
		})]
	});
}
function FilaEnCarrito({ linea, presentacion, onCantidad, onQuitar }) {
	const esIngreso = linea.Tipo === "ingreso";
	const maximo = esIngreso ? null : Number(presentacion.CantidadActual || 0);
	const ajustar = (delta) => {
		let siguiente = Number(linea.Cantidad || 0) + delta;
		if (siguiente < 1) siguiente = 1;
		if (maximo !== null && siguiente > maximo) siguiente = maximo;
		onCantidad(linea.IdPresentacion, siguiente);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-2.5",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Badge, {
						variant: "outline",
						className: cn("border-0 text-[11px] font-extrabold uppercase", esIngreso ? "bg-emerald-50 text-emerald-700" : "bg-c4/10 text-c3"),
						children: esIngreso ? "Ingreso" : "Salida"
					}), /* @__PURE__ */ jsx("span", {
						className: "font-mono text-sm font-extrabold text-slate-900",
						children: presentacion.CodigoPresentacion
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-[12.5px] text-slate-500",
					children: [
						presentacion.NombreProducto,
						" · stock ",
						presentacion.CantidadActual
					]
				})]
			}), /* @__PURE__ */ jsx("button", {
				onClick: () => onQuitar(linea.IdPresentacion),
				className: "text-slate-400 transition-colors hover:text-red-600",
				children: /* @__PURE__ */ jsx(Trash2, {
					size: 16,
					strokeWidth: 2.5
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-2.5",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-[12px] font-bold uppercase tracking-wide text-slate-400",
				children: "Cantidad"
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => ajustar(-1),
						className: "flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 text-slate-600 hover:border-slate-300",
						children: /* @__PURE__ */ jsx(Minus, {
							size: 14,
							strokeWidth: 3
						})
					}),
					/* @__PURE__ */ jsx(Input, {
						type: "number",
						min: 1,
						value: linea.Cantidad,
						onChange: (e) => {
							const valor = Number(e.target.value);
							if (Number.isNaN(valor)) return;
							if (maximo !== null && valor > maximo) {
								onCantidad(linea.IdPresentacion, maximo);
								return;
							}
							onCantidad(linea.IdPresentacion, valor < 1 ? 1 : valor);
						},
						className: "h-8 w-16 text-center font-bold tabular-nums"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => ajustar(1),
						disabled: maximo !== null && Number(linea.Cantidad) >= maximo,
						className: "flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40",
						children: /* @__PURE__ */ jsx(Plus, {
							size: 14,
							strokeWidth: 3
						})
					})
				]
			})]
		})]
	});
}
function InventarioProductoTerminado({ usuario }) {
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const [inventario, setInventario] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [busqueda, setBusqueda] = useState("");
	const [productoFiltro, setProductoFiltro] = useState("todos");
	const [estadoFiltro, setEstadoFiltro] = useState("todos");
	const [carrito, setCarrito] = useState([]);
	const [carritoAbierto, setCarritoAbierto] = useState(false);
	const [observacionGlobal, setObservacionGlobal] = useState("");
	const [enviando, setEnviando] = useState(false);
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
	const productos = useMemo(() => {
		const nombres = /* @__PURE__ */ new Set();
		inventario.forEach((p) => nombres.add(p.NombreProducto));
		return Array.from(nombres);
	}, [inventario]);
	const filtradas = useMemo(() => {
		const termino = busqueda.trim().toLowerCase();
		return inventario.filter((p) => {
			if (productoFiltro !== "todos" && p.NombreProducto !== productoFiltro) return false;
			if (estadoFiltro !== "todos" && estadoStock(p.CantidadActual) !== estadoFiltro) return false;
			if (!termino) return true;
			return p.CodigoPresentacion.toLowerCase().includes(termino) || p.NombreProducto.toLowerCase().includes(termino) || p.TipoContenedor.toLowerCase().includes(termino);
		});
	}, [
		inventario,
		busqueda,
		productoFiltro,
		estadoFiltro
	]);
	const totalUnidades = inventario.reduce((s, p) => s + Number(p.CantidadActual || 0), 0);
	const totalAgotadas = inventario.filter((p) => Number(p.CantidadActual || 0) === 0).length;
	const buscarPresentacion = (idPresentacion) => inventario.find((p) => p.IdPresentacion === idPresentacion);
	const lineasIngreso = carrito.filter((l) => l.Tipo === "ingreso");
	const lineasSalida = carrito.filter((l) => l.Tipo === "salida");
	const cambiarCantidadLinea = (idPresentacion, cantidad) => {
		setCarrito((prev) => prev.map((l) => l.IdPresentacion === idPresentacion ? {
			...l,
			Cantidad: cantidad
		} : l));
	};
	const quitarLinea = (idPresentacion) => {
		setCarrito((prev) => prev.filter((l) => l.IdPresentacion !== idPresentacion));
	};
	const vaciarCarrito = () => {
		setCarrito([]);
		setObservacionGlobal("");
	};
	const confirmarMovimientos = async () => {
		if (carrito.length === 0) return;
		const observacion = observacionGlobal.trim() ? observacionGlobal.trim() : null;
		const payloadIngreso = lineasIngreso.map((l) => ({
			IdPresentacion: l.IdPresentacion,
			Cantidad: Number(l.Cantidad),
			Observacion: observacion
		}));
		const payloadSalida = lineasSalida.map((l) => ({
			IdPresentacion: l.IdPresentacion,
			Cantidad: Number(l.Cantidad),
			Observacion: observacion
		}));
		setEnviando(true);
		try {
			if (payloadIngreso.length > 0) await insertarIngresoProductoTerminado(payloadIngreso);
			if (payloadSalida.length > 0) await insertarSalidaProductoTerminado(payloadSalida);
			const resumen = [];
			if (payloadIngreso.length > 0) resumen.push(`${payloadIngreso.length} ingreso(s)`);
			if (payloadSalida.length > 0) resumen.push(`${payloadSalida.length} salida(s)`);
			toast.success(`Registrado: ${resumen.join(" y ")}`);
			vaciarCarrito();
			setCarritoAbierto(false);
			cargarInventario();
		} catch (e) {
			toast.error(e.message);
			cargarInventario();
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(Header, {
				titulo: "Almacén · Producto Terminado",
				subtitulo: "Inventario de Producto Terminado",
				children: esEncargado && /* @__PURE__ */ jsx(BotonDescarga, {
					texto: "Reporte stock",
					ayuda: "PDF con el stock actual de todas las líneas y el detalle de cada presentación",
					exito: "Reporte de stock descargado",
					descargar: () => descargarReporteInventarioProducto(null)
				})
			}) }),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ jsx(TarjetaResumen, {
							icono: Boxes,
							valor: totalUnidades,
							etiqueta: "Unidades en almacén",
							tono: "bg-c4/10 text-c3"
						}),
						/* @__PURE__ */ jsx(TarjetaResumen, {
							icono: Layers,
							valor: inventario.length,
							etiqueta: "Presentaciones registradas",
							tono: "bg-slate-100 text-slate-700"
						}),
						/* @__PURE__ */ jsx(TarjetaResumen, {
							icono: AlertTriangle,
							valor: totalAgotadas,
							etiqueta: "Presentaciones sin stock",
							tono: "bg-amber-50 text-amber-700"
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-3.5 border-b border-slate-100 px-5 py-4",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap items-center gap-2.5",
									children: /* @__PURE__ */ jsxs("div", {
										className: "relative min-w-[220px] flex-1",
										children: [
											/* @__PURE__ */ jsx(Search, {
												size: 16,
												strokeWidth: 2.5,
												className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
											}),
											/* @__PURE__ */ jsx(Input, {
												value: busqueda,
												onChange: (e) => setBusqueda(e.target.value),
												placeholder: "Buscar por código, producto o contenedor...",
												className: "h-11 pl-9"
											}),
											busqueda && /* @__PURE__ */ jsx("button", {
												onClick: () => setBusqueda(""),
												className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700",
												children: /* @__PURE__ */ jsx(X, {
													size: 15,
													strokeWidth: 2.75
												})
											})
										]
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => setProductoFiltro("todos"),
										className: cn("rounded-full border-2 px-3.5 py-1.5 text-[12.5px] font-bold transition-colors", productoFiltro === "todos" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"),
										children: "Todos los productos"
									}), productos.map((nombre) => /* @__PURE__ */ jsx("button", {
										onClick: () => setProductoFiltro(nombre),
										className: cn("rounded-full border-2 px-3.5 py-1.5 text-[12.5px] font-bold transition-colors", productoFiltro === nombre ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"),
										children: nombre
									}, nombre))]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [FILTROS.map((f) => /* @__PURE__ */ jsx("button", {
										onClick: () => setEstadoFiltro(f.id),
										className: cn("rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors", estadoFiltro === f.id ? "bg-c4/10 text-c3" : "text-slate-500 hover:bg-slate-50"),
										children: f.texto
									}, f.id)), /* @__PURE__ */ jsxs("div", {
										className: "ml-auto text-[12.5px] font-semibold text-slate-500",
										children: [
											filtradas.length,
											" de ",
											inventario.length
										]
									})]
								})
							]
						}),
						loading && /* @__PURE__ */ jsxs("div", {
							className: "space-y-2 p-5",
							children: [
								/* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }),
								/* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }),
								/* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }),
								/* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" })
							]
						}),
						error && /* @__PURE__ */ jsx("div", {
							className: "p-5 text-center text-sm font-semibold text-red-600",
							children: error
						}),
						!loading && !error && filtradas.length === 0 && /* @__PURE__ */ jsx("div", {
							className: "p-10 text-center text-sm text-slate-400",
							children: "Ninguna presentación coincide con los filtros aplicados."
						}),
						!loading && !error && filtradas.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ jsxs(Table, {
								className: "min-w-[760px]",
								children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
									className: "hover:bg-transparent",
									children: [
										/* @__PURE__ */ jsx(TableHead, {
											className: "pl-5",
											children: "Código"
										}),
										/* @__PURE__ */ jsx(TableHead, { children: "Producto" }),
										/* @__PURE__ */ jsx(TableHead, { children: "Contenedor" }),
										/* @__PURE__ */ jsx(TableHead, { children: "Contenido" }),
										/* @__PURE__ */ jsx(TableHead, { children: "Estado" }),
										/* @__PURE__ */ jsx(TableHead, {
											className: "text-right",
											children: "Stock"
										})
									]
								}) }), /* @__PURE__ */ jsx(TableBody, { children: filtradas.map((p) => {
									const estado = estadoStock(p.CantidadActual);
									return /* @__PURE__ */ jsxs(TableRow, {
										className: cn("hover:bg-slate-50", carrito.some((l) => l.IdPresentacion === p.IdPresentacion) && "bg-c4/5 hover:bg-c4/5"),
										children: [
											/* @__PURE__ */ jsx(TableCell, {
												className: "pl-5 font-mono font-bold text-c3",
												children: p.CodigoPresentacion
											}),
											/* @__PURE__ */ jsx(TableCell, {
												className: "font-semibold text-slate-900",
												children: p.NombreProducto
											}),
											/* @__PURE__ */ jsx(TableCell, {
												className: "text-slate-600",
												children: p.TipoContenedor
											}),
											/* @__PURE__ */ jsx(TableCell, {
												className: "text-slate-600",
												children: descripcionContenido(p)
											}),
											/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
												variant: "outline",
												className: cn("border-0 font-bold", ESTILO_ESTADO[estado].clase),
												children: ESTILO_ESTADO[estado].texto
											}) }),
											/* @__PURE__ */ jsx(TableCell, {
												className: "text-right text-[15px] font-extrabold tabular-nums text-slate-900",
												children: p.CantidadActual
											})
										]
									}, p.IdPresentacion);
								}) })]
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-col gap-2.5 p-3.5 md:hidden",
							children: filtradas.map((p) => {
								const estado = estadoStock(p.CantidadActual);
								return /* @__PURE__ */ jsx("div", {
									className: cn("flex flex-col gap-3 rounded-2xl border-2 p-3.5", carrito.some((l) => l.IdPresentacion === p.IdPresentacion) ? "border-c4/30 bg-c4/8" : "border-slate-200 bg-white"),
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-start justify-between gap-2.5",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-1",
											children: [
												/* @__PURE__ */ jsx("div", {
													className: "font-mono text-[15px] font-extrabold text-c3",
													children: p.CodigoPresentacion
												}),
												/* @__PURE__ */ jsx("div", {
													className: "text-[13px] font-semibold text-slate-900",
													children: p.NombreProducto
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "text-[12.5px] text-slate-600",
													children: [
														p.TipoContenedor,
														" · ",
														descripcionContenido(p)
													]
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex flex-col items-end gap-1.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-xl font-extrabold tabular-nums text-slate-900",
												children: p.CantidadActual
											}), /* @__PURE__ */ jsx(Badge, {
												variant: "outline",
												className: cn("border-0 text-[11px] font-bold", ESTILO_ESTADO[estado].clase),
												children: ESTILO_ESTADO[estado].texto
											})]
										})]
									})
								}, p.IdPresentacion);
							})
						})] })
					]
				})]
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open: carritoAbierto,
				onOpenChange: setCarritoAbierto,
				children: /* @__PURE__ */ jsxs(SheetContent, {
					className: "flex w-full flex-col gap-0 sm:max-w-md",
					children: [
						/* @__PURE__ */ jsxs(SheetHeader, { children: [/* @__PURE__ */ jsx(SheetTitle, {
							className: "text-lg font-extrabold",
							children: "Movimientos pendientes"
						}), /* @__PURE__ */ jsxs(SheetDescription, { children: [
							lineasIngreso.length,
							" ingreso(s) · ",
							lineasSalida.length,
							" salida(s)"
						] })] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 overflow-y-auto px-4 py-3",
							children: [
								carrito.length === 0 && /* @__PURE__ */ jsx("div", {
									className: "py-16 text-center text-sm text-slate-400",
									children: "No hay movimientos cargados."
								}),
								lineasIngreso.length > 0 && /* @__PURE__ */ jsxs("div", {
									className: "mb-4 flex flex-col gap-2.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-[12px] font-bold uppercase tracking-wide text-emerald-700",
										children: "Ingresos"
									}), lineasIngreso.map((l) => {
										const presentacion = buscarPresentacion(l.IdPresentacion);
										if (!presentacion) return null;
										return /* @__PURE__ */ jsx(FilaEnCarrito, {
											linea: l,
											presentacion,
											onCantidad: cambiarCantidadLinea,
											onQuitar: quitarLinea
										}, l.IdPresentacion);
									})]
								}),
								lineasSalida.length > 0 && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-2.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-[12px] font-bold uppercase tracking-wide text-c3",
										children: "Salidas"
									}), lineasSalida.map((l) => {
										const presentacion = buscarPresentacion(l.IdPresentacion);
										if (!presentacion) return null;
										return /* @__PURE__ */ jsx(FilaEnCarrito, {
											linea: l,
											presentacion,
											onCantidad: cambiarCantidadLinea,
											onQuitar: quitarLinea
										}, l.IdPresentacion);
									})]
								})
							]
						}),
						carrito.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-col gap-3 px-4 py-4",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-1.5",
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-[12px] font-bold uppercase tracking-wide text-slate-500",
									children: "Observación general"
								}), /* @__PURE__ */ jsx(Textarea, {
									value: observacionGlobal,
									onChange: (e) => setObservacionGlobal(limpiarObservacion(e.target.value)),
									placeholder: "Se aplica a todas las líneas (opcional)",
									className: "min-h-16 resize-none"
								})]
							})
						})] }),
						/* @__PURE__ */ jsxs(SheetFooter, {
							className: "flex-row gap-2 border-t border-slate-100 px-4 py-4",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								onClick: vaciarCarrito,
								disabled: carrito.length === 0 || enviando,
								className: "h-11 font-bold text-slate-500 hover:text-slate-900",
								children: "Vaciar"
							}), /* @__PURE__ */ jsx(Button, {
								onClick: confirmarMovimientos,
								disabled: carrito.length === 0 || enviando,
								className: "h-11 flex-1 gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800",
								children: enviando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}), "Procesando..."] }) : "Confirmar"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { InventarioProductoTerminado as t };
