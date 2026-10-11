import { n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { a as TooltipTrigger, h as cn, n as Tooltip, o as Skeleton, r as TooltipContent } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { t as SelectEntidad } from "./Selectentidad_BdaWuz7z.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as ToggleGroupItem, t as ToggleGroup } from "./toggle-group_DEOhjbgI.mjs";
import { t as ObtenerProveedoresForm } from "./Proveedor_BrPdG6tg.mjs";
import { n as PILDORA_FILTRO } from "./Acentos_7-zo-5xR.mjs";
import { t as useOpciones } from "./useOpciones_DRlb-Ko1.mjs";
import { t as useDescarga } from "./useDescarga_B6TO3Led.mjs";
import { Fragment } from "react";
import { ChevronLeft, ChevronRight, Download, FileDown, Loader2, RefreshCcw, Search, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/comunes.jsx
var ESTADOS_MATERIA_PRIMA = {
	"En almacén": "border-emerald-300 bg-emerald-50 text-emerald-700",
	"En producción": "border-sky-300 bg-sky-50 text-sky-700",
	Agotado: "border-slate-300 bg-slate-100 text-slate-600",
	"Dado de baja": "border-red-300 bg-red-50 text-red-600",
	"Fuera de Inventario": "border-amber-300 bg-amber-50 text-amber-700",
	Abierta: "border-sky-300 bg-sky-50 text-sky-700",
	Terminada: "border-slate-300 bg-slate-100 text-slate-600"
};
var ESTADOS_PRODUCCION = {
	"En Producción": "border-sky-300 bg-sky-50 text-sky-700",
	Pausa: "border-amber-300 bg-amber-50 text-amber-700",
	Finalizado: "border-emerald-300 bg-emerald-50 text-emerald-700",
	Cancelada: "border-red-300 bg-red-50 text-red-600",
	"Cambio de línea": "border-violet-300 bg-violet-50 text-violet-700"
};
var AYUDA_SIN_RANGO = "Elegí una fecha de inicio y una de fin para poder descargar el informe";
var DERECHA = {
	claseTitulo: "text-right",
	clase: "text-right tabular-nums"
};
var contar = (cantidad, singular, plural) => `${cantidad} ${cantidad === 1 ? singular : plural}`;
function BadgeEstado({ estado, estilos = ESTADOS_MATERIA_PRIMA, className }) {
	return /* @__PURE__ */ jsx(Badge, {
		variant: "outline",
		className: cn(className, "font-bold", estilos[estado] ?? "border-slate-300 bg-slate-100 text-slate-600"),
		children: estado
	});
}
var columnaCodigo = (campo) => ({
	titulo: "Código",
	clase: "font-mono font-bold text-slate-900",
	valor: (elemento) => elemento[campo]
});
var COLUMNA_ESTADO = {
	titulo: "Estado",
	valor: (elemento) => /* @__PURE__ */ jsx(BadgeEstado, { estado: elemento.TipoEstado })
};
var COLUMNA_PROVEEDOR = {
	titulo: "Proveedor",
	valor: (elemento) => elemento.NombreProveedor
};
function CampoFiltro({ etiqueta, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ jsx(Label, {
			className: "text-xs font-bold uppercase tracking-wide text-slate-600",
			children: etiqueta
		}), children]
	});
}
function BuscadorFiltro({ reporte, campo, etiqueta, placeholder, mono = true }) {
	return /* @__PURE__ */ jsx(CampoFiltro, {
		etiqueta,
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [/* @__PURE__ */ jsx(Search, {
				size: 16,
				className: "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
			}), /* @__PURE__ */ jsx(Input, {
				value: reporte.textos[campo],
				onChange: (e) => reporte.escribir(campo, e.target.value),
				placeholder,
				className: cn("h-11 pl-9", mono && "font-mono")
			})]
		})
	});
}
function SelectFiltro({ reporte, campo, etiqueta, opciones, campoEtiqueta, placeholder }) {
	return /* @__PURE__ */ jsx(CampoFiltro, {
		etiqueta,
		children: /* @__PURE__ */ jsx(SelectEntidad, {
			opciones,
			valor: reporte.filtros[campo],
			onCambio: (valor) => reporte.cambiar(campo, valor),
			campoValor: campo,
			campoEtiqueta,
			placeholder
		})
	});
}
function FiltroProveedor({ reporte }) {
	return /* @__PURE__ */ jsx(SelectFiltro, {
		reporte,
		campo: "IdProveedor",
		etiqueta: "Proveedor",
		opciones: useOpciones(ObtenerProveedoresForm),
		campoEtiqueta: "NombreProveedor",
		placeholder: "Todos los proveedores"
	});
}
function FiltroTipos({ reporte, tipo }) {
	const opciones = useOpciones(tipo.cargar);
	const seleccion = reporte.filtros[tipo.campo];
	if (!Array.isArray(seleccion)) return /* @__PURE__ */ jsx(SelectFiltro, {
		reporte,
		campo: tipo.campo,
		etiqueta: tipo.etiqueta,
		opciones,
		campoEtiqueta: tipo.campoEtiqueta,
		placeholder: "Todos los tipos"
	});
	if (opciones.length === 0) return null;
	return /* @__PURE__ */ jsx(CampoFiltro, {
		etiqueta: tipo.etiqueta,
		children: /* @__PURE__ */ jsx(ToggleGroup, {
			value: seleccion.map(String),
			className: "flex flex-wrap justify-start gap-2",
			children: opciones.map((opcion) => /* @__PURE__ */ jsx(ToggleGroupItem, {
				value: String(opcion[tipo.campoValor]),
				onClick: () => reporte.alternar(tipo.campo, opcion[tipo.campoValor]),
				className: PILDORA_FILTRO,
				children: opcion[tipo.campoEtiqueta]
			}, opcion[tipo.campoValor]))
		})
	});
}
function TarjetaFiltros({ reporte, informe, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-base font-extrabold text-slate-900",
				children: "Filtros"
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [reporte.hayFiltros && /* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: reporte.limpiar,
					className: "h-9 gap-1.5 font-bold text-slate-500 hover:text-slate-900",
					children: [/* @__PURE__ */ jsx(X, {
						size: 14,
						strokeWidth: 2.75
					}), "Limpiar"]
				}), informe]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-col gap-5 p-5",
			children
		})]
	});
}
function BotonInforme({ descargar, exito, ayuda, disponible = true, ayudaNoDisponible = AYUDA_SIN_RANGO }) {
	const { descargando, iniciar } = useDescarga(descargar, exito);
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { render: /* @__PURE__ */ jsx("span", {
		className: "inline-flex",
		children: /* @__PURE__ */ jsxs(Button, {
			onClick: iniciar,
			disabled: !disponible || descargando,
			className: "h-9 gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90",
			children: [descargando ? /* @__PURE__ */ jsx(Loader2, {
				size: 15,
				className: "animate-spin"
			}) : /* @__PURE__ */ jsx(Download, {
				size: 15,
				strokeWidth: 2.5
			}), "Descargar informe"]
		})
	}) }), /* @__PURE__ */ jsx(TooltipContent, { children: disponible ? ayuda : ayudaNoDisponible })] });
}
function BotonDescargaFila({ descargar, ayuda, icono: Icono = FileDown, className }) {
	const { descargando, iniciar } = useDescarga(descargar);
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { render: /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		disabled: descargando,
		onClick: iniciar,
		className: cn("h-9 w-9", className, "text-slate-400 hover:bg-c4/10 hover:text-c3"),
		children: descargando ? /* @__PURE__ */ jsx(Loader2, {
			size: 16,
			className: "animate-spin"
		}) : /* @__PURE__ */ jsx(Icono, {
			size: 16,
			strokeWidth: 2.25
		})
	}) }), /* @__PURE__ */ jsx(TooltipContent, { children: ayuda })] });
}
function Paginacion({ reporte, resumen }) {
	const { catalogo, pagina, totalPaginas, cambiarPagina } = reporte;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5",
		children: [/* @__PURE__ */ jsxs("span", {
			className: "text-[12.5px] font-semibold text-slate-500",
			children: [
				"Página ",
				catalogo.Pagina,
				" de ",
				totalPaginas,
				" · ",
				resumen
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx(Button, {
				variant: "outline",
				size: "icon",
				disabled: pagina <= 1,
				onClick: () => cambiarPagina(-1),
				className: "h-9 w-9",
				children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16 })
			}), /* @__PURE__ */ jsx(Button, {
				variant: "outline",
				size: "icon",
				disabled: pagina >= totalPaginas,
				onClick: () => cambiarPagina(1),
				className: "h-9 w-9",
				children: /* @__PURE__ */ jsx(ChevronRight, { size: 16 })
			})]
		})]
	});
}
function ResultadosReporte({ reporte, elementos, clave, nombres: [singular, plural], resumen, columnas, anchoAccion = "w-12", accion, tarjeta }) {
	const { catalogo, cargando, error, recargar } = reporte;
	const listo = !cargando && !error;
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
		children: [
			cargando && /* @__PURE__ */ jsx("div", {
				className: "flex flex-col gap-2 p-5",
				children: [
					0,
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full rounded-lg" }, i))
			}),
			!cargando && error && /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 p-6 text-sm font-semibold text-red-600",
				children: [error, /* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					onClick: recargar,
					className: "h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50",
					children: [/* @__PURE__ */ jsx(RefreshCcw, {
						size: 14,
						strokeWidth: 2.5
					}), "Reintentar"]
				})]
			}),
			listo && elementos?.length === 0 && /* @__PURE__ */ jsxs("div", {
				className: "p-10 text-center text-sm text-slate-400",
				children: [
					"No hay ",
					plural,
					" que coincidan con los filtros seleccionados."
				]
			}),
			listo && elementos?.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx("div", {
					className: "hidden md:block",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [columnas.map((columna) => /* @__PURE__ */ jsx(TableHead, {
						className: columna.claseTitulo,
						children: columna.titulo
					}, columna.titulo)), /* @__PURE__ */ jsx(TableHead, { className: anchoAccion })] }) }), /* @__PURE__ */ jsx(TableBody, { children: elementos.map((elemento) => /* @__PURE__ */ jsxs(TableRow, { children: [columnas.map((columna) => /* @__PURE__ */ jsx(TableCell, {
						className: columna.clase,
						children: columna.valor(elemento)
					}, columna.titulo)), /* @__PURE__ */ jsx(TableCell, { children: accion(elemento) })] }, clave(elemento))) })] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-col gap-3 p-4 md:hidden",
					children: elementos.map((elemento) => /* @__PURE__ */ jsx(Fragment, { children: tarjeta(elemento) }, clave(elemento)))
				}),
				/* @__PURE__ */ jsx(Paginacion, {
					reporte,
					resumen: resumen ?? contar(catalogo.Total, singular, plural)
				})
			] })
		]
	});
}
function TarjetaReporte({ titulo, tamanoTitulo = "text-[15px]", subtitulo, estado, estilos, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ jsx("span", {
					className: cn("font-mono", tamanoTitulo, "font-bold text-slate-900"),
					children: titulo
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[12.5px] text-slate-500",
					children: subtitulo
				})]
			}), /* @__PURE__ */ jsx(BadgeEstado, {
				estado,
				estilos,
				className: "shrink-0"
			})]
		}), children]
	});
}
function PieTarjeta({ accion, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-slate-600",
			children
		}), accion]
	});
}
function Dato({ etiqueta, children }) {
	return /* @__PURE__ */ jsxs("span", { children: [
		etiqueta,
		" ",
		/* @__PURE__ */ jsx("strong", {
			className: "text-slate-900",
			children
		})
	] });
}
//#endregion
export { TarjetaReporte as _, COLUMNA_ESTADO as a, DERECHA as c, FiltroProveedor as d, FiltroTipos as f, TarjetaFiltros as g, SelectFiltro as h, BuscadorFiltro as i, Dato as l, ResultadosReporte as m, BotonDescargaFila as n, COLUMNA_PROVEEDOR as o, PieTarjeta as p, BotonInforme as r, CampoFiltro as s, BadgeEstado as t, ESTADOS_PRODUCCION as u, columnaCodigo as v, contar as y };
