import { n as Button } from "./input_fNj7IM-d.mjs";
import { h as cn, o as Skeleton } from "./SideBar_kUHPnrT4.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table_ByFipyJZ.mjs";
import { t as formatearNumero } from "./numeros_UZQvWSOa.mjs";
import { Fragment } from "react";
import { RefreshCcw } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Reportes/Producto/comunes.jsx
function CantidadUnidad({ valor, unidad }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("strong", {
			className: "text-slate-900",
			children: formatearNumero(valor, { decimales: 0 })
		}),
		" ",
		/* @__PURE__ */ jsx("span", {
			className: "text-slate-500",
			children: unidad
		})
	] });
}
function TarjetaFila({ nombre, detalle, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-0.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[15px] font-bold text-slate-900",
				children: nombre
			}), /* @__PURE__ */ jsx("span", {
				className: "text-[12.5px] text-slate-500",
				children: detalle
			})]
		}), children && /* @__PURE__ */ jsx("span", {
			className: "shrink-0 text-right text-[15px] tabular-nums",
			children
		})]
	});
}
function TarjetaSeccion({ titulo, extra, className, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: cn("overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200", className),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-base font-extrabold text-slate-900",
				children: titulo
			}), extra && /* @__PURE__ */ jsx("div", {
				className: "text-[15px] tabular-nums",
				children: extra
			})]
		}), children]
	});
}
function EsqueletoCarga() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-2 p-5",
		children: [
			0,
			1,
			2,
			3
		].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full rounded-lg" }, i))
	});
}
function ErrorCarga({ error, recargar }) {
	return /* @__PURE__ */ jsxs("div", {
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
	});
}
function TablaFilas({ columnas, filas, clave, tarjeta }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
		className: "hidden md:block",
		children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsx(TableRow, { children: columnas.map((columna) => /* @__PURE__ */ jsx(TableHead, {
			className: columna.claseTitulo,
			children: columna.titulo
		}, columna.titulo)) }) }), /* @__PURE__ */ jsx(TableBody, { children: filas.map((fila) => /* @__PURE__ */ jsx(TableRow, { children: columnas.map((columna) => /* @__PURE__ */ jsx(TableCell, {
			className: columna.clase,
			children: columna.valor(fila)
		}, columna.titulo)) }, clave(fila))) })] })
	}), /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-3 p-4 md:hidden",
		children: filas.map((fila) => /* @__PURE__ */ jsx(Fragment, { children: tarjeta(fila) }, clave(fila)))
	})] });
}
function SeccionResumenLineas({ reporte, titulo, columnas, tarjeta, pie, mensajeVacio }) {
	const { catalogo, cargando, error, recargar } = reporte;
	const listo = !cargando && !error;
	const lineas = catalogo?.Lineas;
	return /* @__PURE__ */ jsxs(TarjetaSeccion, {
		titulo,
		className: "mt-6",
		children: [
			cargando && /* @__PURE__ */ jsx(EsqueletoCarga, {}),
			!cargando && error && /* @__PURE__ */ jsx(ErrorCarga, {
				error,
				recargar
			}),
			listo && !lineas && /* @__PURE__ */ jsx("div", {
				className: "p-10 text-center text-sm text-slate-400",
				children: mensajeVacio
			}),
			listo && lineas && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(TablaFilas, {
				columnas,
				filas: lineas,
				clave: (linea) => linea.IdProducto,
				tarjeta
			}), pie && /* @__PURE__ */ jsx("div", {
				className: "border-t border-slate-100 px-5 py-3.5 text-[12.5px] font-semibold text-slate-500",
				children: pie
			})] })
		]
	});
}
//#endregion
export { TablaFilas as a, SeccionResumenLineas as i, ErrorCarga as n, TarjetaFila as o, EsqueletoCarga as r, TarjetaSeccion as s, CantidadUnidad as t };
