import { describe, expect, it } from 'vitest';
import { ESTILO_STOCK, estadoStock } from '@/utils/stock';
import { esBloqueoPorConteo, textoMovimientosBloqueados, vistaBloqueada } from '@/utils/bloqueoProducto';
import { resolverRutaQR } from '@/utils/QR';
import { composicionFormato, productosActivosDelTipo, soloActivos } from '@/utils/catalogo';

const UMBRALES = { StockMinimo: 5, StockPreventivo: 10 };

describe('estadoStock coincide con nivel_stock del backend', () => {
  it.each([
    [0, 'agotado'],
    [-2, 'agotado'],
    [null, 'agotado'],
    [1, 'critico'],
    [5, 'critico'],
    [6, 'bajo'],
    [10, 'bajo'],
    [11, 'disponible'],
  ])('%s unidades → %s', (cantidad, esperado) => {
    expect(estadoStock(cantidad, UMBRALES)).toBe(esperado);
  });

  it('sin umbrales configurados solo distingue agotado y disponible', () => {
    expect(estadoStock(1)).toBe('disponible');
    expect(estadoStock(0)).toBe('agotado');
  });

  it('cada estado tiene su texto y estilo', () => {
    expect(Object.keys(ESTILO_STOCK).sort()).toEqual(['agotado', 'bajo', 'critico', 'disponible']);
    expect(ESTILO_STOCK.critico.texto).toBe('Stock crítico');
  });
});

describe('bloqueo de producto terminado', () => {
  const manual = { Bloqueado: true, BloqueaIngreso: true, BloqueaCorreccion: false, BloqueaSalida: true };
  const conteo = { Bloqueado: true, IdConteoProductoTerminado: 3, BloqueaIngreso: true, BloqueaCorreccion: true, BloqueaSalida: true };

  it.each([
    ['ingreso', true],
    ['correccion', false],
    ['salida', true],
  ])('bloqueo manual: vista %s bloqueada %s', (vista, esperado) => {
    expect(vistaBloqueada(manual, vista)).toBe(esperado);
  });

  it('un conteo físico bloquea todas las vistas', () => {
    expect(esBloqueoPorConteo(conteo)).toBe(true);
    expect(['ingreso', 'correccion', 'salida', 'ajuste'].every((v) => vistaBloqueada(conteo, v))).toBe(true);
  });

  it('sin bloqueo nada está bloqueado', () => {
    expect(vistaBloqueada({ Bloqueado: false }, 'ingreso')).toBe(false);
    expect(vistaBloqueada(null, 'ingreso')).toBe(false);
  });

  it.each([
    [{ BloqueaIngreso: true }, 'Ingreso bloqueado'],
    [{ BloqueaSalida: true }, 'Salida bloqueada'],
    [{ BloqueaCorreccion: true, BloqueaSalida: true }, 'Corrección y salida bloqueadas'],
    [{ BloqueaIngreso: true, BloqueaCorreccion: true, BloqueaSalida: true }, 'Ingreso, corrección y salida bloqueados'],
    [{}, ''],
  ])('texto del aviso %j', (campos, esperado) => {
    expect(textoMovimientosBloqueados({ Bloqueado: true, ...campos })).toBe(esperado);
  });

  it('el aviso del conteo tiene su propio texto', () => {
    expect(textoMovimientosBloqueados(conteo)).toBe('Movimientos bloqueados por conteo físico');
  });
});

describe('resolverRutaQR antepone el prefijo del usuario que escanea', () => {
  const ORIGEN = 'https://blanquita.example';

  it.each([
    ['operador', '/operador/producto/ingreso'],
    ['encargado', '/encargado/producto/ingreso'],
    ['gerente', '/gerente/producto/ingreso'],
  ])('el mismo cartel lleva al %s a su propia ruta', (prefijo, esperado) => {
    expect(resolverRutaQR('/producto/ingreso', ORIGEN, prefijo)).toEqual({ ruta: esperado });
  });

  it('acepta una URL completa del mismo sitio y conserva los parámetros', () => {
    expect(resolverRutaQR(`${ORIGEN}/rodela/inventario?tipo=2`, ORIGEN, 'operador')).toEqual({
      ruta: '/operador/rodela/inventario?tipo=2',
    });
  });

  it.each(['https://otro-sitio.com/producto', '//evil.com/x', 'texto cualquiera'])('rechaza %s', (valor) => {
    expect(resolverRutaQR(valor, ORIGEN, 'operador')).toEqual({ error: 'Este código no pertenece al sistema.' });
  });

  it.each(['', '   ', null, 42])('un código ilegible (%s) pide reintentar', (valor) => {
    expect(resolverRutaQR(valor, ORIGEN, 'operador').error).toBe('El código no se pudo leer. Intenta de nuevo.');
  });
});

describe('catálogos', () => {
  it('soloActivos filtra los inactivos de lo que devuelve el servicio', async () => {
    const cargar = async () => [{ Id: 1, Activo: true }, { Id: 2, Activo: false }];

    expect(await soloActivos(cargar)()).toEqual([{ Id: 1, Activo: true }]);
  });

  it('productosActivosDelTipo para iniciar producción', () => {
    const productos = [
      { IdProducto: 1, IdTipoBobina: 1, Activo: true },
      { IdProducto: 2, IdTipoBobina: 1, Activo: false },
      { IdProducto: 3, IdTipoBobina: 2, Activo: true },
    ];

    expect(productosActivosDelTipo(productos, 1).map((p) => p.IdProducto)).toEqual([1]);
  });

  it('composicionFormato describe las sub-bobinas', () => {
    expect(composicionFormato({ Detalle: [{ Cantidad: 2, MedidaMm: 435 }, { Cantidad: 1, MedidaMm: 220 }] })).toBe(
      '2 de 435 · 1 de 220',
    );
    expect(composicionFormato(null)).toBe('');
  });
});
