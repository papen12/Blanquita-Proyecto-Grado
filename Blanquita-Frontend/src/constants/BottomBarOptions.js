import { Boxes, Factory } from "lucide-react";

function unirRutas(...segmentos) {
  const limpios = segmentos
    .filter((s) => typeof s === "string" && s.trim() !== "")
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter((s) => s !== "");
  return "/" + limpios.join("/");
}

export class BottomBarRoutes {
  constructor(rutaBase, subRuta) {
    this.rutaBase = rutaBase;
    this.opciones = [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: unirRutas(rutaBase, subRuta, "inventario"),
      },
      {
        titulo: "Produccion",
        icono: Factory,
        ruta: unirRutas(rutaBase, subRuta, "produccion"),
      },
    ];
  }
}