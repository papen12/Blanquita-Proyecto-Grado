import { Boxes, Factory, User } from "lucide-react";

function unirRutas(...segmentos) {
  const limpios = segmentos
    .filter((s) => typeof s === "string" && s.trim() !== "")
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter((s) => s !== "");
  return "/" + limpios.join("/");
}

export class BottomBarRoutes {
  constructor(rutaBase, subRuta, idOpcionSelect) {
    this.rutaBase = rutaBase;
    this.grupos = [
      {
        idOp: 1,
        opciones: [
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
        ],
      },
      {
        idOp: 2,
        opciones: [
          {
            titulo: "Perfil",
            icono: User,
            ruta: unirRutas(rutaBase, subRuta, "perfil"),
          },
        ],
      },
    ];

    this.opciones = this.grupos.find((g) => g.idOp === idOpcionSelect).opciones;
  }
}