import { a as Roles } from "./Values_CoTzCKTc.mjs";
import { a as limpiarObservacion, i as extraerMensajeError, n as pedirJson, o as numeroONulo } from "./api_B8jC8QYh.mjs";
import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, i as TooltipProvider, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { a as DialogFooter, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog_v7VU57fi.mjs";
import { t as Header } from "./Header_Cyyn7b87.mjs";
import { t as InputForModal } from "./InputForModal_Diav_5ph.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { t as Badge } from "./badge_CwaDEgxo.mjs";
import { n as dateFormatter } from "./dates_DZEitlnj.mjs";
import { t as Textarea } from "./textarea_D_hxLeFM.mjs";
import { n as aCodigo } from "./handlers_w7fuW24c.mjs";
import { t as useCatalogo } from "./useCatalogo_C3TwZBOX.mjs";
import { _ as conAcentos, a as ContenidoLista, c as EncabezadoCatalogo, d as ItemFueraInventario, f as PanelDetalle, g as coincide, h as TarjetaTipo, i as CasillaSeleccion, l as EstadoCatalogo, m as TarjetaFueraInventario, n as BarraSeleccion, p as PanelFuera, r as BuscadorCodigo, s as DialogReingreso, t as BadgeReingresada, u as GRID_TARJETAS, v as useEjecutar, y as useDetalleInventario } from "./comunes_DMeMK0C5.mjs";
import { t as BotonDescarga } from "./BotonDescarga_Cx_h4_wb.mjs";
import { i as iniciarProduccionServilleta, t as abrirBobinaServilleta } from "./Produccion_CAmr9iDG.mjs";
import { i as descargarReporteInventarioCompletoServilleta, u as verBobinasServilletaReporte } from "./Reportes_cTv_nrMT.mjs";
import { useState } from "react";
import { Check, Database, Disc, Loader2, Plus, SquarePen } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/models/BobinaServilleta/Inventario.js
var ReingresarSubBobinaInventarioRequest = (idSubBobina, observacion) => ({
	IdSubBobina: idSubBobina,
	Observacion: observacion ?? null
});
var ReingresarSubBobinaInventarioResponse = (data) => ({
	IdSubBobina: data.IdSubBobina,
	IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
	FechaMovimiento: data.FechaMovimiento
});
var ResumenInventarioBobinaServilletaResponse = (data) => ({
	IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
	NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
	CantidadBobinaServilleta: data.CantidadBobinaServilleta
});
var DetalleInventarioBobinaServilletaResponse = (data) => ({
	IdBobinaServilleta: data.IdBobinaServilleta,
	FechaRecepcion: data.FechaRecepcion,
	NombreProveedor: data.NombreProveedor,
	IdUnidad1: data.IdUnidad1,
	CodigoUnidad1: data.CodigoUnidad1,
	IdFormatoSubBobina1: data.IdFormatoSubBobina1,
	DescripcionFormato1: data.DescripcionFormato1,
	IdUnidad2: data.IdUnidad2,
	CodigoUnidad2: data.CodigoUnidad2,
	IdFormatoSubBobina2: data.IdFormatoSubBobina2,
	DescripcionFormato2: data.DescripcionFormato2
});
var ResumenInventarioSubBobinaServilletaResponse = (data) => ({
	IdTipoMedidaSubBobina: data.IdTipoMedidaSubBobina,
	NombreTipoMedida: data.NombreTipoMedida,
	CantidadSubBobinas: data.CantidadSubBobinas
});
var DetalleInventarioSubBobinaServilletaResponse = (data) => ({
	IdSubBobinaServilleta: data.IdSubBobinaServilleta,
	CodigoUnidadOrigen: data.CodigoUnidadOrigen,
	Reingresada: data.Reingresada ?? false,
	FechaUltimoReingreso: data.FechaUltimoReingreso ?? null
});
var SubBobinaServilletaFueraInventarioResponse = (data) => ({
	IdSubBobinaServilleta: data.IdSubBobinaServilleta,
	CodigoUnidadOrigen: data.CodigoUnidadOrigen,
	NombreTipoMedida: data.NombreTipoMedida,
	UltimaObservacion: data.UltimaObservacion ?? null,
	FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});
var EditarUnidadBobinaServilletaItem = (data) => ({
	IdUnidadBobinaServilleta: data.IdUnidadBobinaServilleta,
	CodigoBobina: (data.CodigoBobina ?? "").trim(),
	PesoBrutoKg: numeroONulo(data.PesoBrutoKg),
	GramajeGr: numeroONulo(data.GramajeGr)
});
var EditarBobinaServilletaRequest = (idBobinaServilleta, unidades, observacion) => ({
	IdBobinaServilleta: idBobinaServilleta,
	Unidades: (unidades ?? []).map(EditarUnidadBobinaServilletaItem),
	Observacion: (observacion ?? "").trim()
});
var EditarBobinaServilletaResponse = (data) => ({
	IdBobinaServilleta: data.IdBobinaServilleta,
	IdUnidadBobinaServilleta: data.IdUnidadBobinaServilleta,
	CodigoBobina: data.CodigoBobina,
	IdFormatoSubBobina: data.IdFormatoSubBobina,
	DescripcionFormato: data.DescripcionFormato,
	PesoBrutoKg: data.PesoBrutoKg ?? null,
	GramajeGr: data.GramajeGr ?? null,
	FechaMovimiento: data.FechaMovimiento
});
//#endregion
//#region src/services/BobinaServilleta/Inventario.js
async function reingresarSubBobinaInventario(idSubBobina, observacion) {
	return ReingresarSubBobinaInventarioResponse(await pedirJson("/api/bobinaservilleta/inventario/reingresar", {
		method: "POST",
		body: ReingresarSubBobinaInventarioRequest(idSubBobina, observacion)
	}));
}
async function verResumenInventarioBobinaServilleta() {
	return (await pedirJson("/api/bobinaservilleta/inventario/resumen")).map(ResumenInventarioBobinaServilletaResponse);
}
async function verDetalleInventarioBobinaServilleta(idTipoBobinaServilleta) {
	return (await pedirJson(`/api/bobinaservilleta/inventario/detalle?${new URLSearchParams({ IdTipoBobinaServilleta: idTipoBobinaServilleta }).toString()}`)).map(DetalleInventarioBobinaServilletaResponse);
}
async function verResumenInventarioSubBobinaServilleta() {
	return (await pedirJson("/api/bobinaservilleta/inventario/sub/resumen")).map(ResumenInventarioSubBobinaServilletaResponse);
}
async function verDetalleInventarioSubBobinaServilleta(idTipoMedidaSubBobina) {
	return (await pedirJson(`/api/bobinaservilleta/inventario/sub/detalle?${new URLSearchParams({ IdTipoMedidaSubBobina: idTipoMedidaSubBobina }).toString()}`)).map(DetalleInventarioSubBobinaServilletaResponse);
}
async function verSubBobinasServilletaFueraInventario() {
	return (await pedirJson("/api/bobinaservilleta/inventario/sub/fuera")).map(SubBobinaServilletaFueraInventarioResponse);
}
async function editarBobinaServilleta(idBobinaServilleta, unidades, observacion) {
	return (await pedirJson("/api/bobinaservilleta/inventario/editar", {
		method: "POST",
		body: EditarBobinaServilletaRequest(idBobinaServilleta, unidades, observacion)
	})).map(EditarBobinaServilletaResponse);
}
//#endregion
//#region src/components/ServilletaBobina/Inventario.jsx
var ESTADO_ALMACEN_ID = 1;
var sinDatos = async () => [];
var aTexto = (valor) => valor === null || valor === void 0 ? "" : String(valor);
var valorInvalido = (valor) => valor !== "" && !(Number(valor) > 0);
var etiquetaCantidad = (n, singular, plural) => {
	const c = Number(n || 0);
	return `${c} ${c === 1 ? singular : plural}`;
};
var cargarDetalle = ({ clase, id }) => clase === "bobina" ? verDetalleInventarioBobinaServilleta(id) : verDetalleInventarioSubBobinaServilleta(id);
var mismaSeleccion = (a, b) => a.clase === b.clase && a.id === b.id;
function TablaBobinas({ bobinas, tipoSel, procesandoId, onAbrir, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, {
			className: "min-w-[760px]",
			children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
				className: "hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, {
						className: "pl-5",
						children: "Bobina"
					}),
					/* @__PURE__ */ jsx(TableHead, { children: "Recepción" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Proveedor" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Unidad 1" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Unidad 2" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "pr-5 text-center",
						children: "Acciones"
					})
				]
			}) }), /* @__PURE__ */ jsx(TableBody, { children: bobinas.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsxs(TableCell, {
					className: cn("pl-5 font-mono font-bold", tipoSel.text),
					children: ["#", b.IdBobinaServilleta]
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-slate-600",
					children: dateFormatter(b.FechaRecepcion)
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-slate-600",
					children: b.NombreProveedor
				}),
				[1, 2].map((n) => /* @__PURE__ */ jsxs(TableCell, {
					className: "text-slate-600",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-mono font-semibold text-slate-900",
						children: b[`CodigoUnidad${n}`]
					}), /* @__PURE__ */ jsx("span", {
						className: "block text-[11px] text-slate-400",
						children: b[`DescripcionFormato${n}`]
					})]
				}, n)),
				/* @__PURE__ */ jsx(TableCell, {
					className: "pr-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-center gap-2",
						children: [onEditar && /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onEditar(b),
							className: "gap-1.5 font-bold text-c3",
							children: [/* @__PURE__ */ jsx(SquarePen, {
								size: 14,
								strokeWidth: 2.5
							}), "Editar"]
						}), /* @__PURE__ */ jsx(Button, {
							size: "sm",
							disabled: procesandoId === b.IdBobinaServilleta,
							onClick: () => onAbrir(b),
							className: "gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90",
							children: procesandoId === b.IdBobinaServilleta ? /* @__PURE__ */ jsx(Loader2, {
								size: 13,
								className: "animate-spin"
							}) : "Abrir"
						})]
					})
				})
			] }, b.IdBobinaServilleta)) })]
		})
	});
}
function ListaMovilBobinas({ bobinas, tipoSel, procesandoId, onAbrir, onEditar }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2.5 p-3.5",
		children: bobinas.map((b) => /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: cn("font-mono text-[15px] font-extrabold", tipoSel.text),
						children: ["#", b.IdBobinaServilleta]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-slate-500",
						children: dateFormatter(b.FechaRecepcion)
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-[12.5px] text-slate-600",
					children: b.NombreProveedor
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600",
					children: [1, 2].map((n) => /* @__PURE__ */ jsxs("span", { children: [
						/* @__PURE__ */ jsx("strong", {
							className: "font-mono text-slate-900",
							children: b[`CodigoUnidad${n}`]
						}),
						" ·",
						" ",
						b[`DescripcionFormato${n}`]
					] }, n))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [onEditar && /* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						onClick: () => onEditar(b),
						className: "h-10 flex-1 gap-1.5 font-bold text-c3",
						children: [/* @__PURE__ */ jsx(SquarePen, {
							size: 15,
							strokeWidth: 2.5
						}), "Editar"]
					}), /* @__PURE__ */ jsx(Button, {
						disabled: procesandoId === b.IdBobinaServilleta,
						onClick: () => onAbrir(b),
						className: "h-10 flex-1 gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90",
						children: procesandoId === b.IdBobinaServilleta ? /* @__PURE__ */ jsx(Loader2, {
							size: 13,
							className: "animate-spin"
						}) : "Abrir bobina"
					})]
				})
			]
		}, b.IdBobinaServilleta))
	});
}
function TablaSubBobinas({ subBobinas, tipoSel, marcada, onToggle }) {
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, {
			className: "min-w-[460px]",
			children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, {
				className: "hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, { className: "w-11 pl-5" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Sub-bobina" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "pr-5",
						children: "Unidad de origen"
					})
				]
			}) }), /* @__PURE__ */ jsx(TableBody, { children: subBobinas.map((s) => {
				const on = marcada === s.IdSubBobinaServilleta;
				return /* @__PURE__ */ jsxs(TableRow, {
					className: cn(on && tipoSel.soft),
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "pl-5",
							children: /* @__PURE__ */ jsx(CasillaSeleccion, {
								marcada: on,
								acento: tipoSel,
								onClick: () => onToggle(s.IdSubBobinaServilleta)
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: cn("font-mono font-bold", tipoSel.text),
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [
									"#",
									s.IdSubBobinaServilleta,
									s.Reingresada && /* @__PURE__ */ jsx(BadgeReingresada, { fecha: s.FechaUltimoReingreso })
								]
							})
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "pr-5 font-mono text-slate-700",
							children: s.CodigoUnidadOrigen
						})
					]
				}, s.IdSubBobinaServilleta);
			}) })]
		})
	});
}
function ListaMovilSubBobinas({ subBobinas, tipoSel, marcada, onToggle }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2.5 p-3.5",
		children: subBobinas.map((s) => {
			const on = marcada === s.IdSubBobinaServilleta;
			return /* @__PURE__ */ jsxs("button", {
				onClick: () => onToggle(s.IdSubBobinaServilleta),
				className: cn("flex items-center justify-between gap-2.5 rounded-2xl border-2 p-3.5 text-left", on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white"),
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: cn("font-mono text-[15px] font-extrabold", tipoSel.text),
							children: ["#", s.IdSubBobinaServilleta]
						}), s.Reingresada && /* @__PURE__ */ jsx(BadgeReingresada, { fecha: s.FechaUltimoReingreso })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "font-mono text-[12.5px] text-slate-600",
						children: s.CodigoUnidadOrigen
					}),
					s.Reingresada && s.FechaUltimoReingreso && /* @__PURE__ */ jsxs("div", {
						className: "text-[12.5px] font-semibold text-amber-700",
						children: ["Reingreso: ", dateFormatter(s.FechaUltimoReingreso)]
					})
				] }), /* @__PURE__ */ jsx(CasillaSeleccion, {
					marcada: on,
					acento: tipoSel,
					grande: true
				})]
			}, s.IdSubBobinaServilleta);
		})
	});
}
function InventarioBobinaServilleta({ usuario }) {
	const esEncargado = usuario?.IdRol === Roles.Encargado;
	const resumenBobinas = useCatalogo(verResumenInventarioBobinaServilleta);
	const resumenSubs = useCatalogo(verResumenInventarioSubBobinaServilleta);
	const fuera = useCatalogo(esEncargado ? verSubBobinasServilletaFueraInventario : sinDatos);
	const detalle = useDetalleInventario(cargarDetalle, mismaSeleccion);
	const traslado = useEjecutar();
	const apertura = useEjecutar();
	const accionesFuera = useEjecutar();
	const [mostrarFuera, setMostrarFuera] = useState(false);
	const [porReingresar, setPorReingresar] = useState(null);
	const [dialogEditar, setDialogEditar] = useState({
		open: false,
		bobina: null
	});
	const [unidadesOriginales, setUnidadesOriginales] = useState([]);
	const [formUnidades, setFormUnidades] = useState([]);
	const [formMotivo, setFormMotivo] = useState("");
	const [cargandoEditar, setCargandoEditar] = useState(false);
	const [errorEditar, setErrorEditar] = useState("");
	const [guardandoEditar, setGuardandoEditar] = useState(false);
	const tiposBobina = conAcentos(resumenBobinas.datos, {
		cantidadDe: (t) => t.CantidadBobinaServilleta,
		umbral: 4
	});
	const tiposSub = conAcentos(resumenSubs.datos, { desplazamiento: 2 });
	const { sel } = detalle;
	const tipoSel = sel?.clase === "bobina" ? tiposBobina.find((t) => t.IdTipoBobinaServilleta === sel.id) : sel?.clase === "sub" ? tiposSub.find((t) => t.IdTipoMedidaSubBobina === sel.id) : null;
	const marcadaSub = detalle.marcadas[0] ?? null;
	const totalBobinas = tiposBobina.reduce((s, t) => s + Number(t.CantidadBobinaServilleta || 0), 0);
	const totalSub = tiposSub.reduce((s, t) => s + Number(t.CantidadSubBobinas || 0), 0);
	const detalleFiltrado = detalle.datos.filter((d) => sel?.clase === "bobina" ? coincide(detalle.busqueda, d.IdBobinaServilleta, d.CodigoUnidad1, d.CodigoUnidad2, d.NombreProveedor) : coincide(detalle.busqueda, d.IdSubBobinaServilleta, d.CodigoUnidadOrigen));
	const recargarResumen = () => {
		resumenBobinas.recargar();
		resumenSubs.recargar();
	};
	const refrescar = () => {
		recargarResumen();
		fuera.recargar();
		detalle.recargar();
	};
	const toggleSub = (id) => detalle.setMarcadas((prev) => prev[0] === id ? [] : [id]);
	const enviarTraslado = () => {
		if (marcadaSub == null) return;
		const sub = detalle.datos.find((s) => s.IdSubBobinaServilleta === marcadaSub);
		if (!sub) return;
		traslado.ejecutar("envio", () => iniciarProduccionServilleta(sub.IdSubBobinaServilleta), `Sub-bobina #${sub.IdSubBobinaServilleta} → En producción`, () => {
			detalle.setMarcadas([]);
			refrescar();
		});
	};
	const abrirBobina = (bobina) => apertura.ejecutar(bobina.IdBobinaServilleta, () => abrirBobinaServilleta(bobina.IdBobinaServilleta), (res) => `Bobina #${bobina.IdBobinaServilleta} abierta · ${res.CantidadSubBobinasTotal} sub-bobinas (${res.CantidadSubBobinas435} de 435 · ${res.CantidadSubBobinas220} de 220)`, refrescar);
	const quitarDeFuera = (id) => fuera.setDatos((prev) => prev.filter((s) => s.IdSubBobinaServilleta !== id));
	const reingresar = (observacion) => {
		const sub = porReingresar;
		accionesFuera.ejecutar(sub.IdSubBobinaServilleta, () => reingresarSubBobinaInventario(sub.IdSubBobinaServilleta, observacion), `Sub-bobina #${sub.IdSubBobinaServilleta} reingresada al inventario`, () => {
			setPorReingresar(null);
			quitarDeFuera(sub.IdSubBobinaServilleta);
			recargarResumen();
		});
	};
	const abrirEditar = async (bobina) => {
		setDialogEditar({
			open: true,
			bobina
		});
		setUnidadesOriginales([]);
		setFormUnidades([]);
		setFormMotivo("");
		setErrorEditar("");
		setCargandoEditar(true);
		try {
			const { Bobinas } = await verBobinasServilletaReporte({
				CodigoBobina: bobina.CodigoUnidad1,
				IdEstadoMateriaPrima: ESTADO_ALMACEN_ID
			});
			const fila = Bobinas.find((b) => b.IdBobinaServilleta === bobina.IdBobinaServilleta);
			if (!fila) throw new Error("No se encontraron los datos de la bobina. Actualiza el inventario.");
			const unidades = [1, 2].map((n) => ({
				IdUnidadBobinaServilleta: fila[`IdUnidad${n}`],
				CodigoBobina: aTexto(fila[`CodigoUnidad${n}`]),
				DescripcionFormato: fila[`DescripcionFormato${n}`],
				PesoBrutoKg: aTexto(fila[`PesoBrutoKg${n}`]),
				GramajeGr: aTexto(fila[`GramajeGr${n}`])
			}));
			setUnidadesOriginales(unidades);
			setFormUnidades(unidades);
		} catch (e) {
			setErrorEditar(extraerMensajeError(e, e.message));
		} finally {
			setCargandoEditar(false);
		}
	};
	const actualizarUnidad = (indice, campo, valor) => {
		setFormUnidades((prev) => prev.map((u, i) => i === indice ? {
			...u,
			[campo]: valor
		} : u));
	};
	const errorUnidad = (u, otra) => {
		const codigo = u.CodigoBobina.trim();
		if (!codigo) return "Falta el código";
		if (otra && codigo.toLowerCase() === otra.CodigoBobina.trim().toLowerCase()) return "Código repetido";
		if (valorInvalido(u.PesoBrutoKg)) return "Peso bruto inválido";
		if (valorInvalido(u.GramajeGr)) return "Gramaje inválido";
		return null;
	};
	const erroresUnidades = formUnidades.map((u, i) => errorUnidad(u, formUnidades[1 - i]));
	const huboCambios = formUnidades.some((u, i) => {
		const o = unidadesOriginales[i];
		if (!o) return false;
		return u.CodigoBobina.trim() !== o.CodigoBobina || numeroONulo(u.PesoBrutoKg) !== numeroONulo(o.PesoBrutoKg) || numeroONulo(u.GramajeGr) !== numeroONulo(o.GramajeGr);
	});
	const motivoLimpio = formMotivo.trim();
	const motivoValido = motivoLimpio.length >= 5 && motivoLimpio.length <= 150;
	const puedeGuardar = formUnidades.length === 2 && erroresUnidades.every((e) => !e) && huboCambios && motivoValido;
	const confirmarEditar = async () => {
		const bobina = dialogEditar.bobina;
		if (!bobina || !puedeGuardar) return;
		setGuardandoEditar(true);
		setErrorEditar("");
		try {
			await editarBobinaServilleta(bobina.IdBobinaServilleta, formUnidades, motivoLimpio);
			toast.success(`Bobina #${bobina.IdBobinaServilleta} actualizada`);
			setDialogEditar({
				open: false,
				bobina: null
			});
			refrescar();
		} catch (e) {
			setErrorEditar(extraerMensajeError(e, e.message));
		} finally {
			setGuardandoEditar(false);
		}
	};
	const esBobina = sel?.clase === "bobina";
	return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx(Header, {
				titulo: "Almacén · Materia Prima",
				subtitulo: "Inventario de Bobinas de Servilleta",
				accion: esEncargado ? {
					texto: "Registrar ingreso",
					icono: Plus,
					href: "/encargado/bobina-servilleta/ingreso"
				} : null,
				children: esEncargado && /* @__PURE__ */ jsx(BotonDescarga, {
					texto: "Descargar inventario",
					ayuda: "PDF con la cantidad de bobinas de servilleta en almacén (y sus unidades) más todas las sub-bobinas en inventario",
					exito: "Informe de inventario descargado",
					descargar: descargarReporteInventarioCompletoServilleta
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ jsxs(EncabezadoCatalogo, {
						titulo: "Catálogo de almacén",
						children: [
							etiquetaCantidad(totalBobinas, "bobina", "bobinas"),
							" ·",
							" ",
							etiquetaCantidad(totalSub, "sub-bobina", "sub-bobinas")
						]
					}),
					/* @__PURE__ */ jsx(EstadoCatalogo, {
						cargando: resumenBobinas.cargando || resumenSubs.cargando,
						error: resumenBobinas.error || resumenSubs.error,
						altoSkeleton: "h-44",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-6",
							children: [/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("div", {
								className: "mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500",
								children: "Bobinas sin abrir"
							}), tiposBobina.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200",
								children: "No hay bobinas de servilleta en almacén."
							}) : /* @__PURE__ */ jsx("div", {
								className: GRID_TARJETAS,
								children: tiposBobina.map((t) => /* @__PURE__ */ jsx(TarjetaTipo, {
									acento: t,
									activo: sel?.clase === "bobina" && sel.id === t.IdTipoBobinaServilleta,
									onClick: () => detalle.seleccionar({
										clase: "bobina",
										id: t.IdTipoBobinaServilleta
									}),
									icono: Database,
									nombre: t.NombreTipoBobinaServilleta,
									etiqueta: t.badge,
									cantidad: t.CantidadBobinaServilleta,
									unidad: "bobinas en almacén",
									textoVer: "Ver bobinas"
								}, t.IdTipoBobinaServilleta))
							})] }), /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("div", {
								className: "mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500",
								children: "Sub-bobinas por medida"
							}), /* @__PURE__ */ jsxs("div", {
								className: GRID_TARJETAS,
								children: [tiposSub.map((t) => /* @__PURE__ */ jsx(TarjetaTipo, {
									acento: t,
									activo: sel?.clase === "sub" && sel.id === t.IdTipoMedidaSubBobina,
									onClick: () => detalle.seleccionar({
										clase: "sub",
										id: t.IdTipoMedidaSubBobina
									}),
									icono: Disc,
									claseIcono: "h-7 w-7",
									nombre: t.NombreTipoMedida,
									etiqueta: "Sub-bobina",
									cantidad: t.CantidadSubBobinas,
									unidad: "sub-bobinas en almacén",
									textoVer: "Ver sub-bobinas"
								}, t.IdTipoMedidaSubBobina)), esEncargado && /* @__PURE__ */ jsx(TarjetaFueraInventario, {
									cantidad: fuera.datos.length,
									activo: mostrarFuera,
									onClick: () => setMostrarFuera((v) => !v),
									unidad: "sub-bobinas retiradas de producción",
									textoVer: "Ver sub-bobinas"
								})]
							})] })]
						})
					}),
					tipoSel && /* @__PURE__ */ jsxs(PanelDetalle, {
						acento: tipoSel,
						icono: esBobina ? Database : Disc,
						claseIcono: esBobina ? "h-7 w-7" : "h-6 w-6",
						titulo: esBobina ? `Bobinas · ${tipoSel.NombreTipoBobinaServilleta}` : `Sub-bobinas · ${tipoSel.NombreTipoMedida}`,
						subtitulo: esBobina ? `${tipoSel.CantidadBobinaServilleta} en almacén` : `${tipoSel.CantidadSubBobinas} en almacén`,
						etiqueta: esBobina ? null : "Se traslada 1 sub-bobina",
						onCerrar: detalle.cerrar,
						children: [/* @__PURE__ */ jsx(ContenidoLista, {
							cargando: detalle.cargando,
							error: detalle.error,
							total: detalle.datos.length,
							cantidadFiltrada: detalleFiltrado.length,
							buscador: /* @__PURE__ */ jsx(BuscadorCodigo, {
								valor: detalle.busqueda,
								onCambio: detalle.setBusqueda,
								placeholder: "Buscar..."
							}),
							mensajeVacio: esBobina ? "No hay bobinas en almacén para este tipo." : "No hay sub-bobinas en almacén para esta medida.",
							mensajeSinCoincidencias: `Nada coincide con "${detalle.busqueda}".`,
							children: esBobina ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
								className: "hidden md:block",
								children: /* @__PURE__ */ jsx(TablaBobinas, {
									bobinas: detalleFiltrado,
									tipoSel,
									procesandoId: apertura.enProceso,
									onAbrir: abrirBobina,
									onEditar: esEncargado ? abrirEditar : null
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "md:hidden",
								children: /* @__PURE__ */ jsx(ListaMovilBobinas, {
									bobinas: detalleFiltrado,
									tipoSel,
									procesandoId: apertura.enProceso,
									onAbrir: abrirBobina,
									onEditar: esEncargado ? abrirEditar : null
								})
							})] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
								className: "hidden md:block",
								children: /* @__PURE__ */ jsx(TablaSubBobinas, {
									subBobinas: detalleFiltrado,
									tipoSel,
									marcada: marcadaSub,
									onToggle: toggleSub
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "md:hidden",
								children: /* @__PURE__ */ jsx(ListaMovilSubBobinas, {
									subBobinas: detalleFiltrado,
									tipoSel,
									marcada: marcadaSub,
									onToggle: toggleSub
								})
							})] })
						}), !esBobina && marcadaSub != null && /* @__PURE__ */ jsx(BarraSeleccion, {
							chips: [{
								clave: marcadaSub,
								texto: `#${marcadaSub}`,
								onQuitar: () => detalle.setMarcadas([])
							}],
							estado: "Se traslada 1 sub-bobina",
							enviando: traslado.enProceso === "envio",
							onEnviar: enviarTraslado,
							textoAccion: "Trasladar a producción",
							textoEnviando: "Trasladando..."
						})]
					}),
					esEncargado && mostrarFuera && /* @__PURE__ */ jsx(PanelFuera, {
						titulo: "Sub-bobinas fuera de inventario",
						onCerrar: () => setMostrarFuera(false),
						children: /* @__PURE__ */ jsx(ContenidoLista, {
							cargando: fuera.cargando,
							error: fuera.error,
							total: fuera.datos.length,
							mensajeVacio: "No hay sub-bobinas fuera de inventario.",
							filasSkeleton: 2,
							altoSkeleton: "h-16",
							children: /* @__PURE__ */ jsx("div", {
								className: "flex flex-col gap-3 p-5",
								children: fuera.datos.map((s) => /* @__PURE__ */ jsx(ItemFueraInventario, {
									codigo: `#${s.IdSubBobinaServilleta}`,
									etiqueta: s.NombreTipoMedida,
									extra: /* @__PURE__ */ jsx("span", {
										className: "font-mono text-[12.5px] text-slate-500",
										children: s.CodigoUnidadOrigen
									}),
									observacion: s.UltimaObservacion,
									fechaMovimiento: s.FechaUltimoMovimiento,
									procesando: accionesFuera.enProceso === s.IdSubBobinaServilleta,
									onReingresar: () => setPorReingresar(s)
								}, s.IdSubBobinaServilleta))
							})
						})
					})
				]
			}),
			esEncargado && /* @__PURE__ */ jsx(DialogReingreso, {
				abierto: porReingresar !== null,
				titulo: porReingresar ? `sub-bobina #${porReingresar.IdSubBobinaServilleta}` : "",
				procesando: porReingresar !== null && accionesFuera.enProceso === porReingresar.IdSubBobinaServilleta,
				onCancelar: () => setPorReingresar(null),
				onConfirmar: reingresar
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: dialogEditar.open,
				onOpenChange: (open) => setDialogEditar({
					open,
					bobina: open ? dialogEditar.bobina : null
				}),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-xl md:max-w-3xl",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: ["Editar bobina servilleta", dialogEditar.bobina && ` #${dialogEditar.bobina.IdBobinaServilleta}`] }) }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-4",
							children: [
								dialogEditar.bobina && /* @__PURE__ */ jsxs("div", {
									className: "rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-500",
									children: [
										dialogEditar.bobina.NombreProveedor,
										" · recibida",
										" ",
										dateFormatter(dialogEditar.bobina.FechaRecepcion)
									]
								}),
								cargandoEditar && /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-56 rounded-xl" }), /* @__PURE__ */ jsx(Skeleton, { className: "h-56 rounded-xl" })]
								}),
								!cargandoEditar && formUnidades.length === 2 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
									children: formUnidades.map((u, i) => /* @__PURE__ */ jsxs("div", {
										className: cn("flex flex-col gap-3 rounded-xl border-2 p-3.5", erroresUnidades[i] ? "border-red-200" : "border-slate-200"),
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "text-sm font-extrabold text-slate-900",
													children: ["Unidad ", i + 1]
												}), /* @__PURE__ */ jsx(Badge, {
													variant: "outline",
													className: "border-slate-300 font-bold text-slate-500",
													children: u.DescripcionFormato
												})]
											}),
											/* @__PURE__ */ jsx(InputForModal, {
												id: `codigo-unidad-${i}`,
												etiqueta: "Código",
												valor: u.CodigoBobina,
												onCambio: (valor) => actualizarUnidad(i, "CodigoBobina", aCodigo(valor)),
												classNameInput: "font-mono font-bold",
												autoComplete: "off"
											}),
											/* @__PURE__ */ jsx(InputForModal, {
												id: `peso-unidad-${i}`,
												etiqueta: "Peso bruto (kg)",
												opcional: true,
												type: "number",
												min: "0",
												step: "0.01",
												inputMode: "decimal",
												valor: u.PesoBrutoKg,
												onCambio: (valor) => actualizarUnidad(i, "PesoBrutoKg", valor)
											}),
											/* @__PURE__ */ jsx(InputForModal, {
												id: `gramaje-unidad-${i}`,
												etiqueta: "Gramaje (g/m²)",
												opcional: true,
												type: "number",
												min: "0",
												step: "0.01",
												inputMode: "decimal",
												valor: u.GramajeGr,
												onCambio: (valor) => actualizarUnidad(i, "GramajeGr", valor)
											}),
											erroresUnidades[i] && /* @__PURE__ */ jsx("p", {
												className: "text-xs font-semibold text-red-600",
												children: erroresUnidades[i]
											})
										]
									}, u.IdUnidadBobinaServilleta))
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "motivo-editar-bobina-servilleta",
											className: "text-xs font-bold uppercase tracking-wide text-slate-600",
											children: "Motivo de la corrección"
										}),
										/* @__PURE__ */ jsx(Textarea, {
											id: "motivo-editar-bobina-servilleta",
											value: formMotivo,
											onChange: (e) => setFormMotivo(limpiarObservacion(e.target.value)),
											placeholder: "Ej. Error de digitación al registrar el ingreso...",
											className: "min-h-20",
											maxLength: 150
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500",
											children: [
												motivoLimpio.length,
												"/",
												150,
												" · mínimo",
												" ",
												5,
												" caracteres",
												!huboCambios && " · aún no hay cambios"
											]
										})
									]
								})] }),
								errorEditar && /* @__PURE__ */ jsx("div", {
									className: "rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600",
									children: errorEditar
								})
							]
						}),
						/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
							onClick: confirmarEditar,
							disabled: guardandoEditar || cargandoEditar || !puedeGuardar,
							className: "h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90 sm:w-auto",
							children: guardandoEditar ? /* @__PURE__ */ jsx(Loader2, {
								size: 16,
								className: "animate-spin"
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Check, {
								size: 16,
								strokeWidth: 2.75
							}), "Guardar cambios"] })
						}) })
					]
				})
			})
		]
	}) });
}
//#endregion
export { InventarioBobinaServilleta as t };
