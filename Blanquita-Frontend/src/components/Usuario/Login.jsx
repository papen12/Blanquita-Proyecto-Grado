import React, { useState, useRef } from 'react';
import './Login.css';

export default function Login() {
  const [ci, setCi] = useState('');
  const [digitos, setDigitos] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [foco, setFoco] = useState(-1);
  const [cargando, setCargando] = useState(false);

  const refs = useRef(Array.from({ length: 6 }, () => React.createRef()));

  const irA = (i) => {
    const el = refs.current[i] && refs.current[i].current;
    if (el) el.focus();
  };

  const fail = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleCambiar = (i) => (e) => {
    const re = i < 3 ? /[^a-zA-Z]/g : /\D/g;
    const ch = (e.target.value || '').replace(re, '').slice(-1).toUpperCase();
    setDigitos((prev) => {
      const d = [...prev];
      d[i] = ch;
      return d;
    });
    setError('');
    if (ch && i < 5) irA(i + 1);
  };

  const handleTecla = (i) => (e) => {
    if (e.key === 'Backspace' && !digitos[i] && i > 0) irA(i - 1);
    if (e.key === 'ArrowLeft' && i > 0) irA(i - 1);
    if (e.key === 'ArrowRight' && i < 5) irA(i + 1);
    if (e.key === 'Enter') handleIngresar();
  };

  const handleCi = (e) => {
    setCi(e.target.value.replace(/\D/g, ''));
  };

  const handleIngresar = async () => {
    if (cargando) return;

    if (!ci.trim()) return fail('Ingresa tu CI.');
    if (digitos.some((d) => !d)) return fail('Completa los 6 dígitos de tu contraseña.');

    const clave = digitos.join('');

    setCargando(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Ci: ci.trim(), Clave: clave })
      });

      const data = await response.json();

      if (!response.ok) {
        fail(data.detail || 'Credenciales inválidas.');
        setDigitos(['', '', '', '', '', '']);
        irA(0);
        return;
      }

      window.location.href = data.rutaRedirect || '/';
    } catch (err) {
      fail('No se pudo conectar con el servidor. Intenta nuevamente.');
      setDigitos(['', '', '', '', '', '']);
      irA(0);
    } finally {
      setCargando(false);
    }
  };

  const bloques = [];
  digitos.forEach((v, i) => {
    if (i === 3) bloques.push({ tipo: 'guion', key: 'guion' });
    bloques.push({
      tipo: 'input',
      key: `input-${i}`,
      i,
      valor: v,
      modo: i < 3 ? 'text' : 'numeric',
      focado: foco === i,
      lleno: !!v,
    });
  });

  return (
    <div className="pb-page">
      <div className="pb-wrapper">
        <div className="pb-header">
          <div className="pb-logo-outer">
            <div className="pb-logo-inner" />
          </div>
          <div className="pb-title-group">
            <div className="pb-title">Papel Blanquita</div>
            <div className="pb-subtitle">Sistema de Inventario y Producción</div>
          </div>
        </div>

        <div className="pb-card">
          <div className="pb-field">
            <label htmlFor="ci" className="pb-label">
              Carnet de identidad (CI)
            </label>
            <input
              id="ci"
              className="pb-input"
              value={ci}
              onChange={handleCi}
              inputMode="numeric"
              autoComplete="username"
              placeholder="Ej. 8456123"
              disabled={cargando}
            />
          </div>

          <div className="pb-field">
            <label className="pb-label">Contraseña</label>
            <div className={`pb-otp-row${shake ? ' pb-shake' : ''}`}>
              {bloques.map((bl) =>
                bl.tipo === 'guion' ? (
                  <div key={bl.key} className="pb-otp-dash" />
                ) : (
                  <input
                    key={bl.key}
                    ref={refs.current[bl.i]}
                    value={bl.valor}
                    onChange={handleCambiar(bl.i)}
                    onKeyDown={handleTecla(bl.i)}
                    onFocus={() => setFoco(bl.i)}
                    type="password"
                    inputMode={bl.modo}
                    maxLength={1}
                    autoComplete="off"
                    disabled={cargando}
                    className={`pb-otp-input${bl.lleno ? ' pb-otp-filled' : ''}${
                      bl.focado ? ' pb-otp-focused' : ''
                    }`}
                  />
                )
              )}
            </div>
            {error && <div className="pb-error">{error}</div>}
          </div>

          <button className="pb-btn" onClick={handleIngresar} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="pb-footer">
          ¿Olvidaste tu contraseña? <a href="#">Contacta al administrador</a>
        </div>
      </div>
    </div>
  );
}