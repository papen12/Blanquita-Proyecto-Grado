import { a as Roles, t as IDS_PRODUCTO_BOBINA_HIGIENICO } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion, i as extraerMensajeError } from "./api_B8jC8QYh.mjs";
import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { i as TooltipProvider } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import "./Acentos_7-zo-5xR.mjs";
import { c as DERECHA } from "./comunes_LNdSvMvL.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { t as ObtenerTiposPapelBobina } from "./BobinaPapel_DoOm6qcL.mjs";
import { r as alternarMotivoEnTexto } from "./handlers_w7fuW24c.mjs";
import { o as obtenerProductos } from "./Inventario_DSn0sOXY.mjs";
import { a as insertarMovimientoLog, c as verPausasProduccionBobinaTuboActivas, l as verProduccionBobinaTubo, n as cancelarProduccion, o as pausarProduccion, r as finalizarProduccion, s as reanudarProduccion, t as cambiarLineaProduccion } from "./Produccion_DbvHg5rL.mjs";
import { o as descargarReporteProduccionCancelada, s as descargarReporteProduccionPorPeriodo, t as descargarReporteDetalleProduccion, u as verProduccionesBobinaTubo } from "./Reportes_BJrOcONl.mjs";
import { c as ObservacionesInsertarLogs, u as movimientosOperador } from "./OperadorConfig_tt2Z91F-.mjs";
import { a as ListaProducciones, c as TarjetaProduccion, i as DialogoPausar, l as useProduccion, n as AlertaFinalizar, o as ResumenProduccion, r as DialogoCancelar, s as TabsProduccion, t as ProduccionesConcluidas } from "./Concluidas_DAlfUJFL.mjs";
import { n as PRODUCTO_BOBINA_PAPEL, t as CODIGO_BOBINA_PAPEL } from "./filtros_DU9X5hxf.mjs";
import { useEffect, useState } from "react";
import { Layers, Loader2, Search, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/PapelBobina/Produccion/Tarjetas.jsx
function EtiquetaProducto({ nombre }) {
	return /* @__PURE__ */ jsx("span", {
		className: "w-fit rounded-full bg-c4/10 px-2.5 py-0.5 text-xs font-bold text-c3",
		children: nombre
	});
}
function LogsRegistrados({ cantidad }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg bg-slate-50 px-3 py-2.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
			children: "Logs registrados"
		}), /* @__PURE__ */ jsx("div", {
			className: "text-2xl font-extrabold tabular-nums text-slate-900",
			children: cantidad
		})]
	});
}
function CardActiva({ p, onInsertar, onPausar, onFinalizar, onCambiarLinea }) {
	return /* @__PURE__ */ jsx(TarjetaProduccion, {
		produccion: p,
		encabezado: /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("div", {
				className: "text-[17px] font-extrabold text-slate-900",
				children: p.NombreTipoBobina
			}),
			/* @__PURE__ */ jsx(EtiquetaProducto, { nombre: p.NombreProducto }),
			/* @__PURE__ */ jsxs("div", {
				className: "font-mono text-sm font-bold text-c3",
				children: [
					p.CodigoBobina1,
					" + ",
					p.CodigoBobina2
				]
			})
		] }),
		acciones: [
			{
				tipo: "insertar",
				onClick: onInsertar
			},
			{
				tipo: "pausar",
				onClick: onPausar
			},
			{
				tipo: "finalizar",
				onClick: onFinalizar
			},
			...onCambiarLinea ? [{
				tipo: "cambiarLinea",
				onClick: onCambiarLinea
			}] : []
		],
		children: /* @__PURE__ */ jsx(LogsRegistrados, { cantidad: p.CantidadLogsActual })
	});
}
function CardPausada({ p, procesando, onInsertar, onReanudar, onCancelar }) {
	return /* @__PURE__ */ jsx(TarjetaProduccion, {
		produccion: p,
		pausada: true,
		encabezado: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
			className: "font-mono text-[15px] font-extrabold text-slate-900",
			children: [
				p.CodigoBobina1,
				" + ",
				p.CodigoBobina2
			]
		}), /* @__PURE__ */ jsx(EtiquetaProducto, { nombre: p.NombreProducto })] }),
		acciones: [
			{
				tipo: "insertar",
				onClick: onInsertar
			},
			{
				tipo: "reanudar",
				onClick: onReanudar,
				disabled: procesando,
				procesando
			},
			{
				tipo: "cancelar",
				onClick: onCancelar
			}
		],
		children: /* @__PURE__ */ jsx(LogsRegistrados, { cantidad: p.CantidadLogsActual })
	});
}
//#endregion
//#region src/components/PapelBobina/Produccion/Concluidas.jsx
var bobinas = (p) => `${p.CodigoBobina1} + ${p.CodigoBobina2}`;
function EtiquetaCargada({ cantidad }) {
	if (cantidad <= 1) return null;
	return /* @__PURE__ */ jsxs(Badge, {
		variant: "outline",
		className: "gap-1 border-c3/30 bg-c4/5 font-bold text-c3",
		title: "Producciones hechas con el mismo par de bobinas",
		children: [
			/* @__PURE__ */ jsx(Layers, {
				size: 12,
				strokeWidth: 2.75
			}),
			"Cargada: ",
			cantidad
		]
	});
}
var COLUMNAS = [
	{
		titulo: "Producto",
		valor: (p) => /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-start gap-1",
			children: [/* @__PURE__ */ jsx("span", {
				className: "font-semibold text-slate-900",
				children: p.NombreProducto
			}), /* @__PURE__ */ jsx(EtiquetaCargada, { cantidad: p.CantidadCargada })]
		})
	},
	{
		titulo: "Bobinas",
		clase: "font-mono text-[12.5px]",
		valor: bobinas
	},
	{
		titulo: "Turno",
		valor: (p) => p.NombreTurno
	},
	{
		titulo: "Operador",
		valor: (p) => p.Operador
	}
];
var COLUMNAS_FINALES = [{
	titulo: "Logs",
	...DERECHA,
	valor: (p) => p.CantidadLogsActual
}];
var TARJETA = {
	titulo: bobinas,
	subtitulo: (p) => `${p.NombreProducto} · ${p.NombreTurno} · ${p.Operador}`,
	extra: (p) => /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("span", { children: ["Logs ", p.CantidadLogsActual] }), /* @__PURE__ */ jsx(EtiquetaCargada, { cantidad: p.CantidadCargada })] })
};
function ConcluidasBobinaPapel({ onTotal }) {
	return /* @__PURE__ */ jsx(ProduccionesConcluidas, {
		onTotal,
		consultar: verProduccionesBobinaTubo,
		campoId: "IdProduccionBobinaTubo",
		idCalendario: "rango-concluidas-bobina-papel",
		conCambioLinea: true,
		filtroTipo: PRODUCTO_BOBINA_PAPEL,
		codigo: CODIGO_BOBINA_PAPEL,
		columnas: COLUMNAS,
		columnasFinales: COLUMNAS_FINALES,
		tarjeta: TARJETA,
		descargarDetalle: (id) => descargarReporteDetalleProduccion(id, true, true),
		descargarCancelada: descargarReporteProduccionCancelada,
		descargarPeriodo: descargarReporteProduccionPorPeriodo
	});
}
//#endregion
//#region src/components/PapelBobina/Produccion/ProduccionPapelBobina.jsx
var ID_TIPO_INGRESO = 1;
var ID_TIPO_DESCUENTO = 2;
var MOTIVOS_PAUSA = ["Falta de pegamento", "Falta de personal para continuar la producción"];
var codigosDe = (p) => `${p.CodigoBobina1} + ${p.CodigoBobina2}`;
function ProduccionBobinaTubo({ usuario }) {
	const [vista, setVista] = useState("activas");
	const [tiposBobina, setTiposBobina] = useState([]);
	const [filtroTipo, setFiltroTipo] = useState("");
	const [productosHigienico, setProductosHigienico] = useState([]);
	const [filtroProducto, setFiltroProducto] = useState("");
	const [buscarCodigoBobina, setBuscarCodigoBobina] = useState("");
	const idTipoFiltro = filtroTipo === "" ? void 0 : Number(filtroTipo);
	const idProductoFiltro = filtroProducto === "" ? void 0 : Number(filtroProducto);
	const permiteFiltroProducto = filtroTipo === "" || Number(filtroTipo) === 1;
	const cambiarFiltroTipo = (valor) => {
		setFiltroTipo(valor);
		if (valor !== "" && Number(valor) !== 1) setFiltroProducto("");
	};
	const { activas, pausadas, recargarTodo, pausa, cancelacion, finalizacion, procesandoId, reanudar } = useProduccion({
		verActivas: () => verProduccionBobinaTubo(idTipoFiltro, idProductoFiltro),
		verPausadas: () => verPausasProduccionBobinaTuboActivas(idTipoFiltro, idProductoFiltro),
		idDe: (p) => p.IdProduccionBobinaTubo,
		pausar: pausarProduccion,
		cancelar: cancelarProduccion,
		finalizar: finalizarProduccion,
		reanudar: reanudarProduccion,
		dependencias: [filtroTipo, filtroProducto]
	});
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const [totalConcluidas, setTotalConcluidas] = useState(0);
	const [cambioLinea, setCambioLinea] = useState(null);
	const [nuevoProducto, setNuevoProducto] = useState(null);
	const [errorCambioLinea, setErrorCambioLinea] = useState("");
	const [enviandoCambioLinea, setEnviandoCambioLinea] = useState(false);
	const productosDisponibles = cambioLinea ? productosHigienico.filter((p) => p.IdProducto !== cambioLinea.IdProducto) : [];
	const abrirCambioLinea = (produccion) => {
		setNuevoProducto(null);
		setErrorCambioLinea("");
		setCambioLinea(produccion);
	};
	const confirmarCambioLinea = async () => {
		if (nuevoProducto === null) {
			setErrorCambioLinea("Selecciona el nuevo producto.");
			return;
		}
		setEnviandoCambioLinea(true);
		setErrorCambioLinea("");
		try {
			const res = await cambiarLineaProduccion(cambioLinea.IdProduccionBobinaTubo, nuevoProducto);
			toast.success(`${codigosDe(cambioLinea)} · ${cambioLinea.NombreProducto} → ${res.NombreProducto}`);
			setCambioLinea(null);
			activas.recargar();
		} catch (e) {
			setErrorCambioLinea(extraerMensajeError(e, e.message));
		} finally {
			setEnviandoCambioLinea(false);
		}
	};
	const [modalInsertar, setModalInsertar] = useState({
		open: false,
		produccion: null
	});
	const [formTipoMovimiento, setFormTipoMovimiento] = useState("");
	const [formCantidadLogs, setFormCantidadLogs] = useState("");
	const [formObservacionLog, setFormObservacionLog] = useState("");
	const [errorInsertar, setErrorInsertar] = useState("");
	const [enviandoInsertar, setEnviandoInsertar] = useState(false);
	useEffect(() => {
		ObtenerTiposPapelBobina().then(setTiposBobina).catch(() => setTiposBobina([]));
		obtenerProductos().then((data) => setProductosHigienico(data.filter((p) => IDS_PRODUCTO_BOBINA_HIGIENICO.includes(p.IdProducto)))).catch(() => setProductosHigienico([]));
	}, []);
	const requiereObservacion = formTipoMovimiento !== "" && Number(formTipoMovimiento) !== ID_TIPO_INGRESO;
	const movimientoSeleccionado = movimientosOperador.find((m) => String(m.IdTipoMovimientoOperadorLogs) === String(formTipoMovimiento));
	const motivosObservacion = ObservacionesInsertarLogs.find((o) => o.id === Number(formTipoMovimiento))?.motivos.filter(Boolean) ?? [];
	const logsActuales = Number(modalInsertar.produccion?.CantidadLogsActual ?? 0);
	const esDescuento = Number(formTipoMovimiento) === ID_TIPO_DESCUENTO;
	const descuentoExcedeTotal = esDescuento && Number(formCantidadLogs) > logsActuales;
	const seleccionarTipoMovimiento = (idMovimiento) => {
		setFormTipoMovimiento(Number(formTipoMovimiento) === idMovimiento ? "" : String(idMovimiento));
		setFormObservacionLog("");
	};
	const abrirInsertar = (produccion) => {
		setFormTipoMovimiento("");
		setFormCantidadLogs("");
		setFormObservacionLog("");
		setErrorInsertar("");
		setModalInsertar({
			open: true,
			produccion
		});
	};
	const confirmarInsertar = async () => {
		if (!formTipoMovimiento) {
			setErrorInsertar("Selecciona el tipo de movimiento.");
			return;
		}
		const cantidad = Number(formCantidadLogs);
		if (!formCantidadLogs || cantidad <= 0) {
			setErrorInsertar("Ingresa una cantidad de logs válida.");
			return;
		}
		if (cantidad > 100) {
			setErrorInsertar(`La cantidad máxima por registro es de 100 logs.`);
			return;
		}
		if (esDescuento && cantidad > logsActuales) {
			setErrorInsertar(`No se puede descontar ${cantidad} logs, el total actual es ${logsActuales}.`);
			return;
		}
		setEnviandoInsertar(true);
		try {
			await insertarMovimientoLog(modalInsertar.produccion.IdProduccionBobinaTubo, Number(formTipoMovimiento), cantidad, requiereObservacion ? formObservacionLog.trim() || null : null);
			toast.success("Movimiento de logs registrado");
			setModalInsertar({
				open: false,
				produccion: null
			});
			recargarTodo();
		} catch (e) {
			setErrorInsertar(extraerMensajeError(e, e.message));
		} finally {
			setEnviandoInsertar(false);
		}
	};
	const motivoObservacionEnTexto = (motivo) => formObservacionLog.includes(motivo);
	const alternarMotivoObservacion = (motivo) => {
		setFormObservacionLog((actual) => alternarMotivoEnTexto(motivo, actual));
	};
	const opcionesPausa = pausa.produccion ? [
		...MOTIVOS_PAUSA,
		...pausa.produccion.CodigoBobina1 ? [`Empalme en la Bobina: ${pausa.produccion.CodigoBobina1}`] : [],
		...pausa.produccion.CodigoBobina2 ? [`Empalme en la Bobina: ${pausa.produccion.CodigoBobina2}`] : []
	] : MOTIVOS_PAUSA;
	const coincideCodigoBobina = (p) => {
		const q = buscarCodigoBobina.trim().toLowerCase();
		if (!q) return true;
		return (p.CodigoBobina1 ?? "").toLowerCase().includes(q) || (p.CodigoBobina2 ?? "").toLowerCase().includes(q);
	};
	const activasFiltradas = activas.datos.filter(coincideCodigoBobina);
	const pausadasFiltradas = pausadas.datos.filter(coincideCodigoBobina);
	const sinCoincidencias = (estado) => `Ninguna producción ${estado} con el código «${buscarCodigoBobina.trim()}».`;
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Producción",
				subtitulo: "Producción de Bobina Tubo"
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsx(TabsProduccion, {
						vista,
						onCambio: setVista,
						totalActivas: activasFiltradas.length,
						totalPausadas: pausadasFiltradas.length,
						mostrarConcluidas: esEncargado,
						totalConcluidas
					}),
					vista === "concluidas" && esEncargado && /* @__PURE__ */ jsx(ConcluidasBobinaPapel, { onTotal: setTotalConcluidas }),
					vista !== "concluidas" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
						tiposBobina.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Filtrar por tipo"
							}), /* @__PURE__ */ jsxs(ToggleGroup, {
								type: "single",
								value: filtroTipo ? [filtroTipo] : ["todos"],
								className: "flex w-full flex-wrap justify-start gap-2",
								children: [/* @__PURE__ */ jsx(ToggleGroupItem, {
									value: "todos",
									onClick: () => cambiarFiltroTipo(""),
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: "Todos"
								}), tiposBobina.map((t) => /* @__PURE__ */ jsx(ToggleGroupItem, {
									value: String(t.IdTipoBobina),
									onClick: () => cambiarFiltroTipo(String(t.IdTipoBobina)),
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: t.NombreTipoBobina
								}, t.IdTipoBobina))]
							})]
						}),
						permiteFiltroProducto && productosHigienico.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Filtrar por producto"
							}), /* @__PURE__ */ jsxs(ToggleGroup, {
								value: filtroProducto ? [filtroProducto] : ["todos"],
								className: "flex w-full flex-wrap justify-start gap-2",
								children: [/* @__PURE__ */ jsx(ToggleGroupItem, {
									value: "todos",
									onClick: () => setFiltroProducto(""),
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: "Todos"
								}), productosHigienico.map((p) => /* @__PURE__ */ jsx(ToggleGroupItem, {
									value: String(p.IdProducto),
									onClick: () => setFiltroProducto(String(p.IdProducto)),
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: p.NombreProducto
								}, p.IdProducto))]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Buscar por código de bobina"
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ jsx(Search, {
										size: 16,
										strokeWidth: 2.5,
										className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									}),
									/* @__PURE__ */ jsx(Input, {
										value: buscarCodigoBobina,
										onChange: (e) => setBuscarCodigoBobina(e.target.value),
										placeholder: "Ej. 967 R20",
										maxLength: 15,
										className: "pl-9 pr-9"
									}),
									buscarCodigoBobina && /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setBuscarCodigoBobina(""),
										className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600",
										"aria-label": "Limpiar búsqueda",
										children: /* @__PURE__ */ jsx(X, {
											size: 15,
											strokeWidth: 2.75
										})
									})
								]
							})]
						})
					] }),
					vista === "activas" && /* @__PURE__ */ jsx(ListaProducciones, {
						lista: activas,
						elementos: activasFiltradas,
						altoSkeleton: "h-64",
						mensajeVacio: "No hay producciones activas.",
						mensajeSinCoincidencias: sinCoincidencias("activa"),
						renderizar: (p) => /* @__PURE__ */ jsx(CardActiva, {
							p,
							onInsertar: () => abrirInsertar(p),
							onPausar: () => pausa.abrir(p),
							onFinalizar: () => finalizacion.abrir(p),
							onCambiarLinea: esEncargado && p.IdTipoBobina === 1 ? () => abrirCambioLinea(p) : void 0
						}, p.IdProduccionBobinaTubo)
					}),
					vista === "pausadas" && /* @__PURE__ */ jsx(ListaProducciones, {
						lista: pausadas,
						elementos: pausadasFiltradas,
						altoSkeleton: "h-64",
						mensajeVacio: "No hay producciones pausadas.",
						mensajeSinCoincidencias: sinCoincidencias("pausada"),
						renderizar: (p) => /* @__PURE__ */ jsx(CardPausada, {
							p,
							procesando: procesandoId === p.IdProduccionBobinaTubo,
							onInsertar: () => abrirInsertar(p),
							onReanudar: () => reanudar(p),
							onCancelar: () => cancelacion.abrir(p)
						}, p.IdPausaProduccionBobinaTubo)
					})
				]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: modalInsertar.open,
				onOpenChange: (open) => setModalInsertar({
					open,
					produccion: open ? modalInsertar.produccion : null
				}),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Insertar movimiento de logs" }) }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4",
							children: [
								modalInsertar.produccion && /* @__PURE__ */ jsx(ResumenProduccion, {
									titulo: codigosDe(modalInsertar.produccion),
									produccion: modalInsertar.produccion
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										className: "text-xs font-bold uppercase tracking-wide text-slate-600",
										children: "Tipo de movimiento"
									}), /* @__PURE__ */ jsx(ToggleGroup, {
										type: "single",
										value: movimientoSeleccionado ? [movimientoSeleccionado.NombreMovimiento] : [],
										className: "flex w-full flex-wrap justify-start gap-2",
										children: movimientosOperador.map((m) => /* @__PURE__ */ jsx(ToggleGroupItem, {
											value: m.NombreMovimiento,
											onClick: () => seleccionarTipoMovimiento(m.IdTipoMovimientoOperadorLogs),
											className: "h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 bg-white hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
											children: m.NombreMovimiento
										}, m.IdTipoMovimientoOperadorLogs))
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "cantidad-logs",
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Cantidad de logs"
										}),
										/* @__PURE__ */ jsx(Input, {
											id: "cantidad-logs",
											value: formCantidadLogs,
											onChange: (e) => setFormCantidadLogs(e.target.value),
											placeholder: "0",
											type: "number",
											min: 1,
											max: esDescuento ? Math.min(logsActuales, 100) : 100,
											className: "h-11"
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500",
											children: [
												"Máximo ",
												100,
												" logs por registro"
											]
										}),
										esDescuento && /* @__PURE__ */ jsxs("span", {
											className: `text-xs font-semibold ${descuentoExcedeTotal ? "text-red-600" : "text-slate-500"}`,
											children: [
												"Disponible para descontar: ",
												logsActuales,
												" logs"
											]
										})
									]
								}),
								requiereObservacion && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-3",
									children: [motivosObservacion.length > 0 && /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col gap-1.5",
										children: [/* @__PURE__ */ jsx(Label, {
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Motivos frecuentes"
										}), /* @__PURE__ */ jsx(ToggleGroup, {
											type: "multiple",
											value: motivosObservacion.filter(motivoObservacionEnTexto),
											className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
											children: motivosObservacion.map((motivo) => /* @__PURE__ */ jsx(ToggleGroupItem, {
												value: motivo,
												onClick: () => alternarMotivoObservacion(motivo),
												className: "h-full w-full whitespace-normal rounded-xl border-2 border-slate-200 px-3 py-2 text-left text-[12.5px] font-bold leading-snug text-slate-600 bg-white hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
												children: motivo
											}, motivo))
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col gap-1.5",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "observacion-log",
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Observación"
										}), /* @__PURE__ */ jsx(Textarea, {
											id: "observacion-log",
											value: formObservacionLog,
											onChange: (e) => setFormObservacionLog(limpiarObservacion(e.target.value)),
											placeholder: "Motivo de la corrección...",
											className: "min-h-20"
										})]
									})]
								}),
								errorInsertar && /* @__PURE__ */ jsx("div", {
									className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
									children: errorInsertar
								})
							]
						}),
						/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
							onClick: confirmarInsertar,
							disabled: enviandoInsertar || descuentoExcedeTotal,
							className: "h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold hover:opacity-90 sm:w-auto",
							children: enviandoInsertar ? /* @__PURE__ */ jsx(Loader2, {
								size: 16,
								className: "animate-spin"
							}) : "Registrar movimiento"
						}) })
					]
				})
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: cambioLinea !== null,
				onOpenChange: (open) => {
					if (!open && !enviandoCambioLinea) setCambioLinea(null);
				},
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Cambiar línea de producción" }) }),
						cambioLinea && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4",
							children: [
								/* @__PURE__ */ jsx(ResumenProduccion, {
									titulo: codigosDe(cambioLinea),
									produccion: cambioLinea
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-sm text-slate-600",
									children: [
										"La producción actual de",
										" ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-slate-900",
											children: cambioLinea.NombreProducto
										}),
										" se cerrará con ",
										cambioLinea.CantidadLogsActual,
										" logs y se iniciará una nueva con las mismas bobinas. El contador de logs empieza en 0."
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										className: "text-xs font-bold uppercase tracking-wide text-slate-600",
										children: "Nuevo producto"
									}), /* @__PURE__ */ jsx(ToggleGroup, {
										value: nuevoProducto === null ? [] : [String(nuevoProducto)],
										className: "flex w-full flex-wrap justify-start gap-2",
										children: productosDisponibles.map((p) => /* @__PURE__ */ jsx(ToggleGroupItem, {
											value: String(p.IdProducto),
											onClick: () => setNuevoProducto(p.IdProducto),
											className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
											children: p.NombreProducto
										}, p.IdProducto))
									})]
								}),
								errorCambioLinea && /* @__PURE__ */ jsx("div", {
									className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
									children: errorCambioLinea
								})
							]
						}),
						/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
							onClick: confirmarCambioLinea,
							disabled: enviandoCambioLinea || nuevoProducto === null,
							className: "h-11 bg-gradient-to-r from-c3 to-c4 font-bold hover:opacity-90",
							children: enviandoCambioLinea ? /* @__PURE__ */ jsx(Loader2, {
								size: 16,
								className: "animate-spin"
							}) : "Cambiar línea"
						}) })
					]
				})
			}),
			/* @__PURE__ */ jsx(DialogoPausar, {
				dialogo: pausa,
				tituloDe: codigosDe,
				opciones: opcionesPausa
			}),
			/* @__PURE__ */ jsx(DialogoCancelar, {
				dialogo: cancelacion,
				tituloDe: codigosDe,
				placeholder: "Ej. Bobina dañada, error de registro..."
			}),
			/* @__PURE__ */ jsx(AlertaFinalizar, {
				dialogo: finalizacion,
				prefijo: "de",
				codigoDe: codigosDe
			})
		]
	}) });
}
//#endregion
export { ProduccionBobinaTubo as t };
