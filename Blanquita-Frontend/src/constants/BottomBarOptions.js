import { Home, Boxes, Factory, PackagePlus } from "lucide-react";

export class BottomBarRoutes {
  constructor(rutaBase, subRuta) {
    this.rutaBase = rutaBase;
    this.opciones = [
      {
        titulo: "Inventario",
        icono: Boxes,
        ruta: `${rutaBase}/${subRuta}/inventario`,
      },
      {
        titulo: "Produccion",
        icono: Boxes,
        ruta: `${rutaBase}/${subRuta}/produccion`,
      },
    ];
  }
}
