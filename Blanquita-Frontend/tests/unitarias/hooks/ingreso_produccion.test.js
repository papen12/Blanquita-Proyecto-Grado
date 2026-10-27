import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { codigosRepetidos, erroresPorFila, useEnvioLote, useFilasLote } from '@/hooks/useIngresoLote';
import { motivoValido, useProduccion } from '@/hooks/useProduccion';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  window.scrollTo = vi.fn();
});

describe('validación de filas del lote', () => {
  it('detecta códigos repetidos aunque estén escritos distinto', () => {
    expect(codigosRepetidos(['bp 0001', 'BP-0001', 'bp-0002', '', 'BP-0003'])).toEqual(new Set(['BP-0001']));
  });

  it('erroresPorFila solo guarda las filas con error', () => {
    const filas = [{ id: 0, peso: '736' }, { id: 1, peso: '' }];

    expect(erroresPorFila(filas, (f) => (f.peso ? '' : 'Falta el peso'))).toEqual({ 1: 'Falta el peso' });
  });
});

describe('useFilasLote', () => {
  const filaVacia = () => ({ CodigoBobina: '', PesoBrutoKg: '' });

  it('empieza con una fila y agrega filas con id propio', () => {
    const alCambiar = vi.fn();
    const { result } = renderHook(() => useFilasLote(filaVacia, alCambiar));

    act(() => result.current.agregarFila());
    act(() => result.current.agregarFila());

    expect(result.current.filas.map((f) => f.id)).toEqual([0, 1, 2]);
    expect(alCambiar).toHaveBeenCalledTimes(2);
  });

  it('actualiza solo la fila indicada', () => {
    const { result } = renderHook(() => useFilasLote(filaVacia, vi.fn()));
    act(() => result.current.agregarFila());

    act(() => result.current.actualizarFila(1, 'CodigoBobina', 'BP-0002'));

    expect(result.current.filas.map((f) => f.CodigoBobina)).toEqual(['', 'BP-0002']);
  });

  it('nunca deja el lote sin filas', () => {
    const { result } = renderHook(() => useFilasLote(filaVacia, vi.fn()));

    act(() => result.current.quitarFila(0));

    expect(result.current.filas).toHaveLength(1);
  });

  it('reiniciar deja una sola fila vacía nueva', () => {
    const { result } = renderHook(() => useFilasLote(filaVacia, vi.fn()));
    act(() => result.current.agregarFila());
    act(() => result.current.actualizarFila(0, 'CodigoBobina', 'BP-0001'));

    act(() => result.current.reiniciar());

    expect(result.current.filas).toHaveLength(1);
    expect(result.current.filas[0].CodigoBobina).toBe('');
  });
});

describe('useEnvioLote', () => {
  it('no abre la confirmación si hay errores', () => {
    const { result } = renderHook(() => useEnvioLote());

    act(() => result.current.pedirConfirmacion(() => 'Hay 2 bobinas con errores'));

    expect(result.current.confirmando).toBe(false);
    expect(result.current.errorEnvio).toBe('Hay 2 bobinas con errores');
    expect(result.current.tocado).toBe(true);
  });

  it('con datos válidos abre la confirmación', () => {
    const { result } = renderHook(() => useEnvioLote());

    act(() => result.current.pedirConfirmacion(() => ''));

    expect(result.current.confirmando).toBe(true);
  });

  it('guardar exitoso entrega el resultado y cierra la confirmación', async () => {
    const alGuardar = vi.fn();
    const { result } = renderHook(() => useEnvioLote());
    act(() => result.current.pedirConfirmacion(() => ''));

    await act(() =>
      result.current.guardar({ validar: () => '', enviar: async () => ({ CantidadBobinas: 3 }), alGuardar }),
    );

    expect(alGuardar).toHaveBeenCalledWith({ CantidadBobinas: 3 });
    expect(result.current.resultado).toEqual({ CantidadBobinas: 3 });
    expect(result.current.confirmando).toBe(false);
    expect(result.current.enviando).toBe(false);
    expect(result.current.tocado).toBe(false);
  });

  it('si el backend rechaza el lote muestra el error y no limpia el formulario', async () => {
    const alGuardar = vi.fn();
    const { result } = renderHook(() => useEnvioLote());

    await act(() =>
      result.current.guardar({
        validar: () => '',
        enviar: async () => { throw new Error('Ya existen bobinas registradas con los códigos BP-0002'); },
        alGuardar,
      }),
    );

    expect(result.current.errorEnvio).toBe('Ya existen bobinas registradas con los códigos BP-0002');
    expect(toast.error).toHaveBeenCalledWith('Ya existen bobinas registradas con los códigos BP-0002');
    expect(alGuardar).not.toHaveBeenCalled();
    expect(result.current.confirmando).toBe(false);
  });

  it('si la validación falla al guardar no envía nada', async () => {
    const enviar = vi.fn();
    const { result } = renderHook(() => useEnvioLote());

    await act(() => result.current.guardar({ validar: () => 'Falta el proveedor', enviar, alGuardar: vi.fn() }));

    expect(enviar).not.toHaveBeenCalled();
    expect(result.current.errorEnvio).toBe('Falta el proveedor');
  });
});

describe('motivoValido', () => {
  it.each([
    ['', false],
    ['    abcd    ', false],
    ['abcde', true],
    ['x'.repeat(150), true],
    ['x'.repeat(151), false],
  ])('"%s" → %s', (texto, esperado) => {
    expect(motivoValido(texto)).toBe(esperado);
  });
});

describe('useProduccion', () => {
  const ACTIVA = { IdProduccionBobinaTubo: 10 };
  const PAUSADA = { IdProduccionBobinaTubo: 11 };

  const crear = () => {
    const servicios = {
      verActivas: vi.fn().mockResolvedValue([ACTIVA]),
      verPausadas: vi.fn().mockResolvedValue([PAUSADA]),
      idDe: (p) => p.IdProduccionBobinaTubo,
      pausar: vi.fn().mockResolvedValue({}),
      cancelar: vi.fn().mockResolvedValue({}),
      finalizar: vi.fn().mockResolvedValue({}),
      reanudar: vi.fn().mockResolvedValue({}),
    };
    const hook = renderHook(() => useProduccion(servicios));
    return { servicios, ...hook };
  };

  it('carga las producciones activas y pausadas al montar', async () => {
    const { result } = crear();

    await waitFor(() => expect(result.current.activas.cargando).toBe(false));
    await waitFor(() => expect(result.current.pausadas.cargando).toBe(false));
    expect(result.current.activas.datos).toEqual([ACTIVA]);
    expect(result.current.pausadas.datos).toEqual([PAUSADA]);
  });

  it('pausar con motivo corto no llama al backend', async () => {
    const { result, servicios } = crear();
    act(() => result.current.pausa.abrir(ACTIVA));
    act(() => result.current.pausa.setMotivo('abc'));

    await act(() => result.current.pausa.confirmar());

    expect(servicios.pausar).not.toHaveBeenCalled();
    expect(result.current.pausa.error).toBe('El motivo de la pausa debe tener entre 5 y 150 caracteres');
    expect(result.current.pausa.abierto).toBe(true);
  });

  it('pausar envía el id y el motivo limpio, cierra el diálogo y recarga ambas listas', async () => {
    const { result, servicios } = crear();
    await waitFor(() => expect(result.current.activas.cargando).toBe(false));
    act(() => result.current.pausa.abrir(ACTIVA));
    act(() => result.current.pausa.setMotivo('  Falta de pegamento  '));

    await act(() => result.current.pausa.confirmar());

    expect(servicios.pausar).toHaveBeenCalledWith(10, 'Falta de pegamento');
    expect(toast.success).toHaveBeenCalledWith('Producción pausada');
    expect(result.current.pausa.abierto).toBe(false);
    expect(servicios.verActivas).toHaveBeenCalledTimes(2);
    expect(servicios.verPausadas).toHaveBeenCalledTimes(2);
  });

  it('si el backend rechaza la cancelación el diálogo sigue abierto con el mensaje', async () => {
    const { result, servicios } = crear();
    servicios.cancelar.mockRejectedValue(Object.assign(new Error('x'), { detail: 'La producción no está en Pausa' }));
    act(() => result.current.cancelacion.abrir(PAUSADA));
    act(() => result.current.cancelacion.setMotivo('Bobina rasgada'));

    await act(() => result.current.cancelacion.confirmar());

    expect(result.current.cancelacion.error).toBe('La producción no está en Pausa');
    expect(result.current.cancelacion.abierto).toBe(true);
    expect(result.current.cancelacion.enviando).toBe(false);
  });

  it('finalizar con menos de 50 logs muestra el error del backend', async () => {
    const { result, servicios } = crear();
    servicios.finalizar.mockRejectedValue(
      Object.assign(new Error('x'), { detail: 'La producción tiene 20 logs registrados; necesita al menos 50' }),
    );
    act(() => result.current.finalizacion.abrir(ACTIVA));

    await act(() => result.current.finalizacion.confirmar());

    expect(servicios.finalizar).toHaveBeenCalledWith(10);
    expect(toast.error).toHaveBeenCalledWith('La producción tiene 20 logs registrados; necesita al menos 50');
    expect(result.current.finalizacion.abierto).toBe(true);
  });

  it('finalizar con éxito cierra el diálogo', async () => {
    const { result } = crear();
    act(() => result.current.finalizacion.abrir(ACTIVA));

    await act(() => result.current.finalizacion.confirmar());

    expect(toast.success).toHaveBeenCalledWith('Producción finalizada');
    expect(result.current.finalizacion.abierto).toBe(false);
  });

  it('reanudar marca la producción en proceso mientras se envía', async () => {
    const { result, servicios } = crear();
    let terminar;
    servicios.reanudar.mockReturnValue(new Promise((r) => { terminar = r; }));
    act(() => result.current.reanudar(PAUSADA));
    act(() => result.current.reanudacion.setMotivo('Llegó el pegamento'));

    act(() => {
      result.current.reanudacion.confirmar();
    });

    expect(result.current.procesandoId).toBe(11);
    await act(async () => terminar({}));
    expect(result.current.procesandoId).toBeNull();
  });
});
