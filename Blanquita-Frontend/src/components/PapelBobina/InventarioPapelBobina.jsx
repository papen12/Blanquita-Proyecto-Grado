import { useState, useEffect, useRef } from "react";
import { Plus, X, Check, ArrowRight, Loader2 } from "lucide-react";
import {
  VerResumenInventarioBobinaPapel,
  VerDetalleInventarioBobinaPapel,
} from "../../services/BobinaPapelService";
import "./InventarioPapelBobina.css";
import { IniciarProduccionBobinaTubo } from "../../services/ProduccionBobinaPapelService";
import {dateFormatter} from "../../utils/DateFormater"

const META_COLORES = [
  { color: "#20A7DB", oscuro: "#1C96C5", suave: "#e3f4fb", borde: "#A0D9EF" },
  { color: "#2BB39A", oscuro: "#1e8f7b", suave: "#e2f6f1", borde: "#9adfd1" },
  { color: "#E5A62C", oscuro: "#c2871a", suave: "#fcf3df", borde: "#f0d194" },
  { color: "#9A7BD6", oscuro: "#7c5cbd", suave: "#f1ebfb", borde: "#cbb8ee" },
];

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-BO", { maximumFractionDigits: 1 });

export default function InventarioBobinasPapel() {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [bobinasSel, setBobinasSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const [marcadas, setMarcadas] = useState([]);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [ancho, setAncho] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  const [formTipo, setFormTipo] = useState(null);
  const [formCodigo, setFormCodigo] = useState("");
  const [formPeso, setFormPeso] = useState("");
  const [formGramaje, setFormGramaje] = useState("");
  const [formError, setFormError] = useState("");

  const [enviando, setEnviando] = useState(false);

  const toastTimer = useRef(null);

  useEffect(() => {
    const onResize = () => setAncho(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await VerResumenInventarioBobinaPapel();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...META_COLORES[i % META_COLORES.length],
        badge:
          t.CantidadBobinas === 0
            ? "Sin stock"
            : t.CantidadBobinas < 6
              ? "Stock bajo"
              : "Disponible",
      }));
      setTipos(conMeta);
      if (conMeta.length && formTipo === null)
        setFormTipo(conMeta[0].IdTipoBobina);
    } catch (e) {
      setErrorTipos(e.message);
    } finally {
      setLoadingTipos(false);
    }
  };

  const cargarDetalle = async (idTipoBobina) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data = await VerDetalleInventarioBobinaPapel(idTipoBobina);
      setBobinasSel(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setBobinasSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const mostrarToast = (msg, ms) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), ms);
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoBobina === sel) : null;
  const esServilleta = tipoSel
    ? tipoSel.NombreTipoBobina.toLowerCase().includes("servilleta")
    : false;
  const requeridas = esServilleta ? 1 : 2;
  const esMovil = ancho < 700;

  const totalBobinas = tipos.reduce((s, t) => s + t.CantidadBobinas, 0);
  const totalPesoFmt = fmt(
    tipos.reduce((s, t) => s + Number(t.PesoNetoTotalKg || 0), 0),
  );
  const listas = marcadas.length === requeridas;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      setSel(null);
      setBobinasSel([]);
      setMarcadas([]);
      return;
    }
    setSel(id);
    setMarcadas([]);
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setBobinasSel([]);
    setMarcadas([]);
  };

  const toggleBobina = (codigo) => {
    setMarcadas((prev) => {
      if (prev.includes(codigo)) return prev.filter((c) => c !== codigo);
      if (prev.length < requeridas) return [...prev, codigo];
      if (requeridas === 1) return [codigo];
      return prev;
    });
  };

  const quitarChip = (codigo) =>
    setMarcadas((prev) => prev.filter((c) => c !== codigo));

  const enviarProduccion = async () => {
    if (!listas || esServilleta) return;

    const bobina1 = bobinasSel.find((b) => b.CodigoBobina === marcadas[0]);
    const bobina2 = bobinasSel.find((b) => b.CodigoBobina === marcadas[1]);
    if (!bobina1 || !bobina2) return;

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    setEnviando(true);
    try {
      await IniciarProduccionBobinaTubo({
        IdBobina1: bobina1.IdBobinaPapel,
        IdBobina2: bobina2.IdBobinaPapel,
        IdUsuario: usuario.IdUsuario,
      });

      setBobinasSel((prev) =>
        prev.filter((b) => !marcadas.includes(b.CodigoBobina)),
      );
      mostrarToast(`${marcadas.join(" + ")} → En producción ✓`, 3200);
      setMarcadas([]);
      cargarResumen();
    } catch (e) {
      mostrarToast(e.message, 3200);
    } finally {
      setEnviando(false);
    }
  };

  const abrirIngreso = () => {
    setFormError("");
    setModal(true);
  };

  const guardarIngreso = () => {
    if (!formCodigo.trim()) {
      setFormError("Ingresa el código de la bobina.");
      return;
    }
    if (!formPeso || +formPeso <= 0) {
      setFormError("Ingresa un peso bruto válido.");
      return;
    }
    setModal(false);
    setFormCodigo("");
    setFormPeso("");
    setFormGramaje("");
    mostrarToast(`Bobina ${formCodigo.trim()} registrada ✓`, 2600);
  };

  return (
    <div className="ibp-root">
      <header className="ibp-header">
        <div className="ibp-header-info">
          <div className="ibp-header-eyebrow">Almacén · Materia Prima</div>
          <div className="ibp-header-title">Inventario de Bobinas de Papel</div>
        </div>
        <button onClick={abrirIngreso} className="ibp-btn-primary-header">
          <Plus size={16} strokeWidth={2.75} />
          Registrar ingreso
        </button>
      </header>

      <main className="ibp-main">
        <div className="ibp-catalog-heading">
          <div className="ibp-catalog-title">Catálogo por tipo de bobina</div>
          <div className="ibp-catalog-sub">
            Solo bobinas <strong>En almacén</strong> · {totalBobinas} bobinas ·{" "}
            {totalPesoFmt} kg netos
          </div>
        </div>

        {loadingTipos && (
          <div className="ibp-loading-state">Cargando inventario...</div>
        )}
        {errorTipos && <div className="ibp-error-state">{errorTipos}</div>}

        {!loadingTipos && !errorTipos && (
          <div className="ibp-tipos-grid">
            {tipos.map((t) => (
              <TarjetaTipo
                key={t.IdTipoBobina}
                tipo={t}
                onClick={() => seleccionarTipo(t.IdTipoBobina)}
              />
            ))}
          </div>
        )}

        {tipoSel && (
          <div className="ibp-detalle-panel">
            <div
              className="ibp-detalle-header"
              style={{ background: tipoSel.suave }}
            >
              <div className="ibp-detalle-header-left">
                <div
                  className="ibp-detalle-dot"
                  style={{ background: tipoSel.color }}
                />
                <div
                  className="ibp-detalle-titulo"
                  style={{ color: tipoSel.oscuro }}
                >
                  Bobinas · {tipoSel.NombreTipoBobina}
                </div>
                <div className="ibp-detalle-cantidad">
                  {tipoSel.CantidadBobinas} en almacén
                </div>
                <div
                  className="ibp-detalle-chip"
                  style={{ color: tipoSel.oscuro, borderColor: tipoSel.borde }}
                >
                  {esServilleta
                    ? "Se envía 1 bobina"
                    : "Se envían de a 2 bobinas"}
                </div>
              </div>
              <button onClick={cerrarDetalle} className="ibp-btn-cerrar">
                <X size={15} strokeWidth={2.75} />
                Cerrar
              </button>
            </div>

            {loadingDetalle && (
              <div className="ibp-loading-state">Cargando bobinas...</div>
            )}
            {errorDetalle && (
              <div className="ibp-error-state">{errorDetalle}</div>
            )}

            {!loadingDetalle && !errorDetalle && bobinasSel.length === 0 && (
              <div className="ibp-empty-state">
                No hay bobinas en almacén para este tipo.
              </div>
            )}

            {!loadingDetalle &&
              !errorDetalle &&
              bobinasSel.length > 0 &&
              (!esMovil ? (
                <TablaBobinas
                  bobinas={bobinasSel}
                  tipoSel={tipoSel}
                  marcadas={marcadas}
                  onToggle={toggleBobina}
                />
              ) : (
                <ListaMovilBobinas
                  bobinas={bobinasSel}
                  tipoSel={tipoSel}
                  marcadas={marcadas}
                  onToggle={toggleBobina}
                />
              ))}

            {marcadas.length > 0 && (
              <div className="ibp-sticky-bar">
                <div className="ibp-chips-wrap">
                  {marcadas.map((codigo) => (
                    <div key={codigo} className="ibp-chip">
                      {codigo}
                      <span
                        onClick={() => quitarChip(codigo)}
                        className="ibp-chip-close"
                      >
                        <X size={13} strokeWidth={3} />
                      </span>
                    </div>
                  ))}
                  <div className="ibp-chips-status">
                    {listas
                      ? "Listo para enviar"
                      : `Selecciona ${requeridas - marcadas.length} más`}
                  </div>
                </div>
                <button
                  onClick={enviarProduccion}
                  disabled={!listas || enviando}
                  className={`ibp-btn-enviar ${listas ? "ibp-btn-enviar-activo" : ""}`}
                >
                  {enviando ? (
                    <>
                      <Loader2 size={16} strokeWidth={2.75} className="ibp-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar a producción
                      <ArrowRight size={16} strokeWidth={2.75} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {modal && (
        <div onClick={() => setModal(false)} className="ibp-modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="ibp-modal">
            <div className="ibp-modal-header">
              <div className="ibp-modal-title">Registrar ingreso de bobina</div>
              <button
                onClick={() => setModal(false)}
                className="ibp-btn-cerrar-modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="ibp-form-group">
              <label className="ibp-label">Tipo de bobina</label>
              <div className="ibp-tipo-grid-buttons">
                {tipos.map((t) => (
                  <button
                    key={t.IdTipoBobina}
                    onClick={() => setFormTipo(t.IdTipoBobina)}
                    className="ibp-tipo-btn"
                    style={
                      formTipo === t.IdTipoBobina
                        ? { borderColor: t.color, background: t.suave }
                        : { borderColor: "#e3eef5", background: "#fff" }
                    }
                  >
                    {t.NombreTipoBobina}
                  </button>
                ))}
              </div>
            </div>

            <div className="ibp-form-group">
              <label className="ibp-label">Código de bobina</label>
              <input
                value={formCodigo}
                onChange={(e) => setFormCodigo(e.target.value)}
                placeholder="Ej. HIG-2026-0148"
                className="ibp-input"
              />
            </div>

            <div className="ibp-form-row">
              <div className="ibp-form-group">
                <label className="ibp-label">Peso bruto (kg)</label>
                <input
                  value={formPeso}
                  onChange={(e) => setFormPeso(e.target.value)}
                  placeholder="0.0"
                  type="number"
                  className="ibp-input"
                />
              </div>
              <div className="ibp-form-group">
                <label className="ibp-label">Gramaje (g/m²)</label>
                <input
                  value={formGramaje}
                  onChange={(e) => setFormGramaje(e.target.value)}
                  placeholder="0.0"
                  type="number"
                  className="ibp-input"
                />
              </div>
            </div>

            {formError && <div className="ibp-form-error">{formError}</div>}

            <button onClick={guardarIngreso} className="ibp-btn-guardar">
              Guardar ingreso
            </button>
          </div>
        </div>
      )}

      {toast && <div className="ibp-toast">{toast}</div>}
    </div>
  );
}

function TarjetaTipo({ tipo: t, onClick }) {
  return (
    <div
      onClick={onClick}
      className="ibp-tarjeta-tipo"
      style={{ borderColor: t.borde }}
    >
      <div className="ibp-tarjeta-header">
        <div className="ibp-tarjeta-header-left">
          <div
            className="ibp-tarjeta-icon-wrap"
            style={{ background: t.color }}
          >
            <div className="ibp-tarjeta-icon-inner" />
          </div>
          <div className="ibp-tarjeta-nombre">{t.NombreTipoBobina}</div>
        </div>
        <div
          className="ibp-tarjeta-badge"
          style={{ background: t.suave, color: t.oscuro }}
        >
          {t.badge}
        </div>
      </div>

      <div className="ibp-tarjeta-cantidad-row">
        <div className="ibp-tarjeta-cantidad" style={{ color: t.oscuro }}>
          {t.CantidadBobinas}
        </div>
        <div className="ibp-tarjeta-cantidad-label">bobinas en almacén</div>
      </div>

      <div className="ibp-tarjeta-stats-grid">
        <div className="ibp-tarjeta-stat">
          <div className="ibp-tarjeta-stat-label">Peso neto</div>
          <div className="ibp-tarjeta-stat-value">
            {fmt(t.PesoNetoTotalKg)} kg
          </div>
        </div>
        <div className="ibp-tarjeta-stat">
          <div className="ibp-tarjeta-stat-label">Gramaje prom.</div>
          <div className="ibp-tarjeta-stat-value">
            {fmt(t.GramajePromedio)} g/m²
          </div>
        </div>
      </div>

      <div className="ibp-tarjeta-footer">
        <span
          className="ibp-tarjeta-footer-link"
          style={{ color: t.oscuro }}
        >
          Ver bobinas
          <ArrowRight size={14} strokeWidth={2.75} />
        </span>
      </div>
    </div>
  );
}

function TablaBobinas({ bobinas, tipoSel, marcadas, onToggle }) {
  return (
    <div className="ibp-table-wrap">
      <table className="ibp-table">
        <thead>
          <tr>
            <th className="ibp-th ibp-th-checkbox" />
            <th className="ibp-th">Código</th>
            <th className="ibp-th">Lote</th>
            <th className="ibp-th">Recepción</th>
            <th className="ibp-th">Proveedor</th>
            <th className="ibp-th ibp-th-right">Peso bruto</th>
            <th className="ibp-th ibp-th-right">Peso neto</th>
            <th className="ibp-th ibp-th-right ibp-th-last">Gramaje</th>
          </tr>
        </thead>
        <tbody>
          {bobinas.map((b) => {
            const on = marcadas.includes(b.CodigoBobina);
            return (
              <tr
                key={b.IdBobinaPapel}
                onClick={() => onToggle(b.CodigoBobina)}
                className="ibp-tr"
                style={{ background: on ? tipoSel.suave : "#fff" }}
              >
                <td className="ibp-td ibp-td-checkbox">
                  <div
                    className="ibp-checkbox-box"
                    style={{
                      borderColor: on ? tipoSel.color : "#cfe2ee",
                      background: on ? tipoSel.color : "#fff",
                    }}
                  >
                    {on && <Check size={14} strokeWidth={3.5} />}
                  </div>
                </td>
                <td
                  className="ibp-td ibp-td-codigo"
                  style={{ color: tipoSel.oscuro }}
                >
                  {b.CodigoBobina}
                </td>
                <td className="ibp-td">{b.CodigoLote}</td>
                <td className="ibp-td">{dateFormatter(b.FechaRecepcion)}</td>
                <td className="ibp-td">{b.NombreProveedor}</td>
                <td className="ibp-td ibp-td-right">{fmt(b.PesoBrutoKg)} kg</td>
                <td className="ibp-td ibp-td-right ibp-td-neto">
                  {fmt(b.PesoNetoKg)} kg
                </td>
                <td className="ibp-td ibp-td-right ibp-td-last">
                  {fmt(b.Gramaje)} g/m²
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ListaMovilBobinas({ bobinas, tipoSel, marcadas, onToggle }) {
  return (
    <div className="ibp-mobile-list">
      {bobinas.map((b) => {
        const on = marcadas.includes(b.CodigoBobina);
        return (
          <div
            key={b.IdBobinaPapel}
            onClick={() => onToggle(b.CodigoBobina)}
            className="ibp-mobile-card"
            style={{
              background: on ? tipoSel.suave : "#fff",
              borderColor: on ? tipoSel.color : "#cfe2ee",
            }}
          >
            <div className="ibp-mobile-card-header">
              <div
                className="ibp-mobile-card-codigo"
                style={{ color: tipoSel.oscuro }}
              >
                {b.CodigoBobina}
              </div>
              <div
                className="ibp-mobile-checkbox"
                style={{
                  borderColor: on ? tipoSel.color : "#cfe2ee",
                  background: on ? tipoSel.color : "#fff",
                }}
              >
                {on && <Check size={15} strokeWidth={3.5} />}
              </div>
            </div>
            <div className="ibp-mobile-meta">
              <span>
                <strong>{b.CodigoLote}</strong> · {b.FechaRecepcion}
              </span>
              <span>{b.NombreProveedor}</span>
            </div>
            <div className="ibp-mobile-stats">
              <MiniStat label="Bruto" value={`${fmt(b.PesoBrutoKg)} kg`} />
              <MiniStat label="Neto" value={`${fmt(b.PesoNetoKg)} kg`} />
              <MiniStat label="Gramaje" value={`${fmt(b.Gramaje)} g/m²`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="ibp-mini-stat">
      <div className="ibp-mini-stat-label">{label}</div>
      <div className="ibp-mini-stat-value">{value}</div>
    </div>
  );
}