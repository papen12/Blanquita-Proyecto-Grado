//#region src/utils/handlers.js
var aCodigo = (valor) => valor.replace(/\s+/g, "-");
var codigoKeyDown = (e, onCambio) => {
	if (e.key !== " ") return;
	e.preventDefault();
	const input = e.target;
	const inicio = input.selectionStart;
	const fin = input.selectionEnd;
	onCambio(input.value.slice(0, inicio) + "-" + input.value.slice(fin));
	requestAnimationFrame(() => {
		input.setSelectionRange(inicio + 1, inicio + 1);
	});
};
var ArrayFilter = (ids, arr) => {
	const clave = Object.keys(arr[0] ?? {}).find((k) => k.startsWith("Id"));
	return arr.filter((obj) => ids.includes(obj[clave]));
};
var SEPARADOR_MOTIVOS = ". ";
var alternarMotivoEnTexto = (motivo, actual) => {
	if (actual.includes(motivo)) return actual.replace(motivo, "").replace(/\.\s*\.\s*/g, ". ").replace(/^\s*\.\s*/, "").trimStart();
	const texto = actual.trimEnd();
	if (!texto) return motivo;
	return texto.endsWith(".") ? `${texto} ${motivo}` : `${texto}${SEPARADOR_MOTIVOS}${motivo}`;
};
//#endregion
export { codigoKeyDown as i, aCodigo as n, alternarMotivoEnTexto as r, ArrayFilter as t };
