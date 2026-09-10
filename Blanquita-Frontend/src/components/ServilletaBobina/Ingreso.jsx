import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectEntidad } from "@/components/layout/Selectentidad";
import Header from "@/components/layout/Header";
import {
  cargarLoteBobinaServilleta,
  ObtenerTiposBobinaServilleta,
} from "../../services/BobinaServilleta/BobinaServilleta";
import { ObtenerProveedoresForm } from "../../services/Proveedor/Proveedor";
import { dateFormatter } from "@/utils/dates";
import { Formatos } from "@/constants/BobinaServilleta";
import { aCodigo } from "@/utils/handlers";

const FORMATO_UNIDAD_1 = Formatos[0];
const FORMATO_UNIDAD_2 = Formatos[1];

export default function IngresoBobinasServilleta({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");
  const [idTipoBobinaServilleta, setIdTipoBobinaServilleta] = useState(null);

  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [errorProveedores, setErrorProveedores] = useState("");

  const [idProveedor, setIdProveedor] = useState("");

  const secuencia = useRef(1);
  const refsCodigo1 = useRef({});

  const nuevaFila = () => ({
    id: secuencia.current++,
    Codigo1: "",
    PesoBruto1: "",
    Gramaje1: "",
    Codigo2: "",
    PesoBruto2: "",
    Gramaje2: "",
  });

  const [filas, setFilas] = useState([
    {
      id: 0,
      Codigo1: "",
      PesoBruto1: "",
      Gramaje1: "",
      Codigo2: "",
      PesoBruto2: "",
      Gramaje2: "",
    },
  ]);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [tocado, setTocado] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    cargarTipos();
    cargarProveedores();
  }, []);

  const cargarTipos = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await ObtenerTiposBobinaServilleta();
      setTipos(data);
      if (data.length) setIdTipoBobinaServilleta(data[0].IdTipoBobinaServilleta);
    } catch (e) {
      setErrorTipos(e.message);
      setTipos([]);
    } finally {
      setLoadingTipos(false);
    }
  };

  const cargarProveedores = async () => {
    setLoadingProveedores(true);
    setErrorProveedores("");
    try {
      const data = await ObtenerProveedoresForm();
      setProveedores(data);
    } catch (e) {
      setErrorProveedores(e.message);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const actualizarFila = (id, campo, valor) => {
    setFilas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)),
    );
    setResultado(null);
  };

  const agregarFila = () => {
    const fila = nuevaFila();
    setFilas((prev) => [...prev, fila]);
    setResultado(null);
    requestAnimationFrame(() => refsCodigo1.current[fila.id]?.focus());
  };

  const quitarFila = (id) => {
    setFilas((prev) =>
      prev.length === 1 ? prev : prev.filter((f) => f.id !== id),
    );
    delete refsCodigo1.current[id];
  };

  const codigosRepetidos = (() => {
    const cuenta = {};
    filas.forEach((f) => {
      [f.Codigo1, f.Codigo2].forEach((c) => {
        const v = c.trim().toLowerCase();
        if (v) cuenta[v] = (cuenta[v] || 0) + 1;
      });
    });
    return new Set(Object.keys(cuenta).filter((c) => cuenta[c] > 1));
  })();

  const pesoInvalido = (v) => v !== "" && Number(v) <= 0;

  const filaConError = (f) => {
    const c1 = f.Codigo1.trim();
    const c2 = f.Codigo2.trim();
    if (!c1) return "Falta el código de la unidad 1";
    if (!c2) return "Falta el código de la unidad 2";
    if (codigosRepetidos.has(c1.toLowerCase())) return "Código de unidad 1 repetido";
    if (codigosRepetidos.has(c2.toLowerCase())) return "Código de unidad 2 repetido";
    if (pesoInvalido(f.PesoBruto1)) return "Peso bruto de unidad 1 inválido";
    if (pesoInvalido(f.PesoBruto2)) return "Peso bruto de unidad 2 inválido";
    if (pesoInvalido(f.Gramaje1)) return "Gramaje de unidad 1 inválido";
    if (pesoInvalido(f.Gramaje2)) return "Gramaje de unidad 2 inválido";
    return null;
  };

  const erroresFilas = filas.reduce((acc, f) => {
    const e = filaConError(f);
    if (e) acc[f.id] = e;
    return acc;
  }, {});

  const listo =
    !!idProveedor &&
    !!idTipoBobinaServilleta &&
    filas.length > 0 &&
    Object.keys(erroresFilas).length === 0;

  const guardarLote = async () => {
    setTocado(true);
    setErrorEnvio("");

    if (!idProveedor) {
      setErrorEnvio("Selecciona el proveedor del lote.");
      return;
    }
    if (!idTipoBobinaServilleta) {
      setErrorEnvio("Selecciona el tipo de bobina del lote.");
      return;
    }
    if (Object.keys(erroresFilas).length > 0) {
      setErrorEnvio("Revisa las bobinas marcadas en rojo antes de guardar.");
      return;
    }

    const bobinas = filas.map((f) => ({
      Unidades: [
        {
          CodigoBobina: f.Codigo1.trim(),
          IdFormatoSubBobina: FORMATO_UNIDAD_1.IdFormatoSubBobina,
          PesoBrutoKg: f.PesoBruto1 === "" ? null : Number(f.PesoBruto1),
          GramajeGr: f.Gramaje1 === "" ? null : Number(f.Gramaje1),
        },
        {
          CodigoBobina: f.Codigo2.trim(),
          IdFormatoSubBobina: FORMATO_UNIDAD_2.IdFormatoSubBobina,
          PesoBrutoKg: f.PesoBruto2 === "" ? null : Number(f.PesoBruto2),
          GramajeGr: f.Gramaje2 === "" ? null : Number(f.Gramaje2),
        },
      ],
    }));

    setEnviando(true);
    try {
      const data = await cargarLoteBobinaServilleta(
        Number(idProveedor),
        Number(idTipoBobinaServilleta),
        bobinas,
      );
      setResultado(data);
      setFilas([nuevaFila()]);
      setTocado(false);
      toast.success(
        `${data.CantidadBobinasServilleta} bobinas (${data.CantidadUnidades} unidades) ingresadas al almacén`,
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrorEnvio(e.message);
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const tipoActual = tipos.find(
    (t) => t.IdTipoBobinaServilleta === idTipoBobinaServilleta,
  );

  return (
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        volver
        titulo="Almacén · Materia Prima"
        subtitulo="Registrar ingreso de bobinas de servilleta"
        contador={{
          valor: filas.length,
          singular: "bobina en el lote",
          plural: "bobinas en el lote",
        }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        {resultado && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-200">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 size={22} strokeWidth={2.5} className="text-emerald-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-base font-extrabold text-slate-900">
                  Lote registrado
                </div>
                <div className="text-sm text-slate-600">
                  {resultado.CantidadBobinasServilleta} bobinas ·{" "}
                  {resultado.CantidadUnidades} unidades · Recepción{" "}
                  {dateFormatter(resultado.FechaRecepcion)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setResultado(null)}
              className="h-10 font-bold text-slate-500 hover:text-slate-900"
            >
              Registrar otro lote
            </Button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-base font-extrabold text-slate-900">
              Datos del lote
            </div>
            <div className="text-sm text-slate-500">
              Se aplican a todas las bobinas que registres abajo
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Proveedor
              </Label>

              {loadingProveedores && <Skeleton className="h-11 w-full rounded-lg" />}

              {!loadingProveedores && errorProveedores && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                  {errorProveedores}
                  <Button
                    variant="outline"
                    onClick={cargarProveedores}
                    className="h-9 border-red-300 font-bold text-red-600 hover:bg-red-100"
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              {!loadingProveedores && !errorProveedores && proveedores.length === 0 && (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                  No hay proveedores registrados.
                </div>
              )}

              {!loadingProveedores && !errorProveedores && proveedores.length > 0 && (
                <SelectEntidad
                  opciones={proveedores}
                  valor={idProveedor}
                  onCambio={setIdProveedor}
                  campoValor="IdProveedor"
                  campoEtiqueta="NombreProveedor"
                  placeholder="Selecciona el proveedor"
                  invalido={tocado && !idProveedor}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de bobina
              </Label>

              {loadingTipos && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[0, 1].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              )}

              {!loadingTipos && errorTipos && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {errorTipos}
                  <Button
                    variant="outline"
                    onClick={cargarTipos}
                    className="h-9 border-red-300 font-bold text-red-600 hover:bg-red-100"
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              {!loadingTipos && !errorTipos && tipos.length === 0 && (
                <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                  No hay tipos de bobina servilleta registrados.
                </div>
              )}

              {!loadingTipos && !errorTipos && tipos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tipos.map((t) => (
                    <button
                      key={t.IdTipoBobinaServilleta}
                      type="button"
                      onClick={() => setIdTipoBobinaServilleta(t.IdTipoBobinaServilleta)}
                      className={cn(
                        "h-12 rounded-lg border-2 px-3 text-sm font-bold transition-colors",
                        idTipoBobinaServilleta === t.IdTipoBobinaServilleta
                          ? "border-c3 bg-c1/15 text-c3"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {t.NombreTipoBobinaServilleta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-base font-extrabold text-slate-900">
                Bobinas del lote
              </div>
              {tipoActual && (
                <Badge variant="outline" className="border-c3 font-bold text-c3">
                  {tipoActual.NombreTipoBobinaServilleta}
                </Badge>
              )}
              <div className="text-sm text-slate-500">
                Cada bobina lleva 2 unidades: unidad 1 arriba, unidad 2 abajo
              </div>
            </div>
            <Button
              onClick={agregarFila}
              className="h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
            >
              <Plus size={16} strokeWidth={2.75} />
              Agregar bobina
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {filas.map((f, i) => {
              const err = tocado ? erroresFilas[f.id] : null;
              return (
                <div
                  key={f.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border-2 p-4",
                    err ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Bobina {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => quitarFila(f.id)}
                      disabled={filas.length === 1}
                      className="h-9 w-9 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-c3 font-bold text-c3">
                        Unidad 1
                      </Badge>
                      <span className="text-[12px] font-semibold text-slate-500">
                        Formato {FORMATO_UNIDAD_1.DescripcionFormato}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr_1fr]">
                      <Input
                        ref={(el) => (refsCodigo1.current[f.id] = el)}
                        value={f.Codigo1}
                        onChange={(e) => actualizarFila(f.id, "Codigo1", aCodigo(e.target.value))}
                        placeholder="Código de la unidad 1"
                        className={cn(
                          "h-10 font-mono",
                          err && !f.Codigo1.trim() && "border-red-300 focus-visible:ring-red-300",
                        )}
                      />
                      <Input
                        value={f.PesoBruto1}
                        onChange={(e) => actualizarFila(f.id, "PesoBruto1", e.target.value)}
                        placeholder="Bruto (kg)"
                        type="number"
                        step="0.01"
                        className="h-10"
                      />
                      <Input
                        value={f.Gramaje1}
                        onChange={(e) => actualizarFila(f.id, "Gramaje1", e.target.value)}
                        placeholder="Gramaje (g)"
                        type="number"
                        step="0.01"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-serv3 font-bold text-serv3">
                        Unidad 2
                      </Badge>
                      <span className="text-[12px] font-semibold text-slate-500">
                        Formato {FORMATO_UNIDAD_2.DescripcionFormato}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr_1fr]">
                      <Input
                        value={f.Codigo2}
                        onChange={(e) => actualizarFila(f.id, "Codigo2", aCodigo(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && i === filas.length - 1) agregarFila();
                        }}
                        placeholder="Código de la unidad 2"
                        className={cn(
                          "h-10 font-mono",
                          err && !f.Codigo2.trim() && "border-red-300 focus-visible:ring-red-300",
                        )}
                      />
                      <Input
                        value={f.PesoBruto2}
                        onChange={(e) => actualizarFila(f.id, "PesoBruto2", e.target.value)}
                        placeholder="Bruto (kg)"
                        type="number"
                        step="0.01"
                        className="h-10"
                      />
                      <Input
                        value={f.Gramaje2}
                        onChange={(e) => actualizarFila(f.id, "Gramaje2", e.target.value)}
                        placeholder="Gramaje (g)"
                        type="number"
                        step="0.01"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {err && (
                    <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-red-600">
                      <AlertCircle size={14} strokeWidth={2.5} />
                      {err}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {errorEnvio && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle size={16} strokeWidth={2.5} />
            {errorEnvio}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 shadow-sm sm:px-7">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="font-extrabold text-white">
                {filas.length} {filas.length === 1 ? "bobina" : "bobinas"}
              </span>
              <span className="text-slate-400">
                <strong className="text-slate-200">{filas.length * 2}</strong> unidades
              </span>
            </div>
            <Button
              onClick={guardarLote}
              disabled={enviando}
              className={cn(
                "h-11 gap-2 bg-white/15 font-extrabold text-white hover:bg-white/15",
                listo && "bg-gradient-to-r from-c3 to-c4 hover:opacity-90",
              )}
            >
              {enviando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <PackageCheck size={16} strokeWidth={2.75} />
                  Guardar lote
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
