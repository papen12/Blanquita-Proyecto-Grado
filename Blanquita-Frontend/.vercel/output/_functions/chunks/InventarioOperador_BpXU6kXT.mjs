import { a as Roles, t as IDS_PRODUCTO_BOBINA_HIGIENICO } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion, n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, i as TooltipProvider } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, i as DialogDescription, n as DialogClose, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import "./Acentos_7-zo-5xR.mjs";
import { t as useOpciones } from "./useOpciones_DRlb-Ko1.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { i as editarBobinaPapel } from "./BobinaPapel_DoOm6qcL.mjs";
import { i as codigoKeyDown, n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { o as obtenerProductos } from "./Inventario_DSn0sOXY.mjs";
import { i as iniciarProduccion } from "./Produccion_DbvHg5rL.mjs";
import { n as descargarReporteInventarioBobinaPapel } from "./Reportes_BJrOcONl.mjs";
import { _ as conAcentos, a as ContenidoLista, c as EncabezadoCatalogo, d as ItemFueraInventario, f as PanelDetalle, g as coincide, h as TarjetaTipo, i as CasillaSeleccion, l as EstadoCatalogo, m as TarjetaFueraInventario, n as BarraSeleccion, o as DatoTarjeta, p as PanelFuera, r as BuscadorCodigo, s as DialogReingreso, t as BadgeReingresada, u as GRID_TARJETAS, v as useEjecutar, y as useDetalleInventario } from "./comunes_DMeMK0C5.mjs";
import { t as BotonDescarga } from "./BotonDescarga_Cx_h4_wb.mjs";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Cylinder, Loader2, Plus, SquarePen } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/models/BobinaPapel/Inventario.js
var VerResumenInventarioBobinaPapelResponse = (data) => ({
	IdTipoBobina: data.IdTipoBobina,
	NombreTipoBobina: data.NombreTipoBobina,
	CantidadBobinas: data.CantidadBobinas,
	PesoNetoTotalKg: data.PesoNetoTotalKg,
	GramajePromedio: data.GramajePromedio
});
var VerDetalleInventarioBobinaPapelResponse = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	CodigoBobina: data.CodigoBobina,
	CodigoLote: data.CodigoLote,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	PesoBrutoKg: data.PesoBrutoKg,
	PesoNetoKg: data.PesoNetoKg,
	Gramaje: data.Gramaje,
	Reingresada: data.Reingresada ?? false,
	FechaUltimoReingreso: data.FechaUltimoReingreso ?? null
});
var ReingresarBobinaAInventarioRequest = (idBobinaPapel, observacion) => ({
	IdBobinaPapel: idBobinaPapel,
	Observacion: observacion ?? null
});
var ReingresarBobinaAInventarioResponse = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var VerBobinasPapelFueraInventarioResponse = (data) => ({
	IdBobinaPapel: data.IdBobinaPapel,
	CodigoBobina: data.CodigoBobina,
	NombreTipoBobina: data.NombreTipoBobina,
	PesoBrutoKg: data.PesoBrutoKg ?? null,
	Gramaje: data.Gramaje ?? null,
	NombreProveedor: data.NombreProveedor,
	FechaRecepcion: data.FechaRecepcion,
	UltimaObservacion: data.UltimaObservacion ?? null,
	FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});
//#endregion
//#region src/services/BobinaPapel/Inventario.js
async function verResumenInventarioBobinaPapel() {
	return (await pedirJson("/api/papelbobina/inventario/resumen")).map(VerResumenInventarioBobinaPapelResponse);
}
async function verDetalleInventarioBobinaPapel(idTipoBobina) {
	return (await pedirJson(`/api/papelbobina/inventario/detalle/${idTipoBobina}`)).map(VerDetalleInventarioBobinaPapelResponse);
}
async function reingresarBobinaInventario(idBobinaPapel, observacion) {
	return ReingresarBobinaAInventarioResponse(await pedirJson("/api/papelbobina/inventario/reingresar", {
		method: "POST",
		body: ReingresarBobinaAInventarioRequest(idBobinaPapel, observacion)
	}));
}
async function verBobinasPapelFueraInventario() {
	return (await pedirJson("/api/papelbobina/inventario/fuera")).map(VerBobinasPapelFueraInventarioResponse);
}
//#endregion
//#region src/components/PapelBobina/Inventario/constantes.js
var fmt = (n) => formatearNumero(n, {
	decimales: 1,
	decimalesMinimos: 0
});
//#endregion
//#region src/components/PapelBobina/Inventario/TablaBobinas.jsx
function TablaBobinas({ bobinas, tipoSel, marcadas, onToggle, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, {
			className: "min-w-[640px]",
			children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
				className: "hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, { className: "w-11 pl-5" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Código" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Lote" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Recepción" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Proveedor" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "text-right",
						children: "Peso bruto"
					}),
					/* @__PURE__ */ jsx(TableHead, {
						className: "text-right",
						children: "Peso neto"
					}),
					/* @__PURE__ */ jsx(TableHead, {
						className: cn("text-right", !onEditar && "pr-5"),
						children: "Gramaje"
					}),
					onEditar && /* @__PURE__ */ jsx(TableHead, {
						className: "pr-5 text-right",
						children: "Acción"
					})
				]
			}) }), /* @__PURE__ */ jsx(TableBody, { children: bobinas.map((b) => {
				const on = marcadas.includes(b.CodigoBobina);
				return /* @__PURE__ */ jsxs(TableRow, {
					onClick: () => onToggle(b.CodigoBobina),
					className: cn("cursor-pointer", on && tipoSel.soft),
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "pl-5",
							children: /* @__PURE__ */ jsx(CasillaSeleccion, {
								marcada: on,
								acento: tipoSel
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: cn("font-mono font-bold", tipoSel.text),
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [b.CodigoBobina, b.Reingresada && /* @__PURE__ */ jsx(BadgeReingresada, { fecha: b.FechaUltimoReingreso })]
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: b.CodigoLote
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: dateFormatter(b.FechaRecepcion)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: b.NombreProveedor
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right tabular-nums text-slate-600",
							children: [fmt(b.PesoBrutoKg), " kg"]
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right font-bold tabular-nums text-slate-900",
							children: [fmt(b.PesoNetoKg), " kg"]
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: cn("text-right tabular-nums text-slate-600", !onEditar && "pr-5"),
							children: [fmt(b.Gramaje), " g/m²"]
						}),
						onEditar && /* @__PURE__ */ jsx(TableCell, {
							className: "pr-5 text-right",
							onClick: (e) => e.stopPropagation(),
							children: /* @__PURE__ */ jsxs(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => onEditar(b),
								className: "gap-1.5 font-bold text-c3",
								children: [/* @__PURE__ */ jsx(SquarePen, {
									size: 14,
									strokeWidth: 2.5
								}), "Editar"]
							})
						})
					]
				}, b.IdBobinaPapel);
			}) })]
		})
	});
}
//#endregion
//#region src/components/PapelBobina/Inventario/MiniStat.jsx
function MiniStat({ label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex-1 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[10px] font-bold uppercase tracking-wide text-slate-500",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "text-sm font-bold tabular-nums text-slate-900",
			children: value
		})]
	});
}
//#endregion
//#region src/components/PapelBobina/Inventario/ListaMovilBobinas.jsx
function ListaMovilBobinas({ bobinas, tipoSel, marcadas, onToggle, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2.5 p-3.5",
		children: bobinas.map((b) => {
			const on = marcadas.includes(b.CodigoBobina);
			return /* @__PURE__ */ jsxs("div", {
				onClick: () => onToggle(b.CodigoBobina),
				className: cn("flex flex-col gap-2.5 rounded-2xl border-2 p-3.5", on ? tipoSel.soft : "border-slate-200 bg-white", on && tipoSel.border),
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-2.5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("div", {
								className: cn("font-mono text-[15px] font-extrabold", tipoSel.text),
								children: b.CodigoBobina
							}), b.Reingresada && /* @__PURE__ */ jsx(BadgeReingresada, { fecha: b.FechaUltimoReingreso })]
						}), /* @__PURE__ */ jsx(CasillaSeleccion, {
							marcada: on,
							acento: tipoSel,
							grande: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
						children: [
							/* @__PURE__ */ jsxs("span", { children: [
								/* @__PURE__ */ jsx("strong", {
									className: "text-slate-900",
									children: b.CodigoLote
								}),
								" ·",
								" ",
								dateFormatter(b.FechaRecepcion)
							] }),
							/* @__PURE__ */ jsx("span", { children: b.NombreProveedor }),
							b.Reingresada && b.FechaUltimoReingreso && /* @__PURE__ */ jsxs("span", {
								className: "font-semibold text-amber-700",
								children: ["Reingreso: ", dateFormatter(b.FechaUltimoReingreso)]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ jsx(MiniStat, {
								label: "Bruto",
								value: `${fmt(b.PesoBrutoKg)} kg`
							}),
							/* @__PURE__ */ jsx(MiniStat, {
								label: "Neto",
								value: `${fmt(b.PesoNetoKg)} kg`
							}),
							/* @__PURE__ */ jsx(MiniStat, {
								label: "Gramaje",
								value: `${fmt(b.Gramaje)} g/m²`
							})
						]
					}),
					onEditar && /* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						onClick: (e) => {
							e.stopPropagation();
							onEditar(b);
						},
						className: "h-10 gap-1.5 self-end font-bold text-c3",
						children: [/* @__PURE__ */ jsx(SquarePen, {
							size: 15,
							strokeWidth: 2.5
						}), "Editar"]
					})
				]
			}, b.IdBobinaPapel);
		})
	});
}
//#endregion
//#region src/components/PapelBobina/Inventario/ModalEditarBobina.jsx
var aTexto = (valor) => valor === null || valor === void 0 || valor === "" ? "" : String(Number(valor));
var aNumero = (valor) => valor === "" ? null : Number(valor);
var formularioDesde = (bobina) => ({
	CodigoBobina: bobina?.CodigoBobina ?? "",
	PesoBrutoKg: aTexto(bobina?.PesoBrutoKg),
	PesoNetoKg: aTexto(bobina?.PesoNetoKg),
	Gramaje: aTexto(bobina?.Gramaje),
	Observacion: ""
});
function validar(form) {
	const errores = {};
	const bruto = Number(form.PesoBrutoKg);
	const neto = Number(form.PesoNetoKg);
	const motivo = form.Observacion.trim();
	if (!form.CodigoBobina.trim()) errores.CodigoBobina = "El código es obligatorio";
	if (form.PesoBrutoKg === "" || !(bruto > 0)) errores.PesoBrutoKg = "Peso bruto inválido";
	if (form.PesoNetoKg === "" || !(neto > 0)) errores.PesoNetoKg = "Peso neto inválido";
	else if (bruto > 0 && neto > bruto) errores.PesoNetoKg = "El neto supera al bruto";
	if (form.Gramaje !== "" && !(Number(form.Gramaje) > 0)) errores.Gramaje = "Gramaje inválido";
	if (motivo.length < 5 || motivo.length > 150) errores.Observacion = `El motivo debe tener entre 5 y 150 caracteres`;
	return errores;
}
function calcularCambios(form, bobina) {
	if (!bobina) return [];
	const cambios = [];
	const codigo = form.CodigoBobina.trim();
	if (codigo !== bobina.CodigoBobina) cambios.push({
		campo: "Código",
		antes: bobina.CodigoBobina,
		despues: codigo
	});
	[
		[
			"PesoBrutoKg",
			"Peso bruto",
			" kg"
		],
		[
			"PesoNetoKg",
			"Peso neto",
			" kg"
		],
		[
			"Gramaje",
			"Gramaje",
			" g/m²"
		]
	].forEach(([clave, campo, unidad]) => {
		const antes = aNumero(aTexto(bobina[clave]));
		const despues = aNumero(form[clave]);
		if (antes !== despues) cambios.push({
			campo,
			antes: antes === null ? "-" : `${fmt(antes)}${unidad}`,
			despues: despues === null ? "-" : `${fmt(despues)}${unidad}`
		});
	});
	return cambios;
}
function ModalEditarBobina({ abierto, onOpenChange, bobina, nombreTipo, onGuardado }) {
	const [form, setForm] = useState(() => formularioDesde(bobina));
	const [errores, setErrores] = useState({});
	const [errorEnvio, setErrorEnvio] = useState("");
	const [guardando, setGuardando] = useState(false);
	useEffect(() => {
		if (abierto) {
			setForm(formularioDesde(bobina));
			setErrores({});
			setErrorEnvio("");
			setGuardando(false);
		}
	}, [abierto, bobina]);
	const actualizar = (campo) => (valor) => {
		setForm((prev) => ({
			...prev,
			[campo]: valor
		}));
		setErrorEnvio("");
		setErrores((prev) => {
			if (!prev[campo]) return prev;
			const { [campo]: _omitido, ...resto } = prev;
			return resto;
		});
	};
	const cambios = calcularCambios(form, bobina);
	const largoMotivo = form.Observacion.trim().length;
	const guardar = async () => {
		const nuevosErrores = validar(form);
		setErrores(nuevosErrores);
		if (Object.keys(nuevosErrores).length > 0 || cambios.length === 0) return;
		setGuardando(true);
		setErrorEnvio("");
		try {
			onGuardado(await editarBobinaPapel({
				IdBobinaPapel: bobina.IdBobinaPapel,
				...form
			}));
			onOpenChange(false);
		} catch (e) {
			setErrorEnvio(e.message);
		} finally {
			setGuardando(false);
		}
	};
	const cambiarAbierto = (valor) => {
		if (guardando) return;
		onOpenChange(valor);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: abierto,
		onOpenChange: cambiarAbierto,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-xl md:max-w-3xl",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Editar bobina" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Corrige los datos registrados por error. El cambio queda en el historial de movimientos de la bobina." })] }),
				bobina && /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-50 p-3.5 text-[13px] ring-1 ring-slate-200 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[11px] font-bold uppercase tracking-wide text-slate-400",
							children: "Tipo"
						}), /* @__PURE__ */ jsx("div", {
							className: "font-semibold text-slate-800",
							children: nombreTipo ?? "-"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[11px] font-bold uppercase tracking-wide text-slate-400",
							children: "Lote"
						}), /* @__PURE__ */ jsx("div", {
							className: "font-semibold text-slate-800",
							children: bobina.CodigoLote
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[11px] font-bold uppercase tracking-wide text-slate-400",
							children: "Recepción"
						}), /* @__PURE__ */ jsx("div", {
							className: "font-semibold text-slate-800",
							children: dateFormatter(bobina.FechaRecepcion)
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[11px] font-bold uppercase tracking-wide text-slate-400",
							children: "Proveedor"
						}), /* @__PURE__ */ jsx("div", {
							className: "font-semibold text-slate-800",
							children: bobina.NombreProveedor
						})] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(InputForModal, {
							id: "CodigoBobina",
							etiqueta: "Código de bobina",
							valor: form.CodigoBobina,
							onCambio: (valor) => actualizar("CodigoBobina")(aCodigo(valor)),
							onKeyDown: (e) => codigoKeyDown(e, actualizar("CodigoBobina")),
							error: errores.CodigoBobina,
							disabled: guardando,
							classNameInput: "font-mono font-bold",
							autoComplete: "off"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ jsx(InputForModal, {
									id: "PesoBrutoKg",
									etiqueta: "Peso bruto (kg)",
									type: "number",
									inputMode: "decimal",
									min: "0",
									step: "any",
									valor: form.PesoBrutoKg,
									onCambio: actualizar("PesoBrutoKg"),
									error: errores.PesoBrutoKg,
									disabled: guardando
								}),
								/* @__PURE__ */ jsx(InputForModal, {
									id: "PesoNetoKg",
									etiqueta: "Peso neto (kg)",
									type: "number",
									inputMode: "decimal",
									min: "0",
									step: "any",
									valor: form.PesoNetoKg,
									onCambio: actualizar("PesoNetoKg"),
									error: errores.PesoNetoKg,
									disabled: guardando
								}),
								/* @__PURE__ */ jsx(InputForModal, {
									id: "Gramaje",
									etiqueta: "Gramaje (g/m²)",
									opcional: true,
									type: "number",
									inputMode: "decimal",
									min: "0",
									step: "any",
									valor: form.Gramaje,
									onCambio: actualizar("Gramaje"),
									error: errores.Gramaje,
									disabled: guardando
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Label, {
									htmlFor: "MotivoCorreccion",
									className: "text-xs font-bold uppercase tracking-wide text-slate-600",
									children: "Motivo de la corrección"
								}),
								/* @__PURE__ */ jsx(Textarea, {
									id: "MotivoCorreccion",
									value: form.Observacion,
									onChange: (e) => actualizar("Observacion")(limpiarObservacion(e.target.value)),
									maxLength: 150,
									placeholder: "Ej. Error de digitación en el peso neto",
									"aria-invalid": Boolean(errores.Observacion),
									disabled: guardando,
									className: "min-h-20"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex justify-between gap-2 text-xs",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-semibold text-red-600",
										children: errores.Observacion
									}), /* @__PURE__ */ jsxs("span", {
										className: "shrink-0 tabular-nums text-slate-400",
										children: [
											largoMotivo,
											"/",
											150
										]
									})]
								})
							]
						}),
						cambios.length > 0 ? /* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border border-c4/30 bg-c4/5 p-3.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "mb-2 text-[11px] font-bold uppercase tracking-wide text-c3",
								children: "Cambios a registrar"
							}), /* @__PURE__ */ jsx("ul", {
								className: "flex flex-col gap-1.5 text-[13px]",
								children: cambios.map((c) => /* @__PURE__ */ jsxs("li", {
									className: "flex flex-wrap items-center gap-1.5",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "font-bold text-slate-700",
											children: [c.campo, ":"]
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-slate-500 line-through",
											children: c.antes
										}),
										/* @__PURE__ */ jsx(ArrowRight, {
											size: 13,
											strokeWidth: 2.75,
											className: "text-slate-400"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "font-bold text-slate-900",
											children: c.despues
										})
									]
								}, c.campo))
							})]
						}) : /* @__PURE__ */ jsx("div", {
							className: "text-center text-xs text-slate-400",
							children: "Modifica al menos un dato para poder guardar."
						}),
						errorEnvio && /* @__PURE__ */ jsx("div", {
							className: "rounded-lg bg-red-50 px-3 py-2.5 text-center text-[13px] font-semibold text-red-600",
							children: errorEnvio
						})
					]
				}),
				/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(DialogClose, {
					render: /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						disabled: guardando
					}),
					children: "Cancelar"
				}), /* @__PURE__ */ jsx(Button, {
					onClick: guardar,
					disabled: guardando || cambios.length === 0,
					className: "gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90",
					children: guardando ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}), "Guardando..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Check, {
						size: 16,
						strokeWidth: 2.75
					}), "Guardar cambios"] })
				})] })
			]
		})
	});
}
//#endregion
//#region src/components/PapelBobina/Inventario/InventarioOperador.jsx
var sinDatos = async () => [];
var cargarProductosHigienico = async () => (await obtenerProductos()).filter((p) => IDS_PRODUCTO_BOBINA_HIGIENICO.includes(p.IdProducto));
function InventarioBobinasPapel({ usuario }) {
	const esLider = usuario?.IdRol === Roles.Encargado;
	const resumen = useCatalogo(verResumenInventarioBobinaPapel);
	const fuera = useCatalogo(esLider ? verBobinasPapelFueraInventario : sinDatos);
	const detalle = useDetalleInventario(verDetalleInventarioBobinaPapel);
	const envio = useEjecutar();
	const accionesFuera = useEjecutar();
	const [mostrarFuera, setMostrarFuera] = useState(false);
	const [busquedaFuera, setBusquedaFuera] = useState("");
	const [porReingresar, setPorReingresar] = useState(null);
	const [bobinaEditar, setBobinaEditar] = useState(null);
	const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
	const tipos = conAcentos(resumen.datos, { cantidadDe: (t) => t.CantidadBobinas });
	const tipoSel = detalle.sel ? tipos.find((t) => t.IdTipoBobina === detalle.sel) : null;
	const esServilleta = tipoSel ? tipoSel.NombreTipoBobina.toLowerCase().includes("servilleta") : false;
	const requeridas = esServilleta ? 1 : 2;
	const { marcadas, setMarcadas } = detalle;
	const listas = marcadas.length === requeridas;
	const productosHigienico = useOpciones(cargarProductosHigienico);
	const [idProducto, setIdProducto] = useState(null);
	const esHigienico = tipoSel?.IdTipoBobina === 1;
	const faltaProducto = esHigienico && idProducto === null;
	useEffect(() => {
		setIdProducto(null);
	}, [detalle.sel]);
	const totalBobinas = tipos.reduce((s, t) => s + t.CantidadBobinas, 0);
	const totalPesoFmt = fmt(tipos.reduce((s, t) => s + Number(t.PesoNetoTotalKg || 0), 0));
	const bobinasFiltradas = detalle.datos.filter((b) => coincide(detalle.busqueda, b.CodigoBobina));
	const fueraFiltradas = fuera.datos.filter((b) => coincide(busquedaFuera, b.CodigoBobina));
	const abrirEditar = (bobina) => {
		setBobinaEditar(bobina);
		setModalEditarAbierto(true);
	};
	const alGuardarEdicion = (actualizada) => {
		toast.success(`Bobina ${actualizada.CodigoBobina} corregida`);
		setMarcadas([]);
		detalle.recargar();
		resumen.recargar();
	};
	const toggleBobina = (codigo) => {
		setMarcadas((prev) => {
			if (prev.includes(codigo)) return prev.filter((c) => c !== codigo);
			if (prev.length < requeridas) return [...prev, codigo];
			if (requeridas === 1) return [codigo];
			return prev;
		});
	};
	const quitarChip = (codigo) => setMarcadas((prev) => prev.filter((c) => c !== codigo));
	const enviarProduccion = () => {
		if (!listas || esServilleta || faltaProducto) return;
		const bobina1 = detalle.datos.find((b) => b.CodigoBobina === marcadas[0]);
		const bobina2 = detalle.datos.find((b) => b.CodigoBobina === marcadas[1]);
		if (!bobina1 || !bobina2) return;
		envio.ejecutar("envio", () => iniciarProduccion(bobina1.IdBobinaPapel, bobina2.IdBobinaPapel, esHigienico ? idProducto : null), (res) => `${marcadas.join(" + ")} → En producción · ${res.NombreProducto}`, () => {
			detalle.setDatos((prev) => prev.filter((b) => !marcadas.includes(b.CodigoBobina)));
			setMarcadas([]);
			setIdProducto(null);
			resumen.recargar();
		});
	};
	const alternarFuera = () => {
		const mostrar = !mostrarFuera;
		setMostrarFuera(mostrar);
		setBusquedaFuera("");
		if (mostrar) fuera.recargar();
	};
	const quitarDeFuera = (idBobinaPapel) => fuera.setDatos((prev) => prev.filter((b) => b.IdBobinaPapel !== idBobinaPapel));
	const reingresar = (observacion) => {
		const b = porReingresar;
		accionesFuera.ejecutar(b.IdBobinaPapel, () => reingresarBobinaInventario(b.IdBobinaPapel, observacion), `Bobina ${b.CodigoBobina} reingresada al inventario`, () => {
			setPorReingresar(null);
			quitarDeFuera(b.IdBobinaPapel);
			resumen.recargar();
		});
	};
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar mt-20 md:mt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Almacén · Materia Prima",
				subtitulo: "Inventario de Bobinas de Papel",
				accion: esLider ? {
					texto: "Registrar ingreso",
					icono: Plus,
					href: "/encargado/bobina-papel/ingreso"
				} : null,
				children: esLider && /* @__PURE__ */ jsx(BotonDescarga, {
					texto: "Descargar inventario",
					ayuda: "PDF con el inventario completo de todos los tipos de bobina",
					exito: "Informe de inventario descargado",
					descargar: () => descargarReporteInventarioBobinaPapel(null)
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsxs(EncabezadoCatalogo, {
						titulo: "Catálogo por tipo de bobina",
						children: [
							"Solo bobinas ",
							/* @__PURE__ */ jsx("strong", {
								className: "text-slate-700",
								children: "en almacén"
							}),
							" ",
							"· ",
							totalBobinas,
							" bobinas · ",
							totalPesoFmt,
							" kg netos"
						]
					}),
					/* @__PURE__ */ jsx(EstadoCatalogo, {
						cargando: resumen.cargando,
						error: resumen.error,
						altoSkeleton: "h-52",
						children: /* @__PURE__ */ jsxs("div", {
							className: GRID_TARJETAS,
							children: [tipos.map((t) => /* @__PURE__ */ jsx(TarjetaTipo, {
								acento: t,
								activo: detalle.sel === t.IdTipoBobina,
								onClick: () => detalle.seleccionar(t.IdTipoBobina),
								icono: Cylinder,
								nombre: t.NombreTipoBobina,
								etiqueta: t.badge,
								cantidad: t.CantidadBobinas,
								unidad: "bobinas en almacén",
								textoVer: "Ver bobinas",
								children: /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ jsxs(DatoTarjeta, {
										etiqueta: "Peso neto",
										tabular: true,
										children: [fmt(t.PesoNetoTotalKg), " kg"]
									}), /* @__PURE__ */ jsxs(DatoTarjeta, {
										etiqueta: "Gramaje prom.",
										tabular: true,
										children: [fmt(t.GramajePromedio), " g/m²"]
									})]
								})
							}, t.IdTipoBobina)), esLider && /* @__PURE__ */ jsx(TarjetaFueraInventario, {
								cantidad: fuera.datos.length,
								activo: mostrarFuera,
								onClick: alternarFuera,
								unidad: "bobinas retiradas de producción",
								textoVer: "Ver bobinas"
							})]
						})
					}),
					tipoSel && /* @__PURE__ */ jsxs(PanelDetalle, {
						acento: tipoSel,
						icono: Cylinder,
						titulo: `Bobinas · ${tipoSel.NombreTipoBobina}`,
						subtitulo: `${tipoSel.CantidadBobinas} en almacén`,
						etiqueta: esServilleta ? "Se envía 1 bobina" : "Se envían de a 2 bobinas",
						onCerrar: detalle.cerrar,
						children: [
							/* @__PURE__ */ jsxs(ContenidoLista, {
								cargando: detalle.cargando,
								error: detalle.error,
								total: detalle.datos.length,
								cantidadFiltrada: bobinasFiltradas.length,
								buscador: /* @__PURE__ */ jsx(BuscadorCodigo, {
									valor: detalle.busqueda,
									onCambio: detalle.setBusqueda
								}),
								mensajeVacio: "No hay bobinas en almacén para este tipo.",
								mensajeSinCoincidencias: `Ninguna bobina coincide con "${detalle.busqueda}".`,
								children: [/* @__PURE__ */ jsx("div", {
									className: "hidden md:block",
									children: /* @__PURE__ */ jsx(TablaBobinas, {
										bobinas: bobinasFiltradas,
										tipoSel,
										marcadas,
										onToggle: toggleBobina,
										onEditar: esLider ? abrirEditar : void 0
									})
								}), /* @__PURE__ */ jsx("div", {
									className: "md:hidden",
									children: /* @__PURE__ */ jsx(ListaMovilBobinas, {
										bobinas: bobinasFiltradas,
										tipoSel,
										marcadas,
										onToggle: toggleBobina,
										onEditar: esLider ? abrirEditar : void 0
									})
								})]
							}),
							marcadas.length > 0 && esHigienico && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-4",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold uppercase tracking-wide text-slate-600",
									children: "Producto a elaborar"
								}), /* @__PURE__ */ jsx(ToggleGroup, {
									value: idProducto === null ? [] : [String(idProducto)],
									className: "flex flex-wrap justify-start gap-2",
									children: productosHigienico.map((p) => /* @__PURE__ */ jsx(ToggleGroupItem, {
										value: String(p.IdProducto),
										onClick: () => setIdProducto(p.IdProducto),
										className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
										children: p.NombreProducto
									}, p.IdProducto))
								})]
							}),
							marcadas.length > 0 && /* @__PURE__ */ jsx(BarraSeleccion, {
								chips: marcadas.map((codigo) => ({
									clave: codigo,
									texto: codigo,
									onQuitar: () => quitarChip(codigo)
								})),
								estado: !listas ? `Selecciona ${requeridas - marcadas.length} más` : faltaProducto ? "Selecciona el producto" : "Listo para enviar",
								listo: listas && !faltaProducto,
								enviando: envio.enProceso === "envio",
								onEnviar: enviarProduccion,
								textoAccion: "Enviar a producción",
								textoEnviando: "Enviando..."
							})
						]
					}),
					esLider && mostrarFuera && /* @__PURE__ */ jsx(PanelFuera, {
						titulo: "Bobinas fuera de inventario",
						onCerrar: () => setMostrarFuera(false),
						children: /* @__PURE__ */ jsx(ContenidoLista, {
							cargando: fuera.cargando,
							error: fuera.error,
							total: fuera.datos.length,
							cantidadFiltrada: fueraFiltradas.length,
							buscador: /* @__PURE__ */ jsx(BuscadorCodigo, {
								valor: busquedaFuera,
								onCambio: setBusquedaFuera
							}),
							mensajeVacio: "No hay bobinas fuera de inventario.",
							mensajeSinCoincidencias: `Ninguna bobina coincide con "${busquedaFuera}".`,
							filasSkeleton: 2,
							altoSkeleton: "h-16",
							children: /* @__PURE__ */ jsx("div", {
								className: "flex flex-col gap-3 p-5",
								children: fueraFiltradas.map((b) => /* @__PURE__ */ jsx(ItemFueraInventario, {
									codigo: b.CodigoBobina,
									etiqueta: b.NombreTipoBobina,
									detalle: /* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
										children: [
											/* @__PURE__ */ jsx("span", { children: b.NombreProveedor }),
											/* @__PURE__ */ jsxs("span", { children: ["Recepción: ", dateFormatter(b.FechaRecepcion)] }),
											/* @__PURE__ */ jsxs("span", { children: [
												"Bruto: ",
												fmt(b.PesoBrutoKg),
												" kg"
											] }),
											/* @__PURE__ */ jsxs("span", { children: [
												"Gramaje: ",
												fmt(b.Gramaje),
												" g/m²"
											] })
										]
									}),
									observacion: b.UltimaObservacion,
									fechaMovimiento: b.FechaUltimoMovimiento,
									procesando: accionesFuera.enProceso === b.IdBobinaPapel,
									onReingresar: () => setPorReingresar(b)
								}, b.IdBobinaPapel))
							})
						})
					})
				]
			}),
			esLider && /* @__PURE__ */ jsx(DialogReingreso, {
				abierto: porReingresar !== null,
				titulo: porReingresar ? `bobina ${porReingresar.CodigoBobina}` : "",
				procesando: porReingresar !== null && accionesFuera.enProceso === porReingresar.IdBobinaPapel,
				onCancelar: () => setPorReingresar(null),
				onConfirmar: reingresar
			}),
			esLider && /* @__PURE__ */ jsx(ModalEditarBobina, {
				abierto: modalEditarAbierto,
				onOpenChange: setModalEditarAbierto,
				bobina: bobinaEditar,
				nombreTipo: tipoSel?.NombreTipoBobina,
				onGuardado: alGuardarEdicion
			})
		]
	}) });
}
//#endregion
export { InventarioBobinasPapel as t };
