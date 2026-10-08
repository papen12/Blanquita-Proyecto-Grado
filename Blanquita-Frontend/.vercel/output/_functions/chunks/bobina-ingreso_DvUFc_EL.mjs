import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as SelectEntidad } from "./Selectentidad_BdaWuz7z.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { t as ObtenerProveedoresForm } from "./Proveedor_BrPdG6tg.mjs";
import { t as ACENTOS } from "./Acentos_7-zo-5xR.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { f as codigosRepetidos, i as DatosLote, l as ResultadoLote, m as useEnvioLote, n as BotonQuitarFila, o as ErrorEnvio, p as erroresPorFila, r as CabeceraFila, s as ErrorFila, t as BarraGuardarLote, u as SelectorProveedor } from "./comunes_DqMrMcrC.mjs";
import { t as BottomBar } from "./BottomBar_C056loei.mjs";
import { n as obtenerTiposEmpaque, t as cargarLoteEmpaque } from "./EmpaqueBobina_BjLs9QkI.mjs";
import { useRef, useState } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/Empaque/EmpaqueBobinaIngreso.jsx
var ERROR_INPUT = "border-red-300 focus-visible:ring-red-300";
var totalEmpaques = (resultado) => resultado.Resumen.reduce((s, r) => s + r.CantidadEmpaques, 0);
function EmpaqueBobinaIngreso({ usuario }) {
	const [idProveedor, setIdProveedor] = useState("");
	const [cantidadToneladasPedida, setCantidadToneladasPedida] = useState("");
	const bloqueSeq = useRef(1);
	const filaSeq = useRef(1);
	const refsCodigo = useRef({});
	const nuevaFila = () => ({
		id: filaSeq.current++,
		CodigoEmpaque: "",
		PesoKg: ""
	});
	const nuevoBloque = (idTipoEmpaque = "") => ({
		id: bloqueSeq.current++,
		IdTipoEmpaque: idTipoEmpaque,
		filas: [nuevaFila()]
	});
	const [bloques, setBloques] = useState([{
		id: 0,
		IdTipoEmpaque: "",
		filas: [{
			id: 0,
			CodigoEmpaque: "",
			PesoKg: ""
		}]
	}]);
	const proveedores = useCatalogo(ObtenerProveedoresForm);
	const tipos = useCatalogo(obtenerTiposEmpaque, (data) => {
		if (data.length) setBloques((prev) => prev.map((b) => b.IdTipoEmpaque === "" ? {
			...b,
			IdTipoEmpaque: data[0].IdTipoEmpaque
		} : b));
	});
	const envio = useEnvioLote();
	const { tocado } = envio;
	const limpiarResultado = () => envio.setResultado(null);
	const actualizarTipoBloque = (bloqueId, idTipoEmpaque) => {
		setBloques((prev) => prev.map((b) => b.id === bloqueId ? {
			...b,
			IdTipoEmpaque: idTipoEmpaque
		} : b));
		limpiarResultado();
	};
	const actualizarFila = (bloqueId, filaId, campo, valor) => {
		setBloques((prev) => prev.map((b) => b.id !== bloqueId ? b : {
			...b,
			filas: b.filas.map((f) => f.id === filaId ? {
				...f,
				[campo]: valor
			} : f)
		}));
		limpiarResultado();
	};
	const agregarBloque = () => {
		const usados = new Set(bloques.map((b) => b.IdTipoEmpaque));
		const bloque = nuevoBloque(tipos.datos.find((t) => !usados.has(t.IdTipoEmpaque))?.IdTipoEmpaque ?? tipos.datos[0]?.IdTipoEmpaque ?? "");
		setBloques((prev) => [...prev, bloque]);
		limpiarResultado();
		requestAnimationFrame(() => refsCodigo.current[bloque.filas[0].id]?.focus());
	};
	const quitarBloque = (bloqueId) => {
		setBloques((prev) => prev.length === 1 ? prev : prev.filter((b) => b.id !== bloqueId));
	};
	const agregarFila = (bloqueId) => {
		const fila = nuevaFila();
		setBloques((prev) => prev.map((b) => b.id === bloqueId ? {
			...b,
			filas: [...b.filas, fila]
		} : b));
		limpiarResultado();
		requestAnimationFrame(() => refsCodigo.current[fila.id]?.focus());
	};
	const quitarFila = (bloqueId, filaId) => {
		setBloques((prev) => prev.map((b) => b.id === bloqueId && b.filas.length > 1 ? {
			...b,
			filas: b.filas.filter((f) => f.id !== filaId)
		} : b));
		delete refsCodigo.current[filaId];
	};
	const filasPlanas = bloques.flatMap((b) => b.filas.map((f) => ({
		...f,
		bloqueId: b.id,
		IdTipoEmpaque: b.IdTipoEmpaque
	})));
	const repetidos = codigosRepetidos(filasPlanas.map((f) => f.CodigoEmpaque));
	const erroresFilas = erroresPorFila(filasPlanas, (f) => {
		const codigo = f.CodigoEmpaque.trim();
		if (!codigo) return "Falta el código";
		if (repetidos.has(codigo.toLowerCase())) return "Código repetido";
		if (!f.PesoKg || Number(f.PesoKg) <= 0) return "Peso inválido";
		return null;
	});
	const erroresBloques = erroresPorFila(bloques, (b) => b.IdTipoEmpaque ? null : "Selecciona el tipo de empaque");
	const toneladasValidas = !!cantidadToneladasPedida && Number(cantidadToneladasPedida) > 0;
	const hayErroresFilas = Object.keys(erroresFilas).length > 0;
	const hayErroresBloques = Object.keys(erroresBloques).length > 0;
	const listo = !!idProveedor && toneladasValidas && filasPlanas.length > 0 && !hayErroresFilas && !hayErroresBloques;
	const guardarLote = () => envio.guardar({
		validar: () => {
			if (!idProveedor) return "Selecciona el proveedor del lote.";
			if (!toneladasValidas) return "Indica la cantidad de toneladas pedidas.";
			if (hayErroresBloques) return "Selecciona el tipo de empaque en cada bloque.";
			if (hayErroresFilas) return "Revisa los empaques marcados en rojo antes de guardar.";
			return null;
		},
		enviar: () => cargarLoteEmpaque(Number(idProveedor), Number(cantidadToneladasPedida), filasPlanas.map((f) => ({
			CodigoEmpaque: f.CodigoEmpaque.trim(),
			IdTipoEmpaque: Number(f.IdTipoEmpaque),
			PesoKg: Number(f.PesoKg)
		}))),
		alGuardar: (data) => {
			setBloques([nuevoBloque(tipos.datos[0]?.IdTipoEmpaque ?? "")]);
			setCantidadToneladasPedida("");
			toast.success(`${totalEmpaques(data)} empaques ingresados al almacén`);
		}
	});
	const totalPesoKg = filasPlanas.reduce((s, f) => s + (Number(f.PesoKg) > 0 ? Number(f.PesoKg) : 0), 0);
	const nombreTipo = (idTipoEmpaque) => tipos.datos.find((t) => t.IdTipoEmpaque === idTipoEmpaque)?.NombreTipoEmpaque ?? "";
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsx(Header, {
			volver: true,
			titulo: "Almacén · Materia Prima",
			subtitulo: "Registrar ingreso de empaques",
			contador: {
				valor: filasPlanas.length,
				singular: "empaque en el lote",
				plural: "empaques en el lote"
			}
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
			children: [
				envio.resultado && /* @__PURE__ */ jsx(ResultadoLote, {
					descripcion: /* @__PURE__ */ jsxs(Fragment$1, { children: [
						totalEmpaques(envio.resultado),
						" empaques · Recepción",
						" ",
						dateFormatter(envio.resultado.Resumen[0]?.FechaRecepcion)
					] }),
					onCerrar: limpiarResultado,
					children: /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-1.5",
						children: envio.resultado.Resumen.map((r) => /* @__PURE__ */ jsxs(Badge, {
							variant: "outline",
							className: "border-emerald-300 font-bold text-emerald-700",
							children: [
								r.NombreTipoEmpaque,
								": ",
								r.CantidadEmpaques
							]
						}, r.IdTipoEmpaque))
					})
				}),
				/* @__PURE__ */ jsxs(DatosLote, {
					descripcion: "Se aplican al pedido completo, no a cada empaque",
					className: "flex flex-col gap-5 p-5 sm:flex-row sm:gap-6",
					children: [/* @__PURE__ */ jsx(SelectorProveedor, {
						catalogo: proveedores,
						valor: idProveedor,
						onCambio: setIdProveedor,
						invalido: tocado && !idProveedor,
						className: "flex flex-1 flex-col gap-1.5"
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-1 flex-col gap-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							className: "text-xs font-bold uppercase tracking-wide text-slate-600",
							children: "Toneladas pedidas"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							min: "0",
							step: "0.01",
							value: cantidadToneladasPedida,
							onChange: (e) => setCantidadToneladasPedida(e.target.value),
							placeholder: "Ej. 12.5",
							className: cn("h-11", tocado && !toneladasValidas && ERROR_INPUT)
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "mt-6 flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "text-base font-extrabold text-slate-900",
										children: "Empaques del lote"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-sm text-slate-500",
										children: "Agrupados por tipo de empaque"
									}),
									tipos.error && /* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600",
										children: [tipos.error, /* @__PURE__ */ jsx(Button, {
											variant: "outline",
											onClick: tipos.recargar,
											className: "h-7 border-red-300 px-2 text-xs font-bold text-red-600 hover:bg-red-100",
											children: "Reintentar"
										})]
									}),
									!tipos.cargando && !tipos.error && tipos.datos.length === 0 && /* @__PURE__ */ jsx("div", {
										className: "rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700",
										children: "No hay tipos de empaque registrados."
									})
								]
							}), /* @__PURE__ */ jsxs(Button, {
								onClick: agregarBloque,
								disabled: tipos.cargando || tipos.datos.length === 0,
								className: "h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90",
								children: [/* @__PURE__ */ jsx(Layers, {
									size: 16,
									strokeWidth: 2.75
								}), "Agregar tipo de empaque"]
							})]
						}),
						tipos.cargando && /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full rounded-2xl" }),
						!tipos.cargando && bloques.map((b, bi) => {
							const acento = ACENTOS[bi % ACENTOS.length];
							const errTipo = tocado ? erroresBloques[b.id] : null;
							return /* @__PURE__ */ jsxs("div", {
								className: cn("overflow-hidden rounded-2xl border-2 bg-white shadow-sm", errTipo ? "border-red-300" : acento.border),
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: cn("flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5", acento.soft),
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-1 flex-wrap items-center gap-3",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: "shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500",
													children: ["Tipo ", bi + 1]
												}),
												/* @__PURE__ */ jsx("div", {
													className: "min-w-[220px] flex-1 sm:max-w-xs",
													children: /* @__PURE__ */ jsx(SelectEntidad, {
														opciones: tipos.datos,
														valor: b.IdTipoEmpaque,
														onCambio: (v) => actualizarTipoBloque(b.id, v),
														campoValor: "IdTipoEmpaque",
														campoEtiqueta: "NombreTipoEmpaque",
														placeholder: "Selecciona el tipo",
														invalido: !!errTipo,
														className: "h-10! bg-white"
													})
												}),
												/* @__PURE__ */ jsxs(Badge, {
													variant: "outline",
													className: cn("border font-bold", acento.text, acento.border),
													children: [
														b.filas.length,
														" ",
														b.filas.length === 1 ? "bobina" : "bobinas"
													]
												})
											]
										}), /* @__PURE__ */ jsxs(Button, {
											variant: "ghost",
											onClick: () => quitarBloque(b.id),
											disabled: bloques.length === 1,
											className: "h-9 gap-1.5 font-bold text-slate-500 hover:bg-red-50 hover:text-red-600",
											children: [/* @__PURE__ */ jsx(Trash2, {
												size: 14,
												strokeWidth: 2.5
											}), "Quitar tipo"]
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "hidden md:block",
										children: /* @__PURE__ */ jsxs("table", {
											className: "w-full text-left",
											children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
												className: "border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500",
												children: [
													/* @__PURE__ */ jsx("th", {
														className: "w-12 px-5 py-2.5",
														children: "#"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-3 py-2.5",
														children: "Código"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "w-36 px-3 py-2.5",
														children: "Peso (kg)"
													}),
													/* @__PURE__ */ jsx("th", { className: "w-14 px-3 py-2.5" })
												]
											}) }), /* @__PURE__ */ jsx("tbody", { children: b.filas.map((f, i) => {
												const err = tocado ? erroresFilas[f.id] : null;
												return /* @__PURE__ */ jsxs("tr", {
													className: cn("border-b border-slate-100 last:border-0", err && "bg-red-50/60"),
													children: [
														/* @__PURE__ */ jsx("td", {
															className: "px-5 py-2 text-sm font-bold text-slate-400",
															children: i + 1
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-3 py-2",
															children: /* @__PURE__ */ jsx(Input, {
																ref: (el) => {
																	refsCodigo.current[f.id] = el;
																},
																value: f.CodigoEmpaque,
																onChange: (e) => actualizarFila(b.id, f.id, "CodigoEmpaque", aCodigo(e.target.value)),
																onKeyDown: (e) => {
																	if (e.key === "Enter" && i === b.filas.length - 1) agregarFila(b.id);
																},
																placeholder: "Ej. EMP-2026-0148",
																className: cn("h-10 font-mono", err && ERROR_INPUT)
															})
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-3 py-2",
															children: /* @__PURE__ */ jsx(Input, {
																type: "number",
																min: "0",
																step: "0.01",
																value: f.PesoKg,
																onChange: (e) => actualizarFila(b.id, f.id, "PesoKg", e.target.value),
																placeholder: "0.00",
																className: cn("h-10", err && ERROR_INPUT)
															})
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-3 py-2",
															children: /* @__PURE__ */ jsx(BotonQuitarFila, {
																onClick: () => quitarFila(b.id, f.id),
																disabled: b.filas.length === 1
															})
														})
													]
												}, f.id);
											}) })]
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex flex-col gap-3 p-4 md:hidden",
										children: b.filas.map((f, i) => {
											const err = tocado ? erroresFilas[f.id] : null;
											return /* @__PURE__ */ jsxs("div", {
												className: cn("flex flex-col gap-3 rounded-xl border p-3.5", err ? "border-red-300 bg-red-50/60" : "border-slate-200 bg-slate-50"),
												children: [
													/* @__PURE__ */ jsx(CabeceraFila, {
														titulo: `Bobina ${i + 1}`,
														onQuitar: () => quitarFila(b.id, f.id),
														deshabilitado: b.filas.length === 1
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "flex flex-col gap-1.5",
														children: [/* @__PURE__ */ jsx(Label, {
															className: "text-[11px] font-bold uppercase tracking-wide text-slate-600",
															children: "Código"
														}), /* @__PURE__ */ jsx(Input, {
															value: f.CodigoEmpaque,
															onChange: (e) => actualizarFila(b.id, f.id, "CodigoEmpaque", aCodigo(e.target.value)),
															placeholder: "Ej. EMP-2026-0148",
															className: "h-11 bg-white font-mono"
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "flex flex-col gap-1.5",
														children: [/* @__PURE__ */ jsx(Label, {
															className: "text-[11px] font-bold uppercase tracking-wide text-slate-600",
															children: "Peso (kg)"
														}), /* @__PURE__ */ jsx(Input, {
															type: "number",
															min: "0",
															step: "0.01",
															value: f.PesoKg,
															onChange: (e) => actualizarFila(b.id, f.id, "PesoKg", e.target.value),
															placeholder: "0.00",
															className: "h-11 bg-white"
														})]
													}),
													err && /* @__PURE__ */ jsx(ErrorFila, { mensaje: err })
												]
											}, f.id);
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "border-t border-slate-100 px-5 py-3",
										children: /* @__PURE__ */ jsxs(Button, {
											variant: "outline",
											onClick: () => agregarFila(b.id),
											className: cn("h-10 gap-2 font-bold", acento.text, acento.border),
											children: [
												/* @__PURE__ */ jsx(Plus, {
													size: 15,
													strokeWidth: 2.75
												}),
												"Agregar bobina ",
												nombreTipo(b.IdTipoEmpaque) && `de ${nombreTipo(b.IdTipoEmpaque)}`
											]
										})
									})
								]
							}, b.id);
						})
					]
				}),
				envio.errorEnvio && /* @__PURE__ */ jsx(ErrorEnvio, { mensaje: envio.errorEnvio }),
				/* @__PURE__ */ jsxs(BarraGuardarLote, {
					listo,
					enviando: envio.enviando,
					onGuardar: guardarLote,
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "font-extrabold text-white",
							children: [
								filasPlanas.length,
								" ",
								filasPlanas.length === 1 ? "empaque" : "empaques"
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-slate-400",
							children: [
								"en ",
								bloques.length,
								" ",
								bloques.length === 1 ? "tipo" : "tipos"
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-slate-400",
							children: [
								"Peso total",
								" ",
								/* @__PURE__ */ jsxs("strong", {
									className: "text-slate-200",
									children: [totalPesoKg.toFixed(2), " kg"]
								})
							]
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/pages/encargado/empaque/bobina-ingreso.astro
var bobina_ingreso_exports = /* @__PURE__ */ __exportAll({
	default: () => $$BobinaIngreso,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$BobinaIngreso = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BobinaIngreso;
	const { usuario } = Astro.locals;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="md:hidden">${renderComponent($$result, "NavBar", NavBar, {
		"client:media": "(max-width: 767.98px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/NavBar",
		"client:component-export": "default"
	})}</div><div class="hidden md:block">${renderComponent($$result, "SideBar", SideBar, {
		"client:media": "(min-width: 768px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/SideBar",
		"client:component-export": "default"
	})}</div>${renderComponent($$result, "EmpaqueBobinaIngreso", EmpaqueBobinaIngreso, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Empaque/EmpaqueBobinaIngreso",
		"client:component-export": "default"
	})}${renderComponent($$result, "BottomBar", BottomBar, {
		"idRol": usuario.IdRol,
		"subRuta": "empaque",
		"idOpcionSelect": 3,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/Qr/BottomBar",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/empaque/bobina-ingreso.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/empaque/bobina-ingreso.astro";
var $$url = "/encargado/empaque/bobina-ingreso";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/empaque/bobina-ingreso@_@astro
var page = () => bobina_ingreso_exports;
//#endregion
export { page };
