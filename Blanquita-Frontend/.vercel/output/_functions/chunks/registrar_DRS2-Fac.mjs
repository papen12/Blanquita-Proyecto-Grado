import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { o as RolesUsuario } from "./Values_CoTzCKTc.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { t as SelectEntidad } from "./Selectentidad_BdaWuz7z.mjs";
import { a as ETIQUETA, c as crearUsuario, n as CamposClave, o as ErrorDialogo, s as claveValida, t as BotonEnviar } from "./Dialogos_OVQVEhLJ.mjs";
import { useState } from "react";
import { CircleCheck, UserPlus, Users } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Admin/Usuarios/RegistrarUsuario.jsx
var PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,15}$/;
var PATRON_CI = /^\d{6,12}$/;
var PATRON_CELULAR = /^[67]\d{7}$/;
var soloLetras = (texto) => texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "").slice(0, 15);
var soloDigitos = (texto, max) => texto.replace(/\D/g, "").slice(0, max);
var FORMULARIO_VACIO = {
	Ci: "",
	PrimerNombre: "",
	SegundoNombre: "",
	ApellidoPaterno: "",
	ApellidoMaterno: "",
	Celular: "",
	IdRol: "",
	IsAdmin: false
};
var CAMPOS_NOMBRE = [
	{
		campo: "PrimerNombre",
		etiqueta: "Primer nombre"
	},
	{
		campo: "SegundoNombre",
		etiqueta: "Segundo nombre",
		opcional: true
	},
	{
		campo: "ApellidoPaterno",
		etiqueta: "Apellido paterno"
	},
	{
		campo: "ApellidoMaterno",
		etiqueta: "Apellido materno",
		opcional: true
	}
];
function erroresRegistro(datos) {
	const errores = {};
	if (datos.Ci && !PATRON_CI.test(datos.Ci)) errores.Ci = "Entre 6 y 12 dígitos";
	if (datos.Celular && !PATRON_CELULAR.test(datos.Celular)) errores.Celular = "8 dígitos, empieza con 6 o 7";
	for (const { campo } of CAMPOS_NOMBRE) if (datos[campo] && !PATRON_NOMBRE.test(datos[campo])) errores[campo] = "Entre 2 y 15 letras";
	return errores;
}
function Seccion({ titulo, descripcion, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-base font-extrabold text-slate-900",
				children: titulo
			}), descripcion && /* @__PURE__ */ jsx("p", {
				className: "mt-0.5 text-[13px] text-slate-500",
				children: descripcion
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-col gap-4 p-5",
			children
		})]
	});
}
function Registrado({ usuario, onOtro }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50",
				children: /* @__PURE__ */ jsx(CircleCheck, {
					size: 30,
					className: "text-emerald-600"
				})
			}),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("div", {
					className: "text-lg font-extrabold text-slate-900",
					children: "Usuario registrado"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-sm text-slate-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-bold text-slate-900",
							children: usuario.NombreCompleto
						}),
						" · CI",
						" ",
						/* @__PURE__ */ jsx("span", {
							className: "font-mono font-bold text-slate-900",
							children: usuario.Ci
						}),
						" ·",
						" ",
						usuario.NombreRol,
						usuario.IsAdmin && " · Administrador"
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13px] text-slate-500",
					children: "Ya puede ingresar con su CI y la clave que definiste."
				})
			] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					onClick: onOtro,
					className: "h-11 gap-2 font-bold",
					children: [/* @__PURE__ */ jsx(UserPlus, {
						size: 16,
						strokeWidth: 2.5
					}), "Registrar otro"]
				}), /* @__PURE__ */ jsxs(Button, {
					onClick: () => window.location.href = "/admin/usuarios",
					className: "h-11 gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800",
					children: [/* @__PURE__ */ jsx(Users, {
						size: 16,
						strokeWidth: 2.5
					}), "Ver usuarios"]
				})]
			})
		]
	});
}
function RegistrarUsuario() {
	const [datos, setDatos] = useState(FORMULARIO_VACIO);
	const [clave, setClave] = useState("");
	const [confirmacion, setConfirmacion] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState("");
	const [creado, setCreado] = useState(null);
	const cambiar = (campo) => (valor) => setDatos((previos) => ({
		...previos,
		[campo]: valor
	}));
	const errores = erroresRegistro(datos);
	const valido = datos.Ci && datos.PrimerNombre && datos.ApellidoPaterno && datos.Celular && datos.IdRol && Object.keys(errores).length === 0 && claveValida(clave) && clave === confirmacion;
	const reiniciar = () => {
		setDatos(FORMULARIO_VACIO);
		setClave("");
		setConfirmacion("");
		setError("");
		setCreado(null);
	};
	const confirmar = async () => {
		setEnviando(true);
		setError("");
		try {
			setCreado(await crearUsuario({
				...datos,
				Clave: clave
			}));
			setClave("");
			setConfirmacion("");
		} catch (e) {
			setError(e.message);
		} finally {
			setEnviando(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0",
		children: [/* @__PURE__ */ jsx(Header, {
			volver: "/admin/usuarios",
			titulo: "Usuarios",
			subtitulo: "Registrar usuario"
		}), /* @__PURE__ */ jsx("main", {
			className: "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 sm:px-6",
			children: creado ? /* @__PURE__ */ jsx(Registrado, {
				usuario: creado,
				onOtro: reiniciar
			}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx(Seccion, {
					titulo: "Datos personales",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(InputForModal, {
								id: "registro-ci",
								etiqueta: "CI",
								valor: datos.Ci,
								onCambio: (v) => cambiar("Ci")(soloDigitos(v, 12)),
								inputMode: "numeric",
								classNameInput: "font-mono",
								error: errores.Ci
							}),
							/* @__PURE__ */ jsx(InputForModal, {
								id: "registro-celular",
								etiqueta: "Celular",
								valor: datos.Celular,
								onCambio: (v) => cambiar("Celular")(soloDigitos(v, 8)),
								inputMode: "numeric",
								classNameInput: "font-mono",
								error: errores.Celular
							}),
							CAMPOS_NOMBRE.map(({ campo, etiqueta, opcional }) => /* @__PURE__ */ jsx(InputForModal, {
								id: `registro-${campo}`,
								etiqueta,
								opcional,
								valor: datos[campo],
								onCambio: (v) => cambiar(campo)(soloLetras(v)),
								error: errores[campo]
							}, campo))
						]
					})
				}),
				/* @__PURE__ */ jsxs(Seccion, {
					titulo: "Acceso",
					descripcion: "Define qué podrá hacer el usuario en el sistema.",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							className: ETIQUETA,
							children: "Rol"
						}), /* @__PURE__ */ jsx(SelectEntidad, {
							opciones: RolesUsuario,
							valor: datos.IdRol,
							onCambio: cambiar("IdRol"),
							campoValor: "IdRol",
							campoEtiqueta: "NombreRol",
							placeholder: "Selecciona un rol"
						})]
					}), /* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: datos.IsAdmin,
							onChange: (e) => cambiar("IsAdmin")(e.target.checked),
							className: "mt-0.5 h-4 w-4 accent-slate-900"
						}), /* @__PURE__ */ jsxs("span", {
							className: "flex flex-col gap-0.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-bold text-slate-900",
								children: "Acceso de administrador"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[12.5px] text-slate-500",
								children: "Podrá entrar al panel de administración y gestionar usuarios."
							})]
						})]
					})]
				}),
				/* @__PURE__ */ jsx(Seccion, {
					titulo: "Clave",
					descripcion: "El usuario ingresará con su CI y esta clave. Comunícasela de forma personal.",
					children: /* @__PURE__ */ jsx(CamposClave, {
						prefijoId: "registro",
						clave,
						setClave,
						confirmacion,
						setConfirmacion
					})
				}),
				error && /* @__PURE__ */ jsx(ErrorDialogo, { mensaje: error }),
				/* @__PURE__ */ jsx("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ jsxs(BotonEnviar, {
						onClick: confirmar,
						enviando,
						deshabilitado: !valido,
						className: "bg-slate-900 hover:bg-slate-800",
						children: [/* @__PURE__ */ jsx(UserPlus, {
							size: 16,
							strokeWidth: 2.5
						}), "Registrar usuario"]
					})
				})
			] })
		})]
	});
}
//#endregion
//#region src/pages/admin/usuarios/registrar.astro
var registrar_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Registrar,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Registrar = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Registrar;
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
	})}</div>${renderComponent($$result, "RegistrarUsuario", RegistrarUsuario, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Admin/Usuarios/RegistrarUsuario",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/usuarios/registrar.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/usuarios/registrar.astro";
var $$url = "/admin/usuarios/registrar";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/usuarios/registrar@_@astro
var page = () => registrar_exports;
//#endregion
export { page };
