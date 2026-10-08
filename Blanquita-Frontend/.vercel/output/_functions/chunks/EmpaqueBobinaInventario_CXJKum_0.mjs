import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { h as cn } from "./SideBar_kUHPnrT4.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { _ as conAcentos, a as ContenidoLista, c as EncabezadoCatalogo, f as PanelDetalle, g as coincide, h as TarjetaTipo, i as CasillaSeleccion, l as EstadoCatalogo, n as BarraSeleccion, r as BuscadorCodigo, u as GRID_TARJETAS, v as useEjecutar, y as useDetalleInventario } from "./comunes_DMeMK0C5.mjs";
import { a as verResumenInventarioEmpaque, i as verDetalleInventarioEmpaque, r as trasladarEmpaquesAProduccion } from "./EmpaqueBobina_BjLs9QkI.mjs";
import { Package, Plus } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Empaque/EmpaqueBobinaInventario.jsx
function TablaEmpaques({ empaques, tipoSel, marcados, onToggle }) {
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, {
			className: "min-w-[620px]",
			children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
				className: "hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, { className: "w-11 pl-5" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Código" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Peso (kg)" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Recepción" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "pr-5",
						children: "Proveedor"
					})
				]
			}) }), /* @__PURE__ */ jsx(TableBody, { children: empaques.map((e) => {
				const on = marcados.includes(e.IdEmpaque);
				return /* @__PURE__ */ jsxs(TableRow, {
					className: cn(on && tipoSel.soft),
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "pl-5",
							children: /* @__PURE__ */ jsx(CasillaSeleccion, {
								marcada: on,
								acento: tipoSel,
								onClick: () => onToggle(e.IdEmpaque)
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: cn("font-mono font-bold", tipoSel.text),
							children: e.CodigoEmpaque
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: e.PesoKg
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-slate-600",
							children: dateFormatter(e.FechaRecepcion)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "pr-5 text-slate-600",
							children: e.NombreProveedor
						})
					]
				}, e.IdEmpaque);
			}) })]
		})
	});
}
function ListaMovilEmpaques({ empaques, tipoSel, marcados, onToggle }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2.5 p-3.5",
		children: empaques.map((e) => {
			const on = marcados.includes(e.IdEmpaque);
			return /* @__PURE__ */ jsxs("button", {
				onClick: () => onToggle(e.IdEmpaque),
				className: cn("flex flex-col gap-2.5 rounded-2xl border-2 p-3.5 text-left", on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white"),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: cn("font-mono text-[15px] font-extrabold", tipoSel.text),
						children: e.CodigoEmpaque
					}), /* @__PURE__ */ jsx(CasillaSeleccion, {
						marcada: on,
						acento: tipoSel,
						grande: true
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						/* @__PURE__ */ jsxs("strong", {
							className: "text-slate-900",
							children: [e.PesoKg, " kg"]
						}),
						" ·",
						" ",
						dateFormatter(e.FechaRecepcion)
					] }), /* @__PURE__ */ jsx("span", { children: e.NombreProveedor })]
				})]
			}, e.IdEmpaque);
		})
	});
}
function EmpaqueBobinaInventario({ usuario }) {
	const resumen = useCatalogo(verResumenInventarioEmpaque);
	const detalle = useDetalleInventario(verDetalleInventarioEmpaque);
	const envio = useEjecutar();
	const tipos = conAcentos(resumen.datos, { cantidadDe: (t) => t.CantidadEmpaques });
	const tipoSel = detalle.sel ? tipos.find((t) => t.IdTipoEmpaque === detalle.sel) : null;
	const { marcadas: marcados, setMarcadas: setMarcados } = detalle;
	const totalEnAlmacen = tipos.reduce((s, t) => s + Number(t.CantidadEmpaques || 0), 0);
	const empaquesFiltrados = detalle.datos.filter((e) => coincide(detalle.busqueda, e.CodigoEmpaque));
	const toggleEmpaque = (idEmpaque) => {
		setMarcados((prev) => prev.includes(idEmpaque) ? prev.filter((id) => id !== idEmpaque) : [...prev, idEmpaque]);
	};
	const quitarChip = (idEmpaque) => setMarcados((prev) => prev.filter((id) => id !== idEmpaque));
	const refrescar = () => {
		resumen.recargar();
		detalle.recargar();
	};
	const enviarProduccion = () => {
		if (marcados.length === 0) return;
		envio.ejecutar("envio", () => trasladarEmpaquesAProduccion(marcados), (resultado) => `${resultado.map((r) => r.CodigoEmpaque).join(", ")} → Trasladado a producción`, () => {
			setMarcados([]);
			refrescar();
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [/* @__PURE__ */ jsx(Header, {
			titulo: "Almacén · Materia Prima",
			subtitulo: "Inventario de Empaques",
			accion: usuario?.IdRol === Roles.Encargado ? {
				texto: "Registrar ingreso",
				icono: Plus,
				href: "/encargado/empaque/bobina-ingreso"
			} : null
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
			children: [
				/* @__PURE__ */ jsxs(EncabezadoCatalogo, {
					titulo: "Catálogo por tipo de empaque",
					children: [
						totalEnAlmacen,
						" empaques ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-slate-700",
							children: "en almacén"
						})
					]
				}),
				/* @__PURE__ */ jsx(EstadoCatalogo, {
					cargando: resumen.cargando,
					error: resumen.error,
					vacio: tipos.length === 0,
					mensajeVacio: "No hay tipos de empaque registrados.",
					altoSkeleton: "h-44",
					children: /* @__PURE__ */ jsx("div", {
						className: GRID_TARJETAS,
						children: tipos.map((t) => /* @__PURE__ */ jsx(TarjetaTipo, {
							acento: t,
							activo: detalle.sel === t.IdTipoEmpaque,
							onClick: () => detalle.seleccionar(t.IdTipoEmpaque),
							icono: Package,
							claseIcono: "h-7 w-7",
							grosorIcono: 2.25,
							nombre: t.NombreTipoEmpaque,
							etiqueta: t.badge,
							cantidad: t.CantidadEmpaques,
							unidad: "empaques en almacén",
							textoVer: "Ver empaques"
						}, t.IdTipoEmpaque))
					})
				}),
				tipoSel && /* @__PURE__ */ jsxs(PanelDetalle, {
					acento: tipoSel,
					icono: Package,
					claseIcono: "h-6 w-6",
					grosorIcono: 2.25,
					titulo: `Empaques · ${tipoSel.NombreTipoEmpaque}`,
					subtitulo: `${tipoSel.CantidadEmpaques} en almacén`,
					onCerrar: detalle.cerrar,
					children: [/* @__PURE__ */ jsxs(ContenidoLista, {
						cargando: detalle.cargando,
						error: detalle.error,
						total: detalle.datos.length,
						cantidadFiltrada: empaquesFiltrados.length,
						buscador: /* @__PURE__ */ jsx(BuscadorCodigo, {
							valor: detalle.busqueda,
							onCambio: detalle.setBusqueda
						}),
						mensajeVacio: "No hay empaques en almacén para este tipo.",
						mensajeSinCoincidencias: `Ningún empaque coincide con "${detalle.busqueda}".`,
						children: [/* @__PURE__ */ jsx("div", {
							className: "hidden md:block",
							children: /* @__PURE__ */ jsx(TablaEmpaques, {
								empaques: empaquesFiltrados,
								tipoSel,
								marcados,
								onToggle: toggleEmpaque
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "md:hidden",
							children: /* @__PURE__ */ jsx(ListaMovilEmpaques, {
								empaques: empaquesFiltrados,
								tipoSel,
								marcados,
								onToggle: toggleEmpaque
							})
						})]
					}), marcados.length > 0 && /* @__PURE__ */ jsx(BarraSeleccion, {
						chips: marcados.map((idEmpaque) => ({
							clave: idEmpaque,
							texto: detalle.datos.find((e) => e.IdEmpaque === idEmpaque)?.CodigoEmpaque ?? idEmpaque,
							onQuitar: () => quitarChip(idEmpaque)
						})),
						estado: `${marcados.length} ${marcados.length === 1 ? "empaque" : "empaques"} seleccionados`,
						enviando: envio.enProceso === "envio",
						onEnviar: enviarProduccion,
						textoAccion: "Trasladar a producción",
						textoEnviando: "Trasladando..."
					})]
				})
			]
		})]
	});
}
//#endregion
export { EmpaqueBobinaInventario as t };
