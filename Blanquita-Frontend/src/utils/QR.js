export function resolverRutaQR(valor, origen, prefijo) {
  if (typeof valor !== "string") {
    return { error: "El código no se pudo leer. Intenta de nuevo." };
  }

  const texto = valor.trim();
  if (texto === "") {
    return { error: "El código no se pudo leer. Intenta de nuevo." };
  }

  if (texto.startsWith("//")) {
    return { error: "Este código no pertenece al sistema." };
  }

  if (texto.startsWith("/")) {
    return { ruta: `/${prefijo}${texto}` };
  }

  try {
    const url = new URL(texto);
    if (url.origin === origen) {
      return { ruta: `/${prefijo}${url.pathname}${url.search}` };
    }
    return { error: "Este código no pertenece al sistema." };
  } catch {
    return { error: "Este código no pertenece al sistema." };
  }
}
