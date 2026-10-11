import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { a as SelectItem, i as SelectGroup, n as Select, o as SelectTrigger, r as SelectContent, s as SelectValue } from "./Selectentidad_BdaWuz7z.mjs";
import { a as TablaFilas, n as ErrorCarga, o as TarjetaFila, r as EsqueletoCarga, s as TarjetaSeccion } from "./comunes_CSK1dv5A.mjs";
import { c as DERECHA, v as columnaCodigo } from "./comunes_LNdSvMvL.mjs";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster, toast } from "sonner";
//#region src/components/layout/SelectForModal.jsx
function SelectForModal({ id, etiqueta = "", opciones = [], campoValor = "id", campoEtiqueta = "nombre", campoDescripcion = null, valor = "", onCambio, placeholder = "Selecciona una opción", deshabilitado = false, className = "", classNameContenido = "" }) {
	const opcionesValidas = (opciones ?? []).filter((o) => o?.[campoValor] !== null && o?.[campoValor] !== void 0 && String(o[campoValor]) !== "");
	const opcionSeleccionada = opcionesValidas.find((o) => String(o[campoValor]) === String(valor ?? ""));
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1.5",
		children: [etiqueta && /* @__PURE__ */ jsx(Label, {
			htmlFor: id,
			className: "text-xs font-bold uppercase tracking-wide text-slate-600",
			children: etiqueta
		}), /* @__PURE__ */ jsxs(Select, {
			value: valor === null || valor === void 0 ? "" : String(valor),
			onValueChange: onCambio,
			disabled: deshabilitado,
			children: [/* @__PURE__ */ jsx(SelectTrigger, {
				id,
				className: cn("h-11 w-full", className),
				children: /* @__PURE__ */ jsx(SelectValue, {
					placeholder,
					children: opcionSeleccionada ? String(opcionSeleccionada[campoEtiqueta]) : null
				})
			}), /* @__PURE__ */ jsx(SelectContent, {
				position: "popper",
				className: cn("w-(--radix-select-trigger-width) max-w-none", classNameContenido),
				children: /* @__PURE__ */ jsx(SelectGroup, { children: opcionesValidas.map((o) => /* @__PURE__ */ jsx(SelectItem, {
					value: String(o[campoValor]),
					className: "whitespace-normal py-2.5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-0.5 text-left",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-slate-900",
							children: o[campoEtiqueta]
						}), campoDescripcion && o[campoDescripcion] && /* @__PURE__ */ jsx("span", {
							className: "text-[11.5px] leading-snug text-slate-500",
							children: o[campoDescripcion]
						})]
					})
				}, String(o[campoValor]))) })
			})]
		})]
	});
}
//#endregion
//#region src/models/Catalogo/Catalogo.js
var LineaItem = (data) => ({
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	SiglasProducto: data.SiglasProducto,
	CantidadPresentaciones: data.CantidadPresentaciones ?? 0
});
var CrearLineaRequest = (datos) => ({
	NombreProducto: (datos.NombreProducto ?? "").trim().replace(/\s+/g, " "),
	SiglasProducto: (datos.SiglasProducto ?? "").toUpperCase()
});
var LineaResponse = (data) => ({
	IdProducto: data.IdProducto,
	NombreProducto: data.NombreProducto,
	SiglasProducto: data.SiglasProducto
});
var PresentacionItem = (data) => ({
	IdPresentacion: data.IdPresentacion,
	IdProducto: data.IdProducto,
	TipoContenedor: data.TipoContenedor,
	CantidadRollosUnidades: data.CantidadRollosUnidades,
	CantidadPorUnidadTerminada: data.CantidadPorUnidadTerminada,
	CodigoPresentacion: data.CodigoPresentacion,
	NombreProducto: data.NombreProducto
});
var CrearPresentacionRequest = (datos) => ({
	IdProducto: Number(datos.IdProducto),
	TipoContenedor: datos.TipoContenedor,
	TipoCantidad: datos.TipoCantidad,
	CantidadRollosUnidades: Number(datos.CantidadRollosUnidades),
	CantidadPorUnidadTerminada: Number(datos.CantidadPorUnidadTerminada)
});
var PresentacionResponse = PresentacionItem;
//#endregion
//#region src/services/Catalogo/Catalogo.js
async function listarLineas() {
	return (await pedirJson("/api/catalogo/lineas/listar")).map(LineaItem);
}
async function crearLinea(datos) {
	return LineaResponse(await pedirJson("/api/catalogo/lineas/crear", {
		method: "POST",
		body: CrearLineaRequest(datos)
	}));
}
async function listarProductos() {
	return (await pedirJson("/api/catalogo/productos/listar")).map(PresentacionItem);
}
async function crearProducto(datos) {
	return PresentacionResponse(await pedirJson("/api/catalogo/productos/crear", {
		method: "POST",
		body: CrearPresentacionRequest(datos)
	}));
}
//#endregion
//#region src/components/Admin/Catalogo/Catalogo.jsx
var NOMBRE_MIN = 3;
var NOMBRE_MAX = 30;
var PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$/;
var PATRON_ENTERO = /^\d{0,4}$/;
var PATRON_SIGLAS = /^[A-Z]{3}$/;
var LIMITES_CANTIDAD = {
	Rollos: {
		minimo: 2,
		maximo: 100
	},
	Unidades: {
		minimo: 20,
		maximo: 1e3
	}
};
var MAXIMO_POR_UNIDAD_TERMINADA = 50;
var VALORES_POR_DEFECTO = {
	IdProducto: "",
	TipoCantidad: "Rollos",
	TipoContenedor: "Jaba",
	CantidadRollosUnidades: "",
	CantidadPorUnidadTerminada: ""
};
var limpiarNombre = (nombre) => nombre.trim().replace(/\s+/g, " ");
var soloLetras = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
var siglasSugeridas = (nombre) => soloLetras(nombre).slice(0, 3);
var nombrePresentacion = (p) => `${p.NombreProducto} ${p.CantidadRollosUnidades}`;
var armarCodigo = (sigla, contenedor, cantidad) => sigla && cantidad ? `${sigla}-${contenedor[0]}${String(Number(cantidad)).padStart(2, "0")}` : "";
var COLUMNAS = [
	columnaCodigo("CodigoPresentacion"),
	{
		titulo: "Producto",
		clase: "font-semibold text-slate-900",
		valor: nombrePresentacion
	},
	{
		titulo: "Empaque",
		valor: (p) => p.TipoContenedor
	},
	{
		titulo: "Contenido",
		...DERECHA,
		valor: (p) => p.CantidadRollosUnidades
	},
	{
		titulo: "Por unidad terminada",
		...DERECHA,
		valor: (p) => p.CantidadPorUnidadTerminada
	}
];
var tarjetaPresentacion = (p) => /* @__PURE__ */ jsxs(TarjetaFila, {
	nombre: nombrePresentacion(p),
	detalle: `${p.CodigoPresentacion} · ${p.TipoContenedor}`,
	children: [
		/* @__PURE__ */ jsx("strong", {
			className: "text-slate-900",
			children: p.CantidadPorUnidadTerminada
		}),
		" ",
		/* @__PURE__ */ jsx("span", {
			className: "text-slate-500",
			children: "por unidad"
		})
	]
});
function Segmentado({ etiqueta, opciones, valor, onCambio }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ jsx(Label, {
			className: "text-xs font-bold uppercase tracking-wide text-slate-600",
			children: etiqueta
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1",
			children: opciones.map(({ valor: v, texto, deshabilitado }) => /* @__PURE__ */ jsx("button", {
				type: "button",
				disabled: deshabilitado,
				onClick: () => onCambio(v),
				className: cn("h-9 rounded-md text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40", valor === v ? "bg-white text-c3 shadow-sm" : "text-slate-500 enabled:hover:text-slate-700"),
				children: texto
			}, v))
		})]
	});
}
function DialogoLinea({ abierto, lineas, onCerrar, onGuardado }) {
	const [datos, setDatos] = useState({
		NombreProducto: "",
		SiglasProducto: ""
	});
	const [siglasEditadas, setSiglasEditadas] = useState(false);
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!abierto) return;
		setDatos({
			NombreProducto: "",
			SiglasProducto: ""
		});
		setSiglasEditadas(false);
		setError("");
	}, [abierto]);
	const cambiarNombre = (valor) => {
		const nombre = valor.slice(0, NOMBRE_MAX);
		setDatos((previos) => ({
			NombreProducto: nombre,
			SiglasProducto: siglasEditadas ? previos.SiglasProducto : siglasSugeridas(nombre)
		}));
	};
	const cambiarSiglas = (valor) => {
		setSiglasEditadas(true);
		setDatos((previos) => ({
			...previos,
			SiglasProducto: soloLetras(valor).slice(0, 3)
		}));
	};
	const limpio = limpiarNombre(datos.NombreProducto);
	const lineaMismoNombre = lineas.find((l) => l.NombreProducto.toLowerCase() === limpio.toLowerCase());
	const lineaMismasSiglas = lineas.find((l) => l.SiglasProducto === datos.SiglasProducto);
	let errorNombre = "";
	if (limpio && (limpio.length < NOMBRE_MIN || !PATRON_NOMBRE.test(limpio))) errorNombre = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y guiones`;
	else if (lineaMismoNombre) errorNombre = "Ya existe una línea con este nombre";
	let errorSiglas = "";
	if (datos.SiglasProducto && !PATRON_SIGLAS.test(datos.SiglasProducto)) errorSiglas = "Exactamente 3 letras";
	else if (lineaMismasSiglas) errorSiglas = `Ya las usa la línea ${lineaMismasSiglas.NombreProducto}`;
	const valido = limpio && datos.SiglasProducto && !errorNombre && !errorSiglas;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onGuardado(await crearLinea(datos));
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: abierto,
		onOpenChange: (open) => !open && !enviando && onCerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Nueva línea de producción" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Las siglas encabezan el código de todos los productos de la línea y no se pueden cambiar después." })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(InputForModal, {
							id: "linea-nombre",
							etiqueta: "Nombre de la línea",
							valor: datos.NombreProducto,
							onCambio: cambiarNombre,
							placeholder: "Ej. Toalla Pro",
							error: errorNombre
						}),
						/* @__PURE__ */ jsx(InputForModal, {
							id: "linea-siglas",
							etiqueta: "Siglas",
							valor: datos.SiglasProducto,
							onCambio: cambiarSiglas,
							placeholder: "Ej. TOA",
							classNameInput: "font-mono uppercase",
							error: errorSiglas
						}),
						datos.SiglasProducto && !errorSiglas && /* @__PURE__ */ jsxs("p", {
							className: "-mt-2 text-xs text-slate-500",
							children: [
								"Los códigos quedarán como",
								" ",
								/* @__PURE__ */ jsxs("span", {
									className: "font-mono font-bold text-slate-700",
									children: [datos.SiglasProducto, "-J06"]
								}),
								" o",
								" ",
								/* @__PURE__ */ jsxs("span", {
									className: "font-mono font-bold text-slate-700",
									children: [datos.SiglasProducto, "-P12"]
								}),
								"."
							]
						}),
						error && /* @__PURE__ */ jsx("div", {
							className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
							children: error
						})
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					onClick: confirmar,
					disabled: enviando || !valido,
					className: "h-11 w-full gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800 sm:w-auto",
					children: enviando ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : "Crear línea"
				}) })
			]
		})
	});
}
function DialogoProducto({ abierto, idLineaInicial, lineas, presentaciones, onCerrar, onGuardado }) {
	const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!abierto) return;
		setDatos({
			...VALORES_POR_DEFECTO,
			IdProducto: idLineaInicial ? String(idLineaInicial) : ""
		});
		setError("");
	}, [abierto, idLineaInicial]);
	const cambiar = (campo) => (valor) => setDatos((previos) => ({
		...previos,
		[campo]: valor
	}));
	const cambiarTipoCantidad = (tipo) => setDatos((previos) => ({
		...previos,
		TipoCantidad: tipo,
		TipoContenedor: tipo === "Unidades" ? "Jaba" : previos.TipoContenedor
	}));
	const opcionesLinea = useMemo(() => lineas.map((l) => ({
		...l,
		Etiqueta: `${l.NombreProducto} (${l.SiglasProducto})`
	})), [lineas]);
	const linea = lineas.find((l) => String(l.IdProducto) === datos.IdProducto);
	const limites = LIMITES_CANTIDAD[datos.TipoCantidad];
	const codigo = armarCodigo(linea?.SiglasProducto, datos.TipoContenedor, datos.CantidadRollosUnidades);
	const codigoRepetido = Boolean(codigo) && presentaciones.some((p) => p.CodigoPresentacion === codigo);
	const errores = {};
	const cantidad = Number(datos.CantidadRollosUnidades);
	if (datos.CantidadRollosUnidades !== "" && (cantidad < limites.minimo || cantidad > limites.maximo)) errores.CantidadRollosUnidades = `Entre ${limites.minimo} y ${limites.maximo} ${datos.TipoCantidad.toLowerCase()}`;
	const porUnidad = Number(datos.CantidadPorUnidadTerminada);
	if (datos.CantidadPorUnidadTerminada !== "" && (porUnidad < 1 || porUnidad > MAXIMO_POR_UNIDAD_TERMINADA)) errores.CantidadPorUnidadTerminada = `Entre 1 y ${MAXIMO_POR_UNIDAD_TERMINADA}`;
	const valido = linea && datos.CantidadRollosUnidades !== "" && datos.CantidadPorUnidadTerminada !== "" && Object.keys(errores).length === 0 && !codigoRepetido;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onGuardado(await crearProducto(datos));
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: abierto,
		onOpenChange: (open) => !open && !enviando && onCerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[90vh] max-w-md overflow-y-auto",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Nuevo producto" }), /* @__PURE__ */ jsx(DialogDescription, { children: "El código se arma con la sigla de la línea, el empaque y la cantidad." })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(SelectForModal, {
							id: "producto-linea",
							etiqueta: "Línea de producción",
							opciones: opcionesLinea,
							campoValor: "IdProducto",
							campoEtiqueta: "Etiqueta",
							valor: datos.IdProducto,
							onCambio: cambiar("IdProducto"),
							placeholder: "Selecciona una línea"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Segmentado, {
								etiqueta: "Contenido",
								opciones: Object.keys(LIMITES_CANTIDAD).map((t) => ({
									valor: t,
									texto: t
								})),
								valor: datos.TipoCantidad,
								onCambio: cambiarTipoCantidad
							}), /* @__PURE__ */ jsx(Segmentado, {
								etiqueta: "Empaque",
								opciones: [{
									valor: "Jaba",
									texto: "Jaba"
								}, {
									valor: "Plancha",
									texto: "Plancha",
									deshabilitado: datos.TipoCantidad === "Unidades"
								}],
								valor: datos.TipoContenedor,
								onCambio: cambiar("TipoContenedor")
							})]
						}),
						datos.TipoCantidad === "Unidades" && /* @__PURE__ */ jsx("p", {
							className: "-mt-2 text-xs text-slate-500",
							children: "Los productos por unidades solo se empacan en jaba."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(InputForModal, {
								id: "producto-cantidad",
								etiqueta: `${datos.TipoCantidad} por ${datos.TipoContenedor.toLowerCase()}`,
								valor: datos.CantidadRollosUnidades,
								onCambio: (v) => PATRON_ENTERO.test(v) && cambiar("CantidadRollosUnidades")(v),
								inputMode: "numeric",
								placeholder: `${limites.minimo} – ${limites.maximo}`,
								classNameInput: "tabular-nums",
								error: errores.CantidadRollosUnidades
							}), /* @__PURE__ */ jsx(InputForModal, {
								id: "producto-por-unidad",
								etiqueta: "Por unidad terminada",
								valor: datos.CantidadPorUnidadTerminada,
								onCambio: (v) => PATRON_ENTERO.test(v) && cambiar("CantidadPorUnidadTerminada")(v),
								inputMode: "numeric",
								placeholder: `1 – ${MAXIMO_POR_UNIDAD_TERMINADA}`,
								classNameInput: "tabular-nums",
								error: errores.CantidadPorUnidadTerminada
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold uppercase tracking-wide text-slate-500",
									children: "Código"
								}), /* @__PURE__ */ jsx("span", {
									className: cn("font-mono text-base font-extrabold", codigoRepetido ? "text-red-600" : codigo ? "text-slate-900" : "text-slate-300"),
									children: codigo || `${linea?.SiglasProducto ?? "SIG"}-${datos.TipoContenedor[0]}00`
								})]
							}), linea && datos.CantidadRollosUnidades && /* @__PURE__ */ jsxs("div", {
								className: "text-right text-[12.5px] font-semibold text-slate-500",
								children: [
									linea.NombreProducto,
									" ",
									Number(datos.CantidadRollosUnidades)
								]
							})]
						}),
						codigoRepetido && /* @__PURE__ */ jsx("p", {
							className: "-mt-3 text-xs font-semibold text-red-600",
							children: "Ya existe un producto con este código."
						}),
						error && /* @__PURE__ */ jsx("div", {
							className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
							children: error
						})
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					onClick: confirmar,
					disabled: enviando || !valido,
					className: "h-11 w-full gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800 sm:w-auto",
					children: enviando ? /* @__PURE__ */ jsx(Loader2, {
						size: 16,
						className: "animate-spin"
					}) : "Crear producto"
				}) })
			]
		})
	});
}
function SeccionLinea({ linea, productos, onAgregar }) {
	return /* @__PURE__ */ jsx(TarjetaSeccion, {
		titulo: linea.NombreProducto,
		extra: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ jsx("span", {
				className: "rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[13px] font-bold text-slate-600",
				children: linea.SiglasProducto
			}), /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				onClick: () => onAgregar(linea.IdProducto),
				className: "h-9 gap-1.5 font-bold text-c3 hover:bg-c4/10 hover:text-c3",
				children: [/* @__PURE__ */ jsx(Plus, {
					size: 15,
					strokeWidth: 2.5
				}), "Agregar"]
			})]
		}),
		children: productos.length === 0 ? /* @__PURE__ */ jsx("div", {
			className: "p-8 text-center text-sm text-slate-400",
			children: "Esta línea todavía no tiene productos."
		}) : /* @__PURE__ */ jsx(TablaFilas, {
			columnas: COLUMNAS,
			filas: productos,
			clave: (p) => p.IdPresentacion,
			tarjeta: tarjetaPresentacion
		})
	});
}
function Catalogo() {
	const [lineas, setLineas] = useState(null);
	const [presentaciones, setPresentaciones] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");
	const [dialogoLinea, setDialogoLinea] = useState(false);
	const [dialogoProducto, setDialogoProducto] = useState({
		abierto: false,
		idLinea: null
	});
	const cargar = async () => {
		setCargando(true);
		setError("");
		try {
			const [lineasCargadas, presentacionesCargadas] = await Promise.all([listarLineas(), listarProductos()]);
			setLineas(lineasCargadas);
			setPresentaciones(presentacionesCargadas);
		} catch (e) {
			setError(e.message);
		} finally {
			setCargando(false);
		}
	};
	useEffect(() => {
		cargar();
	}, []);
	const productosPorLinea = useMemo(() => {
		const grupos = /* @__PURE__ */ new Map();
		for (const p of presentaciones) {
			if (!grupos.has(p.IdProducto)) grupos.set(p.IdProducto, []);
			grupos.get(p.IdProducto).push(p);
		}
		return grupos;
	}, [presentaciones]);
	const alGuardarLinea = (linea) => {
		setDialogoLinea(false);
		toast.success(`Línea ${linea.NombreProducto} creada con las siglas ${linea.SiglasProducto}`);
		cargar();
	};
	const alGuardarProducto = (producto) => {
		setDialogoProducto({
			abierto: false,
			idLinea: null
		});
		toast.success(`Producto ${producto.CodigoPresentacion} creado`);
		cargar();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0",
		children: [
			/* @__PURE__ */ jsx(Toaster, {
				richColors: true,
				position: "top-center"
			}),
			/* @__PURE__ */ jsx(Header, {
				volver: "/admin/inicio",
				titulo: "Administración",
				subtitulo: "Líneas y productos",
				contador: presentaciones.length ? {
					valor: presentaciones.length,
					singular: "producto",
					plural: "productos"
				} : null,
				accion: {
					texto: "Nuevo producto",
					icono: Plus,
					onClick: () => setDialogoProducto({
						abierto: true,
						idLinea: null
					})
				},
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setDialogoLinea(true),
					variant: "ghost",
					className: "h-11 gap-2 font-bold text-white ring-1 ring-white/40 hover:bg-white/15 hover:text-white",
					children: [/* @__PURE__ */ jsx(Plus, {
						size: 16,
						strokeWidth: 2.75
					}), "Nueva línea"]
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6",
				children: [
					(cargando || error) && /* @__PURE__ */ jsx(TarjetaSeccion, {
						titulo: "Líneas de producción",
						children: cargando ? /* @__PURE__ */ jsx(EsqueletoCarga, {}) : /* @__PURE__ */ jsx(ErrorCarga, {
							error,
							recargar: cargar
						})
					}),
					!cargando && !error && lineas?.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200",
						children: "Todavía no hay líneas de producción."
					}),
					!cargando && !error && lineas?.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "flex flex-col gap-4",
						children: lineas.map((linea) => /* @__PURE__ */ jsx(SeccionLinea, {
							linea,
							productos: productosPorLinea.get(linea.IdProducto) ?? [],
							onAgregar: (idLinea) => setDialogoProducto({
								abierto: true,
								idLinea
							})
						}, linea.IdProducto))
					})
				]
			}),
			/* @__PURE__ */ jsx(DialogoLinea, {
				abierto: dialogoLinea,
				lineas: lineas ?? [],
				onCerrar: () => setDialogoLinea(false),
				onGuardado: alGuardarLinea
			}),
			/* @__PURE__ */ jsx(DialogoProducto, {
				abierto: dialogoProducto.abierto,
				idLineaInicial: dialogoProducto.idLinea,
				lineas: lineas ?? [],
				presentaciones,
				onCerrar: () => setDialogoProducto({
					abierto: false,
					idLinea: null
				}),
				onGuardado: alGuardarProducto
			})
		]
	});
}
//#endregion
//#region src/pages/admin/catalogo.astro
var catalogo_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Catalogo,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Catalogo = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Catalogo;
	const { usuario } = Astro.locals;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="md:hidden">${renderComponent($$result, "NavBar", NavBar, {
		"client:media": "(max-width: 767.98px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"seccion": "admin",
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/NavBar",
		"client:component-export": "default"
	})}</div><div class="hidden md:block">${renderComponent($$result, "SideBar", SideBar, {
		"client:media": "(min-width: 768px)",
		"idRol": usuario.IdRol,
		"esAdmin": usuario.IsAdmin,
		"seccion": "admin",
		"client:component-hydration": "media",
		"client:component-path": "@/components/layout/SideBar",
		"client:component-export": "default"
	})}</div>${renderComponent($$result, "Catalogo", Catalogo, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Admin/Catalogo/Catalogo",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/catalogo.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/catalogo.astro";
var $$url = "/admin/catalogo";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/catalogo@_@astro
var page = () => catalogo_exports;
//#endregion
export { page };
