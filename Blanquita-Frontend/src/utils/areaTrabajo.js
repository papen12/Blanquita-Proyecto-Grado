import {
  AREAS_TRABAJO,
  CLAVE_AREA_TRABAJO,
  AREA_POR_DEFECTO,
} from "@/constants/OperadorConfig";
import { PREFIJO_POR_ROL } from "@/constants/Values";
export const getArea = (id) => AREAS_TRABAJO.find((a) => a.id === id) ?? null;
export const idAreaPorDefecto = () =>
  getArea(AREA_POR_DEFECTO)?.id ?? AREAS_TRABAJO[0].id;

export function leerAreaGuardada() {
  try {
    return getArea(localStorage.getItem(CLAVE_AREA_TRABAJO));
  } catch {
    return null;
  }
}

export function guardarArea(id) {
  try {
    if (getArea(id)) localStorage.setItem(CLAVE_AREA_TRABAJO, id);
  } catch {
  }
}

export function limpiarArea() {
  try {
    localStorage.removeItem(CLAVE_AREA_TRABAJO);
  } catch {
  }
}

export function areaInicial() {
  return leerAreaGuardada() ?? getArea(AREA_POR_DEFECTO) ?? AREAS_TRABAJO[0];
}

export function rutaAcceso(idRol, area, subruta) {
  const prefijo = PREFIJO_POR_ROL[idRol] ?? "operador";
  return `/${prefijo}/${area.ruta}/${subruta.ruta}`;
}
