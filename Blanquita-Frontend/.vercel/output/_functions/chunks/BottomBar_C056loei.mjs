import { r as PREFIJO_POR_ROL } from "./Values_CoTzCKTc.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, Camera, CircleUserRound, Combine, Factory, Home, PackagePlus, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/layout/Qr/Escanerqr.jsx
function EscanerQR({ abierto, onCerrar, onDetectar }) {
	const videoRef = useRef(null);
	const scannerRef = useRef(null);
	const pistaRef = useRef(null);
	const yaLeidoRef = useRef(false);
	const onCerrarRef = useRef(onCerrar);
	const onDetectarRef = useRef(onDetectar);
	onCerrarRef.current = onCerrar;
	onDetectarRef.current = onDetectar;
	const [estado, setEstado] = useState("cargando");
	const [error, setError] = useState("");
	const [intento, setIntento] = useState(0);
	const [zoom, setZoom] = useState(null);
	const [limitesZoom, setLimitesZoom] = useState(null);
	const pellizcoRef = useRef(null);
	useEffect(() => {
		if (!abierto) return;
		window.history.pushState({ escanerQR: true }, "");
		const alVolver = () => onCerrarRef.current();
		window.addEventListener("popstate", alVolver);
		return () => window.removeEventListener("popstate", alVolver);
	}, [abierto]);
	const cerrar = useCallback(() => {
		if (window.history.state && window.history.state.escanerQR) {
			window.history.back();
			return;
		}
		onCerrarRef.current();
	}, []);
	const prepararZoom = useCallback(() => {
		const stream = videoRef.current && videoRef.current.srcObject;
		if (!stream) return;
		const pista = stream.getVideoTracks()[0];
		if (!pista || typeof pista.getCapabilities !== "function") return;
		pistaRef.current = pista;
		const caps = pista.getCapabilities();
		if (!caps || !caps.zoom) return;
		const min = caps.zoom.min ?? 1;
		const max = caps.zoom.max ?? 1;
		if (max <= min) return;
		const paso = caps.zoom.step || (max - min) / 20;
		const actual = pista.getSettings().zoom ?? min;
		setLimitesZoom({
			min,
			max,
			paso
		});
		setZoom(actual);
	}, []);
	const aplicarZoom = useCallback((valor) => {
		if (!limitesZoom || !pistaRef.current) return;
		const acotado = Math.min(limitesZoom.max, Math.max(limitesZoom.min, valor));
		setZoom(acotado);
		pistaRef.current.applyConstraints({ advanced: [{ zoom: acotado }] }).catch(() => {});
	}, [limitesZoom]);
	const alTocarInicio = (evento) => {
		if (!limitesZoom || evento.touches.length !== 2) return;
		pellizcoRef.current = {
			distancia: distanciaEntreDedos(evento.touches),
			zoomInicial: zoom
		};
	};
	const alTocarMover = (evento) => {
		const pellizco = pellizcoRef.current;
		if (!pellizco || evento.touches.length !== 2) return;
		const distancia = distanciaEntreDedos(evento.touches);
		if (pellizco.distancia === 0) return;
		const factor = distancia / pellizco.distancia;
		aplicarZoom(pellizco.zoomInicial * factor);
	};
	const alTocarFin = () => {
		pellizcoRef.current = null;
	};
	useEffect(() => {
		if (!abierto) return;
		let cancelado = false;
		yaLeidoRef.current = false;
		setEstado("cargando");
		setError("");
		setZoom(null);
		setLimitesZoom(null);
		const alLeer = (resultado) => {
			if (yaLeidoRef.current) return;
			yaLeidoRef.current = true;
			const valor = resultado && resultado.data ? resultado.data : resultado;
			if (scannerRef.current) scannerRef.current.stop();
			if (window.history.state && window.history.state.escanerQR) window.history.replaceState(null, "");
			onDetectarRef.current(valor);
		};
		(async () => {
			try {
				const { default: QrScanner } = await import("qr-scanner");
				if (cancelado || !videoRef.current) return;
				const scanner = new QrScanner(videoRef.current, alLeer, {
					preferredCamera: "environment",
					highlightScanRegion: false,
					highlightCodeOutline: false,
					maxScansPerSecond: 5
				});
				scannerRef.current = scanner;
				await scanner.start();
				if (cancelado) {
					scanner.destroy();
					scannerRef.current = null;
					return;
				}
				setEstado("activo");
				prepararZoom();
			} catch (fallo) {
				if (cancelado) return;
				setEstado("error");
				setError(mensajeDeFallo(fallo));
			}
		})();
		return () => {
			cancelado = true;
			if (scannerRef.current) {
				scannerRef.current.destroy();
				scannerRef.current = null;
			}
			pistaRef.current = null;
		};
	}, [
		abierto,
		intento,
		prepararZoom
	]);
	if (!abierto) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex h-[100dvh] flex-col bg-black",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Escanear código QR",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 overflow-hidden",
				onTouchStart: alTocarInicio,
				onTouchMove: alTocarMover,
				onTouchEnd: alTocarFin,
				onTouchCancel: alTocarFin,
				children: /* @__PURE__ */ jsx("video", {
					ref: videoRef,
					className: "h-full w-full object-cover",
					playsInline: true,
					muted: true
				})
			}),
			estado === "activo" ? /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 flex items-center justify-center",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative aspect-square w-[min(72vw,52vh,340px)]",
					children: [
						/* @__PURE__ */ jsx("span", { className: "absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-c3" }),
						/* @__PURE__ */ jsx("span", { className: "absolute -right-px -top-px h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-c3" }),
						/* @__PURE__ */ jsx("span", { className: "absolute -bottom-px -left-px h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-c3" }),
						/* @__PURE__ */ jsx("span", { className: "absolute -bottom-px -right-px h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-c3" })
					]
				})
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 flex items-center justify-between gap-3 bg-linear-to-b from-black/70 to-transparent px-4 pb-8 pt-[max(env(safe-area-inset-top),0.75rem)]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-sans text-sm font-semibold text-white",
					children: "Escanear código QR"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: cerrar,
					"aria-label": "Cerrar cámara",
					className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 active:bg-white/30",
					children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
				})]
			}),
			/* @__PURE__ */ jsx("div", { className: "flex-1" }),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 flex flex-col gap-4 bg-linear-to-t from-black/80 to-transparent px-5 pt-10 pb-[max(env(safe-area-inset-bottom),1.25rem)]",
				children: [
					estado === "error" ? /* @__PURE__ */ jsxs("div", {
						className: "mx-auto w-full max-w-sm rounded-2xl bg-white/10 p-4 text-center backdrop-blur",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-sans text-sm font-medium text-white",
							children: error
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setIntento((n) => n + 1),
							className: "mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-c3 px-5 py-2.5 font-sans text-sm font-semibold text-white transition-transform active:scale-95",
							children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }), "Reintentar"]
						})]
					}) : null,
					estado === "cargando" ? /* @__PURE__ */ jsx("p", {
						className: "text-center font-sans text-sm text-white/70",
						children: "Encendiendo la cámara…"
					}) : null,
					estado === "activo" && limitesZoom !== null && zoom !== null ? /* @__PURE__ */ jsxs("div", {
						className: "mx-auto flex w-full max-w-sm items-center gap-3 rounded-full bg-white/10 px-3 py-2 backdrop-blur",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => aplicarZoom(zoom - limitesZoom.paso * 2),
								"aria-label": "Alejar",
								className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15",
								children: /* @__PURE__ */ jsx(ZoomOut, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx("input", {
								type: "range",
								min: limitesZoom.min,
								max: limitesZoom.max,
								step: limitesZoom.paso,
								value: zoom,
								onChange: (evento) => aplicarZoom(Number(evento.target.value)),
								"aria-label": "Nivel de acercamiento",
								className: "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-c3"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => aplicarZoom(zoom + limitesZoom.paso * 2),
								"aria-label": "Acercar",
								className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15",
								children: /* @__PURE__ */ jsx(ZoomIn, { className: "h-5 w-5" })
							})
						]
					}) : null,
					estado === "activo" ? /* @__PURE__ */ jsx("p", {
						className: "text-center font-sans text-sm text-white/70",
						children: "Apunta la cámara al código del material"
					}) : null
				]
			})
		]
	});
}
function distanciaEntreDedos(dedos) {
	const dx = dedos[0].clientX - dedos[1].clientX;
	const dy = dedos[0].clientY - dedos[1].clientY;
	return Math.hypot(dx, dy);
}
function mensajeDeFallo(fallo) {
	const nombre = fallo && fallo.name ? fallo.name : "";
	if (nombre === "NotAllowedError" || nombre === "SecurityError") return "El navegador bloqueó la cámara. Habilita el permiso desde la configuración del sitio.";
	if (nombre === "NotFoundError" || nombre === "OverconstrainedError") return "Este dispositivo no tiene una cámara disponible.";
	if (nombre === "NotReadableError") return "Otra aplicación está usando la cámara. Ciérrala y vuelve a intentar.";
	return "No se pudo abrir la cámara.";
}
//#endregion
//#region src/constants/BottomBarOptions.js
function unirRutas(...segmentos) {
	return "/" + segmentos.filter((s) => typeof s === "string" && s.trim() !== "").map((s) => s.replace(/^\/+|\/+$/g, "")).filter((s) => s !== "").join("/");
}
var BottomBarOpciones = [
	{
		id: 1,
		opciones: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Produccion",
			icono: Factory,
			ruta: "produccion"
		}]
	},
	{
		id: 2,
		opciones: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Ingreso",
			icono: PackagePlus,
			ruta: "ingreso"
		}]
	},
	{
		id: 3,
		opciones: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "bobina-inventario"
		}, {
			titulo: "Ingreso",
			icono: PackagePlus,
			ruta: "bobina-ingreso"
		}]
	},
	{
		id: 4,
		opciones: [{
			titulo: "Inicio",
			icono: Home,
			ruta: "inicio"
		}, {
			titulo: "Perfil",
			icono: CircleUserRound,
			ruta: "perfil"
		}]
	},
	{
		id: 5,
		opciones: [{
			titulo: "Inventario",
			icono: Boxes,
			ruta: "inventario"
		}, {
			titulo: "Movimientos",
			icono: Combine,
			ruta: "movimientos"
		}]
	}
];
function resolverOpcionesConjunto(idConjunto, rutaBase, subRuta) {
	const conjunto = BottomBarOpciones.find((c) => c.id === idConjunto);
	if (!conjunto) {
		console.error("resolverOpcionesConjunto: idConjunto no válido ->", idConjunto);
		return [];
	}
	return conjunto.opciones.map((opcion) => ({
		...opcion,
		ruta: unirRutas(rutaBase, subRuta, opcion.ruta)
	}));
}
//#endregion
//#region src/utils/QR.js
function resolverRutaQR(valor, origen, prefijo) {
	if (typeof valor !== "string") return { error: "El código no se pudo leer. Intenta de nuevo." };
	const texto = valor.trim();
	if (texto === "") return { error: "El código no se pudo leer. Intenta de nuevo." };
	if (texto.startsWith("//")) return { error: "Este código no pertenece al sistema." };
	if (texto.startsWith("/")) return { ruta: `/${prefijo}${texto}` };
	try {
		const url = new URL(texto);
		if (url.origin === origen) return { ruta: `/${prefijo}${url.pathname}${url.search}` };
		return { error: "Este código no pertenece al sistema." };
	} catch {
		return { error: "Este código no pertenece al sistema." };
	}
}
//#endregion
//#region src/components/layout/Qr/BottomBar.jsx
function normalizar(ruta) {
	if (typeof ruta !== "string" || ruta === "") return "/";
	if (ruta === "/") return "/";
	return ruta.replace(/\/+$/, "");
}
function OpcionNav({ opcion, activa }) {
	const Icono = opcion.icono;
	const claseEnlace = activa ? "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200 text-c3" : "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200 text-neutral-400 hover:text-c4";
	const claseTexto = activa ? "font-sans text-[11px] font-semibold" : "font-sans text-[11px] font-medium";
	return /* @__PURE__ */ jsxs("a", {
		href: opcion.ruta,
		className: claseEnlace,
		children: [/* @__PURE__ */ jsx(Icono, {
			className: "h-6 w-6",
			strokeWidth: activa ? 2.4 : 1.8,
			fill: activa ? "currentColor" : "none",
			fillOpacity: activa ? .15 : 0
		}), /* @__PURE__ */ jsx("span", {
			className: claseTexto,
			children: opcion.titulo
		})]
	});
}
function BottomBar({ idRol, subRuta, idOpcionSelect }) {
	const rutaBase = PREFIJO_POR_ROL[idRol];
	const [rutaActual, setRutaActual] = useState("");
	const [escaneando, setEscaneando] = useState(false);
	const [avisoQR, setAvisoQR] = useState("");
	useEffect(() => {
		setRutaActual(normalizar(window.location.pathname));
	}, []);
	useEffect(() => {
		if (!avisoQR) return;
		const id = setTimeout(() => setAvisoQR(""), 4e3);
		return () => clearTimeout(id);
	}, [avisoQR]);
	const alDetectar = (valor) => {
		const { ruta, error } = resolverRutaQR(valor, window.location.origin, rutaBase);
		setEscaneando(false);
		if (error) {
			setAvisoQR(error);
			return;
		}
		window.location.href = ruta;
	};
	if (!rutaBase) {
		console.error("BottomBar: idRol no válido ->", idRol);
		return null;
	}
	const opciones = resolverOpcionesConjunto(idOpcionSelect, rutaBase, subRuta);
	const mitad = Math.ceil(opciones.length / 2);
	const izquierda = opciones.slice(0, mitad);
	const derecha = opciones.slice(mitad);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", { className: "h-20" }),
		/* @__PURE__ */ jsx("nav", {
			className: "pointer-events-none fixed inset-x-0 bottom-0 z-40",
			children: /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-auto relative mx-auto max-w-2xl",
				children: [
					avisoQR ? /* @__PURE__ */ jsx("div", {
						className: "absolute bottom-full left-1/2 mb-3 w-[min(90vw,24rem)] -translate-x-1/2 rounded-2xl bg-neutral-900/90 px-4 py-3 text-center backdrop-blur",
						children: /* @__PURE__ */ jsx("p", {
							className: "font-sans text-sm font-medium text-white",
							children: avisoQR
						})
					}) : null,
					/* @__PURE__ */ jsx("div", {
						className: "rounded-t-3xl border-t border-c2/60 bg-white/95 shadow-[0_-6px_24px_-12px_rgba(28,150,197,0.45)] backdrop-blur",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex flex-1",
									children: izquierda.map((opcion) => /* @__PURE__ */ jsx(OpcionNav, {
										opcion,
										activa: rutaActual === normalizar(opcion.ruta)
									}, opcion.ruta))
								}),
								/* @__PURE__ */ jsx("div", { className: "w-20 shrink-0" }),
								/* @__PURE__ */ jsx("div", {
									className: "flex flex-1",
									children: derecha.map((opcion) => /* @__PURE__ */ jsx(OpcionNav, {
										opcion,
										activa: rutaActual === normalizar(opcion.ruta)
									}, opcion.ruta))
								})
							]
						})
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setEscaneando(true),
						"aria-label": "Escanear código QR",
						className: "absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-c4 to-c3 text-white shadow-lg shadow-c3/40 transition-transform duration-200 active:scale-95",
						children: /* @__PURE__ */ jsx(Camera, {
							className: "h-7 w-7",
							strokeWidth: 2
						})
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(EscanerQR, {
			abierto: escaneando,
			onCerrar: () => setEscaneando(false),
			onDetectar: alDetectar
		})
	] });
}
//#endregion
export { BottomBar as t };
