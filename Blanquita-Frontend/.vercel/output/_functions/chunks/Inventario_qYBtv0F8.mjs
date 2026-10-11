import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion, i as extraerMensajeError } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, i as TooltipProvider } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { _ as conAcentos, a as ContenidoLista, c as EncabezadoCatalogo, f as PanelDetalle, g as coincide, h as TarjetaTipo, i as CasillaSeleccion, l as EstadoCatalogo, n as BarraSeleccion, o as DatoTarjeta, r as BuscadorCodigo, u as GRID_TARJETAS, v as useEjecutar, y as useDetalleInventario } from "./comunes_DMeMK0C5.mjs";
import { t as BotonDescarga } from "./BotonDescarga_Cx_h4_wb.mjs";
import { t as descargarReporteInventarioRodela } from "./Reportes_B8aPqdfn.mjs";
import { a as verDetalleInventarioRodela, i as trasladarRodelaAProduccion, n as editarRodela, o as verResumenInventarioRodela } from "./Inventario_Fw4KWp2f.mjs";
import { useState } from "react";
import { Disc, Loader2, Pencil, Plus, SquarePen } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/Rodela/Inventario.jsx
var ESTADO_ALMACEN = "En almacén";
var REQUERIDAS = 1;
var etiquetaRodelas = (n) => {
	const cantidad = Number(n || 0);
	return `${cantidad} ${cantidad === 1 ? "rodela" : "rodelas"}`;
};
var cargarRodelasEnAlmacen = async (idTipoRodela) => {
	return (await verDetalleInventarioRodela(idTipoRodela)).filter((r) => r.TipoEstado === ESTADO_ALMACEN);
};
function BotonEditar({ rodela, onEditar, className }) {
	return /* @__PURE__ */ jsxs(Button, {
		variant: "outline",
		size: "sm",
		onClick: () => onEditar(rodela),
		"aria-label": `Editar ${rodela.CodigoRodela}`,
		className: cn("gap-1.5 font-bold text-c3", className),
		children: [/* @__PURE__ */ jsx(SquarePen, {
			size: 14,
			strokeWidth: 2.5
		}), "Editar"]
	});
}
function TablaRodelas({ rodelas, tipoSel, marcadas, onToggle, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, {
			className: "min-w-[560px]",
			children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
				className: "hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, { className: "w-11 pl-5" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Código" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Lote" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Recepción" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: cn(!onEditar && "pr-5"),
						children: "Proveedor"
					}),
					onEditar && /* @__PURE__ */ jsx(TableHead, {
						className: "pr-5 text-right",
						children: "Acción"
					})
				]
			}) }), /* @__PURE__ */ jsx(TableBody, { children: rodelas.map((r) => {
				const on = marcadas.includes(r.CodigoRodela);
				return /* @__PURE__ */ jsxs(TableRow, {
					className: cn(on && tipoSel.soft),
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "pl-5",
							children: /* @__PURE__ */ jsx(CasillaSeleccion, {
								marcada: on,
								acento: tipoSel,
								onClick: () => onToggle(r.CodigoRodela)
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: cn("font-mono font-bold", tipoSel.text),
							children: r.CodigoRodela
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: r.CodigoLote
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: dateFormatter(r.FechaRecepcion)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: cn("text-slate-600", !onEditar && "pr-5"),
							children: r.NombreProveedor
						}),
						onEditar && /* @__PURE__ */ jsx(TableCell, {
							className: "pr-5 text-right",
							children: /* @__PURE__ */ jsx(BotonEditar, {
								rodela: r,
								onEditar
							})
						})
					]
				}, r.IdRodela);
			}) })]
		})
	});
}
function ListaMovilRodelas({ rodelas, tipoSel, marcadas, onToggle, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2.5 p-3.5",
		children: rodelas.map((r) => {
			const on = marcadas.includes(r.CodigoRodela);
			return /* @__PURE__ */ jsxs("div", {
				className: cn("flex flex-col gap-2.5 rounded-2xl border-2 p-3.5", on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white"),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: cn("font-mono text-[15px] font-extrabold", tipoSel.text),
						children: r.CodigoRodela
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex shrink-0 items-center gap-1.5",
						children: [onEditar && /* @__PURE__ */ jsx(BotonEditar, {
							rodela: r,
							onEditar
						}), /* @__PURE__ */ jsx(CasillaSeleccion, {
							marcada: on,
							acento: tipoSel,
							grande: true,
							onClick: () => onToggle(r.CodigoRodela)
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						/* @__PURE__ */ jsx("strong", {
							className: "text-slate-900",
							children: r.CodigoLote
						}),
						" ·",
						" ",
						dateFormatter(r.FechaRecepcion)
					] }), /* @__PURE__ */ jsx("span", { children: r.NombreProveedor })]
				})]
			}, r.IdRodela);
		})
	});
}
function InventarioRodelas({ usuario }) {
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const resumen = useCatalogo(verResumenInventarioRodela);
	const detalle = useDetalleInventario(cargarRodelasEnAlmacen);
	const envio = useEjecutar();
	const [dialogEditar, setDialogEditar] = useState({
		open: false,
		rodela: null
	});
	const [formCodigo, setFormCodigo] = useState("");
	const [formMotivo, setFormMotivo] = useState("");
	const [errorEditar, setErrorEditar] = useState("");
	const [guardandoEditar, setGuardandoEditar] = useState(false);
	const tipos = conAcentos(resumen.datos, { cantidadDe: (t) => t.CantidadEnAlmacen });
	const tipoSel = detalle.sel ? tipos.find((t) => t.IdTipoRodela === detalle.sel) : null;
	const { marcadas, setMarcadas } = detalle;
	const listas = marcadas.length === REQUERIDAS;
	const totalEnAlmacen = tipos.reduce((s, t) => s + Number(t.CantidadEnAlmacen || 0), 0);
	const rodelasFiltradas = detalle.datos.filter((r) => coincide(detalle.busqueda, r.CodigoRodela));
	const toggleRodela = (codigo) => {
		setMarcadas((prev) => prev.includes(codigo) ? [] : [codigo]);
	};
	const quitarChip = (codigo) => setMarcadas((prev) => prev.filter((c) => c !== codigo));
	const refrescar = () => {
		resumen.recargar();
		detalle.recargar();
	};
	const enviarProduccion = () => {
		if (!listas) return;
		const rodela = detalle.datos.find((r) => r.CodigoRodela === marcadas[0]);
		if (!rodela) return;
		envio.ejecutar("envio", () => trasladarRodelaAProduccion(rodela.IdRodela), `${rodela.CodigoRodela} → Abierta en producción`, () => {
			setMarcadas([]);
			refrescar();
		});
	};
	const codigoLimpio = formCodigo.trim();
	const motivoLimpio = formMotivo.trim();
	const codigoCambio = !!dialogEditar.rodela && codigoLimpio !== "" && codigoLimpio !== dialogEditar.rodela.CodigoRodela;
	const motivoValido = motivoLimpio.length >= 5 && motivoLimpio.length <= 150;
	const abrirEditar = (rodela) => {
		setFormCodigo(rodela.CodigoRodela);
		setFormMotivo("");
		setErrorEditar("");
		setDialogEditar({
			open: true,
			rodela
		});
	};
	const confirmarEditar = async () => {
		const rodela = dialogEditar.rodela;
		if (!rodela || !codigoCambio || !motivoValido) return;
		setGuardandoEditar(true);
		setErrorEditar("");
		try {
			const res = await editarRodela(rodela.IdRodela, codigoLimpio, motivoLimpio);
			toast.success(`${res.CodigoAnterior} → ${res.CodigoRodela} actualizada`);
			setDialogEditar({
				open: false,
				rodela: null
			});
			setMarcadas((prev) => prev.filter((c) => c !== res.CodigoAnterior));
			refrescar();
		} catch (e) {
			setErrorEditar(extraerMensajeError(e, e.message));
		} finally {
			setGuardandoEditar(false);
		}
	};
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Almacén · Materia Prima",
				subtitulo: "Inventario de Rodelas",
				accion: esEncargado ? {
					texto: "Registrar ingreso",
					icono: Plus,
					href: "/encargado/rodela/ingreso"
				} : null,
				children: esEncargado && /* @__PURE__ */ jsx(BotonDescarga, {
					texto: "Descargar inventario",
					ayuda: "PDF con el inventario completo de todos los tipos de rodela",
					exito: "Informe de inventario descargado",
					descargar: () => descargarReporteInventarioRodela(null)
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsxs(EncabezadoCatalogo, {
						titulo: "Catálogo por tipo de rodela",
						children: [
							totalEnAlmacen,
							" rodelas ",
							/* @__PURE__ */ jsx("strong", {
								className: "text-slate-700",
								children: "en almacén"
							})
						]
					}),
					/* @__PURE__ */ jsx(EstadoCatalogo, {
						cargando: resumen.cargando,
						error: resumen.error,
						vacio: tipos.length === 0,
						mensajeVacio: "No hay tipos de rodela registrados.",
						altoSkeleton: "h-52",
						children: /* @__PURE__ */ jsx("div", {
							className: GRID_TARJETAS,
							children: tipos.map((t) => /* @__PURE__ */ jsxs(TarjetaTipo, {
								acento: t,
								activo: detalle.sel === t.IdTipoRodela,
								onClick: () => detalle.seleccionar(t.IdTipoRodela),
								icono: Disc,
								nombre: t.NombreTipoRodela,
								etiqueta: t.badge,
								cantidad: t.CantidadEnAlmacen,
								unidad: "rodelas en almacén",
								textoVer: "Ver rodelas",
								children: [/* @__PURE__ */ jsx(DatoTarjeta, {
									etiqueta: "Abiertas en producción",
									children: etiquetaRodelas(t.CantidadAbiertas)
								}), t.Descripcion && /* @__PURE__ */ jsx("div", {
									className: "text-[12.5px] leading-snug text-slate-500",
									children: t.Descripcion
								})]
							}, t.IdTipoRodela))
						})
					}),
					tipoSel && /* @__PURE__ */ jsxs(PanelDetalle, {
						acento: tipoSel,
						icono: Disc,
						titulo: `Rodelas · ${tipoSel.NombreTipoRodela}`,
						subtitulo: `${tipoSel.CantidadEnAlmacen} en almacén · ${tipoSel.CantidadAbiertas} abiertas`,
						etiqueta: "Se traslada 1 rodela",
						onCerrar: detalle.cerrar,
						children: [/* @__PURE__ */ jsxs(ContenidoLista, {
							cargando: detalle.cargando,
							error: detalle.error,
							total: detalle.datos.length,
							cantidadFiltrada: rodelasFiltradas.length,
							buscador: /* @__PURE__ */ jsx(BuscadorCodigo, {
								valor: detalle.busqueda,
								onCambio: detalle.setBusqueda
							}),
							mensajeVacio: "No hay rodelas en almacén para este tipo.",
							mensajeSinCoincidencias: `Ninguna rodela coincide con "${detalle.busqueda}".`,
							children: [/* @__PURE__ */ jsx("div", {
								className: "hidden md:block",
								children: /* @__PURE__ */ jsx(TablaRodelas, {
									rodelas: rodelasFiltradas,
									tipoSel,
									marcadas,
									onToggle: toggleRodela,
									onEditar: esEncargado ? abrirEditar : null
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "md:hidden",
								children: /* @__PURE__ */ jsx(ListaMovilRodelas, {
									rodelas: rodelasFiltradas,
									tipoSel,
									marcadas,
									onToggle: toggleRodela,
									onEditar: esEncargado ? abrirEditar : null
								})
							})]
						}), marcadas.length > 0 && /* @__PURE__ */ jsx(BarraSeleccion, {
							chips: marcadas.map((codigo) => ({
								clave: codigo,
								texto: codigo,
								onQuitar: () => quitarChip(codigo)
							})),
							estado: listas ? "Listo para trasladar" : `Selecciona ${REQUERIDAS - marcadas.length} más`,
							listo: listas,
							enviando: envio.enProceso === "envio",
							onEnviar: enviarProduccion,
							textoAccion: "Trasladar a producción",
							textoEnviando: "Trasladando..."
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: dialogEditar.open,
				onOpenChange: (open) => setDialogEditar({
					open,
					rodela: open ? dialogEditar.rodela : null
				}),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Editar rodela" }) }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4",
							children: [
								dialogEditar.rodela && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
											children: "Código actual"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "font-mono font-bold text-slate-900",
											children: dialogEditar.rodela.CodigoRodela
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-[12px] text-slate-500",
											children: [
												dialogEditar.rodela.CodigoLote,
												" · ",
												dialogEditar.rodela.NombreProveedor
											]
										})
									]
								}),
								/* @__PURE__ */ jsx(InputForModal, {
									id: "codigo-rodela-editar",
									etiqueta: "Nuevo código",
									valor: formCodigo,
									onCambio: (valor) => setFormCodigo(aCodigo(valor)),
									classNameInput: "font-mono font-bold",
									autoComplete: "off"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "motivo-editar-rodela",
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Motivo de la corrección"
										}),
										/* @__PURE__ */ jsx(Textarea, {
											id: "motivo-editar-rodela",
											value: formMotivo,
											onChange: (e) => setFormMotivo(limpiarObservacion(e.target.value)),
											placeholder: "Ej. Error de digitación al registrar el ingreso...",
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
								errorEditar && /* @__PURE__ */ jsx("div", {
									className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
									children: errorEditar
								})
							]
						}),
						/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
							onClick: confirmarEditar,
							disabled: guardandoEditar || !codigoCambio || !motivoValido,
							className: "h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90 sm:w-auto",
							children: guardandoEditar ? /* @__PURE__ */ jsx(Loader2, {
								size: 16,
								className: "animate-spin"
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Pencil, {
								size: 16,
								strokeWidth: 2.75
							}), "Guardar cambios"] })
						}) })
					]
				})
			})
		]
	}) });
}
//#endregion
export { InventarioRodelas as t };
