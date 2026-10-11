import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { t as ObtenerProveedoresForm } from "./Proveedor_BrPdG6tg.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { n as cargarLoteBobinaPapel, t as ObtenerTiposPapelBobina } from "./BobinaPapel_DoOm6qcL.mjs";
import { n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { a as EncabezadoFilas, c as ErroresFilas, d as SelectorTipo, f as codigosRepetidos, h as useFilasLote, i as DatosLote, l as ResultadoLote, m as useEnvioLote, n as BotonQuitarFila, o as ErrorEnvio, p as erroresPorFila, r as CabeceraFila, s as ErrorFila, t as BarraGuardarLote, u as SelectorProveedor } from "./comunes_DqMrMcrC.mjs";
import { t as BottomBar } from "./BottomBar_C056loei.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/PapelBobina/InsertarLote/Ingresobobinaspapel.jsx
var ETIQUETA_MOVIL = "text-[11px] font-bold uppercase tracking-wide text-slate-600";
var filaVacia = () => ({
	CodigoBobina: "",
	PesoBrutoKg: "",
	PesoNetoKg: "",
	Gramaje: ""
});
function IngresoBobinasPapel({ usuario }) {
	const [idProveedor, setIdProveedor] = useState("");
	const [idTipoBobina, setIdTipoBobina] = useState(null);
	const [tara, setTara] = useState("");
	const proveedores = useCatalogo(ObtenerProveedoresForm);
	const tipos = useCatalogo(ObtenerTiposPapelBobina, (data) => {
		if (data.length) setIdTipoBobina(data[0].IdTipoBobina);
	});
	const envio = useEnvioLote();
	const { tocado } = envio;
	const { filas, actualizarFila, agregarFila, quitarFila, registrarRef, reiniciar } = useFilasLote(filaVacia, () => envio.setResultado(null));
	const repetidos = codigosRepetidos(filas.map((f) => f.CodigoBobina));
	const erroresFilas = erroresPorFila(filas, (f) => {
		const codigo = f.CodigoBobina.trim();
		if (!codigo) return "Falta el código";
		if (repetidos.has(codigo.toLowerCase())) return "Código repetido";
		const bruto = Number(f.PesoBrutoKg);
		if (!f.PesoBrutoKg || bruto <= 0) return "Peso bruto inválido";
		const neto = Number(f.PesoNetoKg);
		if (!f.PesoNetoKg || neto <= 0) return "Peso neto inválido";
		if (neto > bruto) return "El neto supera al bruto";
		if (f.Gramaje !== "" && Number(f.Gramaje) <= 0) return "Gramaje inválido";
		return null;
	});
	const hayErrores = Object.keys(erroresFilas).length > 0;
	const totalBruto = filas.reduce((s, f) => s + Number(f.PesoBrutoKg || 0), 0);
	const totalNeto = filas.reduce((s, f) => s + Number(f.PesoNetoKg || 0), 0);
	const listo = !!idProveedor && !!idTipoBobina && filas.length > 0 && !hayErrores;
	const guardarLote = () => envio.guardar({
		validar: () => {
			if (!idProveedor) return "Selecciona el proveedor del lote.";
			if (!idTipoBobina) return "Selecciona el tipo de bobina del lote.";
			if (hayErrores) return "Revisa las bobinas marcadas en rojo antes de guardar.";
			return null;
		},
		enviar: () => cargarLoteBobinaPapel(Number(idProveedor), Number(idTipoBobina), filas.map((f) => ({
			CodigoBobina: f.CodigoBobina.trim(),
			PesoBrutoKg: Number(f.PesoBrutoKg),
			Gramaje: f.Gramaje === "" ? null : Number(f.Gramaje),
			PesoNetoKg: Number(f.PesoNetoKg)
		}))),
		alGuardar: (data) => {
			reiniciar();
			setTara("");
			toast.success(`${data.CantidadBobinas} bobinas ingresadas al almacén`);
		}
	});
	const tipoActual = tipos.datos.find((t) => t.IdTipoBobina === idTipoBobina);
	const claseError = (err) => err && "border-red-300 focus-visible:ring-red-300";
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsx(Header, {
			volver: true,
			titulo: "Almacén · Materia Prima",
			subtitulo: "Registrar ingreso de bobinas",
			contador: {
				valor: filas.length,
				singular: "bobina en el lote",
				plural: "bobinas en el lote"
			}
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
			children: [
				envio.resultado && /* @__PURE__ */ jsx(ResultadoLote, {
					descripcion: /* @__PURE__ */ jsxs(Fragment$1, { children: [
						envio.resultado.CantidadBobinas,
						" bobinas · Recepción",
						" ",
						dateFormatter(envio.resultado.FechaRecepcion)
					] }),
					onCerrar: () => envio.setResultado(null)
				}),
				/* @__PURE__ */ jsxs(DatosLote, {
					descripcion: "Se aplican a todas las bobinas que registres abajo",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-5 md:grid-cols-2",
						children: [/* @__PURE__ */ jsx(SelectorProveedor, {
							catalogo: proveedores,
							valor: idProveedor,
							onCambio: setIdProveedor,
							invalido: tocado && !idProveedor
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Tara por bobina (kg)"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex gap-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: tara,
									onChange: (e) => setTara(e.target.value),
									placeholder: "0.0",
									type: "number",
									step: "0.01",
									className: "h-11"
								})
							})]
						})]
					}), /* @__PURE__ */ jsx(SelectorTipo, {
						catalogo: tipos,
						valor: idTipoBobina,
						onCambio: setIdTipoBobina,
						campoValor: "IdTipoBobina",
						campoEtiqueta: "NombreTipoBobina",
						etiqueta: "Tipo de bobina",
						mensajeVacio: "No hay tipos de bobina registrados."
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
					children: [
						/* @__PURE__ */ jsx(EncabezadoFilas, {
							titulo: "Bobinas del lote",
							tipo: tipoActual?.NombreTipoBobina,
							textoAgregar: "Agregar bobina",
							onAgregar: agregarFila
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "hidden md:block",
							children: [/* @__PURE__ */ jsxs("table", {
								className: "w-full text-left",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "w-12 px-5 py-3",
											children: "#"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-3",
											children: "Código de bobina"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "w-36 px-3 py-3",
											children: "Peso bruto (kg)"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "w-36 px-3 py-3",
											children: "Peso neto (kg)"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "w-36 px-3 py-3",
											children: "Gramaje (g/m²)"
										}),
										/* @__PURE__ */ jsx("th", { className: "w-14 px-3 py-3" })
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: filas.map((f, i) => {
									const err = tocado ? erroresFilas[f.id] : null;
									return /* @__PURE__ */ jsxs("tr", {
										className: cn("border-b border-slate-100 last:border-0", err && "bg-red-50/60"),
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "px-5 py-2.5 text-sm font-bold text-slate-400",
												children: i + 1
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ jsx(Input, {
													ref: registrarRef(f.id),
													value: f.CodigoBobina,
													onChange: (e) => actualizarFila(f.id, "CodigoBobina", aCodigo(e.target.value)),
													onKeyDown: (e) => {
														if (e.key === "Enter" && i === filas.length - 1) agregarFila();
													},
													placeholder: "Ej. 963-R20",
													className: cn("h-10 font-mono", claseError(err))
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ jsx(Input, {
													value: f.PesoBrutoKg,
													onChange: (e) => actualizarFila(f.id, "PesoBrutoKg", e.target.value),
													placeholder: "0.0",
													type: "number",
													step: "0.01",
													className: cn("h-10", claseError(err))
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ jsx(Input, {
													value: f.PesoNetoKg,
													onChange: (e) => actualizarFila(f.id, "PesoNetoKg", e.target.value),
													placeholder: "0.0",
													type: "number",
													step: "0.01",
													className: cn("h-10", claseError(err))
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ jsx(Input, {
													value: f.Gramaje,
													onChange: (e) => actualizarFila(f.id, "Gramaje", e.target.value),
													placeholder: "0.0",
													type: "number",
													step: "0.01",
													className: "h-10"
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ jsx(BotonQuitarFila, {
													onClick: () => quitarFila(f.id),
													disabled: filas.length === 1
												})
											})
										]
									}, f.id);
								}) })]
							}), tocado && hayErrores && /* @__PURE__ */ jsx(ErroresFilas, {
								filas,
								errores: erroresFilas
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex flex-col gap-3 p-5 md:hidden",
							children: filas.map((f, i) => {
								const err = tocado ? erroresFilas[f.id] : null;
								return /* @__PURE__ */ jsxs("div", {
									className: cn("flex flex-col gap-3 rounded-xl border p-4", err ? "border-red-300 bg-red-50/60" : "border-slate-200 bg-slate-50"),
									children: [
										/* @__PURE__ */ jsx(CabeceraFila, {
											titulo: `Bobina ${i + 1}`,
											onQuitar: () => quitarFila(f.id),
											deshabilitado: filas.length === 1
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												className: ETIQUETA_MOVIL,
												children: "Código"
											}), /* @__PURE__ */ jsx(Input, {
												value: f.CodigoBobina,
												onChange: (e) => actualizarFila(f.id, "CodigoBobina", aCodigo(e.target.value)),
												placeholder: "Ej. HIG-2026-0148",
												className: "h-11 bg-white font-mono"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col gap-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													className: ETIQUETA_MOVIL,
													children: "Bruto (kg)"
												}), /* @__PURE__ */ jsx(Input, {
													value: f.PesoBrutoKg,
													onChange: (e) => actualizarFila(f.id, "PesoBrutoKg", e.target.value),
													placeholder: "0.0",
													type: "number",
													step: "0.01",
													className: "h-11 bg-white"
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col gap-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													className: ETIQUETA_MOVIL,
													children: "Neto (kg)"
												}), /* @__PURE__ */ jsx(Input, {
													value: f.PesoNetoKg,
													onChange: (e) => actualizarFila(f.id, "PesoNetoKg", e.target.value),
													placeholder: "0.0",
													type: "number",
													step: "0.01",
													className: "h-11 bg-white"
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												className: ETIQUETA_MOVIL,
												children: "Gramaje (g/m²)"
											}), /* @__PURE__ */ jsx(Input, {
												value: f.Gramaje,
												onChange: (e) => actualizarFila(f.id, "Gramaje", e.target.value),
												placeholder: "0.0",
												type: "number",
												step: "0.01",
												className: "h-11 bg-white"
											})]
										}),
										err && /* @__PURE__ */ jsx(ErrorFila, { mensaje: err })
									]
								}, f.id);
							})
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
								filas.length,
								" ",
								filas.length === 1 ? "bobina" : "bobinas"
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-slate-400",
							children: [
								"Bruto",
								" ",
								/* @__PURE__ */ jsxs("strong", {
									className: "text-slate-200",
									children: [formatearNumero(totalBruto), " kg"]
								})
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-slate-400",
							children: [
								"Neto",
								" ",
								/* @__PURE__ */ jsxs("strong", {
									className: "text-slate-200",
									children: [formatearNumero(totalNeto), " kg"]
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
//#region src/pages/encargado/bobina-papel/ingreso.astro
var ingreso_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Ingreso,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Ingreso = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Ingreso;
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
	})}</div>${renderComponent($$result, "IngresoBobinasPapel", IngresoBobinasPapel, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/PapelBobina/InsertarLote/Ingresobobinaspapel",
		"client:component-export": "default"
	})}${renderComponent($$result, "BottomBar", BottomBar, {
		"idRol": usuario.IdRol,
		"subRuta": "bobina-papel",
		"idOpcionSelect": 1,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/Qr/BottomBar",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/bobina-papel/ingreso.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/bobina-papel/ingreso.astro";
var $$url = "/encargado/bobina-papel/ingreso";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/bobina-papel/ingreso@_@astro
var page = () => ingreso_exports;
//#endregion
export { page };
