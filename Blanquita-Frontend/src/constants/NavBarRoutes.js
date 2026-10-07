import {
  Home,
  Boxes,
  Factory,
  Database,
  ShelvingUnit,
  SquareStack,
  Container,
  CircleUserRound,
  ClipboardList,
  Combine,QrCode,UserShield,Users
} from "lucide-react";
import { toiletRoll } from "@lucide/lab";
import { Roles } from "@/constants/Values";

export function rutaDeItem(item, basePath, prefijo) {
  if (item.absoluta) return item.ruta;
  if (item.ruta === "") return `${prefijo}/inicio`;
  return `${basePath}/${item.ruta}`;
}

export function rutasVisibles(rutas, idRol, esAdmin) {
  return rutas.filter(
    (item) =>
      (!item.isLider || idRol === Roles.Encargado) && (!item.soloAdmin || esAdmin),
  );
}

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
    titulo: "Bobina Servilleta",
    icono: SquareStack,
    ruta: "bobina-servilleta",
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

  {
    titulo: "Empaque",
    icono: Container,
    ruta: "empaque",
    subrutas: [
      {
        titulo: "Bobina",
        icono: Database,
        ruta: "bobina-inventario",
      },
    ],
  },

  {
    titulo: "Productos",
    icono: ShelvingUnit,
    ruta: "producto",
    subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
      { titulo: "Movimientos", icono: Combine, ruta: "movimientos" },
    ],
  },
  {
    titulo: "Reportes",
    icono: ClipboardList,
    ruta: "reportes/inicio",
    isLider: true,
  },
  {
    titulo: "Administrador",
    icono: UserShield,
    ruta: "admin/inicio",
    absoluta: true,
    soloAdmin: true,
  },
  {
    titulo: "Perfil",
    icono: CircleUserRound,
    ruta: "perfil",
  },
];

export const RutasReportes = [
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
    titulo: "Bobina Servilleta",
    icono: SquareStack,
    ruta: "bobina-servilleta",
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
    titulo: "Productos",
    icono: ShelvingUnit,
    ruta: "producto",
    subrutas: [
      { titulo: "Inventario", icono: Boxes, ruta: "inventario" },
      { titulo: "Producción", icono: Factory, ruta: "produccion" },
    ],
  },
   {
    titulo:"Códigos Qr",
    icono:QrCode,
    ruta:"qr",
  },
  {
    titulo: "Volver a la Planta",
    icono: Factory,
    ruta: "",
  },
];



export const RutasAdmin=
[
  {
    titulo:"Usuarios",
    icono:Users,
    ruta:"/usuarios"
  }
]
