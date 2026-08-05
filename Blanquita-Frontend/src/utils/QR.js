const PREFIJO_SCAN = "/scan/";
const PATRON_CODIGO = /^[A-Za-z0-9._:-]{1,64}$/;

export function resolverRutaQR(valor, origen) {
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
    return { ruta: texto };
  }

  try {
    const url = new URL(texto);
    if (url.origin === origen) {
      return { ruta: url.pathname + url.search };
    }
    return { error: "Este código no pertenece al sistema." };
  } catch {
    if (!PATRON_CODIGO.test(texto)) {
      return { error: "Este código no corresponde a un material." };
    }
    return { ruta: PREFIJO_SCAN + encodeURIComponent(texto) };
  }
}