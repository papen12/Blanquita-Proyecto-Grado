import { n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton, s as Separator } from "./SideBar_kUHPnrT4.mjs";
import { a as DialogFooter, n as DialogClose, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { useEffect, useState } from "react";
import { CalendarClock, Check, Copy, IdCard, Loader2, Pencil, Phone, ShieldCheck, UserRound, UserRoundKey } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/models/Usuario/Perfil.js
var limpiarOpcional = (valor) => {
	const texto = (valor ?? "").trim();
	return texto === "" ? null : texto;
};
var PerfilUpdateRequest = (datos) => ({
	PrimerNombre: (datos.PrimerNombre ?? "").trim(),
	SegundoNombre: limpiarOpcional(datos.SegundoNombre),
	ApellidoPaterno: (datos.ApellidoPaterno ?? "").trim(),
	ApellidoMaterno: limpiarOpcional(datos.ApellidoMaterno),
	Celular: limpiarOpcional(datos.Celular)
});
var PerfilResponse = (data) => ({
	IdUsuario: data.IdUsuario,
	Ci: data.Ci,
	PrimerNombre: data.PrimerNombre,
	SegundoNombre: data.SegundoNombre ?? null,
	ApellidoPaterno: data.ApellidoPaterno,
	ApellidoMaterno: data.ApellidoMaterno ?? null,
	NombreCompleto: data.NombreCompleto,
	Celular: data.Celular ?? null,
	IdRol: data.IdRol,
	NombreRol: data.NombreRol,
	IdEstadoUsuario: data.IdEstadoUsuario,
	NombreEstadoUsuario: data.NombreEstadoUsuario,
	FechaRegistro: data.FechaRegistro,
	Correo: data.Correo ?? null
});
//#endregion
//#region src/services/Usuario/Perfil.js
async function obtenerPerfil() {
	return PerfilResponse(await pedirJson("/api/Usuario/ver"));
}
async function editarPerfil(datos) {
	return PerfilResponse(await pedirJson("/api/Usuario/editar", {
		method: "POST",
		body: PerfilUpdateRequest(datos)
	}));
}
//#endregion
//#region src/components/Usuario/Perfil.jsx
var ESTADO_ESTILO = {
	1: "border-emerald-300 bg-emerald-50 text-emerald-700",
	2: "border-slate-300 bg-slate-100 text-slate-600",
	3: "border-red-300 bg-red-50 text-red-600"
};
var MIN_NOMBRE = 2;
var MAX_NOMBRE = 15;
var NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/;
var CARACTERES_NO_PERMITIDOS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g;
var CELULAR_REGEX = /^[67]\d{7}$/;
var CAMPOS_NOMBRE = [
	{
		campo: "PrimerNombre",
		obligatorio: true
	},
	{
		campo: "SegundoNombre",
		obligatorio: false
	},
	{
		campo: "ApellidoPaterno",
		obligatorio: true
	},
	{
		campo: "ApellidoMaterno",
		obligatorio: false
	}
];
var limpiarNombre = (valor) => valor.replace(CARACTERES_NO_PERMITIDOS, "");
function iniciales(primerNombre, apellidoPaterno) {
	return ((primerNombre?.trim()?.[0] ?? "") + (apellidoPaterno?.trim()?.[0] ?? "")).toUpperCase() || "?";
}
function formatearCelular(valor) {
	if (!valor) return "Sin registrar";
	const limpio = String(valor).replace(/\D/g, "");
	return limpio.length === 8 ? limpio.replace(/(\d{4})(\d{4})/, "$1 $2") : String(valor);
}
var norm = (valor) => (valor ?? "").trim();
function formularioDesde(perfil) {
	return {
		PrimerNombre: perfil.PrimerNombre ?? "",
		SegundoNombre: perfil.SegundoNombre ?? "",
		ApellidoPaterno: perfil.ApellidoPaterno ?? "",
		ApellidoMaterno: perfil.ApellidoMaterno ?? "",
		Celular: perfil.Celular ?? ""
	};
}
function errorNombre(valor, obligatorio) {
	const nombre = norm(valor);
	if (!nombre) return obligatorio ? "Requerido" : null;
	if (nombre.length < MIN_NOMBRE) return `Mínimo ${MIN_NOMBRE} caracteres`;
	if (nombre.length > MAX_NOMBRE) return `Máximo ${MAX_NOMBRE} caracteres`;
	if (!NOMBRE_REGEX.test(nombre)) return "Solo letras, sin espacios";
	return null;
}
function validar(form) {
	const errores = {};
	for (const { campo, obligatorio } of CAMPOS_NOMBRE) {
		const error = errorNombre(form[campo], obligatorio);
		if (error) errores[campo] = error;
	}
	const celular = norm(form.Celular);
	if (celular && !CELULAR_REGEX.test(celular)) errores.Celular = "8 dígitos, empezando con 6 o 7";
	return errores;
}
function hayCambios(form, perfil) {
	return norm(form.PrimerNombre) !== norm(perfil.PrimerNombre) || norm(form.SegundoNombre) !== norm(perfil.SegundoNombre) || norm(form.ApellidoPaterno) !== norm(perfil.ApellidoPaterno) || norm(form.ApellidoMaterno) !== norm(perfil.ApellidoMaterno) || norm(form.Celular) !== norm(perfil.Celular);
}
async function copiar(texto, etiqueta) {
	if (!texto) return;
	try {
		await navigator.clipboard?.writeText(String(texto));
		toast.success(`${etiqueta} copiado`);
	} catch {
		toast.error("No se pudo copiar");
	}
}
function Campo({ icono: Icono, etiqueta, valor, copiable = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-start gap-3 py-3",
		children: [Icono && /* @__PURE__ */ jsx("div", {
			className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-c4/10 text-c3",
			children: /* @__PURE__ */ jsx(Icono, {
				size: 17,
				strokeWidth: 2.25
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-[11px] font-bold uppercase tracking-wide text-slate-400",
				children: etiqueta
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 break-words text-[15px] font-semibold text-slate-800",
				children: [valor, copiable && valor && /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon",
					onClick: () => copiar(valor, etiqueta),
					className: "h-6 w-6 shrink-0 text-slate-400 hover:text-c3",
					children: /* @__PURE__ */ jsx(Copy, {
						size: 13,
						strokeWidth: 2.5
					})
				})]
			})]
		})]
	});
}
function TarjetaPerfil({ titulo, icono: Icono, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-sm font-extrabold text-slate-700",
			children: [Icono && /* @__PURE__ */ jsx("div", {
				className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-c4/10 text-c3",
				children: /* @__PURE__ */ jsx(Icono, {
					size: 16,
					strokeWidth: 2.25
				})
			}), titulo]
		}), /* @__PURE__ */ jsx("div", {
			className: "px-5 py-1",
			children
		})]
	});
}
function PerfilSkeleton() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("section", {
			className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-20 w-20 rounded-full" }), /* @__PURE__ */ jsxs("div", {
					className: "w-full space-y-2",
					children: [
						/* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-48" }),
						/* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32" }),
						/* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-24 rounded-full" })
					]
				})]
			})
		}), [0, 1].map((i) => /* @__PURE__ */ jsxs("section", {
			className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
			children: [/* @__PURE__ */ jsx("div", {
				className: "border-b border-slate-100 px-5 py-3.5",
				children: /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-28" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" })]
			})]
		}, i))]
	});
}
function DialogEditarPerfil({ abierto, onOpenChange, perfil, onGuardado }) {
	const [form, setForm] = useState(() => formularioDesde(perfil));
	const [errores, setErrores] = useState({});
	const [guardando, setGuardando] = useState(false);
	useEffect(() => {
		if (abierto) {
			setForm(formularioDesde(perfil));
			setErrores({});
			setGuardando(false);
		}
	}, [abierto, perfil]);
	const actualizar = (campo) => (valor) => {
		setForm((prev) => ({
			...prev,
			[campo]: valor
		}));
		setErrores((prev) => {
			if (!prev[campo]) return prev;
			const { [campo]: _omitido, ...resto } = prev;
			return resto;
		});
	};
	const actualizarNombre = (campo) => (valor) => actualizar(campo)(limpiarNombre(valor));
	const actualizarCelular = (valor) => actualizar("Celular")(valor.replace(/\D/g, "").slice(0, 8));
	const cambios = hayCambios(form, perfil);
	const guardar = async () => {
		const nuevosErrores = validar(form);
		setErrores(nuevosErrores);
		if (Object.keys(nuevosErrores).length > 0) return;
		setGuardando(true);
		try {
			onGuardado(await editarPerfil(form));
			onOpenChange(false);
			toast.success("Perfil actualizado");
		} catch (e) {
			toast.error(e.message);
		} finally {
			setGuardando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: abierto,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-2xl",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Editar perfil" }) }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4 sm:flex-row",
							children: [/* @__PURE__ */ jsx(InputForModal, {
								className: "flex-1",
								id: "PrimerNombre",
								etiqueta: "Primer nombre",
								valor: form.PrimerNombre,
								onCambio: actualizarNombre("PrimerNombre"),
								error: errores.PrimerNombre,
								maxLength: MAX_NOMBRE,
								autoComplete: "given-name"
							}), /* @__PURE__ */ jsx(InputForModal, {
								className: "flex-1",
								id: "SegundoNombre",
								etiqueta: "Segundo nombre",
								opcional: true,
								valor: form.SegundoNombre,
								onCambio: actualizarNombre("SegundoNombre"),
								error: errores.SegundoNombre,
								maxLength: MAX_NOMBRE,
								autoComplete: "additional-name"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4 sm:flex-row",
							children: [/* @__PURE__ */ jsx(InputForModal, {
								className: "flex-1",
								id: "ApellidoPaterno",
								etiqueta: "Apellido paterno",
								valor: form.ApellidoPaterno,
								onCambio: actualizarNombre("ApellidoPaterno"),
								error: errores.ApellidoPaterno,
								maxLength: MAX_NOMBRE,
								autoComplete: "family-name"
							}), /* @__PURE__ */ jsx(InputForModal, {
								className: "flex-1",
								id: "ApellidoMaterno",
								etiqueta: "Apellido materno",
								opcional: true,
								valor: form.ApellidoMaterno,
								onCambio: actualizarNombre("ApellidoMaterno"),
								error: errores.ApellidoMaterno,
								maxLength: MAX_NOMBRE
							})]
						}),
						/* @__PURE__ */ jsx(InputForModal, {
							id: "Celular",
							etiqueta: "Celular",
							opcional: true,
							valor: form.Celular,
							onCambio: actualizarCelular,
							error: errores.Celular,
							inputMode: "numeric",
							placeholder: "Ej. 71234567",
							autoComplete: "tel-national"
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
					disabled: guardando || !cambios,
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
function Perfil() {
	const [perfil, setPerfil] = useState(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");
	const [editando, setEditando] = useState(false);
	useEffect(() => {
		let activo = true;
		(async () => {
			setCargando(true);
			setError("");
			try {
				const data = await obtenerPerfil();
				if (activo) setPerfil(data);
			} catch (e) {
				if (activo) setError(e.message);
			} finally {
				if (activo) setCargando(false);
			}
		})();
		return () => {
			activo = false;
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar mt-20 md:mt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-3xl flex-1 px-5 py-6 pb-28 sm:px-6",
			children: [
				cargando && /* @__PURE__ */ jsx(PerfilSkeleton, {}),
				!cargando && error && /* @__PURE__ */ jsx("div", {
					className: "rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600",
					children: error
				}),
				!cargando && !error && perfil && /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ jsx("section", {
							className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
							children: /* @__PURE__ */ jsxs("div", {
								className: "relative flex h-full flex-col items-center gap-4 bg-gradient-to-br from-c3 to-c4 p-6 text-white sm:flex-row sm:text-left",
								children: [
									/* @__PURE__ */ jsxs(Button, {
										onClick: () => setEditando(true),
										className: "absolute right-4 top-4 h-9 gap-1.5 bg-white/15 font-bold text-white hover:bg-white/25",
										children: [/* @__PURE__ */ jsx(Pencil, {
											size: 14,
											strokeWidth: 2.5
										}), "Editar"]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold",
										children: iniciales(perfil.PrimerNombre, perfil.ApellidoPaterno)
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ jsx("div", {
												className: "text-xl font-extrabold leading-tight break-words",
												children: perfil.NombreCompleto
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "mt-1 flex items-center justify-center gap-2 text-sm text-white/85 sm:justify-start",
												children: [
													/* @__PURE__ */ jsx(IdCard, {
														size: 15,
														strokeWidth: 2.25
													}),
													"CI ",
													perfil.Ci,
													/* @__PURE__ */ jsx(Button, {
														variant: "ghost",
														size: "icon",
														onClick: () => copiar(perfil.Ci, "CI"),
														className: "h-6 w-6 text-white/80 hover:bg-white/15 hover:text-white",
														children: /* @__PURE__ */ jsx(Copy, {
															size: 13,
															strokeWidth: 2.5
														})
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "mt-2 flex flex-wrap justify-center gap-2 sm:justify-start",
												children: [/* @__PURE__ */ jsx(Badge, {
													variant: "outline",
													className: "border-white/40 bg-white/10 font-bold text-white",
													children: perfil.NombreRol
												}), /* @__PURE__ */ jsx(Badge, {
													variant: "outline",
													className: cn("font-bold", ESTADO_ESTILO[perfil.IdEstadoUsuario] ?? "border-white/40 bg-white/10 text-white"),
													children: perfil.NombreEstadoUsuario
												})]
											})
										]
									})
								]
							})
						}),
						/* @__PURE__ */ jsxs(TarjetaPerfil, {
							titulo: "Datos personales",
							icono: UserRound,
							children: [
								/* @__PURE__ */ jsx(Campo, {
									etiqueta: "Primer nombre",
									valor: perfil.PrimerNombre
								}),
								perfil.SegundoNombre && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsx(Campo, {
									etiqueta: "Segundo nombre",
									valor: perfil.SegundoNombre
								})] }),
								/* @__PURE__ */ jsx(Separator, {}),
								/* @__PURE__ */ jsx(Campo, {
									etiqueta: "Apellido paterno",
									valor: perfil.ApellidoPaterno
								}),
								perfil.ApellidoMaterno && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsx(Campo, {
									etiqueta: "Apellido materno",
									valor: perfil.ApellidoMaterno
								})] })
							]
						}),
						/* @__PURE__ */ jsxs(TarjetaPerfil, {
							titulo: "Cuenta",
							children: [
								/* @__PURE__ */ jsx(Campo, {
									icono: Phone,
									etiqueta: "Celular",
									valor: formatearCelular(perfil.Celular),
									copiable: Boolean(perfil.Celular)
								}),
								/* @__PURE__ */ jsx(Separator, {}),
								/* @__PURE__ */ jsx(Campo, {
									icono: UserRoundKey,
									etiqueta: "Rol",
									valor: perfil.NombreRol
								}),
								/* @__PURE__ */ jsx(Separator, {}),
								/* @__PURE__ */ jsx(Campo, {
									icono: ShieldCheck,
									etiqueta: "Estado",
									valor: perfil.NombreEstadoUsuario
								}),
								/* @__PURE__ */ jsx(Separator, {}),
								/* @__PURE__ */ jsx(Campo, {
									icono: CalendarClock,
									etiqueta: "Registrado el",
									valor: dateFormatter(perfil.FechaRegistro)
								})
							]
						})
					]
				})
			]
		}), perfil && /* @__PURE__ */ jsx(DialogEditarPerfil, {
			abierto: editando,
			onOpenChange: setEditando,
			perfil,
			onGuardado: setPerfil
		})]
	});
}
//#endregion
export { Perfil as t };
