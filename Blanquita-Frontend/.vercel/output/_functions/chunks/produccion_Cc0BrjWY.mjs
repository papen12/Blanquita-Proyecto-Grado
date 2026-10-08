import { a as limpiarObservacion, i as extraerMensajeError } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { r as alternarMotivoEnTexto } from "./handlers_w7fuW24c.mjs";
import { l as ObservacionesRodela } from "./OperadorConfig_tt2Z91F-.mjs";
import { r as listarRodelasReingresables, t as deshacerTrasladoRodela } from "./Inventario_Fw4KWp2f.mjs";
import { useCallback, useEffect, useState } from "react";
import { Clock, Disc, Loader2, RefreshCcw, Undo2 } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/Rodela/produccion.jsx
var INTERVALO_REFRESCO_MS = 3e4;
var INTERVALO_TICK_MS = 15e3;
function colorRestante(min) {
	if (min <= 3) return {
		text: "text-red-600",
		bg: "bg-red-50"
	};
	if (min <= 10) return {
		text: "text-amber-600",
		bg: "bg-amber-50"
	};
	return {
		text: "text-emerald-600",
		bg: "bg-emerald-50"
	};
}
function TarjetaRodela({ r, restante, procesando, onReingresar }) {
	const c = colorRestante(restante);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx(Disc, {
						className: "h-7 w-7 shrink-0 text-c3",
						strokeWidth: 2
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ jsx("div", {
							className: "font-mono text-[15px] font-extrabold text-slate-900",
							children: r.CodigoRodela
						}), /* @__PURE__ */ jsx("div", {
							className: "text-[12.5px] font-semibold text-slate-500",
							children: r.NombreTipoRodela
						})]
					})]
				}), /* @__PURE__ */ jsx(Badge, {
					className: cn("border-0 font-bold tabular-nums", c.bg, c.text),
					children: restante <= 0 ? "Expirando…" : `${restante} min`
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-600",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ jsx(Clock, {
							size: 13,
							strokeWidth: 2.75
						}),
						"Enviada a producción: ",
						dateFormatter(r.FechaTraslado)
					]
				}), /* @__PURE__ */ jsxs("span", { children: [
					r.NombreProveedor,
					" · recibida ",
					dateFormatter(r.FechaRecepcion)
				] })]
			}),
			/* @__PURE__ */ jsx(Button, {
				onClick: () => onReingresar(r),
				disabled: procesando || restante <= 0,
				className: "h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90",
				children: procesando ? /* @__PURE__ */ jsx(Loader2, {
					size: 16,
					className: "animate-spin"
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Undo2, {
					size: 16,
					strokeWidth: 2.75
				}), "Reingresar al almacén"] })
			})
		]
	});
}
function ProduccionRodela({ usuario }) {
	const [rodelas, setRodelas] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");
	const [fetchedAt, setFetchedAt] = useState(() => Date.now());
	const [ahora, setAhora] = useState(() => Date.now());
	const [dialog, setDialog] = useState({
		open: false,
		rodela: null
	});
	const [formMotivo, setFormMotivo] = useState("");
	const [errorReingreso, setErrorReingreso] = useState("");
	const [procesandoId, setProcesandoId] = useState(null);
	const [enviando, setEnviando] = useState(false);
	const cargar = useCallback(async ({ silencioso = false } = {}) => {
		if (!silencioso) setCargando(true);
		setError("");
		try {
			setRodelas(await listarRodelasReingresables());
			setFetchedAt(Date.now());
		} catch (e) {
			if (!silencioso) setError(extraerMensajeError(e, e.message));
		} finally {
			if (!silencioso) setCargando(false);
		}
	}, []);
	useEffect(() => {
		cargar();
	}, [cargar]);
	useEffect(() => {
		const tick = setInterval(() => setAhora(Date.now()), INTERVALO_TICK_MS);
		const refetch = setInterval(() => cargar({ silencioso: true }), INTERVALO_REFRESCO_MS);
		return () => {
			clearInterval(tick);
			clearInterval(refetch);
		};
	}, [cargar]);
	const restanteDe = (r) => {
		const transcurrido = (ahora - fetchedAt) / 6e4;
		return Math.max(0, Math.round(r.MinutosRestantes - transcurrido));
	};
	const visibles = rodelas.filter((r) => restanteDe(r) > 0);
	const motivosSeleccionados = ObservacionesRodela.filter((m) => formMotivo.includes(m));
	const motivoLimpio = formMotivo.trim();
	const motivoValido = motivoLimpio.length >= 5 && motivoLimpio.length <= 150;
	const abrirDialog = (rodela) => {
		setFormMotivo("");
		setErrorReingreso("");
		setDialog({
			open: true,
			rodela
		});
	};
	const alternarMotivo = (motivo) => {
		setFormMotivo((actual) => alternarMotivoEnTexto(motivo, actual));
	};
	const confirmarReingreso = async () => {
		const rodela = dialog.rodela;
		if (!rodela) return;
		if (!motivoValido) {
			setErrorReingreso(`El motivo debe tener entre 5 y 150 caracteres`);
			return;
		}
		setEnviando(true);
		setErrorReingreso("");
		setProcesandoId(rodela.IdRodela);
		try {
			await deshacerTrasladoRodela(rodela.IdRodela, motivoLimpio);
			toast.success(`${rodela.CodigoRodela} reingresada al almacén`);
			setDialog({
				open: false,
				rodela: null
			});
		} catch (e) {
			setErrorReingreso(extraerMensajeError(e, e.message));
		} finally {
			setEnviando(false);
			setProcesandoId(null);
			cargar({ silencioso: true });
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Almacén · Materia Prima",
				subtitulo: "Rodelas enviadas a producción",
				children: /* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: () => cargar(),
					className: "h-11 gap-2 font-bold text-white hover:bg-white/15 hover:text-white",
					children: [/* @__PURE__ */ jsx(RefreshCcw, {
						size: 16,
						strokeWidth: 2.75
					}), "Actualizar"]
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "mb-4 rounded-xl bg-c1/10 px-4 py-3 text-[13px] font-medium text-c3",
						children: "Solo aparecen las rodelas trasladadas en los últimos 30 minutos. Pasado ese tiempo el traslado queda firme y ya no puede deshacerse."
					}),
					cargando && /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							0,
							1,
							2
						].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-52 rounded-2xl" }, i))
					}),
					!cargando && error && /* @__PURE__ */ jsx("div", {
						className: "rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600",
						children: error
					}),
					!cargando && !error && visibles.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200",
						children: "No hay rodelas que se puedan reingresar en este momento."
					}),
					!cargando && !error && visibles.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: visibles.map((r) => /* @__PURE__ */ jsx(TarjetaRodela, {
							r,
							restante: restanteDe(r),
							procesando: procesandoId === r.IdRodela,
							onReingresar: abrirDialog
						}, r.IdRodela))
					})
				]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: dialog.open,
				onOpenChange: (open) => setDialog({
					open,
					rodela: open ? dialog.rodela : null
				}),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Reingresar rodela al almacén" }) }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4",
							children: [
								dialog.rodela && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold text-slate-900",
										children: dialog.rodela.CodigoRodela
									}), /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1 text-[12px] text-slate-500",
										children: [
											/* @__PURE__ */ jsx(Clock, {
												size: 12,
												strokeWidth: 2.75
											}),
											"Enviada: ",
											dateFormatter(dialog.rodela.FechaTraslado)
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										className: "text-xs font-bold uppercase tracking-wide text-slate-600",
										children: "Motivos frecuentes"
									}), /* @__PURE__ */ jsx(ToggleGroup, {
										type: "multiple",
										value: motivosSeleccionados,
										className: "flex flex-wrap justify-start gap-2",
										children: ObservacionesRodela.map((motivo) => /* @__PURE__ */ jsx(ToggleGroupItem, {
											value: motivo,
											onClick: () => alternarMotivo(motivo),
											className: "h-auto whitespace-normal rounded-full border-2 border-slate-200 px-3.5 py-2 text-left text-[12.5px] font-bold text-slate-600 bg-white hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
											children: motivo
										}, motivo))
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "motivo-reingreso",
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Detalle del reingreso"
										}),
										/* @__PURE__ */ jsx(Textarea, {
											id: "motivo-reingreso",
											value: formMotivo,
											onChange: (e) => setFormMotivo(limpiarObservacion(e.target.value)),
											placeholder: "Ej. Se escaneó la rodela equivocada al enviar a producción...",
											className: "min-h-20",
											maxLength: 150
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500",
											children: [
												motivoLimpio.length,
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
								errorReingreso && /* @__PURE__ */ jsx("div", {
									className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
									children: errorReingreso
								})
							]
						}),
						/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
							onClick: confirmarReingreso,
							disabled: enviando || !motivoValido,
							className: "h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90 sm:w-auto",
							children: enviando ? /* @__PURE__ */ jsx(Loader2, {
								size: 16,
								className: "animate-spin"
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Undo2, {
								size: 16,
								strokeWidth: 2.75
							}), "Reingresar al almacén"] })
						}) })
					]
				})
			})
		]
	});
}
//#endregion
export { ProduccionRodela as t };
