import {
  Boxes,
  Factory,
  PackagePlus,
  Database,
  SquareStack,
  Container,
  ShelvingUnit,
} from "lucide-react";
import { toiletRoll } from "@lucide/lab";
export const movimientosOperador = [
  {
    IdTipoMovimientoOperadorLogs: 1,
    NombreMovimiento: "Ingreso",
    DescripcionTipoMovimientoOperadorLogs:
      "Registro de logs producidos por el operador durante el turno",
  },
  {
    IdTipoMovimientoOperadorLogs: 2,
    NombreMovimiento: "Descuento",
    DescripcionTipoMovimientoOperadorLogs:
      "Corrección que resta logs registrados por error",
  },
  {
    IdTipoMovimientoOperadorLogs: 3,
    NombreMovimiento: "Aumento",
    DescripcionTipoMovimientoOperadorLogs:
      "Corrección que suma logs no contabilizados previamente",
  },
];

export const ObservacionesInsertarLogs = [
  {
    id: 2, // Descuento: corrección que resta logs registrados por error
    motivos: [
      "Error de registro de logs",
      "Doble registro del mismo movimiento",
      "Cantidad ingresada mayor a la real",
      "Logs contabilizados de otra producción",
    ],
  },
  {
    id: 3, // Aumento: corrección que suma logs no contabilizados previamente
    motivos: [
      "Logs no registrados en el turno",
      "Cantidad ingresada menor a la real",
      "Registro omitido por falla del sistema",
      "Ajuste tras reconteo físico",
    ],
  },
];

export const CLAVE_AREA_TRABAJO = "operador.areaTrabajo";

export const AREA_POR_DEFECTO = "bobina-papel";

export const AREAS_TRABAJO = [
  {
    id: "bobina-papel",
    titulo: "Bobina Papel",
    descripcion: "Higiénico, toalla y económico",
    icono: toiletRoll,
    esIconoLab: true,
    ruta: "bobina-papel",
    idConjunto: 1,
    subrutas: [
      {
        titulo: "Inventario",
        descripcion: "Ver stock y enviar bobinas a producción",
        icono: Boxes,
        ruta: "Inventario",
      },
      {
        titulo: "Producción",
        descripcion: "Activas, pausas y registro de logs",
        icono: Factory,
        ruta: "produccion",
      },
    ],
  },
  {
    id: "bobina-servilleta",
    titulo: "Bobina Servilleta",
    descripcion: "Servilletera grande y pequeña",
    icono: SquareStack,
    ruta: "bobina-servilleta",
    idConjunto: 1,
    subrutas: [
      {
        titulo: "Inventario",
        descripcion: "Ver stock y enviar bobinas a producción",
        icono: Boxes,
        ruta: "inventario",
      },
      {
        titulo: "Producción",
        descripcion: "Activas, pausas y registro",
        icono: Factory,
        ruta: "produccion",
      },
    ],
  },
  {
    id: "rodela",
    titulo: "Rodela",
    descripcion: "Materia prima para tubos",
    icono: Database,
    ruta: "rodela",
    idConjunto: 2,
    subrutas: [
      {
        titulo: "Inventario",
        descripcion: "Palets y rodelas disponibles",
        icono: Boxes,
        ruta: "inventario",
      },
      {
        titulo: "Registrar ingreso",
        descripcion: "Ingreso de rodelas recibidas",
        icono: PackagePlus,
        ruta: "ingreso",
      },
    ],
  },
  {
    id: "empaque",
    titulo: "Empaque",
    descripcion: "Bolsas y bobinas de empaque",
    icono: Container,
    ruta: "empaque",
    idConjunto: 3,
    subrutas: [
      {
        titulo: "Inventario",
        descripcion: "Stock de empaque",
        icono: Boxes,
        ruta: "bobina-inventario",
      },
      {
        titulo: "Registrar ingreso",
        descripcion: "Ingreso de empaque recibido",
        icono: PackagePlus,
        ruta: "bobina-ingreso",
      },
    ],
  },
  {
    id: "producto",
    titulo: "Producto terminado",
    descripcion: "Inventario final",
    icono: ShelvingUnit,
    ruta: "producto",
    idConjunto: null,
    subrutas: [
      {
        titulo: "Inventario final",
        descripcion: "Existencias por presentación",
        icono: Boxes,
        ruta: "inventario",
      },
    ],
  },
];
