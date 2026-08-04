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
  ObtenerTiposPapelBobina,
  cargarLoteBobinaPapel,
} from "../../../services/BobinaPapel/BobinaPapel";
import { ObtenerProveedoresForm } from "../../../services/Proveedor/Proveedor";
import { dateFormatter } from "@/utils/dates";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function IngresoBobinasPapel({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [errorProveedores, setErrorProveedores] = useState("");

  const [idProveedor, setIdProveedor] = useState("");
  const [idTipoBobina, setIdTipoBobina] = useState(null);
  const [tara, setTara] = useState("");

  const secuencia = useRef(1);
  const refsCodigo = useRef({});

  const nuevaFila = () => ({
    id: secuencia.current++,
    CodigoBobina: "",
    PesoBrutoKg: "",
    PesoNetoKg: "",
    Gramaje: "",
  });

  const [filas, setFilas] = useState([
    { id: 0, CodigoBobina: "", PesoBrutoKg: "", PesoNetoKg: "", Gramaje: "" },
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
      const data = await ObtenerTiposPapelBobina();
      setTipos(data);
      if (data.length) setIdTipoBobina(data[0].IdTipoBobina);
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
    requestAnimationFrame(() => refsCodigo.current[fila.id]?.focus());
  };

  const quitarFila = (id) => {
    setFilas((prev) =>
      prev.length === 1 ? prev : prev.filter((f) => f.id !== id),
    );
    delete refsCodigo.current[id];
  };

  const codigosRepetidos = (() => {
    const cuenta = {};
    filas.forEach((f) => {
      const c = f.CodigoBobina.trim().toLowerCase();
      if (c) cuenta[c] = (cuenta[c] || 0) + 1;
    });
    return new Set(Object.keys(cuenta).filter((c) => cuenta[c] > 1));
  })();

  const filaConError = (f) => {
    const codigo = f.CodigoBobina.trim();
    if (!codigo) return "Falta el código";
    if (codigosRepetidos.has(codigo.toLowerCase())) return "Código repetido";
    const bruto = Number(f.PesoBrutoKg);
    if (!f.PesoBrutoKg || bruto <= 0) return "Peso bruto inválido";
    const neto = Number(f.PesoNetoKg);
    if (!f.PesoNetoKg || neto <= 0) return "Peso neto inválido";
    if (neto > bruto) return "El neto supera al bruto";
    if (f.Gramaje !== "" && Number(f.Gramaje) <= 0) return "Gramaje inválido";
    return null;
  };

  const erroresFilas = filas.reduce((acc, f) => {
    const e = filaConError(f);
    if (e) acc[f.id] = e;
    return acc;
  }, {});

  const totalBruto = filas.reduce((s, f) => s + Number(f.PesoBrutoKg || 0), 0);
  const totalNeto = filas.reduce((s, f) => s + Number(f.PesoNetoKg || 0), 0);
  const listo =
    !!idProveedor &&
    !!idTipoBobina &&
    filas.length > 0 &&
    Object.keys(erroresFilas).length === 0;

  const guardarLote = async () => {
    setTocado(true);
    setErrorEnvio("");

    if (!idProveedor) {
      setErrorEnvio("Selecciona el proveedor del lote.");
      return;
    }
    if (!idTipoBobina) {
      setErrorEnvio("Selecciona el tipo de bobina del lote.");
      return;
    }
    if (Object.keys(erroresFilas).length > 0) {
      setErrorEnvio("Revisa las bobinas marcadas en rojo antes de guardar.");
      return;
    }

    const bobinas = filas.map((f) => ({
      CodigoBobina: f.CodigoBobina.trim(),
      PesoBrutoKg: Number(f.PesoBrutoKg),
      Gramaje: f.Gramaje === "" ? null : Number(f.Gramaje),
      PesoNetoKg: Number(f.PesoNetoKg),
    }));

    setEnviando(true);
    try {
      const data = await cargarLoteBobinaPapel(
        Number(idProveedor),
        Number(idTipoBobina),
        bobinas,
      );
      setResultado(data);
      setFilas([nuevaFila()]);
      setTocado(false);
      setTara("");
      toast.success(`${data.CantidadBobinas} bobinas ingresadas al almacén`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrorEnvio(e.message);
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const tipoActual = tipos.find((t) => t.IdTipoBobina === idTipoBobina);

  return (
    <div className="pt-20 md:pt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        volver
        titulo="Almacén · Materia Prima"
        subtitulo="Registrar ingreso de bobinas"
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
                <CheckCircle2
                  size={22}
                  strokeWidth={2.5}
                  className="text-emerald-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-base font-extrabold text-slate-900">
                  Lote registrado
                </div>
                <div className="text-sm text-slate-600">
                  {resultado.CantidadBobinas} bobinas · Recepción{" "}
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Proveedor
                </Label>

                {loadingProveedores && (
                  <Skeleton className="h-11 w-full rounded-lg" />
                )}

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

                {!loadingProveedores &&
                  !errorProveedores &&
                  proveedores.length === 0 && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                      No hay proveedores registrados.
                    </div>
                  )}

                {!loadingProveedores &&
                  !errorProveedores &&
                  proveedores.length > 0 && (
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

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Tara por bobina (kg)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tara}
                    onChange={(e) => setTara(e.target.value)}
                    placeholder="0.0"
                    type="number"
                    step="0.01"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de bobina
              </Label>

              {loadingTipos && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              )}

              {errorTipos && (
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
                  No hay tipos de bobina registrados.
                </div>
              )}

              {!loadingTipos && !errorTipos && tipos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tipos.map((t) => (
                    <button
                      key={t.IdTipoBobina}
                      type="button"
                      onClick={() => setIdTipoBobina(t.IdTipoBobina)}
                      className={cn(
                        "h-12 rounded-lg border-2 px-3 text-sm font-bold transition-colors",
                        idTipoBobina === t.IdTipoBobina
                          ? "border-c3 bg-c1/15 text-c3"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {t.NombreTipoBobina}
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
                  {tipoActual.NombreTipoBobina}
                </Badge>
              )}
            </div>
            <Button
              onClick={agregarFila}
              className="h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
            >
              <Plus size={16} strokeWidth={2.75} />
              Agregar bobina
            </Button>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="w-12 px-5 py-3">#</th>
                  <th className="px-3 py-3">Código de bobina</th>
                  <th className="w-36 px-3 py-3">Peso bruto (kg)</th>
                  <th className="w-36 px-3 py-3">Peso neto (kg)</th>
                  <th className="w-36 px-3 py-3">Gramaje (g/m²)</th>
                  <th className="w-14 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => {
                  const err = tocado ? erroresFilas[f.id] : null;
                  return (
                    <tr
                      key={f.id}
                      className={cn(
                        "border-b border-slate-100 last:border-0",
                        err && "bg-red-50/60",
                      )}
                    >
                      <td className="px-5 py-2.5 text-sm font-bold text-slate-400">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          ref={(el) => (refsCodigo.current[f.id] = el)}
                          value={f.CodigoBobina}
                          onChange={(e) =>
                            actualizarFila(f.id, "CodigoBobina", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && i === filas.length - 1)
                              agregarFila();
                          }}
                          placeholder="Ej. 963-R20"
                          className={cn(
                            "h-10 font-mono",
                            err && "border-red-300 focus-visible:ring-red-300",
                          )}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={f.PesoBrutoKg}
                          onChange={(e) =>
                            actualizarFila(f.id, "PesoBrutoKg", e.target.value)
                          }
                          placeholder="0.0"
                          type="number"
                          step="0.01"
                          className={cn(
                            "h-10",
                            err && "border-red-300 focus-visible:ring-red-300",
                          )}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={f.PesoNetoKg}
                          onChange={(e) =>
                            actualizarFila(f.id, "PesoNetoKg", e.target.value)
                          }
                          placeholder="0.0"
                          type="number"
                          step="0.01"
                          className={cn(
                            "h-10",
                            err && "border-red-300 focus-visible:ring-red-300",
                          )}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={f.Gramaje}
                          onChange={(e) =>
                            actualizarFila(f.id, "Gramaje", e.target.value)
                          }
                          placeholder="0.0"
                          type="number"
                          step="0.01"
                          className="h-10"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Button
                          variant="ghost"
                          onClick={() => quitarFila(f.id)}
                          disabled={filas.length === 1}
                          className="h-10 w-10 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tocado && Object.keys(erroresFilas).length > 0 && (
              <div className="flex flex-col gap-1 border-t border-slate-100 bg-red-50 px-5 py-3">
                {filas.map((f, i) =>
                  erroresFilas[f.id] ? (
                    <div
                      key={f.id}
                      className="text-[12.5px] font-semibold text-red-600"
                    >
                      Fila {i + 1}: {erroresFilas[f.id]}
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-5 md:hidden">
            {filas.map((f, i) => {
              const err = tocado ? erroresFilas[f.id] : null;
              return (
                <div
                  key={f.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border p-4",
                    err
                      ? "border-red-300 bg-red-50/60"
                      : "border-slate-200 bg-slate-50",
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

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      Código
                    </Label>
                    <Input
                      value={f.CodigoBobina}
                      onChange={(e) =>
                        actualizarFila(f.id, "CodigoBobina", e.target.value)
                      }
                      placeholder="Ej. HIG-2026-0148"
                      className="h-11 bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        Bruto (kg)
                      </Label>
                      <Input
                        value={f.PesoBrutoKg}
                        onChange={(e) =>
                          actualizarFila(f.id, "PesoBrutoKg", e.target.value)
                        }
                        placeholder="0.0"
                        type="number"
                        step="0.01"
                        className="h-11 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        Neto (kg)
                      </Label>
                      <Input
                        value={f.PesoNetoKg}
                        onChange={(e) =>
                          actualizarFila(f.id, "PesoNetoKg", e.target.value)
                        }
                        placeholder="0.0"
                        type="number"
                        step="0.01"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      Gramaje (g/m²)
                    </Label>
                    <Input
                      value={f.Gramaje}
                      onChange={(e) =>
                        actualizarFila(f.id, "Gramaje", e.target.value)
                      }
                      placeholder="0.0"
                      type="number"
                      step="0.01"
                      className="h-11 bg-white"
                    />
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
                Bruto{" "}
                <strong className="text-slate-200">{fmt(totalBruto)} kg</strong>
              </span>
              <span className="text-slate-400">
                Neto{" "}
                <strong className="text-slate-200">{fmt(totalNeto)} kg</strong>
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