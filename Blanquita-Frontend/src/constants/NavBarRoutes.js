import { 
        Home, Boxes, Factory,Database,
        ShelvingUnit,SquareStack, Container,PackagePlus
      } from "lucide-react";
import { toiletRoll } from "@lucide/lab";
export const RutasNavBar = [
  {
    titulo: "Inicio",
    icono: Home,
    ruta: "inicio",
  },
  {
    titulo: "Bobina Papel",
    icono: toiletRoll,
    esIconoLab: true, 
    ruta: "bobina-papel",
    subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
      { titulo: "Producción", icono: Factory, ruta: "produccion" },
    ],
  },
  {
    titulo: "Rodela",
    icono: Database,
    ruta: "rodela",
    subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
    ],
  },
  {
    titulo:"Bobina Servilleta",
    icono:SquareStack,
    ruta:"bobina-servilleta",
     subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
      { titulo: "Producción", icono: Factory, ruta: "produccion" },
    ],
  },
  {
    titulo:"Empaque",
    icono:Container,
    ruta:"empaque",
    subrutas:[
      {
        titulo:"Bobina",icono:Database,ruta:"bobina-inventario"
      }
    ]
  },
  {
    titulo:"Productos",
    icono:ShelvingUnit,
    ruta:"producto",
    subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
    ],
  }
];

