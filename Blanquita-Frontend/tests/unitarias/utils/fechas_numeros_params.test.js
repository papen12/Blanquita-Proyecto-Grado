import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  aFechaISO,
  dateFormatter,
  dateOnlyFormatter,
  diaSemanaCorto,
  formatearDuracion,
  formatearSegundos,
  hoyISO,
  segundosDesde,
} from '@/utils/dates';
import { formatearNumero } from '@/utils/numeros';
import { conQueryParams, construirQueryParams } from '@/utils/params';

describe('fechas en hora de La Paz', () => {
  it('dateFormatter convierte UTC a La Paz (UTC-4)', () => {
    expect(dateFormatter('2026-10-27T14:30:05Z')).toBe('27/10/2026, 10:30:05');
  });

  it('dateFormatter pasa al día anterior antes de las 04:00 UTC', () => {
    expect(dateFormatter('2026-10-27T02:05:00Z')).toBe('26/10/2026, 22:05:00');
  });

  it('dateOnlyFormatter no se corre de día por la zona horaria', () => {
    expect(dateOnlyFormatter('2026-10-01')).toBe('1 de oct, 2026');
  });

  it('diaSemanaCorto para los gráficos', () => {
    expect(diaSemanaCorto('2026-10-27')).toBe('mar 27');
  });

  it('aFechaISO para los filtros', () => {
    expect(aFechaISO(new Date(2026, 9, 5))).toBe('2026-10-05');
    expect(aFechaISO(null)).toBeNull();
  });

  describe('con reloj fijo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 9, 27, 10, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('hoyISO usa la fecha local', () => {
      expect(hoyISO()).toBe('2026-10-27');
    });

    it('segundosDesde mide el tiempo de una pausa', () => {
      expect(segundosDesde(new Date(2026, 9, 27, 7, 30, 0))).toBe(9000);
    });

    it('segundosDesde nunca es negativo ni falla sin fecha', () => {
      expect(segundosDesde(new Date(2026, 9, 27, 11, 0, 0))).toBe(0);
      expect(segundosDesde(null)).toBe(0);
    });
  });
});

describe('duraciones', () => {
  it.each([
    ['PT2H5M', '2h 05m'],
    ['PT45M30S', '0h 45m'],
    ['P1DT3H', '27h 00m'],
    ['PT0S', '0h 00m'],
    [null, '-'],
    ['no-es-iso', '-'],
  ])('formatearDuracion(%s) = %s', (entrada, esperado) => {
    expect(formatearDuracion(entrada)).toBe(esperado);
  });

  it.each([
    [0, '0m'],
    [59, '0m'],
    [600, '10m'],
    [7500, '2h 05m'],
    [-30, '0m'],
    ['abc', '0m'],
  ])('formatearSegundos(%s) = %s', (segundos, esperado) => {
    expect(formatearSegundos(segundos)).toBe(esperado);
  });
});

describe('formatearNumero en formato boliviano', () => {
  it('usa coma decimal y punto de miles', () => {
    expect(formatearNumero(20941.5)).toBe('20.941,50');
  });

  it('respeta los decimales mínimos y máximos', () => {
    expect(formatearNumero(736, { decimales: 2, decimalesMinimos: 0 })).toBe('736');
    expect(formatearNumero(13.987, { decimales: 1 })).toBe('14,0');
  });

  it('muestra el texto de vacío solo si se pide', () => {
    expect(formatearNumero(null, { vacio: '-' })).toBe('-');
    expect(formatearNumero(null)).toBe('0,00');
  });
});

describe('parámetros de consulta para los reportes', () => {
  it('omite los filtros vacíos y repite los arreglos', () => {
    const params = construirQueryParams({
      FechaInicio: '2026-10-01',
      IdTurno: null,
      Busqueda: '',
      Estados: ['Abierto', 'Cerrado'],
      IdProducto: 0,
    });

    expect(params.toString()).toBe('FechaInicio=2026-10-01&Estados=Abierto&Estados=Cerrado&IdProducto=0');
  });

  it('conQueryParams no agrega ? si no hay filtros', () => {
    expect(conQueryParams('/api/productofinal/reportes/salidas', { IdTurno: undefined })).toBe(
      '/api/productofinal/reportes/salidas',
    );
    expect(conQueryParams('/api/x', { IdTurno: 2 })).toBe('/api/x?IdTurno=2');
  });
});
