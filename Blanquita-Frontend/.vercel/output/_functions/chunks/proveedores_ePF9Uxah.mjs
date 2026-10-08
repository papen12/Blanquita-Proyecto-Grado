import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { a as limpiarObservacion } from "./api_B8jC8QYh.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { a as TooltipTrigger, i as TooltipProvider, n as Tooltip, r as TooltipContent, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { a as listarProveedores, i as editarProveedor, n as cambiarEstadoProveedor, o as ProveedorDatos, r as crearProveedor } from "./Proveedor_BrPdG6tg.mjs";
import "./Acentos_7-zo-5xR.mjs";
import { _ as TarjetaReporte, g as TarjetaFiltros, h as SelectFiltro, i as BuscadorFiltro, l as Dato, m as ResultadosReporte, p as PieTarjeta, t as BadgeEstado } from "./comunes_LNdSvMvL.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { r as EstadosProveedor } from "./Estados_DlvEoiha.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { o as ErrorDialogo, t as BotonEnviar } from "./Dialogos_OVQVEhLJ.mjs";
import { useEffect, useState } from "react";
import { Pencil, Plus, ToggleRight } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster, toast } from "sonner";
//#region src/components/Admin/Proveedores/Dialogos.jsx
var NOMBRE_MIN = 3;
var NOMBRE_MAX = 60;
var CORREO_MAX = 100;
var PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&-]+$/;
var PATRON_CELULAR = /^[67]\d{7}$/;
var PATRON_CORREO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
var VALORES_POR_DEFECTO = {
	NombreProveedor: "",
	CelularProveedor: "",
	CorreoProveedor: ""
};
var aFormulario = (proveedor) => ({
	NombreProveedor: proveedor.NombreProveedor,
	CelularProveedor: proveedor.CelularProveedor ?? "",
	CorreoProveedor: proveedor.CorreoProveedor ?? ""
});
function erroresProveedor(datos) {
	const errores = {};
	const { NombreProveedor, CelularProveedor, CorreoProveedor } = ProveedorDatos(datos);
	if (NombreProveedor && (NombreProveedor.length < NOMBRE_MIN || !PATRON_NOMBRE.test(NombreProveedor))) errores.NombreProveedor = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y . , & -`;
	if (CelularProveedor && !PATRON_CELULAR.test(CelularProveedor)) errores.CelularProveedor = "8 dígitos, empieza con 6 o 7";
	if (CorreoProveedor && !PATRON_CORREO.test(CorreoProveedor)) errores.CorreoProveedor = "Correo no válido";
	return errores;
}
function ResumenProveedor({ proveedor }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[15px] font-extrabold text-slate-900",
			children: proveedor.NombreProveedor
		}), /* @__PURE__ */ jsxs("div", {
			className: "text-[12.5px] text-slate-500",
			children: [
				proveedor.CelularProveedor ?? "Sin celular",
				" · ",
				proveedor.NombreEstadoProveedor
			]
		})]
	});
}
function DialogoProveedor({ abierto, proveedor, onCerrar, onGuardado }) {
	const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	const editando = Boolean(proveedor);
	useEffect(() => {
		if (!abierto) return;
		setDatos(proveedor ? aFormulario(proveedor) : VALORES_POR_DEFECTO);
		setError("");
	}, [abierto, proveedor]);
	const cambiar = (campo) => (valor) => setDatos((previos) => ({
		...previos,
		[campo]: valor
	}));
	const errores = erroresProveedor(datos);
	const completo = datos.NombreProveedor.trim() !== "";
	const sinCambios = editando && JSON.stringify(ProveedorDatos(aFormulario(proveedor))) === JSON.stringify(ProveedorDatos(datos));
	const valido = completo && Object.keys(errores).length === 0 && !sinCambios;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onGuardado(editando ? await editarProveedor(proveedor.IdProveedor, datos) : await crearProveedor(datos), editando);
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
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: editando ? "Editar proveedor" : "Registrar proveedor" }), /* @__PURE__ */ jsx(DialogDescription, { children: editando ? "Los cambios no modifican los lotes ya registrados." : "El proveedor se registra como Activo y aparece en los formularios de ingreso." })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(InputForModal, {
							id: "proveedor-nombre",
							etiqueta: "Nombre",
							valor: datos.NombreProveedor,
							onCambio: (v) => cambiar("NombreProveedor")(v.slice(0, NOMBRE_MAX)),
							placeholder: "Ej. Papelera del Sur S.R.L.",
							error: errores.NombreProveedor
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(InputForModal, {
								id: "proveedor-celular",
								etiqueta: "Celular",
								opcional: true,
								valor: datos.CelularProveedor,
								onCambio: (v) => cambiar("CelularProveedor")(v.replace(/\D/g, "").slice(0, 8)),
								inputMode: "numeric",
								placeholder: "70012345",
								classNameInput: "tabular-nums",
								error: errores.CelularProveedor
							}), /* @__PURE__ */ jsx(InputForModal, {
								id: "proveedor-correo",
								etiqueta: "Correo",
								opcional: true,
								type: "email",
								valor: datos.CorreoProveedor,
								onCambio: (v) => cambiar("CorreoProveedor")(v.replace(/\s/g, "").slice(0, CORREO_MAX)),
								placeholder: "ventas@empresa.com",
								error: errores.CorreoProveedor
							})]
						}),
						error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(BotonEnviar, {
					onClick: confirmar,
					enviando,
					deshabilitado: !valido,
					className: "bg-slate-900 hover:bg-slate-800",
					children: editando ? "Guardar cambios" : "Registrar proveedor"
				}) })
			]
		})
	});
}
function DialogoCambiarEstado({ proveedor, onCerrar, onCambiado }) {
	const [idEstado, setIdEstado] = useState(null);
	const [motivo, setMotivo] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!proveedor) return;
		setIdEstado(null);
		setMotivo("");
		setError("");
	}, [proveedor]);
	const destinos = proveedor ? EstadosProveedor.filter((e) => e.IdEstadoProveedor !== proveedor.IdEstadoProveedor) : [];
	const largo = motivo.trim().length;
	const valido = idEstado !== null && largo >= 5 && largo <= 150;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onCambiado(await cambiarEstadoProveedor(proveedor.IdProveedor, idEstado, motivo));
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: Boolean(proveedor),
		onOpenChange: (open) => !open && !enviando && onCerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Cambiar estado" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Un proveedor inactivo no aparece en los formularios de ingreso; sus lotes se conservan." })] }),
				proveedor && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(ResumenProveedor, { proveedor }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Nuevo estado"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap gap-2",
								children: destinos.map((estado) => /* @__PURE__ */ jsx("button", {
									type: "button",
									"aria-pressed": idEstado === estado.IdEstadoProveedor,
									onClick: () => setIdEstado(estado.IdEstadoProveedor),
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: estado.NombreEstadoProveedor
								}, estado.IdEstadoProveedor))
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Label, {
									htmlFor: "motivo-estado-proveedor",
									className: "text-xs font-bold uppercase tracking-wide text-slate-600",
									children: "Motivo"
								}),
								/* @__PURE__ */ jsx(Textarea, {
									id: "motivo-estado-proveedor",
									value: motivo,
									onChange: (e) => setMotivo(limpiarObservacion(e.target.value)),
									placeholder: "Ej. Dejó de distribuir, problemas de calidad...",
									className: "min-h-20",
									maxLength: 150
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-slate-500",
									children: [
										largo,
										"/",
										150,
										" · mínimo ",
										5,
										" caracteres"
									]
								})
							]
						}),
						error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(BotonEnviar, {
					onClick: confirmar,
					enviando,
					deshabilitado: !valido,
					className: "bg-slate-900 hover:bg-slate-800",
					children: "Cambiar estado"
				}) })
			]
		})
	});
}
//#endregion
//#region src/components/Admin/Proveedores/Proveedores.jsx
var ESTADOS_PROVEEDOR = {
	Activo: "border-emerald-300 bg-emerald-50 text-emerald-700",
	Inactivo: "border-amber-300 bg-amber-50 text-amber-700"
};
var FILTROS_INICIALES = {
	Busqueda: "",
	IdEstadoProveedor: ""
};
var COLUMNAS = [
	{
		titulo: "Nombre",
		clase: "font-semibold text-slate-900",
		valor: (p) => p.NombreProveedor
	},
	{
		titulo: "Celular",
		clase: "tabular-nums",
		valor: (p) => p.CelularProveedor ?? "—"
	},
	{
		titulo: "Correo",
		valor: (p) => p.CorreoProveedor ?? "—"
	},
	{
		titulo: "Estado",
		valor: (p) => /* @__PURE__ */ jsx(BadgeEstado, {
			estado: p.NombreEstadoProveedor,
			estilos: ESTADOS_PROVEEDOR
		})
	}
];
function BotonAccion({ ayuda, icono: Icono, onClick }) {
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { render: /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		onClick,
		className: "h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3",
		children: /* @__PURE__ */ jsx(Icono, {
			size: 16,
			strokeWidth: 2.25
		})
	}) }), /* @__PURE__ */ jsx(TooltipContent, { children: ayuda })] });
}
function Proveedores() {
	const reporte = useReporte(listarProveedores, FILTROS_INICIALES, ["Busqueda"]);
	const [dialogo, setDialogo] = useState({
		abierto: false,
		proveedor: null
	});
	const [cambioEstado, setCambioEstado] = useState(null);
	const acciones = (p) => /* @__PURE__ */ jsxs("div", {
		className: "flex justify-end gap-1",
		children: [/* @__PURE__ */ jsx(BotonAccion, {
			ayuda: "Editar proveedor",
			icono: Pencil,
			onClick: () => setDialogo({
				abierto: true,
				proveedor: p
			})
		}), /* @__PURE__ */ jsx(BotonAccion, {
			ayuda: "Cambiar estado",
			icono: ToggleRight,
			onClick: () => setCambioEstado(p)
		})]
	});
	const alGuardar = (guardado, editando) => {
		setDialogo({
			abierto: false,
			proveedor: null
		});
		toast.success(editando ? `Proveedor ${guardado.NombreProveedor} actualizado` : `Proveedor ${guardado.NombreProveedor} registrado`);
		reporte.recargar();
	};
	const alCambiarEstado = (resultado) => {
		setCambioEstado(null);
		toast.success(`${resultado.NombreProveedor}: ${resultado.NombreEstadoAnterior} → ${resultado.NombreEstadoProveedor}`);
		reporte.recargar();
	};
	return /* @__PURE__ */ jsxs(TooltipProvider, { children: [
		/* @__PURE__ */ jsx(Toaster, {
			richColors: true,
			position: "top-center"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0",
			children: [/* @__PURE__ */ jsx(Header, {
				volver: "/admin/inicio",
				titulo: "Administración",
				subtitulo: "Proveedores",
				contador: reporte.catalogo ? {
					valor: reporte.catalogo.Total,
					singular: "proveedor",
					plural: "proveedores"
				} : null,
				accion: {
					texto: "Registrar proveedor",
					icono: Plus,
					onClick: () => setDialogo({
						abierto: true,
						proveedor: null
					})
				}
			}), /* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [/* @__PURE__ */ jsx(TarjetaFiltros, {
					reporte,
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ jsx(BuscadorFiltro, {
							reporte,
							campo: "Busqueda",
							etiqueta: "Buscar",
							placeholder: "Nombre, celular o correo",
							mono: false
						}), /* @__PURE__ */ jsx(SelectFiltro, {
							reporte,
							campo: "IdEstadoProveedor",
							etiqueta: "Estado",
							opciones: EstadosProveedor,
							campoEtiqueta: "NombreEstadoProveedor",
							placeholder: "Todos los estados"
						})]
					})
				}), /* @__PURE__ */ jsx(ResultadosReporte, {
					reporte,
					elementos: reporte.catalogo?.Proveedores,
					clave: (p) => p.IdProveedor,
					nombres: ["proveedor", "proveedores"],
					columnas: COLUMNAS,
					anchoAccion: "w-24",
					accion: acciones,
					tarjeta: (p) => /* @__PURE__ */ jsx(TarjetaReporte, {
						titulo: p.NombreProveedor,
						tamanoTitulo: "text-[14px] font-sans",
						subtitulo: p.CorreoProveedor ?? "Sin correo",
						estado: p.NombreEstadoProveedor,
						estilos: ESTADOS_PROVEEDOR,
						children: /* @__PURE__ */ jsx(PieTarjeta, {
							accion: acciones(p),
							children: /* @__PURE__ */ jsx(Dato, {
								etiqueta: "Celular",
								children: p.CelularProveedor ?? "—"
							})
						})
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsx(DialogoProveedor, {
			abierto: dialogo.abierto,
			proveedor: dialogo.proveedor,
			onCerrar: () => setDialogo({
				abierto: false,
				proveedor: null
			}),
			onGuardado: alGuardar
		}),
		/* @__PURE__ */ jsx(DialogoCambiarEstado, {
			proveedor: cambioEstado,
			onCerrar: () => setCambioEstado(null),
			onCambiado: alCambiarEstado
		})
	] });
}
//#endregion
//#region src/pages/admin/proveedores.astro
var proveedores_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Proveedores,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Proveedores = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Proveedores;
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
	})}</div>${renderComponent($$result, "Proveedores", Proveedores, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Admin/Proveedores/Proveedores",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/proveedores.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/proveedores.astro";
var $$url = "/admin/proveedores";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/proveedores@_@astro
var page = () => proveedores_exports;
//#endregion
export { page };
