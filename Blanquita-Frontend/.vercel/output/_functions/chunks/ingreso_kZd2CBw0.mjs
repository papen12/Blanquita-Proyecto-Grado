import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { o as numeroONulo } from "./api_B8jC8QYh.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { t as ObtenerProveedoresForm } from "./Proveedor_BrPdG6tg.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { n as cargarLoteBobinaServilleta, t as ObtenerTiposBobinaServilleta } from "./BobinaServilleta_CEietmcz.mjs";
import { n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { a as EncabezadoFilas, d as SelectorTipo, f as codigosRepetidos, h as useFilasLote, i as DatosLote, l as ResultadoLote, m as useEnvioLote, o as ErrorEnvio, p as erroresPorFila, r as CabeceraFila, s as ErrorFila, t as BarraGuardarLote, u as SelectorProveedor } from "./comunes_DqMrMcrC.mjs";
import { t as BottomBar } from "./BottomBar_C056loei.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/constants/BobinaServilleta.js
var Formatos = [{
	"IdFormatoSubBobina": 1,
	"DescripcionFormato": "435x3",
	"CantidadBobina435": 3,
	"CantidadBobina220": 0
}, {
	"IdFormatoSubBobina": 2,
	"DescripcionFormato": "435x2+220x1",
	"CantidadBobina435": 2,
	"CantidadBobina220": 1
}];
//#endregion
//#region src/components/ServilletaBobina/Ingreso.jsx
var FORMATO_UNIDAD_1 = Formatos[0];
var FORMATO_UNIDAD_2 = Formatos[1];
var filaVacia = () => ({
	Codigo1: "",
	PesoBruto1: "",
	Gramaje1: "",
	Codigo2: "",
	PesoBruto2: "",
	Gramaje2: ""
});
var pesoInvalido = (v) => v !== "" && Number(v) <= 0;
var unidadDe = (f, numero, formato) => ({
	CodigoBobina: f[`Codigo${numero}`].trim(),
	IdFormatoSubBobina: formato.IdFormatoSubBobina,
	PesoBrutoKg: numeroONulo(f[`PesoBruto${numero}`]),
	GramajeGr: numeroONulo(f[`Gramaje${numero}`])
});
function BloqueUnidad({ numero, formato, claseBadge, fila, conError, onCampo, inputRef, onKeyDown }) {
	const codigo = fila[`Codigo${numero}`];
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsxs(Badge, {
				variant: "outline",
				className: cn("font-bold", claseBadge),
				children: ["Unidad ", numero]
			}), /* @__PURE__ */ jsxs("span", {
				className: "text-[12px] font-semibold text-slate-500",
				children: ["Formato ", formato.DescripcionFormato]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr_1fr]",
			children: [
				/* @__PURE__ */ jsx(Input, {
					ref: inputRef,
					value: codigo,
					onChange: (e) => onCampo(`Codigo${numero}`, aCodigo(e.target.value)),
					onKeyDown,
					placeholder: `Código de la unidad ${numero}`,
					className: cn("h-10 font-mono", conError && !codigo.trim() && "border-red-300 focus-visible:ring-red-300")
				}),
				/* @__PURE__ */ jsx(Input, {
					value: fila[`PesoBruto${numero}`],
					onChange: (e) => onCampo(`PesoBruto${numero}`, e.target.value),
					placeholder: "Bruto (kg)",
					type: "number",
					step: "0.01",
					className: "h-10"
				}),
				/* @__PURE__ */ jsx(Input, {
					value: fila[`Gramaje${numero}`],
					onChange: (e) => onCampo(`Gramaje${numero}`, e.target.value),
					placeholder: "Gramaje (g)",
					type: "number",
					step: "0.01",
					className: "h-10"
				})
			]
		})]
	});
}
function IngresoBobinasServilleta({ usuario }) {
	const [idProveedor, setIdProveedor] = useState("");
	const [idTipoBobinaServilleta, setIdTipoBobinaServilleta] = useState(null);
	const proveedores = useCatalogo(ObtenerProveedoresForm);
	const tipos = useCatalogo(ObtenerTiposBobinaServilleta, (data) => {
		if (data.length) setIdTipoBobinaServilleta(data[0].IdTipoBobinaServilleta);
	});
	const envio = useEnvioLote();
	const { tocado } = envio;
	const { filas, actualizarFila, agregarFila, quitarFila, registrarRef, reiniciar } = useFilasLote(filaVacia, () => envio.setResultado(null));
	const repetidos = codigosRepetidos(filas.flatMap((f) => [f.Codigo1, f.Codigo2]));
	const erroresFilas = erroresPorFila(filas, (f) => {
		const c1 = f.Codigo1.trim();
		const c2 = f.Codigo2.trim();
		if (!c1) return "Falta el código de la unidad 1";
		if (!c2) return "Falta el código de la unidad 2";
		if (repetidos.has(c1.toLowerCase())) return "Código de unidad 1 repetido";
		if (repetidos.has(c2.toLowerCase())) return "Código de unidad 2 repetido";
		if (pesoInvalido(f.PesoBruto1)) return "Peso bruto de unidad 1 inválido";
		if (pesoInvalido(f.PesoBruto2)) return "Peso bruto de unidad 2 inválido";
		if (pesoInvalido(f.Gramaje1)) return "Gramaje de unidad 1 inválido";
		if (pesoInvalido(f.Gramaje2)) return "Gramaje de unidad 2 inválido";
		return null;
	});
	const hayErrores = Object.keys(erroresFilas).length > 0;
	const listo = !!idProveedor && !!idTipoBobinaServilleta && filas.length > 0 && !hayErrores;
	const guardarLote = () => envio.guardar({
		validar: () => {
			if (!idProveedor) return "Selecciona el proveedor del lote.";
			if (!idTipoBobinaServilleta) return "Selecciona el tipo de bobina del lote.";
			if (hayErrores) return "Revisa las bobinas marcadas en rojo antes de guardar.";
			return null;
		},
		enviar: () => cargarLoteBobinaServilleta(Number(idProveedor), Number(idTipoBobinaServilleta), filas.map((f) => ({ Unidades: [unidadDe(f, 1, FORMATO_UNIDAD_1), unidadDe(f, 2, FORMATO_UNIDAD_2)] }))),
		alGuardar: (data) => {
			reiniciar();
			toast.success(`${data.CantidadBobinasServilleta} bobinas (${data.CantidadUnidades} unidades) ingresadas al almacén`);
		}
	});
	const tipoActual = tipos.datos.find((t) => t.IdTipoBobinaServilleta === idTipoBobinaServilleta);
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsx(Header, {
			volver: true,
			titulo: "Almacén · Materia Prima",
			subtitulo: "Registrar ingreso de bobinas de servilleta",
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
						envio.resultado.CantidadBobinasServilleta,
						" bobinas ·",
						" ",
						envio.resultado.CantidadUnidades,
						" unidades · Recepción",
						" ",
						dateFormatter(envio.resultado.FechaRecepcion)
					] }),
					onCerrar: () => envio.setResultado(null)
				}),
				/* @__PURE__ */ jsxs(DatosLote, {
					descripcion: "Se aplican a todas las bobinas que registres abajo",
					children: [/* @__PURE__ */ jsx(SelectorProveedor, {
						catalogo: proveedores,
						valor: idProveedor,
						onCambio: setIdProveedor,
						invalido: tocado && !idProveedor
					}), /* @__PURE__ */ jsx(SelectorTipo, {
						catalogo: tipos,
						valor: idTipoBobinaServilleta,
						onCambio: setIdTipoBobinaServilleta,
						campoValor: "IdTipoBobinaServilleta",
						campoEtiqueta: "NombreTipoBobinaServilleta",
						etiqueta: "Tipo de bobina",
						mensajeVacio: "No hay tipos de bobina servilleta registrados.",
						cantidadSkeleton: 2
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
					children: [/* @__PURE__ */ jsx(EncabezadoFilas, {
						titulo: "Bobinas del lote",
						tipo: tipoActual?.NombreTipoBobinaServilleta,
						nota: "Cada bobina lleva 2 unidades: unidad 1 arriba, unidad 2 abajo",
						textoAgregar: "Agregar bobina",
						onAgregar: agregarFila
					}), /* @__PURE__ */ jsx("div", {
						className: "flex flex-col gap-4 p-5",
						children: filas.map((f, i) => {
							const err = tocado ? erroresFilas[f.id] : null;
							const cambiarCampo = (campo, valor) => actualizarFila(f.id, campo, valor);
							return /* @__PURE__ */ jsxs("div", {
								className: cn("flex flex-col gap-3 rounded-xl border-2 p-4", err ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-slate-50"),
								children: [
									/* @__PURE__ */ jsx(CabeceraFila, {
										titulo: `Bobina ${i + 1}`,
										onQuitar: () => quitarFila(f.id),
										deshabilitado: filas.length === 1
									}),
									/* @__PURE__ */ jsx(BloqueUnidad, {
										numero: 1,
										formato: FORMATO_UNIDAD_1,
										claseBadge: "border-c3 text-c3",
										fila: f,
										conError: !!err,
										onCampo: cambiarCampo,
										inputRef: registrarRef(f.id)
									}),
									/* @__PURE__ */ jsx(BloqueUnidad, {
										numero: 2,
										formato: FORMATO_UNIDAD_2,
										claseBadge: "border-serv3 text-serv3",
										fila: f,
										conError: !!err,
										onCampo: cambiarCampo,
										onKeyDown: (e) => {
											if (e.key === "Enter" && i === filas.length - 1) agregarFila();
										}
									}),
									err && /* @__PURE__ */ jsx(ErrorFila, { mensaje: err })
								]
							}, f.id);
						})
					})]
				}),
				envio.errorEnvio && /* @__PURE__ */ jsx(ErrorEnvio, { mensaje: envio.errorEnvio }),
				/* @__PURE__ */ jsxs(BarraGuardarLote, {
					listo,
					enviando: envio.enviando,
					onGuardar: guardarLote,
					children: [/* @__PURE__ */ jsxs("span", {
						className: "font-extrabold text-white",
						children: [
							filas.length,
							" ",
							filas.length === 1 ? "bobina" : "bobinas"
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-slate-400",
						children: [/* @__PURE__ */ jsx("strong", {
							className: "text-slate-200",
							children: filas.length * 2
						}), " unidades"]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/pages/encargado/bobina-servilleta/ingreso.astro
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
	})}</div>${renderComponent($$result, "IngresoBobinasServilleta", IngresoBobinasServilleta, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/ServilletaBobina/Ingreso",
		"client:component-export": "default"
	})}${renderComponent($$result, "BottomBar", BottomBar, {
		"idRol": usuario.IdRol,
		"subRuta": "bobina-servilleta",
		"idOpcionSelect": 1,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/Qr/BottomBar",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/bobina-servilleta/ingreso.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/encargado/bobina-servilleta/ingreso.astro";
var $$url = "/encargado/bobina-servilleta/ingreso";
//#endregion
//#region \0virtual:astro:page:src/pages/encargado/bobina-servilleta/ingreso@_@astro
var page = () => ingreso_exports;
//#endregion
export { page };
