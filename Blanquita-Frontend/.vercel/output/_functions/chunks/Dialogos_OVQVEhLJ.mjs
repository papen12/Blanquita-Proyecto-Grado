import { a as limpiarObservacion, n as pedirJson } from "./api_B8jC8QYh.mjs";
import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { t as conQueryParams } from "./params_JvteIAPo.mjs";
import "./Acentos_7-zo-5xR.mjs";
import { a as TransicionesEstadoUsuario, i as EstadosUsuario } from "./Estados_DlvEoiha.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, TriangleAlert, X } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/models/Usuario/Admin.js
var textoOpcional = (valor) => {
	const texto = (valor ?? "").trim();
	return texto === "" ? null : texto;
};
var ListarUsuariosRequest = (filtros = {}) => ({
	Busqueda: filtros.Busqueda ?? null,
	IdEstadoUsuario: filtros.IdEstadoUsuario ?? null,
	IdRol: filtros.IdRol ?? null,
	Pagina: filtros.Pagina ?? 1,
	TamanoPagina: filtros.TamanoPagina ?? 20
});
var UsuarioListaItem = (data) => ({
	IdUsuario: data.IdUsuario,
	Ci: data.Ci,
	PrimerNombre: data.PrimerNombre,
	SegundoNombre: data.SegundoNombre ?? null,
	ApellidoPaterno: data.ApellidoPaterno,
	ApellidoMaterno: data.ApellidoMaterno ?? null,
	NombreCompleto: [
		data.PrimerNombre,
		data.SegundoNombre,
		data.ApellidoPaterno,
		data.ApellidoMaterno
	].filter(Boolean).join(" "),
	Celular: data.Celular ?? null,
	FechaRegistro: data.FechaRegistro,
	IdRol: data.IdRol,
	NombreRol: data.NombreRol,
	IdEstadoUsuario: data.IdEstadoUsuario,
	NombreEstadoUsuario: data.NombreEstadoUsuario
});
var ListarUsuariosResponse = (data) => ({
	Total: data.Total,
	Pagina: data.Pagina,
	TamanoPagina: data.TamanoPagina,
	Usuarios: (data.Usuarios ?? []).map(UsuarioListaItem)
});
var CrearUsuarioRequest = (datos) => ({
	IdRol: Number(datos.IdRol),
	Ci: (datos.Ci ?? "").trim(),
	PrimerNombre: (datos.PrimerNombre ?? "").trim(),
	SegundoNombre: textoOpcional(datos.SegundoNombre),
	ApellidoPaterno: (datos.ApellidoPaterno ?? "").trim(),
	ApellidoMaterno: textoOpcional(datos.ApellidoMaterno),
	Celular: (datos.Celular ?? "").trim(),
	Clave: datos.Clave,
	IsAdmin: Boolean(datos.IsAdmin)
});
var CrearUsuarioResponse = (data) => ({
	IdUsuario: data.IdUsuario,
	Ci: data.Ci,
	NombreCompleto: data.NombreCompleto,
	NombreRol: data.NombreRol,
	IsAdmin: data.IsAdmin
});
var CambiarEstadoUsuarioRequest = (idUsuario, idEstadoUsuario, motivo) => ({
	IdUsuario: idUsuario,
	IdEstadoUsuario: idEstadoUsuario,
	Motivo: (motivo ?? "").trim()
});
var CambiarEstadoUsuarioResponse = (data) => ({
	IdUsuario: data.IdUsuario,
	Ci: data.Ci,
	NombreCompleto: data.NombreCompleto,
	NombreEstadoAnterior: data.NombreEstadoAnterior,
	NombreEstadoUsuario: data.NombreEstadoUsuario
});
var RestablecerClaveRequest = (idUsuario, claveNueva) => ({
	IdUsuario: idUsuario,
	ClaveNueva: claveNueva
});
var RestablecerClaveResponse = (data) => ({
	IdUsuario: data.IdUsuario,
	Ci: data.Ci,
	NombreCompleto: data.NombreCompleto
});
//#endregion
//#region src/services/Usuario/Admin.js
var BASE_URL = "/api/Usuario";
async function listarUsuarios(filtros) {
	return ListarUsuariosResponse(await pedirJson(conQueryParams(`${BASE_URL}/listar`, ListarUsuariosRequest(filtros))));
}
async function crearUsuario(datos) {
	return CrearUsuarioResponse(await pedirJson(`${BASE_URL}/crear`, {
		method: "POST",
		body: CrearUsuarioRequest(datos)
	}));
}
async function cambiarEstadoUsuario(idUsuario, idEstadoUsuario, motivo) {
	return CambiarEstadoUsuarioResponse(await pedirJson(`${BASE_URL}/estado`, {
		method: "PATCH",
		body: CambiarEstadoUsuarioRequest(idUsuario, idEstadoUsuario, motivo)
	}));
}
async function restablecerClave(idUsuario, claveNueva) {
	return RestablecerClaveResponse(await pedirJson(`${BASE_URL}/clave`, {
		method: "PATCH",
		body: RestablecerClaveRequest(idUsuario, claveNueva)
	}));
}
//#endregion
//#region src/components/Admin/Usuarios/Dialogos.jsx
var ETIQUETA = "text-xs font-bold uppercase tracking-wide text-slate-600";
var SIMBOLOS = "!@#$%^&*()-_=+[]{}|;:',.<>?/`~\"\\";
var reglasClave = (clave) => [
	{
		texto: `Entre 8 y 12 caracteres`,
		ok: clave.length >= 8 && clave.length <= 12
	},
	{
		texto: "Una letra mayúscula",
		ok: /[A-ZÁÉÍÓÚÜÑ]/.test(clave)
	},
	{
		texto: "Un número",
		ok: /\d/.test(clave)
	},
	{
		texto: "Un símbolo",
		ok: [...clave].some((ch) => SIMBOLOS.includes(ch))
	}
];
var claveValida = (clave) => reglasClave(clave).every((regla) => regla.ok);
function ErrorDialogo({ mensaje }) {
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
		children: mensaje
	});
}
function BotonEnviar({ enviando, deshabilitado, onClick, className, children }) {
	return /* @__PURE__ */ jsx(Button, {
		onClick,
		disabled: enviando || deshabilitado,
		className: cn("h-11 w-full gap-2 font-extrabold text-white sm:w-auto", className),
		children: enviando ? /* @__PURE__ */ jsx(Loader2, {
			size: 16,
			className: "animate-spin"
		}) : children
	});
}
function ResumenUsuario({ usuario }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[15px] font-extrabold text-slate-900",
			children: usuario.NombreCompleto
		}), /* @__PURE__ */ jsxs("div", {
			className: "text-[12.5px] text-slate-500",
			children: [
				"CI ",
				/* @__PURE__ */ jsx("span", {
					className: "font-mono font-bold text-slate-700",
					children: usuario.Ci
				}),
				" ·",
				" ",
				usuario.NombreRol,
				" · ",
				usuario.NombreEstadoUsuario
			]
		})]
	});
}
function CamposClave({ clave, setClave, confirmacion, setConfirmacion, prefijoId }) {
	const [visible, setVisible] = useState(false);
	const reglas = reglasClave(clave);
	const noCoincide = confirmacion !== "" && confirmacion !== clave;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-1.5",
			children: [
				/* @__PURE__ */ jsx(Label, {
					htmlFor: `${prefijoId}-clave`,
					className: ETIQUETA,
					children: "Clave"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Input, {
						id: `${prefijoId}-clave`,
						type: visible ? "text" : "password",
						value: clave,
						onChange: (e) => setClave(e.target.value.replace(/\s/g, "")),
						maxLength: 12,
						autoComplete: "new-password",
						className: "h-11 pr-11 font-mono"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setVisible((v) => !v),
						"aria-label": visible ? "Ocultar clave" : "Mostrar clave",
						className: "absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700",
						children: visible ? /* @__PURE__ */ jsx(EyeOff, { size: 17 }) : /* @__PURE__ */ jsx(Eye, { size: 17 })
					})]
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] font-semibold",
					children: reglas.map((regla) => /* @__PURE__ */ jsxs("li", {
						className: cn("flex items-center gap-1.5", regla.ok ? "text-emerald-600" : "text-slate-400"),
						children: [regla.ok ? /* @__PURE__ */ jsx(Check, {
							size: 13,
							strokeWidth: 3
						}) : /* @__PURE__ */ jsx(X, {
							size: 13,
							strokeWidth: 3
						}), regla.texto]
					}, regla.texto))
				})
			]
		}), /* @__PURE__ */ jsx(InputForModal, {
			id: `${prefijoId}-confirmacion`,
			etiqueta: "Confirmar clave",
			type: visible ? "text" : "password",
			valor: confirmacion,
			onCambio: (v) => setConfirmacion(v.replace(/\s/g, "")),
			maxLength: 12,
			autoComplete: "new-password",
			classNameInput: "font-mono",
			error: noCoincide ? "Las claves no coinciden" : ""
		})]
	});
}
function DialogoCambiarEstado({ usuario, onCerrar, onCambiado }) {
	const [idEstado, setIdEstado] = useState(null);
	const [motivo, setMotivo] = useState("");
	const [confirmarSuspension, setConfirmarSuspension] = useState(false);
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!usuario) return;
		setIdEstado(null);
		setMotivo("");
		setConfirmarSuspension(false);
		setError("");
	}, [usuario]);
	const destinos = usuario ? EstadosUsuario.filter((e) => (TransicionesEstadoUsuario[usuario.IdEstadoUsuario] ?? []).includes(e.IdEstadoUsuario)) : [];
	const suspender = idEstado === 3;
	const largo = motivo.trim().length;
	const valido = idEstado !== null && largo >= 5 && largo <= 150 && (!suspender || confirmarSuspension);
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onCambiado(await cambiarEstadoUsuario(usuario.IdUsuario, idEstado, motivo));
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: Boolean(usuario),
		onOpenChange: (open) => !open && !enviando && onCerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Cambiar estado" }) }),
				usuario && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(ResumenUsuario, { usuario }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								className: "text-xs font-bold uppercase tracking-wide text-slate-600",
								children: "Nuevo estado"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap gap-2",
								children: destinos.map((estado) => /* @__PURE__ */ jsx("button", {
									type: "button",
									"aria-pressed": idEstado === estado.IdEstadoUsuario,
									onClick: () => {
										setIdEstado(estado.IdEstadoUsuario);
										setConfirmarSuspension(false);
									},
									className: "h-auto rounded-full border-2 border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-600 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white aria-pressed:hover:border-slate-900 aria-pressed:hover:bg-slate-900 aria-pressed:hover:text-white",
									children: estado.NombreEstadoUsuario
								}, estado.IdEstadoUsuario))
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Label, {
									htmlFor: "motivo-estado",
									className: "text-xs font-bold uppercase tracking-wide text-slate-600",
									children: "Motivo"
								}),
								/* @__PURE__ */ jsx(Textarea, {
									id: "motivo-estado",
									value: motivo,
									onChange: (e) => setMotivo(limpiarObservacion(e.target.value)),
									placeholder: "Ej. Licencia, fin de contrato...",
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
						suspender && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-2 text-sm font-semibold text-red-700",
								children: [/* @__PURE__ */ jsx(TriangleAlert, {
									size: 18,
									className: "mt-0.5 shrink-0"
								}), "La suspensión es definitiva: el usuario no podrá volver a ingresar y su estado ya no podrá cambiarse."]
							}), /* @__PURE__ */ jsxs("label", {
								className: "flex cursor-pointer items-center gap-2 text-[13px] font-bold text-red-700",
								children: [/* @__PURE__ */ jsx("input", {
									type: "checkbox",
									checked: confirmarSuspension,
									onChange: (e) => setConfirmarSuspension(e.target.checked),
									className: "h-4 w-4 accent-red-600"
								}), "Entiendo que no se puede deshacer"]
							})]
						}),
						error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(BotonEnviar, {
					onClick: confirmar,
					enviando,
					deshabilitado: !valido,
					className: suspender ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800",
					children: suspender ? "Suspender usuario" : "Cambiar estado"
				}) })
			]
		})
	});
}
function DialogoRestablecerClave({ usuario, onCerrar, onRestablecida }) {
	const [clave, setClave] = useState("");
	const [confirmacion, setConfirmacion] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!usuario) return;
		setClave("");
		setConfirmacion("");
		setError("");
	}, [usuario]);
	const valido = claveValida(clave) && clave === confirmacion;
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			onRestablecida(await restablecerClave(usuario.IdUsuario, clave));
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: Boolean(usuario),
		onOpenChange: (open) => !open && !enviando && onCerrar(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Restablecer clave" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Comunica la nueva clave al usuario de forma personal." })] }),
				usuario && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsx(ResumenUsuario, { usuario }),
						/* @__PURE__ */ jsx(CamposClave, {
							prefijoId: "restablecer",
							clave,
							setClave,
							confirmacion,
							setConfirmacion
						}),
						error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: error })
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(BotonEnviar, {
					onClick: confirmar,
					enviando,
					deshabilitado: !valido,
					className: "bg-slate-900 hover:bg-slate-800",
					children: "Restablecer clave"
				}) })
			]
		})
	});
}
//#endregion
export { ETIQUETA as a, crearUsuario as c, DialogoRestablecerClave as i, listarUsuarios as l, CamposClave as n, ErrorDialogo as o, DialogoCambiarEstado as r, claveValida as s, BotonEnviar as t };
