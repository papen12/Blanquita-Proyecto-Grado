export const handleKeyDown = (e) => {
  if (e.key === " ") {
    e.preventDefault();

    const input = e.target;
    const inicio = input.selectionStart;
    const fin = input.selectionEnd;

    const nuevoValor =
      input.value.substring(0, inicio) +
      "-" +
      input.value.substring(fin);

    setNombre(nuevoValor);

    setTimeout(() => {
      input.setSelectionRange(inicio + 1, inicio + 1);
    }, 0);
  }
};