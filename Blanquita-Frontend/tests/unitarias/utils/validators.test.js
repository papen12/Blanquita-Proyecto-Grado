import { describe, expect, it } from 'vitest';
import {
  aEntero,
  errorCodigo,
  EsEncargado,
  EsGerente,
  extraerMensajeError,
  limpiarObservacion,
  manejarErrorBackend,
  numeroONulo,
  rutaDeRol,
  VeComoLider,
} from '@/utils/validators';
import { CODIGO_MAX, CODIGO_MIN, Roles } from '@/constants/Values';

describe('roles', () => {
  it.each([
    [Roles.Operador, false, false, false],
    [Roles.Encargado, true, false, true],
    [Roles.Gerente, false, true, true],
  ])('rol %i → encargado %s, gerente %s, ve como líder %s', (rol, encargado, gerente, lider) => {
    expect(EsEncargado(rol)).toBe(encargado);
    expect(EsGerente(rol)).toBe(gerente);
    expect(VeComoLider(rol)).toBe(lider);
  });

  it.each([
    [Roles.Operador, '/operador/producto/ingreso'],
    [Roles.Encargado, '/encargado/producto/ingreso'],
    [Roles.Gerente, '/gerente/producto/ingreso'],
  ])('rutaDeRol antepone el prefijo del rol %i', (rol, esperado) => {
    expect(rutaDeRol(rol, 'producto/ingreso')).toBe(esperado);
  });
});

describe('extraerMensajeError traduce las respuestas de FastAPI', () => {
  it('usa el detail de texto de una HTTPException', () => {
    expect(extraerMensajeError({ detail: 'Stock insuficiente' })).toBe('Stock insuficiente');
  });

  it('une los errores 422 de Pydantic sin el prefijo body', () => {
    const data = {
      detail: [
        { loc: ['body', 'CantidadLogs'], msg: 'Input should be greater than or equal to 1' },
        { loc: ['body', 'Bobinas', 0, 'CodigoBobina'], msg: 'Field required' },
      ],
    };

    expect(extraerMensajeError(data)).toBe(
      'CantidadLogs: Input should be greater than or equal to 1 | Bobinas.0.CodigoBobina: Field required',
    );
  });

  it('usa msg o message de un detail objeto', () => {
    expect(extraerMensajeError({ detail: { msg: 'Bloqueado' } })).toBe('Bloqueado');
  });

  it('usa message del cuerpo si no hay detail', () => {
    expect(extraerMensajeError({ message: 'Rate limit exceeded' })).toBe('Rate limit exceeded');
  });

  it('sin datos devuelve el mensaje por defecto', () => {
    expect(extraerMensajeError(undefined, 'Sin conexión')).toBe('Sin conexión');
  });
});

describe('manejarErrorBackend', () => {
  it('lanza un Error con el mensaje, el estado y el detalle', async () => {
    const respuesta = new Response(JSON.stringify({ detail: 'La producción no está en Pausa' }), { status: 409 });

    await expect(manejarErrorBackend(respuesta)).rejects.toMatchObject({
      message: 'La producción no está en Pausa',
      status: 409,
      detail: 'La producción no está en Pausa',
    });
  });

  it('si el cuerpo no es JSON usa el estado HTTP', async () => {
    const respuesta = new Response('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' });

    await expect(manejarErrorBackend(respuesta)).rejects.toThrow('Error 502: Bad Gateway');
  });
});

describe('conversiones de formularios', () => {
  it.each([
    ['5', 5],
    [12, 12],
    ['0', 0],
    ['-3', 0],
    ['2.5', 0],
    ['abc', 0],
  ])('aEntero(%s) = %i', (valor, esperado) => {
    expect(aEntero(valor)).toBe(esperado);
  });

  it.each([
    ['', null],
    [null, null],
    [undefined, null],
    ['13.9', 13.9],
    [0, 0],
  ])('numeroONulo(%s) = %s', (valor, esperado) => {
    expect(numeroONulo(valor)).toBe(esperado);
  });
});

describe('limpiarObservacion deja solo lo que acepta el backend', () => {
  it('quita símbolos no permitidos y conserva tildes y puntuación', () => {
    expect(limpiarObservacion('Ñandú: falla (máquina 2) #3 / 50% @ok!')).toBe('Ñandú: falla (máquina 2) #3 / 50 ok');
  });

  it('convierte tabulaciones y saltos de línea en espacios', () => {
    expect(limpiarObservacion('linea uno\nlinea\tdos')).toBe('linea uno linea dos');
  });
});

describe('errorCodigo', () => {
  it.each(['ABC', 'BP-0012', 'PEÑA-01', 'X'.repeat(CODIGO_MAX)])('%s es válido', (codigo) => {
    expect(errorCodigo(codigo)).toBe('');
  });

  it('vacío pide el código', () => {
    expect(errorCodigo('')).toBe('Falta el código');
  });

  it.each(['AB', 'X'.repeat(CODIGO_MAX + 1), 'BP--1', 'BP-', 'bp-1'])('%s es inválido', (codigo) => {
    expect(errorCodigo(codigo)).toBe(
      `Código inválido: ${CODIGO_MIN} a ${CODIGO_MAX} caracteres, solo letras, números y guiones`,
    );
  });
});
