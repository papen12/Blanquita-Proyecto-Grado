import { useState, useEffect } from "react";
import { Plus, X, ArrowRight, Loader2, Search, Cylinder } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  verResumenInventarioBobinaPapel,
  verDetalleInventarioBobinaPapel,
  verBobinasPapelFueraInventario,
  reingresarBobinaInventario,
  darDeBajaBobina,
} from "../../../services/BobinaPapel/Inventario";
import { iniciarProduccion } from "../../../services/BobinaPapel/Produccion";
import { dateFormatter } from "@/utils/dates";

import { ACENTOS, fmt } from "./constantes";
import { TarjetaTipo } from "./TarjetaTipo";
import { TarjetaFueraInventario } from "./TarjetaFueraInventario";
import { TablaBobinas } from "./TablaBobinas";
import { ListaMovilBobinas } from "./ListaMovilBobinas";
import Header from "@/components/layout/Header";

export default function InventarioBobinasPapel({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [bobinasSel, setBobinasSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  const [marcadas, setMarcadas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const [mostrarFuera, setMostrarFuera] = useState(false);
  const [fueraInventario, setFueraInventario] = useState([]);
  const [loadingFuera, setLoadingFuera] = useState(false);
  const [errorFuera, setErrorFuera] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [busquedaCodigoFuera, setBusquedaCodigoFuera] = useState("");

  useEffect(() => {
    cargarResumen();
    cargarFueraInventario();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await verResumenInventarioBobinaPapel();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...ACENTOS[i % ACENTOS.length],
        badge:
          t.CantidadBobinas === 0
            ? "Sin stock"
            : t.CantidadBobinas < 6
              ? "Stock bajo"
              : "Disponible",
      }));
      setTipos(conMeta);
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
      const data = await verDetalleInventarioBobinaPapel(idTipoBobina);
      setBobinasSel(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setBobinasSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoBobina === sel) : null;
  const esServilleta = tipoSel
    ? tipoSel.NombreTipoBobina.toLowerCase().includes("servilleta")
    : false;
  const requeridas = esServilleta ? 1 : 2;

  const totalBobinas = tipos.reduce((s, t) => s + t.CantidadBobinas, 0);
  const totalPesoFmt = fmt(
    tipos.reduce((s, t) => s + Number(t.PesoNetoTotalKg || 0), 0),
  );
  const listas = marcadas.length === requeridas;

  const bobinasFiltradas = busquedaCodigo.trim()
    ? bobinasSel.filter((b) =>
        b.CodigoBobina.toLowerCase().includes(
          busquedaCodigo.trim().toLowerCase(),
        ),
      )
    : bobinasSel;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      setSel(null);
      setBobinasSel([]);
      setMarcadas([]);
      setBusquedaCodigo("");
      return;
    }
    setSel(id);
    setMarcadas([]);
    setBusquedaCodigo("");
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setBobinasSel([]);
    setMarcadas([]);
    setBusquedaCodigo("");
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

    setEnviando(true);
    try {
      await iniciarProduccion(bobina1.IdBobinaPapel, bobina2.IdBobinaPapel);

      setBobinasSel((prev) =>
        prev.filter((b) => !marcadas.includes(b.CodigoBobina)),
      );
      toast.success(`${marcadas.join(" + ")} → En producción`);
      setMarcadas([]);
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const cargarFueraInventario = async () => {
    setLoadingFuera(true);
    setErrorFuera("");
    try {
      const data = await verBobinasPapelFueraInventario();
      setFueraInventario(data);
    } catch (e) {
      setErrorFuera(e.message);
      setFueraInventario([]);
    } finally {
      setLoadingFuera(false);
    }
  };

  const toggleFueraInventario = () => {
    const nuevoEstado = !mostrarFuera;
    setMostrarFuera(nuevoEstado);
    setBusquedaCodigoFuera("");
    if (nuevoEstado) {
      cargarFueraInventario();
    }
  };

  const fueraInventarioFiltradas = busquedaCodigoFuera.trim()
    ? fueraInventario.filter((b) =>
        b.CodigoBobina.toLowerCase().includes(
          busquedaCodigoFuera.trim().toLowerCase(),
        ),
      )
    : fueraInventario;

  const handleReingresar = async (idBobinaPapel, codigoBobina) => {
    setProcesandoId(idBobinaPapel);
    try {
      await reingresarBobinaInventario(idBobinaPapel);
      toast.success(`Bobina ${codigoBobina} reingresada al inventario`);
      setFueraInventario((prev) =>
        prev.filter((b) => b.IdBobinaPapel !== idBobinaPapel),
      );
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDarDeBaja = async (idBobinaPapel, codigoBobina) => {
    setProcesandoId(idBobinaPapel);
    try {
      await darDeBajaBobina(idBobinaPapel);
      toast.success(`Bobina ${codigoBobina} retirada definitivamente`);
      setFueraInventario((prev) =>
        prev.filter((b) => b.IdBobinaPapel !== idBobinaPapel),
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="contenido-con-sidebar mt-20 md:mt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        titulo="Almacén · Materia Prima"
        subtitulo="Inventario de Bobinas de Papel"
        accion={{
          texto: "Registrar ingreso",
          icono: Plus,
          href: "/operador/bobina-papel/ingreso",
        }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">
            Catálogo por tipo de bobina
          </div>
          <div className="text-sm text-slate-500">
            Solo bobinas <strong className="text-slate-700">en almacén</strong>{" "}
            · {totalBobinas} bobinas · {totalPesoFmt} kg netos
          </div>
        </div>

        {loadingTipos && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        )}
        {errorTipos && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
            {errorTipos}
          </div>
        )}

        {!loadingTipos && !errorTipos && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <TarjetaTipo
                key={t.IdTipoBobina}
                tipo={t}
                activo={sel === t.IdTipoBobina}
                onClick={() => seleccionarTipo(t.IdTipoBobina)}
              />
            ))}
            <TarjetaFueraInventario
              cantidad={fueraInventario.length}
              activo={mostrarFuera}
              onClick={toggleFueraInventario}
            />
          </div>
        )}

        {tipoSel && (
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
                tipoSel.soft,
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Cylinder className={cn("h-7 w-7 shrink-0", tipoSel.text)} strokeWidth={2} />
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  Bobinas · {tipoSel.NombreTipoBobina}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadBobinas} en almacén
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "border font-bold",
                    tipoSel.text,
                    tipoSel.border,
                  )}
                >
                  {esServilleta
                    ? "Se envía 1 bobina"
                    : "Se envían de a 2 bobinas"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                onClick={cerrarDetalle}
                className="h-11 gap-1.5 font-bold text-slate-500 hover:text-slate-900"
              >
                <X size={15} strokeWidth={2.75} />
                Cerrar
              </Button>
            </div>

            {!loadingDetalle && !errorDetalle && bobinasSel.length > 0 && (
              <div className="border-b border-slate-100 px-5 py-3.5">
                <div className="relative max-w-xs">
                  <Search
                    size={16}
                    strokeWidth={2.5}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={busquedaCodigo}
                    onChange={(e) => setBusquedaCodigo(e.target.value)}
                    placeholder="Buscar por código..."
                    className="h-10 pl-9"
                  />
                  {busquedaCodigo && (
                    <button
                      onClick={() => setBusquedaCodigo("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={15} strokeWidth={2.75} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {loadingDetalle && (
              <div className="space-y-2 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {errorDetalle && (
              <div className="p-5 text-center text-sm font-semibold text-red-600">
                {errorDetalle}
              </div>
            )}
            {!loadingDetalle && !errorDetalle && bobinasSel.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay bobinas en almacén para este tipo.
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              bobinasSel.length > 0 &&
              bobinasFiltradas.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ninguna bobina coincide con "{busquedaCodigo}".
                </div>
              )}

            {!loadingDetalle &&
              !errorDetalle &&
              bobinasFiltradas.length > 0 && (
                <>
                  <div className="hidden md:block">
                    <TablaBobinas
                      bobinas={bobinasFiltradas}
                      tipoSel={tipoSel}
                      marcadas={marcadas}
                      onToggle={toggleBobina}
                    />
                  </div>
                  <div className="md:hidden">
                    <ListaMovilBobinas
                      bobinas={bobinasFiltradas}
                      tipoSel={tipoSel}
                      marcadas={marcadas}
                      onToggle={toggleBobina}
                    />
                  </div>
                </>
              )}

            {marcadas.length > 0 && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {marcadas.map((codigo) => (
                    <div
                      key={codigo}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold text-white"
                    >
                      {codigo}
                      <button
                        onClick={() => quitarChip(codigo)}
                        className="opacity-70 hover:opacity-100"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  <div className="text-sm font-semibold text-slate-400">
                    {listas
                      ? "Listo para enviar"
                      : `Selecciona ${requeridas - marcadas.length} más`}
                  </div>
                </div>
                <Button
                  onClick={enviarProduccion}
                  disabled={!listas || enviando}
                  className={cn(
                    "h-11 gap-2 bg-white/15 font-extrabold text-white hover:bg-white/15",
                    listas && "bg-gradient-to-r from-c3 to-c4 hover:opacity-90",
                  )}
                >
                  {enviando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar a producción
                      <ArrowRight size={16} strokeWidth={2.75} />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {mostrarFuera && (
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-amber-50 px-5 py-4">
              <div className="text-base font-extrabold text-amber-700">
                Bobinas fuera de inventario
              </div>
              <Button
                variant="ghost"
                onClick={() => setMostrarFuera(false)}
                className="h-11 gap-1.5 font-bold text-slate-500 hover:text-slate-900"
              >
                <X size={15} strokeWidth={2.75} />
                Cerrar
              </Button>
            </div>

            {!loadingFuera && !errorFuera && fueraInventario.length > 0 && (
              <div className="border-b border-slate-100 px-5 py-3.5">
                <div className="relative max-w-xs">
                  <Search
                    size={16}
                    strokeWidth={2.5}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={busquedaCodigoFuera}
                    onChange={(e) => setBusquedaCodigoFuera(e.target.value)}
                    placeholder="Buscar por código..."
                    className="h-10 pl-9"
                  />
                  {busquedaCodigoFuera && (
                    <button
                      onClick={() => setBusquedaCodigoFuera("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={15} strokeWidth={2.75} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {loadingFuera && (
              <div className="space-y-2 p-5">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {errorFuera && (
              <div className="p-5 text-center text-sm font-semibold text-red-600">
                {errorFuera}
              </div>
            )}
            {!loadingFuera && !errorFuera && fueraInventario.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay bobinas fuera de inventario.
              </div>
            )}
            {!loadingFuera &&
              !errorFuera &&
              fueraInventario.length > 0 &&
              fueraInventarioFiltradas.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ninguna bobina coincide con "{busquedaCodigoFuera}".
                </div>
              )}

            {!loadingFuera && !errorFuera && fueraInventarioFiltradas.length > 0 && (
              <div className="flex flex-col gap-3 p-5">
                {fueraInventarioFiltradas.map((b) => (
                  <div
                    key={b.IdBobinaPapel}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[15px] font-extrabold text-slate-900">
                          {b.CodigoBobina}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-300 font-bold text-slate-600"
                        >
                          {b.NombreTipoBobina}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                        <span>{b.NombreProveedor}</span>
                        <span>Recepción: {dateFormatter(b.FechaRecepcion)}</span>
                        <span>Bruto: {fmt(b.PesoBrutoKg)} kg</span>
                        <span>Gramaje: {fmt(b.Gramaje)} g/m²</span>
                      </div>
                      {b.UltimaObservacion && (
                        <div className="text-[12.5px] italic text-slate-500">
                          "{b.UltimaObservacion}"
                        </div>
                      )}
                      {b.FechaUltimoMovimiento && (
                        <div className="text-[11px] text-slate-400">
                          Último movimiento:{" "}
                          {dateFormatter(b.FechaUltimoMovimiento)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleReingresar(b.IdBobinaPapel, b.CodigoBobina)
                        }
                        disabled={procesandoId === b.IdBobinaPapel}
                        className="h-10 gap-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        {procesandoId === b.IdBobinaPapel ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          "Reingresar"
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          handleDarDeBaja(b.IdBobinaPapel, b.CodigoBobina)
                        }
                        disabled={procesandoId === b.IdBobinaPapel}
                        variant="outline"
                        className="h-10 gap-2 border-red-300 font-bold text-red-600 hover:bg-red-50"
                      >
                        {procesandoId === b.IdBobinaPapel ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          "Retirar"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}