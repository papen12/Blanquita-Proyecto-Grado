import { describe, expect, it } from 'vitest';
import { aMedida, errorMedida, fueraDeRango, textoRango } from '@/utils/medidas';
import {
  DECIMALES_TONELADAS,
  PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG,
  PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG,
  PESO_BRUTO_NORMAL_BOBINA_PAPEL_KG,
  PESO_NORMAL_UNIDAD_SERVILLETA_KG,
  TONELADAS_NORMALES_PEDIDO,
} from '@/constants/Values';

const PESO_BRUTO = {
  etiqueta: 'El peso bruto',
  unidad: 'kg',
  minimo: PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG,
  maximo: PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG,
};

describe('aMedida limpia lo que escribe el usuario', () => {
  it.each([
    ['736,5', '736.5'],
    ['736.567', '736.56'],
    ['00736', '736'],
    ['7a3b6 kg', '736'],
    ['-736', '736'],
    ['1234567', '12345'],
    ['', ''],
    [null, ''],
    ['0.5', '0.5'],
  ])('%s queda como %s', (entrada, esperado) => {
    expect(aMedida(entrada)).toBe(esperado);
  });

  it('acepta tres decimales en toneladas', () => {
    expect(aMedida('1,23456', DECIMALES_TONELADAS)).toBe('1.234');
  });

  it('sin decimales devuelve solo la parte entera', () => {
    expect(aMedida('435.7', 0)).toBe('435');
  });

  it('une varios puntos en uno solo', () => {
    expect(aMedida('7.3.6')).toBe('7.36');
  });
});

describe('errorMedida aplica los mismos límites duros que el backend', () => {
  it.each(['736', '100', '1500', 736])('%s kg es válido', (valor) => {
    expect(errorMedida(valor, PESO_BRUTO)).toBeNull();
  });

  it.each(['99.99', '1500.01', '0', 'abc'])('%s kg da el mensaje con el rango', (valor) => {
    expect(errorMedida(valor, PESO_BRUTO)).toBe('El peso bruto entre 100 y 1.500 kg');
  });

  it('vacío y obligatorio pide el dato', () => {
    expect(errorMedida('', PESO_BRUTO)).toBe('Falta el peso bruto');
  });

  it('vacío y opcional no es error', () => {
    expect(errorMedida(null, { ...PESO_BRUTO, obligatorio: false })).toBeNull();
  });

  it('sin mínimo exige mayor a cero', () => {
    expect(errorMedida('0', { etiqueta: 'El gramaje', unidad: 'g/m²', maximo: 50 })).toBe(
      'El gramaje mayor a 0 y hasta 50 g/m²',
    );
  });
});

describe('fueraDeRango detecta valores inusuales para el aviso de confirmación', () => {
  it.each([
    ['599.99', true],
    ['600', false],
    ['950', false],
    ['950.01', true],
    ['', false],
    [null, false],
    ['abc', false],
  ])('papel %s kg → inusual %s', (valor, esperado) => {
    expect(fueraDeRango(valor, PESO_BRUTO_NORMAL_BOBINA_PAPEL_KG)).toBe(esperado);
  });

  it('servilleta de 370 kg está en el rango normal', () => {
    expect(fueraDeRango('370', PESO_NORMAL_UNIDAD_SERVILLETA_KG)).toBe(false);
  });
});

describe('textoRango', () => {
  it('describe el rango normal con formato boliviano', () => {
    expect(textoRango(PESO_BRUTO_NORMAL_BOBINA_PAPEL_KG, 'kg')).toBe('600 a 950 kg');
    expect(textoRango(TONELADAS_NORMALES_PEDIDO, 't', DECIMALES_TONELADAS)).toBe('0,5 a 10 t');
  });
});
