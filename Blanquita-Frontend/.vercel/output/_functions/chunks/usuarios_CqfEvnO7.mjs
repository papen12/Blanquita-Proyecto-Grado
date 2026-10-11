import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, L as createAstro, M as renderTemplate, N as maybeRenderHead, R as createComponent } from "./server_DPybzryC.mjs";
import { o as RolesUsuario } from "./Values_CoTzCKTc.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button } from "./input_fNj7IM-d.mjs";
import { a as TooltipTrigger, i as TooltipProvider, n as Tooltip, r as TooltipContent, t as SideBar } from "./SideBar_kUHPnrT4.mjs";
import { t as NavBar } from "./NavBar_CAQjP16-.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { _ as TarjetaReporte, g as TarjetaFiltros, h as SelectFiltro, i as BuscadorFiltro, l as Dato, m as ResultadosReporte, p as PieTarjeta, t as BadgeEstado } from "./comunes_LNdSvMvL.mjs";
import { t as useReporte } from "./useReporte_DHrabK2K.mjs";
import { i as EstadosUsuario } from "./Estados_DlvEoiha.mjs";
import { i as DialogoRestablecerClave, l as listarUsuarios, r as DialogoCambiarEstado } from "./Dialogos_OVQVEhLJ.mjs";
import { useState } from "react";
import { KeyRound, UserCog, UserPlus } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
//#region src/components/Admin/Usuarios/Usuarios.jsx
var ESTADOS_USUARIO = {
	Activo: "border-emerald-300 bg-emerald-50 text-emerald-700",
	Inactivo: "border-amber-300 bg-amber-50 text-amber-700",
	Suspendido: "border-red-300 bg-red-50 text-red-600"
};
var fechaRegistro = (fecha) => format(new Date(fecha), "d 'de' LLL, y", { locale: es });
var FILTROS_INICIALES = {
	Busqueda: "",
	IdEstadoUsuario: "",
	IdRol: ""
};
var COLUMNAS = [
	{
		titulo: "CI",
		clase: "font-mono font-bold text-slate-900",
		valor: (u) => u.Ci
	},
	{
		titulo: "Nombre",
		clase: "font-semibold text-slate-900",
		valor: (u) => u.NombreCompleto
	},
	{
		titulo: "Rol",
		valor: (u) => u.NombreRol
	},
	{
		titulo: "Celular",
		clase: "tabular-nums",
		valor: (u) => u.Celular ?? "—"
	},
	{
		titulo: "Registro",
		clase: "tabular-nums",
		valor: (u) => fechaRegistro(u.FechaRegistro)
	},
	{
		titulo: "Estado",
		valor: (u) => /* @__PURE__ */ jsx(BadgeEstado, {
			estado: u.NombreEstadoUsuario,
			estilos: ESTADOS_USUARIO
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
function Usuarios({ usuario: sesion }) {
	const reporte = useReporte(listarUsuarios, FILTROS_INICIALES, ["Busqueda"]);
	const [cambioEstado, setCambioEstado] = useState(null);
	const [cambioClave, setCambioClave] = useState(null);
	const acciones = (u) => {
		if (u.IdEstadoUsuario === 3) return /* @__PURE__ */ jsx("span", {
			className: "text-xs font-semibold text-slate-400",
			children: "Sin acciones"
		});
		return /* @__PURE__ */ jsxs("div", {
			className: "flex justify-end gap-1",
			children: [!(u.IdUsuario === sesion?.IdUsuario) && /* @__PURE__ */ jsx(BotonAccion, {
				ayuda: "Cambiar estado",
				icono: UserCog,
				onClick: () => setCambioEstado(u)
			}), /* @__PURE__ */ jsx(BotonAccion, {
				ayuda: "Restablecer clave",
				icono: KeyRound,
				onClick: () => setCambioClave(u)
			})]
		});
	};
	const alCambiarEstado = (resultado) => {
		setCambioEstado(null);
		toast.success(`${resultado.NombreCompleto}: ${resultado.NombreEstadoAnterior} → ${resultado.NombreEstadoUsuario}`);
		reporte.recargar();
	};
	const alRestablecer = (resultado) => {
		setCambioClave(null);
		toast.success(`Clave de ${resultado.NombreCompleto} restablecida`);
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
				subtitulo: "Usuarios",
				contador: reporte.catalogo ? {
					valor: reporte.catalogo.Total,
					singular: "usuario",
					plural: "usuarios"
				} : null,
				accion: {
					texto: "Registrar usuario",
					icono: UserPlus,
					onClick: () => window.location.href = "/admin/usuarios/registrar"
				}
			}), /* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [/* @__PURE__ */ jsx(TarjetaFiltros, {
					reporte,
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ jsx(BuscadorFiltro, {
								reporte,
								campo: "Busqueda",
								etiqueta: "Buscar",
								placeholder: "CI o nombre",
								mono: false
							}),
							/* @__PURE__ */ jsx(SelectFiltro, {
								reporte,
								campo: "IdEstadoUsuario",
								etiqueta: "Estado",
								opciones: EstadosUsuario,
								campoEtiqueta: "NombreEstadoUsuario",
								placeholder: "Todos los estados"
							}),
							/* @__PURE__ */ jsx(SelectFiltro, {
								reporte,
								campo: "IdRol",
								etiqueta: "Rol",
								opciones: RolesUsuario,
								campoEtiqueta: "NombreRol",
								placeholder: "Todos los roles"
							})
						]
					})
				}), /* @__PURE__ */ jsx(ResultadosReporte, {
					reporte,
					elementos: reporte.catalogo?.Usuarios,
					clave: (u) => u.IdUsuario,
					nombres: ["usuario", "usuarios"],
					columnas: COLUMNAS,
					anchoAccion: "w-24",
					accion: acciones,
					tarjeta: (u) => /* @__PURE__ */ jsx(TarjetaReporte, {
						titulo: u.NombreCompleto,
						tamanoTitulo: "text-[14px] font-sans",
						subtitulo: `CI ${u.Ci} · ${u.NombreRol}`,
						estado: u.NombreEstadoUsuario,
						estilos: ESTADOS_USUARIO,
						children: /* @__PURE__ */ jsxs(PieTarjeta, {
							accion: acciones(u),
							children: [/* @__PURE__ */ jsx(Dato, {
								etiqueta: "Celular",
								children: u.Celular ?? "—"
							}), /* @__PURE__ */ jsx(Dato, {
								etiqueta: "Registro",
								children: fechaRegistro(u.FechaRegistro)
							})]
						})
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsx(DialogoCambiarEstado, {
			usuario: cambioEstado,
			onCerrar: () => setCambioEstado(null),
			onCambiado: alCambiarEstado
		}),
		/* @__PURE__ */ jsx(DialogoRestablecerClave, {
			usuario: cambioClave,
			onCerrar: () => setCambioClave(null),
			onRestablecida: alRestablecer
		})
	] });
}
//#endregion
//#region src/pages/admin/usuarios.astro
var usuarios_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Usuarios,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Usuarios = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Usuarios;
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
	})}</div>${renderComponent($$result, "Usuarios", Usuarios, {
		"client:load": true,
		"usuario": usuario,
		"client:component-hydration": "load",
		"client:component-path": "@/components/Admin/Usuarios/Usuarios",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/usuarios.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/admin/usuarios.astro";
var $$url = "/admin/usuarios";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/usuarios@_@astro
var page = () => usuarios_exports;
//#endregion
export { page };
