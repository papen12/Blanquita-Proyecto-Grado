import { Boxes, Factory, PackagePlus,Home,CircleUserRound } from "lucide-react";

export function unirRutas(...segmentos) {
  const limpios = segmentos
    .filter((s) => typeof s === "string" && s.trim() !== "")
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter((s) => s !== "");
  return "/" + limpios.join("/");
}

export const BottomBarOpciones = [
  {
    id: 1, // bobina-papel / bobina-servilleta: inventario + produccion
    opciones: [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: "inventario",
      },
      {
        titulo: "Produccion",
        icono: Factory,
        ruta: "produccion",
      },
    ],
  },
  {
    id: 2, // rodela: inventario + ingreso (no tiene produccion)
    opciones: [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: "inventario",
      },
      {
        titulo: "Ingreso",
        icono: PackagePlus,
        ruta: "ingreso",
      },
    ],
  },
  {
    id: 3, // empaque bobina: inventario + ingreso 
    opciones: [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: "bobina-inventario",
      },
      {
        titulo: "Ingreso",
        icono: PackagePlus,
        ruta: "bobina-ingreso",
      },
    ],
  },
  // inicio
  {
    id:4,
    opciones: [
      {
        titulo: "Inicio",
        icono: Home,
        ruta: "inicio",
      },
      {
        titulo: "Perfil",
        icono: CircleUserRound,
        ruta: "perfil",
      },
    ],
  }
];

export function resolverOpcionesConjunto(idConjunto, rutaBase, subRuta) {
  const conjunto = BottomBarOpciones.find((c) => c.id === idConjunto);

  if (!conjunto) {
    console.error("resolverOpcionesConjunto: idConjunto no válido ->", idConjunto);
    return [];
  }

  return conjunto.opciones.map((opcion) => ({
    ...opcion,
    ruta: unirRutas(rutaBase, subRuta, opcion.ruta),
  }));
}
