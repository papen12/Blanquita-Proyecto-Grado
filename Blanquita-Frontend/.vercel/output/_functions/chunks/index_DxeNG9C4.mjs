import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { A as renderComponent, M as renderTemplate, R as createComponent } from "./server_DPybzryC.mjs";
import "./compiler_Dooo4qxi.mjs";
import { i as $$Layout, n as Button, t as Input } from "./input_fNj7IM-d.mjs";
import { t as Label } from "./label_DWMzSa71.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/Usuario/Login.jsx
function Login() {
	const [ci, setCi] = useState("");
	const [clave, setClave] = useState("");
	const [error, setError] = useState("");
	const [shake, setShake] = useState(false);
	const [cargando, setCargando] = useState(false);
	const fail = (msg) => {
		setError(msg);
		setShake(true);
		setTimeout(() => setShake(false), 400);
	};
	const handleCi = (e) => {
		setCi(e.target.value.replace(/\D/g, ""));
	};
	const handleClave = (e) => {
		setClave(e.target.value.slice(0, 30));
	};
	const handleIngresar = async () => {
		if (cargando) return;
		if (!ci.trim()) return fail("Ingresa tu CI.");
		if (!clave.trim()) return fail("Ingresa tu contraseña.");
		setCargando(true);
		setError("");
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					Ci: ci.trim(),
					Clave: clave
				})
			});
			const data = await response.json();
			if (!response.ok) {
				fail(data.detail || "Credenciales inválidas.");
				setClave("");
				return;
			}
			window.location.href = data.rutaRedirect || "/";
		} catch (err) {
			fail("No se pudo conectar con el servidor. Intenta nuevamente.");
			setClave("");
		} finally {
			setCargando(false);
		}
	};
	const handleTecla = (e) => {
		if (e.key === "Enter") handleIngresar();
	};
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#e3f4fb] via-[#f4f9fc] to-white font-sans text-[#123a4c]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-[400px] flex flex-col gap-[22px] animate-in fade-in slide-in-from-bottom-2 duration-300",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center gap-[10px] text-center",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-16 h-16 rounded-full bg-gradient-to-br from-[#1C96C5] to-[#20A7DB] flex items-center justify-center shadow-[0_8px_20px_rgba(28,150,197,0.3)]",
						children: /* @__PURE__ */ jsx("div", { className: "w-[26px] h-[26px] rounded-full bg-white border-[7px] border-[#A0D9EF] box-border" })
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-0.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-2xl font-extrabold text-[#1C96C5]",
							children: "Papel Blanquita"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-[13px] font-semibold text-[#5d8299]",
							children: "Sistema de Inventario y Producción"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-[18px] p-7 px-6 shadow-[0_4px_24px_rgba(18,58,76,0.1)] flex flex-col gap-5 box-border",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "ci",
								className: "text-xs font-bold text-[#33566b] uppercase tracking-[0.6px]",
								children: "Carnet de identidad (CI)"
							}), /* @__PURE__ */ jsx(Input, {
								id: "ci",
								value: ci,
								onChange: handleCi,
								onKeyDown: handleTecla,
								inputMode: "numeric",
								autoComplete: "username",
								placeholder: "Ej. 8456123",
								disabled: cargando,
								className: "h-12 rounded-xl border-[1.5px] border-[#cfe2ee] px-3.5 text-base font-semibold text-[#123a4c] focus-visible:border-[#20A7DB] focus-visible:ring-[3px] focus-visible:ring-[#20A7DB]/20"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ jsx(Label, {
									className: "text-xs font-bold text-[#33566b] uppercase tracking-[0.6px]",
									children: "Contraseña"
								}),
								/* @__PURE__ */ jsx("div", {
									className: shake ? "animate-[shake_0.35s_ease]" : "",
									children: /* @__PURE__ */ jsx(Input, {
										type: "password",
										value: clave,
										onChange: handleClave,
										onKeyDown: handleTecla,
										maxLength: 30,
										autoComplete: "off",
										disabled: cargando,
										placeholder: "Ingresa tu contraseña",
										className: "h-12 rounded-xl border-[1.5px] border-[#cfe2ee] px-3.5 text-base font-semibold text-[#123a4c] focus-visible:border-[#20A7DB] focus-visible:ring-[3px] focus-visible:ring-[#20A7DB]/20"
									})
								}),
								error && /* @__PURE__ */ jsx("div", {
									className: "text-[13px] font-semibold text-[#c0392b] bg-[#fdecea] rounded-lg px-3 py-2.5 text-center",
									children: error
								})
							]
						}),
						/* @__PURE__ */ jsx(Button, {
							onClick: handleIngresar,
							disabled: cargando,
							className: "h-[50px] rounded-xl bg-gradient-to-r from-[#1C96C5] to-[#20A7DB] font-extrabold text-[15px] shadow-[0_4px_14px_rgba(28,150,197,0.35)] hover:brightness-[1.06]",
							children: cargando ? "Ingresando..." : "Ingresar"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "text-center text-xs text-[#8aa7b8]",
					children: [
						"¿Olvidaste tu contraseña?",
						" ",
						/* @__PURE__ */ jsx("a", {
							href: "#",
							className: "text-[#1C96C5] font-bold no-underline",
							children: "Contacta al administrador"
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Login", Login, {
		"client:idle": true,
		"client:component-hydration": "idle",
		"client:component-path": "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/components/Usuario/Login.jsx",
		"client:component-export": "default"
	})}` })}`;
}, "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/index.astro", void 0);
var $$file = "C:/Users/HP OMEN/Documents/8.Octavo Semestre/ProyectoFinalBlanquita/Blanquita-Frontend/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
