import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { useEjecutar } from '@/hooks/useEjecutar';
import { useCatalogo } from '@/hooks/useCatalogo';
import { useOpciones } from '@/hooks/useOpciones';
import { pedir, pedirJson } from '@/utils/api';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useEjecutar', () => {
  it('muestra el éxito y entrega el resultado', async () => {
    const alTerminar = vi.fn();
    const { result } = renderHook(() => useEjecutar());

    await act(() => result.current.ejecutar('guardar', async () => ({ Id: 5 }), (r) => `Guardado #${r.Id}`, alTerminar));

    expect(toast.success).toHaveBeenCalledWith('Guardado #5');
    expect(alTerminar).toHaveBeenCalledWith({ Id: 5 });
    expect(result.current.enProceso).toBeNull();
  });

  it('marca la acción en proceso mientras espera al backend', async () => {
    let terminar;
    const { result } = renderHook(() => useEjecutar());

    act(() => {
      result.current.ejecutar('salida', () => new Promise((r) => { terminar = r; }), 'Listo');
    });

    expect(result.current.enProceso).toBe('salida');
    await act(async () => terminar());
    expect(result.current.enProceso).toBeNull();
  });

  it('si el backend falla muestra su mensaje y no llama a alTerminar', async () => {
    const alTerminar = vi.fn();
    const { result } = renderHook(() => useEjecutar());

    await act(() =>
      result.current.ejecutar('ajuste', async () => { throw new Error('Stock insuficiente'); }, 'Listo', alTerminar),
    );

    expect(toast.error).toHaveBeenCalledWith('Stock insuficiente');
    expect(toast.success).not.toHaveBeenCalled();
    expect(alTerminar).not.toHaveBeenCalled();
    expect(result.current.enProceso).toBeNull();
  });
});

describe('useCatalogo', () => {
  it('carga al montar y avisa con los datos', async () => {
    const alCargar = vi.fn();
    const cargar = vi.fn().mockResolvedValue([{ IdProveedor: 1 }]);

    const { result } = renderHook(() => useCatalogo(cargar, alCargar));

    expect(result.current.cargando).toBe(true);
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toEqual([{ IdProveedor: 1 }]);
    expect(alCargar).toHaveBeenCalledWith([{ IdProveedor: 1 }]);
    expect(cargar).toHaveBeenCalledTimes(1);
  });

  it('si falla deja la lista vacía con el error', async () => {
    const { result } = renderHook(() => useCatalogo(vi.fn().mockRejectedValue(new Error('Sin conexión'))));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.error).toBe('Sin conexión');
    expect(result.current.datos).toEqual([]);
  });

  it('recargar vuelve a pedir y limpia el error', async () => {
    const cargar = vi.fn().mockRejectedValueOnce(new Error('Falla')).mockResolvedValueOnce([{ Id: 2 }]);
    const { result } = renderHook(() => useCatalogo(cargar));
    await waitFor(() => expect(result.current.error).toBe('Falla'));

    await act(() => result.current.recargar());

    expect(result.current.error).toBe('');
    expect(result.current.datos).toEqual([{ Id: 2 }]);
  });
});

describe('useOpciones', () => {
  it('carga las opciones de un select', async () => {
    const { result } = renderHook(() => useOpciones(vi.fn().mockResolvedValue([{ IdTurno: 1 }])));

    await waitFor(() => expect(result.current).toEqual([{ IdTurno: 1 }]));
  });

  it('si falla avisa con toast', async () => {
    renderHook(() => useOpciones(vi.fn().mockRejectedValue(new Error('No autorizado'))));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
  });
});

describe('cliente de la API', () => {
  it('pedirJson envía JSON y devuelve la respuesta', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    const datos = await pedirJson('/api/productofinal/salida', { method: 'POST', body: { Observacion: 'Despacho' } });

    expect(datos).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/productofinal/salida');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ Observacion: 'Despacho' });
    vi.unstubAllGlobals();
  });

  it('un GET no manda cuerpo ni Content-Type', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await pedir('/api/productofinal/bloqueo');

    expect(fetch.mock.calls[0][1]).toEqual({ method: 'GET', headers: {} });
    vi.unstubAllGlobals();
  });

  it('una respuesta de error se convierte en excepción con el mensaje del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Token expirado' }), { status: 401 })));

    await expect(pedirJson('/api/x')).rejects.toMatchObject({ message: 'Token expirado', status: 401 });
    vi.unstubAllGlobals();
  });
});
