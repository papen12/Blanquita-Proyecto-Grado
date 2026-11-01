import { descargarDesdeUrl } from "@/utils/downloadFile";

const BASE_URL = "/api/qr";

export async function descargarCartelQr(ruta) {
  return descargarDesdeUrl(`${BASE_URL}/${ruta}`, "cartel-qr.pdf");
}
