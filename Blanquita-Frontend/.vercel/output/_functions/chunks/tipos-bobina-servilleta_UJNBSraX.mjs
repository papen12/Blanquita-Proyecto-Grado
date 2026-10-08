import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { o as Skeleton, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { a as listarTiposBobinaServilleta, i as editarTipoBobinaServilleta, o as TipoBobinaServilletaDatos, r as crearTipoBobinaServilleta } from "./BobinaServilleta_CEietmcz.mjs";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCcw, SquareStack } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster, toast } from "sonner";
//#region src/components/Admin/TiposBobinaServilleta/TiposBobinaServilleta.jsx
var NOMBRE_MIN = 3;
var NOMBRE_MAX = 30;
var PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$/;
var PATRON_DECIMAL = /^\d{0,4}(\.\d{0,2})?$/;
var CAMPOS_MEDIDA = [
	{
		campo: "DiametroMm",
		etiqueta: "Diámetro (mm)",
		maximo: 5e3
	},
	{
		campo: "CrepadoPorcentaje",
		etiqueta: "Crepado (%)",
		maximo: 100
	},
	{
		campo: "ResistenciaKgf",
		etiqueta: "Resistencia (kgf)",
		maximo: 1e3
	}
];
var VALORES_POR_DEFECTO = {
	NombreTipoBobinaServilleta: "",
	DiametroMm: "1210",
	CrepadoPorcentaje: "14",
	ResistenciaKgf: "1.35"
};
var aFormulario = (tipo) => ({
	NombreTipoBobinaServilleta: tipo.NombreTipoBobinaServilleta,
	DiametroMm: String(tipo.DiametroMm),
	CrepadoPorcentaje: String(tipo.CrepadoPorcentaje),
	ResistenciaKgf: String(tipo.ResistenciaKgf)
});
function erroresTipo(datos) {
	const errores = {};
	const nombre = datos.NombreTipoBobinaServilleta.trim().replace(/\s+/g, " ");
	if (nombre && (nombre.length < NOMBRE_MIN || !PATRON_NOMBRE.test(nombre))) errores.NombreTipoBobinaServilleta = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y guiones`;
	for (const { campo, maximo } of CAMPOS_MEDIDA) {
		const valor = Number(datos[campo]);
		if (datos[campo] !== "" && (!(valor > 0) || valor > maximo)) errores[campo] = `Mayor a 0 y hasta ${formatearNumero(maximo, { decimales: 0 })}`;
	}
	return errores;
}
function DialogoTipo({ abierto, tipo, onCerrar, onGuardado }) {
	const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	const editando = Boolean(tipo);
	useEffect(() => {
		if (!abierto) return;
		setDatos(tipo ? aFormulario(tipo) : VALORES_POR_DEFECTO);
		setError("");
	}, [abierto, tipo]);
	const cambiar = (campo) => (valor) => setDatos((previos) => ({
		...previos,
		[campo]: valor
	}));
	const errores = erroresTipo(datos);
	const completo = datos.NombreTipoBobinaServilleta.trim() && CAMPOS_MEDIDA.every(({ campo }) => datos[campo] !== "");
	const sinCambios = editando && JSON.stringify(TipoBobinaServilletaDatos(tipo)) === JSON.stringify(TipoBobinaServilletaDatos(datos));
	const valido = completo && Object.keys(errores).length === 0 && !sinCambios;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onGuardado(editando ? await editarTipoBobinaServilleta(tipo.IdTipoBobinaServilleta, datos) : await crearTipoBobinaServilleta(datos), editando);
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
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: editando ? "Editar tipo de bobina servilleta" : "Nuevo tipo de bobina servilleta" }), /* @__PURE__ */ jsx(DialogDescription, { children: editando ? "Los cambios no modifican las bobinas ya registradas." : "El diámetro, el crepado y la resistencia son valores de referencia del tipo." })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(InputForModal, {
							id: "tipo-nombre",
							etiqueta: "Nombre",
							valor: datos.NombreTipoBobinaServilleta,
							onCambio: (v) => cambiar("NombreTipoBobinaServilleta")(v.slice(0, NOMBRE_MAX)),
							placeholder: "Ej. Doble hoja",
							error: errores.NombreTipoBobinaServilleta
						}),
						/* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
							children: CAMPOS_MEDIDA.map(({ campo, etiqueta }) => /* @__PURE__ */ jsx(InputForModal, {
								id: `tipo-${campo}`,
								etiqueta,
								valor: datos[campo],
								onCambio: (v) => PATRON_DECIMAL.test(v) && cambiar(campo)(v),
								inputMode: "decimal",
								classNameInput: "tabular-nums",
								error: errores[campo]
							}, campo))
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
					}) : editando ? "Guardar cambios" : "Crear tipo"
				}) })
			]
		})
	});
}
function Medida({ etiqueta, valor, unidad }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-[11px] font-bold uppercase tracking-wide text-slate-500",
			children: etiqueta
		}), /* @__PURE__ */ jsxs("span", {
			className: "text-[15px] font-extrabold tabular-nums text-slate-900",
			children: [
				formatearNumero(valor, { decimalesMinimos: 0 }),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-slate-500",
					children: unidad
				})
			]
		})]
	});
}
function TarjetaTipo({ tipo, onEditar }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-c4/10",
					children: /* @__PURE__ */ jsx(SquareStack, {
						size: 20,
						className: "text-c3"
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-[15px] font-extrabold leading-tight break-words text-slate-900",
						children: tipo.NombreTipoBobinaServilleta
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-[12.5px] text-slate-500",
						children: [
							tipo.CantidadEnAlmacen,
							" en almacén · ",
							tipo.CantidadBobinas,
							" registradas"
						]
					})]
				})]
			}), /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				size: "icon",
				onClick: () => onEditar(tipo),
				"aria-label": `Editar ${tipo.NombreTipoBobinaServilleta}`,
				className: "h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3",
				children: /* @__PURE__ */ jsx(Pencil, {
					size: 16,
					strokeWidth: 2.25
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ jsx(Medida, {
					etiqueta: "Diámetro",
					valor: tipo.DiametroMm,
					unidad: "mm"
				}),
				/* @__PURE__ */ jsx(Medida, {
					etiqueta: "Crepado",
					valor: tipo.CrepadoPorcentaje,
					unidad: "%"
				}),
				/* @__PURE__ */ jsx(Medida, {
					etiqueta: "Resistencia",
					valor: tipo.ResistenciaKgf,
					unidad: "kgf"
				})
			]
		})]
	});
}
function TiposBobinaServilleta() {
	const [tipos, setTipos] = useState(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");
	const [dialogo, setDialogo] = useState({
		abierto: false,
		tipo: null
	});
	const cargar = async () => {
		setCargando(true);
		setError("");
		try {
			setTipos(await listarTiposBobinaServilleta());
		} catch (e) {
			setError(e.message);
		} finally {
			setCargando(false);
		}
	};
	useEffect(() => {
		cargar();
	}, []);
	const alGuardar = (guardado, editando) => {
		setDialogo({
			abierto: false,
			tipo: null
		});
		toast.success(editando ? `Tipo ${guardado.NombreTipoBobinaServilleta} actualizado` : `Tipo ${guardado.NombreTipoBobinaServilleta} creado`);
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
				subtitulo: "Tipos de bobina servilleta",
				contador: tipos ? {
					valor: tipos.length,
					singular: "tipo",
					plural: "tipos"
				} : null,
				accion: {
					texto: "Nuevo tipo",
					icono: Plus,
					onClick: () => setDialogo({
						abierto: true,
						tipo: null
					})
				}
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6",
				children: [
					cargando && /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							0,
							1,
							2
						].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-36 rounded-2xl" }, i))
					}),
					!cargando && error && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-slate-200",
						children: [error, /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							onClick: cargar,
							className: "h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50",
							children: [/* @__PURE__ */ jsx(RefreshCcw, {
								size: 14,
								strokeWidth: 2.5
							}), "Reintentar"]
						})]
					}),
					!cargando && !error && tipos?.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200",
						children: "Todavía no hay tipos de bobina servilleta."
					}),
					!cargando && !error && tipos?.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: tipos.map((tipo) => /* @__PURE__ */ jsx(TarjetaTipo, {
							tipo,
							onEditar: (t) => setDialogo({
								abierto: true,
								tipo: t
							})
						}, tipo.IdTipoBobinaServilleta))
					})
				]
			}),
			/* @__PURE__ */ jsx(DialogoTipo, {
				abierto: dialogo.abierto,
				tipo: dialogo.tipo,
				onCerrar: () => setDialogo({
					abierto: false,
					tipo: null
				}),
				onGuardado: alGuardar
			})
		]
	});
}
//#endregion
//#region src/pages/admin/tipos-bobina-servilleta.astro
var tipos_bobina_servilleta_exports = /* @__PURE__ */ __exportAll({
	default: () => $$TiposBobinaServilleta,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$TiposBobinaServilleta = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TiposBobinaServilleta;
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
	})}</div>${renderComponent($$result, "TiposBobinaServilleta", TiposBobinaServilleta, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Admin/TiposBobinaServilleta/TiposBobinaServilleta",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/tipos-bobina-servilleta.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/tipos-bobina-servilleta.astro";
var $$url = "/admin/tipos-bobina-servilleta";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/tipos-bobina-servilleta@_@astro
var page = () => tipos_bobina_servilleta_exports;
//#endregion
export { page };
