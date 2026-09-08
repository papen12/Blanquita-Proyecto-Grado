import {
  AREAS_TRABAJO,
  CLAVE_AREA_TRABAJO,
  AREA_POR_DEFECTO,
} from "@/constants/OperadorConfig";
import { PREFIJO_POR_ROL } from "@/constants/Values";

/** Devuelve el área por su id, o null si no existe en el catálogo actual. */
export const getArea = (id) => AREAS_TRABAJO.find((a) => a.id === id) ?? null;

/** id del área usada en SSR y en la primera hidratación (siempre válido). */
export const idAreaPorDefecto = () =>
  getArea(AREA_POR_DEFECTO)?.id ?? AREAS_TRABAJO[0].id;

/** Lee el área guardada en localStorage. null si no hay, no es válida o el storage está bloqueado. */
export function leerAreaGuardada() {
  try {
    return getArea(localStorage.getItem(CLAVE_AREA_TRABAJO));
  } catch {
    return null;
  }
}

/** Persiste el área elegida. Ignora ids que no estén en el catálogo. */
export function guardarArea(id) {
  try {
    if (getArea(id)) localStorage.setItem(CLAVE_AREA_TRABAJO, id);
  } catch {
    /* storage no disponible: la selección solo vive en memoria */
  }
}

/** Borra la preferencia (p. ej. al cerrar sesión). */
export function limpiarArea() {
  try {
    localStorage.removeItem(CLAVE_AREA_TRABAJO);
  } catch {
    /* noop */
  }
}

/**
 * Área con la que arranca el inicio en el cliente:
 * la guardada, o la por defecto. No se persiste hasta el primer tap del operador.
 */
export function areaInicial() {
  return leerAreaGuardada() ?? getArea(AREA_POR_DEFECTO) ?? AREAS_TRABAJO[0];
}

/** URL completa de un acceso directo: `/operador/bobina-papel/Inventario`. */
export function rutaAcceso(idRol, area, subruta) {
  const prefijo = PREFIJO_POR_ROL[idRol] ?? "operador";
  return `/${prefijo}/${area.ruta}/${subruta.ruta}`;
}
