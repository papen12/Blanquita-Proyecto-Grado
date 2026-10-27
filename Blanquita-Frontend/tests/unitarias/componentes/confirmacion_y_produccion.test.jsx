import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogoConfirmarLote } from '@/components/IngresoLote/comunes';
import { TarjetaProduccion } from '@/components/Produccion/comunes';

const DETALLES = [
  { etiqueta: 'Proveedor', valor: 'Papelera Andina' },
  { etiqueta: 'Tipo', valor: 'Higiénico' },
];

const renderizarDialogo = (props = {}) => {
  const onConfirmar = vi.fn();
  const onCancelar = vi.fn();
  render(
    <DialogoConfirmarLote
      abierto
      enviando={false}
      cantidad={3}
      unidad="bobinas"
      detalles={DETALLES}
      codigos={['BP-0001', 'BP-0002', 'BP-0003']}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
      {...props}
    />,
  );
  return { onConfirmar, onCancelar };
};

const botonConfirmar = () => screen.getByRole('button', { name: /confirmar ingreso/i });

describe('DialogoConfirmarLote', () => {
  it('muestra la cantidad, los detalles y los códigos a ingresar', () => {
    renderizarDialogo();

    expect(screen.getByText('3 bobinas')).toBeInTheDocument();
    expect(screen.getByText('Papelera Andina')).toBeInTheDocument();
    expect(screen.getByText('Códigos (3)')).toBeInTheDocument();
    expect(screen.getByText('BP-0002')).toBeInTheDocument();
  });

  it('no deja confirmar hasta marcar que se revisó el lote', async () => {
    const { onConfirmar } = renderizarDialogo();

    expect(botonConfirmar()).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox', { name: /revisé los códigos y la cantidad/i }));
    await userEvent.click(botonConfirmar());

    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('con valores inusuales exige una segunda casilla', async () => {
    renderizarDialogo({ inusuales: ['BP-0002: peso bruto 1200 kg fuera de lo normal (600 a 950 kg)'] });

    expect(screen.getByText('Valores fuera de lo común')).toBeInTheDocument();
    expect(screen.getByText(/BP-0002: peso bruto 1200 kg/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: /revisé los códigos y la cantidad/i }));
    expect(botonConfirmar()).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox', { name: /los valores son correctos/i }));
    expect(botonConfirmar()).toBeEnabled();
  });

  it('sin valores inusuales no aparece el aviso', () => {
    renderizarDialogo();

    expect(screen.queryByText('Valores fuera de lo común')).not.toBeInTheDocument();
  });

  it('mientras guarda no se puede confirmar ni volver', async () => {
    renderizarDialogo({ enviando: true });

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /volver a revisar/i })).toBeDisabled();
  });

  it('volver a revisar cancela sin confirmar', async () => {
    const { onCancelar, onConfirmar } = renderizarDialogo();

    await userEvent.click(screen.getByRole('button', { name: /volver a revisar/i }));

    expect(onCancelar).toHaveBeenCalled();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('al volver a abrir el diálogo las casillas empiezan desmarcadas', async () => {
    const props = {
      enviando: false, cantidad: 1, unidad: 'bobina', detalles: DETALLES, codigos: ['BP-0001'],
      onConfirmar: vi.fn(), onCancelar: vi.fn(),
    };
    const { rerender } = render(<DialogoConfirmarLote abierto {...props} />);
    await userEvent.click(screen.getByRole('checkbox'));

    rerender(<DialogoConfirmarLote abierto={false} {...props} />);
    rerender(<DialogoConfirmarLote abierto {...props} />);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});

describe('TarjetaProduccion según el rol', () => {
  const PRODUCCION = {
    NombreEstadoProduccion: 'En Producción',
    FechaInicioProduccion: '2026-10-27T12:00:00Z',
    NombreTurno: 'Mañana',
  };

  const acciones = (manejadores = {}) => [
    { tipo: 'insertar', onClick: manejadores.insertar },
    { tipo: 'pausar', onClick: manejadores.pausar },
    { tipo: 'finalizar', onClick: manejadores.finalizar },
  ];

  it('el operador o el líder ven los botones de acción', async () => {
    const pausar = vi.fn();
    render(
      <TarjetaProduccion
        produccion={PRODUCCION}
        encabezado={<span>BP-0001 + BP-0002</span>}
        acciones={acciones({ insertar: vi.fn(), pausar, finalizar: vi.fn() })}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /pausar/i }));

    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(pausar).toHaveBeenCalled();
  });

  it('el gerente (sin manejadores) ve la producción sin ningún botón', () => {
    render(<TarjetaProduccion produccion={PRODUCCION} encabezado={<span>BP-0001 + BP-0002</span>} acciones={acciones()} />);

    expect(screen.getByText('BP-0001 + BP-0002')).toBeInTheDocument();
    expect(screen.getByText('En Producción')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('muestra la hora de inicio en La Paz y el turno', () => {
    const { container } = render(<TarjetaProduccion produccion={PRODUCCION} encabezado={null} acciones={[]} />);

    expect(within(container).getByText('27/10/2026, 08:00:00')).toBeInTheDocument();
    expect(within(container).getByText('Turno: Mañana')).toBeInTheDocument();
  });

  it('una producción pausada muestra desde cuándo', () => {
    render(
      <TarjetaProduccion
        pausada
        produccion={{ NombreEstadoProduccion: 'Pausa', FechaHoraPausa: '2026-10-27T15:30:00Z' }}
        encabezado={null}
        acciones={[{ tipo: 'reanudar', onClick: vi.fn(), procesando: true }]}
      />,
    );

    expect(screen.getByText(/Pausada: 27\/10\/2026, 11:30:00/)).toBeInTheDocument();
    expect(screen.queryByText('Reanudar')).not.toBeInTheDocument();
  });
});
