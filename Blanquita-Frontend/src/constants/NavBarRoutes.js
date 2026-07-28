
import { Home, Boxes, Factory,Database } from "lucide-react";
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
      { titulo: "Producción", icono: Factory, ruta: "produccion" },
    ],
  },
];

export const PREFIJO_POR_ROL = {
  1: "operador",
  2: "encargado",
};