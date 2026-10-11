import { t as pedir } from "./api_B8jC8QYh.mjs";
//#region src/utils/downloadFile.js
function obtenerNombreArchivo(response, nombrePorDefecto) {
	return (response.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/))?.[1] ?? nombrePorDefecto;
}
function descargarArchivo(blob, nombreArchivo) {
	const url = window.URL.createObjectURL(blob);
	const enlace = document.createElement("a");
	enlace.href = url;
	enlace.download = nombreArchivo;
	document.body.appendChild(enlace);
	enlace.click();
	enlace.remove();
	window.URL.revokeObjectURL(url);
}
async function descargarReportePDF(url, nombrePorDefecto) {
	const response = await pedir(url);
	descargarArchivo(await response.blob(), obtenerNombreArchivo(response, nombrePorDefecto));
}
async function imprimirPDF(url) {
	const blob = await (await pedir(url)).blob();
	const { default: printJS } = await import("print-js");
	const urlLocal = window.URL.createObjectURL(blob);
	try {
		await new Promise((resolve, reject) => {
			printJS({
				printable: urlLocal,
				type: "pdf",
				onLoadingEnd: resolve,
				onError: () => reject(/* @__PURE__ */ new Error("No se pudo abrir la impresión del PDF"))
			});
		});
	} finally {
		window.URL.revokeObjectURL(urlLocal);
	}
}
//#endregion
export { imprimirPDF as n, descargarReportePDF as t };
