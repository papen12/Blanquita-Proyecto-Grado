export const aCodigo = (valor) => valor.replace(/\s+/g, "-");
export const codigoKeyDown = (e, onCambio) => {
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
