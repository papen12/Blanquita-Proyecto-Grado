import { describe, expect, it } from 'vitest';
import { aCodigo, alternarMotivoEnTexto, ArrayFilter, codigoFinal } from '@/utils/handlers';
import { CODIGO_MAX } from '@/constants/Values';

describe('normalización de códigos de materia prima', () => {
  it.each([
    ['bp-0012', 'BP-0012'],
    ['lote 15', 'LOTE-15'],
    ['  lote   15  ', 'LOTE-15'],
    ['café', 'CAFE'],
    ['árbol índigo', 'ARBOL-INDIGO'],
    ['peña', 'PEÑA'],
    ['AÑO 2026', 'AÑO-2026'],
    ['a--b---c', 'A-B-C'],
    ['-ab-', 'AB'],
    ['a - b', 'A-B'],
    ['pingüino', 'PINGUINO'],
  ])('%s queda como %s, igual que en el backend', (entrada, esperado) => {
    expect(codigoFinal(entrada)).toBe(esperado);
  });

  it('mientras se escribe conserva el guion final para poder seguir tecleando', () => {
    expect(aCodigo('bp ')).toBe('BP-');
    expect(codigoFinal('bp ')).toBe('BP');
  });

  it('descarta los símbolos que el backend rechazaría', () => {
    expect(codigoFinal('bp_12#.')).toBe('BP12');
  });

  it(`corta el código en ${CODIGO_MAX} caracteres`, () => {
    expect(aCodigo('x'.repeat(CODIGO_MAX + 10))).toHaveLength(CODIGO_MAX);
  });
});

describe('alternarMotivoEnTexto', () => {
  it('agrega el primer motivo a un texto vacío', () => {
    expect(alternarMotivoEnTexto('Falta de pegamento', '')).toBe('Falta de pegamento');
  });

  it('separa con punto los motivos acumulados', () => {
    expect(alternarMotivoEnTexto('Falta de personal', 'Falta de pegamento')).toBe(
      'Falta de pegamento. Falta de personal',
    );
  });

  it('no duplica el punto si el texto ya termina en punto', () => {
    expect(alternarMotivoEnTexto('Falla', 'Empalme BP-0003.')).toBe('Empalme BP-0003. Falla');
  });

  it('quita el motivo si ya estaba marcado', () => {
    expect(alternarMotivoEnTexto('Falta de pegamento', 'Falta de pegamento. Falta de personal')).toBe(
      'Falta de personal',
    );
  });
});

describe('ArrayFilter', () => {
  it('filtra por la primera clave que empieza con Id', () => {
    const tipos = [
      { IdTipoBobina: 1, Nombre: 'Higiénico' },
      { IdTipoBobina: 2, Nombre: 'Toalla' },
      { IdTipoBobina: 3, Nombre: 'Económico' },
    ];

    expect(ArrayFilter([1, 3], tipos).map((t) => t.Nombre)).toEqual(['Higiénico', 'Económico']);
  });

  it('con una lista vacía devuelve vacío', () => {
    expect(ArrayFilter([1], [])).toEqual([]);
  });
});
