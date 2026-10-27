import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  areaInicial,
  getArea,
  guardarArea,
  idAreaPorDefecto,
  leerAreaGuardada,
  limpiarArea,
  rutaAcceso,
} from '@/utils/areaTrabajo';
import { guardarMensaje, tomarMensaje } from '@/utils/mensajeFlash';
import { AREA_POR_DEFECTO, CLAVE_AREA_TRABAJO } from '@/constants/OperadorConfig';
import { Roles } from '@/constants/Values';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('área de trabajo del operador', () => {
  it('el área por defecto es bobina papel', () => {
    expect(idAreaPorDefecto()).toBe(AREA_POR_DEFECTO);
    expect(areaInicial().id).toBe('bobina-papel');
  });

  it('recuerda el área elegida en el celular', () => {
    guardarArea('rodela');

    expect(localStorage.getItem(CLAVE_AREA_TRABAJO)).toBe('rodela');
    expect(leerAreaGuardada().id).toBe('rodela');
    expect(areaInicial().id).toBe('rodela');
  });

  it('no guarda un área que no existe', () => {
    guardarArea('contabilidad');

    expect(localStorage.getItem(CLAVE_AREA_TRABAJO)).toBeNull();
    expect(getArea('contabilidad')).toBeNull();
  });

  it('un valor viejo o manipulado vuelve al área por defecto', () => {
    localStorage.setItem(CLAVE_AREA_TRABAJO, 'area-borrada');

    expect(leerAreaGuardada()).toBeNull();
    expect(areaInicial().id).toBe(AREA_POR_DEFECTO);
  });

  it('limpiarArea borra la preferencia al cerrar sesión', () => {
    guardarArea('empaque');

    limpiarArea();

    expect(localStorage.getItem(CLAVE_AREA_TRABAJO)).toBeNull();
  });

  it('si el navegador bloquea el almacenamiento sigue funcionando', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => guardarArea('rodela')).not.toThrow();
    expect(leerAreaGuardada()).toBeNull();
    expect(areaInicial().id).toBe(AREA_POR_DEFECTO);
  });

  it.each([
    [Roles.Operador, '/operador/rodela/inventario'],
    [Roles.Encargado, '/encargado/rodela/inventario'],
    [99, '/operador/rodela/inventario'],
  ])('rutaAcceso para el rol %i', (rol, esperado) => {
    const area = getArea('rodela');

    expect(rutaAcceso(rol, area, area.subrutas?.[0] ?? { ruta: 'inventario' })).toBe(esperado);
  });
});

describe('mensaje flash entre páginas del panel admin', () => {
  it('se lee una sola vez', () => {
    guardarMensaje('Usuario creado');

    expect(tomarMensaje()).toBe('Usuario creado');
    expect(tomarMensaje()).toBeNull();
  });

  it('sin almacenamiento disponible no rompe la página', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => guardarMensaje('x')).not.toThrow();
    expect(tomarMensaje()).toBeNull();
  });
});
