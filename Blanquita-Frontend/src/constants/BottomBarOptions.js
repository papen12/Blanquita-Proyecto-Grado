import { Boxes, Factory, User } from "lucide-react";

function unirRutas(...segmentos) {
  const limpios = segmentos
    .filter((s) => typeof s === "string" && s.trim() !== "")
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter((s) => s !== "");
  return "/" + limpios.join("/");
}

const SUB_RUTAS_SIN_PRODUCCION = new Set(["rodela"]);

export class BottomBarRoutes {
  constructor(rutaBase, subRuta, idOpcionSelect) {
    this.rutaBase = rutaBase;

    const opcionesInventario = [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: unirRutas(rutaBase, subRuta, "inventario"),
      },
    ];

    if (!SUB_RUTAS_SIN_PRODUCCION.has(subRuta)) {
      opcionesInventario.push({
        titulo: "Produccion",
        icono: Factory,
        ruta: unirRutas(rutaBase, subRuta, "produccion"),
      });
    }

    this.grupos = [
      {
        idOp: 1,
        opciones: opcionesInventario,
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