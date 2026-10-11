import { a as limpiarObservacion, i as extraerMensajeError } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { n as PILDORA_FILTRO } from "./Acentos_7-zo-5xR.mjs";
import { _ as TarjetaReporte, c as DERECHA, f as FiltroTipos, g as TarjetaFiltros, i as BuscadorFiltro, m as ResultadosReporte, n as BotonDescargaFila, r as BotonInforme, s as CampoFiltro, t as BadgeEstado, u as ESTADOS_PRODUCCION } from "./comunes_LNdSvMvL.mjs";
import { i as formatearDuracion, n as dateFormatter, t as aFechaISO } from "./dates_DZEitlnj.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { r as alternarMotivoEnTexto } from "./handlers_w7fuW24c.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs_DwRtTS0P.mjs";
import { t as DoubleDatePicker } from "./DoubleDatePicker_CRKNWKhn.mjs";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Ban, CheckCircle2, Clock, Layers, Loader2, Pause, Play, Plus } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { startOfMonth, startOfWeek } from "date-fns";
import { AlertDialog } from "@base-ui/react/alert-dialog";
//#region src/hooks/useProduccion.js
var mensajeDe = (e) => extraerMensajeError(e, e.message);
var motivoValido = (texto) => {
	const largo = texto.trim().length;
	return largo >= 5 && largo <= 150;
};
function useListaProducciones(cargar) {
	const [datos, setDatos] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");
	const recargar = async () => {
		setCargando(true);
		setError("");
		try {
			setDatos(await cargar());
		} catch (e) {
			setError(mensajeDe(e));
			setDatos([]);
		} finally {
			setCargando(false);
		}
	};
	return {
		datos,
		cargando,
		error,
		recargar
	};
}
function useDialogoMotivo({ enviar, exito, invalido, alTerminar }) {
	const [produccion, setProduccion] = useState(null);
	const [motivo, setMotivo] = useState("");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);
	const valido = motivoValido(motivo);
	const abrir = (p) => {
		setMotivo("");
		setError("");
		setProduccion(p);
	};
	const confirmar = async () => {
		if (!valido) {
			setError(invalido);
			return;
		}
		setEnviando(true);
		setError("");
		try {
			await enviar(produccion, motivo.trim());
			toast.success(exito);
			setProduccion(null);
			alTerminar();
		} catch (e) {
			setError(mensajeDe(e));
		} finally {
			setEnviando(false);
		}
	};
	return {
		produccion,
		abierto: produccion !== null,
		motivo,
		setMotivo,
		error,
		enviando,
		valido,
		abrir,
		cerrar: () => setProduccion(null),
		confirmar
	};
}
function useProduccion({ verActivas, verPausadas, idDe, pausar, cancelar, finalizar, reanudar, dependencias = [] }) {
	const activas = useListaProducciones(verActivas);
	const pausadas = useListaProducciones(verPausadas);
	const recargarTodo = () => {
		activas.recargar();
		pausadas.recargar();
	};
	useEffect(() => {
		recargarTodo();
	}, dependencias);
	const pausa = useDialogoMotivo({
		enviar: (p, motivo) => pausar(idDe(p), motivo),
		exito: "Producción pausada",
		invalido: `El motivo de la pausa debe tener entre 5 y 150 caracteres`,
		alTerminar: recargarTodo
	});
	const cancelacion = useDialogoMotivo({
		enviar: (p, motivo) => cancelar(idDe(p), motivo),
		exito: "Producción cancelada",
		invalido: `El motivo de cancelación debe tener entre 5 y 150 caracteres`,
		alTerminar: pausadas.recargar
	});
	const [porFinalizar, setPorFinalizar] = useState(null);
	const [finalizando, setFinalizando] = useState(false);
	const confirmarFinalizar = async () => {
		setFinalizando(true);
		try {
			await finalizar(idDe(porFinalizar));
			toast.success("Producción finalizada");
			setPorFinalizar(null);
			activas.recargar();
		} catch (e) {
			toast.error(mensajeDe(e));
		} finally {
			setFinalizando(false);
		}
	};
	const [procesandoId, setProcesandoId] = useState(null);
	const reanudarProduccion = async (p) => {
		setProcesandoId(idDe(p));
		try {
			await reanudar(idDe(p));
			toast.success("Producción reanudada");
			recargarTodo();
		} catch (e) {
			toast.error(mensajeDe(e));
		} finally {
			setProcesandoId(null);
		}
	};
	return {
		activas,
		pausadas,
		recargarTodo,
		pausa,
		cancelacion,
		finalizacion: {
			produccion: porFinalizar,
			abierto: porFinalizar !== null,
			enviando: finalizando,
			abrir: setPorFinalizar,
			cerrar: () => setPorFinalizar(null),
			confirmar: confirmarFinalizar
		},
		procesandoId,
		reanudar: reanudarProduccion
	};
}
//#endregion
//#region src/components/Produccion/comunes.jsx
var GRID = "grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3";
var VACIO = "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200";
function ResumenProduccion({ titulo, produccion }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm",
		children: [/* @__PURE__ */ jsx("span", {
			className: "font-mono font-bold text-slate-900",
			children: titulo
		}), (produccion.FechaHoraPausa || produccion.FechaInicioProduccion) && /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-1 text-[12px] text-slate-500",
			children: [/* @__PURE__ */ jsx(Clock, {
				size: 12,
				strokeWidth: 2.75
			}), produccion.FechaHoraPausa ? `Pausada: ${dateFormatter(produccion.FechaHoraPausa)}` : `Inicio: ${dateFormatter(produccion.FechaInicioProduccion)}`]
		})]
	});
}
var ACCIONES = {
	insertar: {
		texto: "Insertar",
		icono: Plus,
		variant: "default",
		clase: "bg-gradient-to-r from-c3 to-c4 font-bold hover:opacity-90"
	},
	pausar: {
		texto: "Pausar",
		icono: Pause,
		variant: "outline",
		clase: "border-amber-300 font-bold text-amber-600 hover:bg-amber-50"
	},
	finalizar: {
		texto: "Finalizar",
		icono: CheckCircle2,
		variant: "outline",
		clase: "border-emerald-300 font-bold text-emerald-600 hover:bg-emerald-50"
	},
	reanudar: {
		texto: "Reanudar",
		icono: Play,
		variant: "outline",
		clase: "border-c3/30 font-bold text-c3 hover:bg-c4/8"
	},
	cancelar: {
		texto: "Cancelar",
		icono: Ban,
		variant: "outline",
		clase: "border-red-300 font-bold text-red-600 hover:bg-red-50"
	},
	cambiarLinea: {
		texto: "Cambiar línea",
		icono: ArrowLeftRight,
		variant: "outline",
		clase: "border-c3/30 font-bold text-c3 hover:bg-c4/8"
	}
};
function TarjetaProduccion({ produccion, pausada = false, encabezado, children, acciones }) {
	const ancho = acciones.length >= 3 ? "basis-[30%]" : "basis-[45%]";
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 shadow-sm", pausada ? "border-amber-200" : "border-slate-200"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex flex-col gap-1",
					children: encabezado
				}), /* @__PURE__ */ jsx(Badge, {
					className: cn("border-0 font-bold", pausada ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"),
					children: produccion.NombreEstadoProduccion
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
				children: pausada ? /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ jsx(Pause, {
							size: 13,
							strokeWidth: 2.75
						}),
						"Pausada: ",
						dateFormatter(produccion.FechaHoraPausa)
					]
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ jsx(Clock, {
						size: 13,
						strokeWidth: 2.75
					}), dateFormatter(produccion.FechaInicioProduccion)]
				}), /* @__PURE__ */ jsxs("span", { children: ["Turno: ", produccion.NombreTurno] })] })
			}),
			children,
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-center justify-around gap-2",
				children: acciones.map(({ tipo, onClick, disabled = false, procesando = false }) => {
					const { texto, icono: Icono, variant, clase } = ACCIONES[tipo];
					return /* @__PURE__ */ jsx(Button, {
						onClick,
						disabled,
						variant,
						className: cn("h-11 min-w-[100px] flex-1 justify-center gap-1.5", ancho, clase),
						children: procesando ? /* @__PURE__ */ jsx(Loader2, {
							size: 15,
							className: "animate-spin"
						}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Icono, {
							size: 15,
							strokeWidth: 2.75
						}), texto] })
					}, tipo);
				})
			})
		]
	});
}
function TabsProduccion({ vista, onCambio, totalActivas, totalPausadas, mostrarConcluidas = false, totalConcluidas = 0 }) {
	return /* @__PURE__ */ jsx(Tabs, {
		value: vista,
		onValueChange: onCambio,
		className: "mb-5",
		children: /* @__PURE__ */ jsxs(TabsList, {
			className: cn("grid w-full", mostrarConcluidas ? "grid-cols-3 sm:w-[30rem]" : "grid-cols-2 sm:w-80"),
			children: [
				/* @__PURE__ */ jsxs(TabsTrigger, {
					value: "activas",
					className: "gap-1.5 font-bold",
					children: [
						/* @__PURE__ */ jsx(Layers, {
							size: 15,
							strokeWidth: 2.75
						}),
						"Activas",
						totalActivas > 0 && /* @__PURE__ */ jsx(Badge, {
							variant: "secondary",
							className: "ml-1 h-5 min-w-5 justify-center px-1.5",
							children: totalActivas
						})
					]
				}),
				/* @__PURE__ */ jsxs(TabsTrigger, {
					value: "pausadas",
					className: "gap-1.5 font-bold",
					children: [
						/* @__PURE__ */ jsx(Pause, {
							size: 15,
							strokeWidth: 2.75
						}),
						"Pausadas",
						totalPausadas > 0 && /* @__PURE__ */ jsx(Badge, {
							variant: "secondary",
							className: "ml-1 h-5 min-w-5 justify-center px-1.5",
							children: totalPausadas
						})
					]
				}),
				mostrarConcluidas && /* @__PURE__ */ jsxs(TabsTrigger, {
					value: "concluidas",
					className: "gap-1.5 font-bold",
					children: [
						/* @__PURE__ */ jsx(CheckCircle2, {
							size: 15,
							strokeWidth: 2.75
						}),
						"Concluidas",
						totalConcluidas > 0 && /* @__PURE__ */ jsx(Badge, {
							variant: "secondary",
							className: "ml-1 h-5 min-w-5 justify-center px-1.5",
							children: totalConcluidas
						})
					]
				})
			]
		})
	});
}
function ListaProducciones({ lista, elementos = lista.datos, altoSkeleton, mensajeVacio, mensajeSinCoincidencias, renderizar }) {
	if (lista.cargando) return /* @__PURE__ */ jsx("div", {
		className: GRID,
		children: [
			0,
			1,
			2
		].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: cn(altoSkeleton, "rounded-2xl") }, i))
	});
	if (lista.error) return /* @__PURE__ */ jsx("div", {
		className: "rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600",
		children: lista.error
	});
	if (lista.datos.length === 0) return /* @__PURE__ */ jsx("div", {
		className: VACIO,
		children: mensajeVacio
	});
	if (elementos.length === 0) return /* @__PURE__ */ jsx("div", {
		className: VACIO,
		children: mensajeSinCoincidencias
	});
	return /* @__PURE__ */ jsx("div", {
		className: GRID,
		children: elementos.map(renderizar)
	});
}
//#endregion
//#region src/components/ui/alert-dialog.jsx
function AlertDialog$1({ ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Root, {
		"data-slot": "alert-dialog",
		...props
	});
}
function AlertDialogPortal({ ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Portal, {
		"data-slot": "alert-dialog-portal",
		...props
	});
}
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Backdrop, {
		"data-slot": "alert-dialog-overlay",
		className: cn("fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0", className),
		...props
	});
}
function AlertDialogContent({ className, size = "default", ...props }) {
	return /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [/* @__PURE__ */ jsx(AlertDialogOverlay, {}), /* @__PURE__ */ jsx(AlertDialog.Popup, {
		"data-slot": "alert-dialog-content",
		"data-size": size,
		className: cn("group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-dialog-header",
		className: cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-dialog-footer",
		className: cn("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Title, {
		"data-slot": "alert-dialog-title",
		className: cn("font-heading text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Description, {
		"data-slot": "alert-dialog-description",
		className: cn("text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ jsx(Button, {
		"data-slot": "alert-dialog-action",
		className: cn(className),
		...props
	});
}
function AlertDialogCancel({ className, variant = "outline", size = "default", ...props }) {
	return /* @__PURE__ */ jsx(AlertDialog.Close, {
		"data-slot": "alert-dialog-cancel",
		className: cn(className),
		render: /* @__PURE__ */ jsx(Button, {
			variant,
			size
		}),
		...props
	});
}
//#endregion
//#region src/components/Produccion/Dialogos.jsx
var ETIQUETA = "text-xs font-bold uppercase tracking-wide text-slate-600";
function ContadorMotivo({ motivo }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "text-xs text-slate-500",
		children: [
			motivo.trim().length,
			"/",
			150,
			" · mínimo ",
			5,
			" ",
			"caracteres"
		]
	});
}
function ErrorDialogo({ mensaje }) {
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
		children: mensaje
	});
}
function DialogoPausar({ dialogo, tituloDe, opciones }) {
	const seleccionados = opciones.filter((m) => dialogo.motivo.includes(m));
	return /* @__PURE__ */ jsx(Dialog, {
		open: dialogo.abierto,
		onOpenChange: (open) => !open && dialogo.cerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Pausar producción" }) }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						dialogo.produccion && /* @__PURE__ */ jsx(ResumenProduccion, {
							titulo: tituloDe(dialogo.produccion),
							produccion: dialogo.produccion
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								className: ETIQUETA,
								children: "Motivos frecuentes"
							}), /* @__PURE__ */ jsx(ToggleGroup, {
								type: "multiple",
								value: seleccionados,
								className: "flex flex-wrap justify-start gap-2",
								children: opciones.map((motivo) => /* @__PURE__ */ jsx(ToggleGroupItem, {
									value: motivo,
									onClick: () => dialogo.setMotivo((actual) => alternarMotivoEnTexto(motivo, actual)),
									className: "h-auto whitespace-normal rounded-full border-2 border-slate-200 px-3.5 py-2 text-left text-[12.5px] font-bold text-slate-600 bg-white hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: motivo
								}, motivo))
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Label, {
									htmlFor: "motivo-pausa",
									className: ETIQUETA,
									children: "Detalle de la pausa"
								}),
								/* @__PURE__ */ jsx(Textarea, {
									id: "motivo-pausa",
									value: dialogo.motivo,
									onChange: (e) => dialogo.setMotivo(limpiarObservacion(e.target.value)),
									placeholder: "Ej. Falla de máquina, cambio de turno...",
									className: "min-h-20",
									maxLength: 150
								}),
								/* @__PURE__ */ jsx(ContadorMotivo, { motivo: dialogo.motivo })
							]
						}),
						dialogo.error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: dialogo.error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					onClick: dialogo.confirmar,
					disabled: dialogo.enviando || !dialogo.valido,
					className: "h-11 w-full gap-2 bg-amber-500 font-extrabold text-white hover:bg-amber-600 sm:w-auto",
					children: dialogo.enviando ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : "Pausar producción"
				}) })
			]
		})
	});
}
function DialogoCancelar({ dialogo, tituloDe, placeholder }) {
	return /* @__PURE__ */ jsx(Dialog, {
		open: dialogo.abierto,
		onOpenChange: (open) => !open && dialogo.cerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Cancelar producción" }) }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						dialogo.produccion && /* @__PURE__ */ jsx(ResumenProduccion, {
							titulo: tituloDe(dialogo.produccion),
							produccion: dialogo.produccion
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Label, {
									htmlFor: "motivo-cancelacion",
									className: ETIQUETA,
									children: "Motivo de cancelación"
								}),
								/* @__PURE__ */ jsx(Textarea, {
									id: "motivo-cancelacion",
									value: dialogo.motivo,
									onChange: (e) => dialogo.setMotivo(limpiarObservacion(e.target.value)),
									placeholder,
									className: "min-h-20",
									maxLength: 150
								}),
								/* @__PURE__ */ jsx(ContadorMotivo, { motivo: dialogo.motivo })
							]
						}),
						dialogo.error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: dialogo.error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					onClick: dialogo.confirmar,
					disabled: dialogo.enviando || !dialogo.valido,
					className: "h-11 w-full gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700 sm:w-auto",
					children: dialogo.enviando ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : "Cancelar producción"
				}) })
			]
		})
	});
}
function AlertaFinalizar({ dialogo, prefijo, codigoDe }) {
	const p = dialogo.produccion;
	return /* @__PURE__ */ jsx(AlertDialog$1, {
		open: dialogo.abierto,
		onOpenChange: (open) => !open && dialogo.cerrar(),
		children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Finalizar esta producción?" }), /* @__PURE__ */ jsx(AlertDialogDescription, { children: p && /* @__PURE__ */ jsxs(Fragment$1, { children: [
			"Se marcará como finalizada la producción ",
			prefijo,
			" ",
			/* @__PURE__ */ jsx("span", {
				className: "font-mono font-bold text-slate-900",
				children: codigoDe(p)
			}),
			p.FechaInicioProduccion && /* @__PURE__ */ jsxs(Fragment$1, { children: [", iniciada el ", dateFormatter(p.FechaInicioProduccion)] }),
			". Esta acción no se puede deshacer."
		] }) })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, {
			disabled: dialogo.enviando,
			children: "Cancelar"
		}), /* @__PURE__ */ jsx(AlertDialogAction, {
			onClick: dialogo.confirmar,
			disabled: dialogo.enviando,
			className: "gap-2 bg-emerald-600 hover:bg-emerald-700",
			children: dialogo.enviando ? /* @__PURE__ */ jsx(Loader2, {
				size: 16,
				className: "animate-spin"
			}) : "Finalizar"
		})] })] })
	});
}
//#endregion
//#region src/components/Produccion/Concluidas.jsx
var ID_FINALIZADO = 3;
var ID_CANCELADA = 4;
var ID_CAMBIO_LINEA = 5;
var ATAJOS = [
	{
		valor: "hoy",
		texto: "Hoy",
		rango: (hoy) => ({
			from: hoy,
			to: hoy
		})
	},
	{
		valor: "semana",
		texto: "Esta semana",
		rango: (hoy) => ({
			from: startOfWeek(hoy, { weekStartsOn: 1 }),
			to: hoy
		})
	},
	{
		valor: "mes",
		texto: "Este mes",
		rango: (hoy) => ({
			from: startOfMonth(hoy),
			to: hoy
		})
	}
];
var mismoRango = (rango, otro) => aFechaISO(rango?.from) === aFechaISO(otro.from) && aFechaISO(rango?.to) === aFechaISO(otro.to);
var mismosIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));
var COLUMNA_ESTADO = {
	titulo: "Estado",
	valor: (p) => /* @__PURE__ */ jsx(BadgeEstado, {
		estado: p.NombreEstadoProduccion,
		estilos: ESTADOS_PRODUCCION
	})
};
var COLUMNAS_TIEMPO = [
	{
		titulo: "Inicio",
		clase: "text-[12.5px]",
		valor: (p) => dateFormatter(p.FechaInicioProduccion)
	},
	{
		titulo: "Fin",
		clase: "text-[12.5px]",
		valor: (p) => p.FechaFinProduccion ? dateFormatter(p.FechaFinProduccion) : "-"
	},
	{
		titulo: "Duración",
		...DERECHA,
		valor: (p) => formatearDuracion(p.DuracionTotal)
	}
];
function filtrosEstado(conCambioLinea) {
	return [
		{
			valor: "todas",
			texto: "Todas",
			ids: conCambioLinea ? [
				ID_FINALIZADO,
				ID_CAMBIO_LINEA,
				ID_CANCELADA
			] : [ID_FINALIZADO, ID_CANCELADA]
		},
		{
			valor: "finalizadas",
			texto: "Finalizadas",
			ids: [ID_FINALIZADO]
		},
		...conCambioLinea ? [{
			valor: "cambio",
			texto: "Cambio de línea",
			ids: [ID_CAMBIO_LINEA]
		}] : [],
		{
			valor: "canceladas",
			texto: "Canceladas",
			ids: [ID_CANCELADA]
		}
	];
}
/**
* Pestaña de producciones concluidas (finalizadas, cambio de línea y canceladas)
* del encargado. Cada pantalla de producción pasa su catálogo, columnas y descargas.
*/
function ProduccionesConcluidas({ onTotal, consultar, campoId, idCalendario, conCambioLinea = false, filtroTipo, codigo, columnas, columnasFinales = [], tarjeta, descargarDetalle, descargarCancelada, descargarPeriodo }) {
	const FILTROS_ESTADO = filtrosEstado(conCambioLinea);
	const estadosConcluidos = FILTROS_ESTADO[0].ids;
	const reporte = useReporte(consultar, {
		Rango: ATAJOS[0].rango(/* @__PURE__ */ new Date()),
		IdsEstadoProduccion: estadosConcluidos,
		...filtroTipo && { [filtroTipo.campo]: [] },
		CodigoBobina: ""
	}, ["CodigoBobina"]);
	const { filtros, catalogo } = reporte;
	const { Rango } = filtros;
	useEffect(() => {
		if (catalogo) onTotal?.(catalogo.Total);
	}, [catalogo]);
	const hoy = /* @__PURE__ */ new Date();
	const atajoActivo = ATAJOS.find((atajo) => mismoRango(Rango, atajo.rango(hoy)))?.valor;
	const estadoActivo = FILTROS_ESTADO.find((f) => mismosIds(f.ids, filtros.IdsEstadoProduccion))?.valor;
	const rangoCompleto = Boolean(Rango?.from && Rango?.to);
	const hayFiltros = atajoActivo !== "hoy" || estadoActivo !== "todas" || filtroTipo && filtros[filtroTipo.campo].length > 0 || reporte.textos.CodigoBobina.trim() !== "";
	const botonDetalle = (p) => {
		const cancelada = p.NombreEstadoProduccion === "Cancelada";
		return /* @__PURE__ */ jsx(BotonDescargaFila, {
			ayuda: cancelada ? "Descargar el reporte de la cancelación" : "Descargar el detalle de la producción",
			descargar: () => cancelada ? descargarCancelada(p[campoId]) : descargarDetalle(p[campoId])
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(TarjetaFiltros, {
		reporte: {
			...reporte,
			hayFiltros
		},
		informe: /* @__PURE__ */ jsx(BotonInforme, {
			disponible: rangoCompleto,
			ayuda: "PDF del período con las producciones, pausas y cancelaciones",
			exito: "Reporte del período descargado",
			descargar: () => descargarPeriodo(aFechaISO(Rango.from), aFechaISO(Rango.to), true)
		}),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ jsx(DoubleDatePicker, {
					id: idCalendario,
					label: "Fecha de conclusión",
					value: Rango,
					onChange: (valor) => reporte.cambiar("Rango", valor)
				}), /* @__PURE__ */ jsx(CampoFiltro, {
					etiqueta: "Período",
					children: /* @__PURE__ */ jsx(ToggleGroup, {
						value: atajoActivo ? [atajoActivo] : [],
						className: "flex flex-wrap justify-start gap-2",
						children: ATAJOS.map((atajo) => /* @__PURE__ */ jsx(ToggleGroupItem, {
							value: atajo.valor,
							onClick: () => reporte.cambiar("Rango", atajo.rango(/* @__PURE__ */ new Date())),
							className: PILDORA_FILTRO,
							children: atajo.texto
						}, atajo.valor))
					})
				})]
			}),
			/* @__PURE__ */ jsx(CampoFiltro, {
				etiqueta: "Estado",
				children: /* @__PURE__ */ jsx(ToggleGroup, {
					value: estadoActivo ? [estadoActivo] : [],
					className: "flex flex-wrap justify-start gap-2",
					children: FILTROS_ESTADO.map((f) => /* @__PURE__ */ jsx(ToggleGroupItem, {
						value: f.valor,
						onClick: () => reporte.cambiar("IdsEstadoProduccion", f.ids),
						className: PILDORA_FILTRO,
						children: f.texto
					}, f.valor))
				})
			}),
			filtroTipo && /* @__PURE__ */ jsx(FiltroTipos, {
				reporte,
				tipo: filtroTipo
			}),
			/* @__PURE__ */ jsx(BuscadorFiltro, {
				reporte,
				campo: "CodigoBobina",
				etiqueta: codigo.etiqueta,
				placeholder: codigo.placeholder
			})
		]
	}), /* @__PURE__ */ jsx(ResultadosReporte, {
		reporte,
		elementos: catalogo?.Producciones,
		clave: (p) => p[campoId],
		nombres: ["producción concluida", "producciones concluidas"],
		columnas: [
			COLUMNA_ESTADO,
			...columnas,
			...COLUMNAS_TIEMPO,
			...columnasFinales
		],
		accion: botonDetalle,
		tarjeta: (p) => /* @__PURE__ */ jsxs(TarjetaReporte, {
			titulo: tarjeta.titulo(p),
			tamanoTitulo: "text-[13.5px]",
			subtitulo: tarjeta.subtitulo(p),
			estado: p.NombreEstadoProduccion,
			estilos: ESTADOS_PRODUCCION,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-600",
				children: [
					/* @__PURE__ */ jsxs("span", { children: ["Inicio ", dateFormatter(p.FechaInicioProduccion)] }),
					p.FechaFinProduccion && /* @__PURE__ */ jsxs("span", { children: ["Fin ", dateFormatter(p.FechaFinProduccion)] }),
					/* @__PURE__ */ jsxs("span", { children: ["Duración ", formatearDuracion(p.DuracionTotal)] }),
					tarjeta.extra?.(p)
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-end border-t border-slate-200 pt-2.5",
				children: botonDetalle(p)
			})]
		})
	})] });
}
//#endregion
export { ListaProducciones as a, TarjetaProduccion as c, DialogoPausar as i, useProduccion as l, AlertaFinalizar as n, ResumenProduccion as o, DialogoCancelar as r, TabsProduccion as s, ProduccionesConcluidas as t };
