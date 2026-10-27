import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InputCodigo from '@/components/layout/InputCodigo';
import InputMedida from '@/components/layout/InputMedida';
import { CODIGO_MAX, DECIMALES_TONELADAS } from '@/constants/Values';

function CodigoControlado({ onCambio = () => {} }) {
  const [valor, setValor] = useState('');
  return (
    <InputCodigo
      aria-label="Código de bobina"
      valor={valor}
      onCambio={(v) => {
        setValor(v);
        onCambio(v);
      }}
    />
  );
}

function MedidaControlada({ decimales }) {
  const [valor, setValor] = useState('');
  return <InputMedida aria-label="Peso bruto" valor={valor} onCambio={setValor} decimales={decimales} />;
}

describe('InputCodigo', () => {
  it('convierte en mayúsculas y quita tildes mientras se escribe', async () => {
    render(<CodigoControlado />);

    await userEvent.type(screen.getByLabelText('Código de bobina'), 'peña-01');

    expect(screen.getByLabelText('Código de bobina')).toHaveValue('PEÑA-01');
  });

  it('la barra espaciadora escribe un guion', async () => {
    render(<CodigoControlado />);

    await userEvent.type(screen.getByLabelText('Código de bobina'), 'bp 0001');

    expect(screen.getByLabelText('Código de bobina')).toHaveValue('BP-0001');
  });

  it('ignora los símbolos que no acepta el backend', async () => {
    const onCambio = vi.fn();
    render(<CodigoControlado onCambio={onCambio} />);

    await userEvent.type(screen.getByLabelText('Código de bobina'), 'bp#_.12');

    expect(screen.getByLabelText('Código de bobina')).toHaveValue('BP12');
  });

  it(`limita el campo a ${CODIGO_MAX} caracteres y lo muestra en monoespaciado`, () => {
    render(<CodigoControlado />);
    const input = screen.getByLabelText('Código de bobina');

    expect(input).toHaveAttribute('maxLength', String(CODIGO_MAX));
    expect(input).toHaveClass('font-mono');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });
});

describe('InputMedida', () => {
  it('acepta coma como separador decimal y la convierte en punto', async () => {
    render(<MedidaControlada />);

    await userEvent.type(screen.getByLabelText('Peso bruto'), '736,55');

    expect(screen.getByLabelText('Peso bruto')).toHaveValue('736.55');
  });

  it('no deja escribir más de 2 decimales en pesos', async () => {
    render(<MedidaControlada />);

    await userEvent.type(screen.getByLabelText('Peso bruto'), '736.559');

    expect(screen.getByLabelText('Peso bruto')).toHaveValue('736.55');
  });

  it('en toneladas permite 3 decimales', async () => {
    render(<MedidaControlada decimales={DECIMALES_TONELADAS} />);

    await userEvent.type(screen.getByLabelText('Peso bruto'), '1.2345');

    expect(screen.getByLabelText('Peso bruto')).toHaveValue('1.234');
  });

  it('ignora letras y signos', async () => {
    render(<MedidaControlada />);

    await userEvent.type(screen.getByLabelText('Peso bruto'), '-7a3b6');

    expect(screen.getByLabelText('Peso bruto')).toHaveValue('736');
  });

  it('abre el teclado numérico en el celular', () => {
    render(<MedidaControlada />);

    expect(screen.getByLabelText('Peso bruto')).toHaveAttribute('inputMode', 'decimal');
  });
});
