import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Layers,
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
  obtenerTiposEmpaque,
  cargarLoteEmpaque,
} from "../../services/Empaque/EmpaqueBobina";
import { ObtenerProveedoresForm } from "../../services/Proveedor/Proveedor";
import { dateFormatter } from "@/utils/dates";
import { aCodigo } from "@/utils/handlers";

const ACENTOS = [
  { text: "text-c3", soft: "bg-c4/8", border: "border-c4/30" },
  { text: "text-serv3", soft: "bg-serv3/8", border: "border-serv3/30" },
  { text: "text-lux2", soft: "bg-lux1/8", border: "border-lux1/30" },
  { text: "text-eco2", soft: "bg-eco1/8", border: "border-eco1/30" },
];

export default function EmpaqueBobinaIngreso({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [errorProveedores, setErrorProveedores] = useState("");

  const [idProveedor, setIdProveedor] = useState("");
  const [cantidadToneladasPedida, setCantidadToneladasPedida] = useState("");

  const bloqueSeq = useRef(1);
  const filaSeq = useRef(1);
  const refsCodigo = useRef({});

  const nuevaFila = () => ({ id: filaSeq.current++, CodigoEmpaque: "", PesoKg: "" });
  const nuevoBloque = (idTipoEmpaque = "") => ({
    id: bloqueSeq.current++,
    IdTipoEmpaque: idTipoEmpaque,
    filas: [nuevaFila()],
  });

  const [bloques, setBloques] = useState([
    { id: 0, IdTipoEmpaque: "", filas: [{ id: 0, CodigoEmpaque: "", PesoKg: "" }] },
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
      const data = await obtenerTiposEmpaque();
      setTipos(data);
      if (data.length) {
        setBloques((prev) =>
          prev.map((b) =>
            b.IdTipoEmpaque === "" ? { ...b, IdTipoEmpaque: data[0].IdTipoEmpaque } : b,
          ),
        );
      }
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

  const actualizarTipoBloque = (bloqueId, idTipoEmpaque) => {
    setBloques((prev) =>
      prev.map((b) => (b.id === bloqueId ? { ...b, IdTipoEmpaque: idTipoEmpaque } : b)),
    );
    setResultado(null);
  };

  const actualizarFila = (bloqueId, filaId, campo, valor) => {
    setBloques((prev) =>
      prev.map((b) =>
        b.id !== bloqueId
          ? b
          : {
              ...b,
              filas: b.filas.map((f) =>
                f.id === filaId ? { ...f, [campo]: valor } : f,
              ),
            },
      ),
    );
    setResultado(null);
  };

  const agregarBloque = () => {
    const usados = new Set(bloques.map((b) => b.IdTipoEmpaque));
    const tipoLibre = tipos.find((t) => !usados.has(t.IdTipoEmpaque));
    const bloque = nuevoBloque(tipoLibre?.IdTipoEmpaque ?? tipos[0]?.IdTipoEmpaque ?? "");
    setBloques((prev) => [...prev, bloque]);
    setResultado(null);
    requestAnimationFrame(() =>
      refsCodigo.current[bloque.filas[0].id]?.focus(),
    );
  };

  const quitarBloque = (bloqueId) => {
    setBloques((prev) => (prev.length === 1 ? prev : prev.filter((b) => b.id !== bloqueId)));
  };

  const agregarFila = (bloqueId) => {
    const fila = nuevaFila();
    setBloques((prev) =>
      prev.map((b) => (b.id === bloqueId ? { ...b, filas: [...b.filas, fila] } : b)),
    );
    setResultado(null);
    requestAnimationFrame(() => refsCodigo.current[fila.id]?.focus());
  };

  const quitarFila = (bloqueId, filaId) => {
    setBloques((prev) =>
      prev.map((b) =>
        b.id === bloqueId && b.filas.length > 1
          ? { ...b, filas: b.filas.filter((f) => f.id !== filaId) }
          : b,
      ),
    );
    delete refsCodigo.current[filaId];
  };

  const filasPlanas = bloques.flatMap((b) =>
    b.filas.map((f) => ({ ...f, bloqueId: b.id, IdTipoEmpaque: b.IdTipoEmpaque })),
  );

  const codigosRepetidos = (() => {
    const cuenta = {};
    filasPlanas.forEach((f) => {
      const c = f.CodigoEmpaque.trim().toLowerCase();
      if (c) cuenta[c] = (cuenta[c] || 0) + 1;
    });
    return new Set(Object.keys(cuenta).filter((c) => cuenta[c] > 1));
  })();

  const filaConError = (f) => {
    const codigo = f.CodigoEmpaque.trim();
    if (!codigo) return "Falta el código";
    if (codigosRepetidos.has(codigo.toLowerCase())) return "Código repetido";
    if (!f.PesoKg || Number(f.PesoKg) <= 0) return "Peso inválido";
    return null;
  };

  const erroresFilas = filasPlanas.reduce((acc, f) => {
    const e = filaConError(f);
    if (e) acc[f.id] = e;
    return acc;
  }, {});

  const bloqueConError = (b) => {
    if (!b.IdTipoEmpaque) return "Selecciona el tipo de empaque";
    return null;
  };

  const erroresBloques = bloques.reduce((acc, b) => {
    const e = bloqueConError(b);
    if (e) acc[b.id] = e;
    return acc;
  }, {});

  const listo =
    !!idProveedor &&
    !!cantidadToneladasPedida &&
    Number(cantidadToneladasPedida) > 0 &&
    filasPlanas.length > 0 &&
    Object.keys(erroresFilas).length === 0 &&
    Object.keys(erroresBloques).length === 0;

  const guardarLote = async () => {
    setTocado(true);
    setErrorEnvio("");

    if (!idProveedor) {
      setErrorEnvio("Selecciona el proveedor del lote.");
      return;
    }
    if (!cantidadToneladasPedida || Number(cantidadToneladasPedida) <= 0) {
      setErrorEnvio("Indica la cantidad de toneladas pedidas.");
      return;
    }
    if (Object.keys(erroresBloques).length > 0) {
      setErrorEnvio("Selecciona el tipo de empaque en cada bloque.");
      return;
    }
    if (Object.keys(erroresFilas).length > 0) {
      setErrorEnvio("Revisa los empaques marcados en rojo antes de guardar.");
      return;
    }

    const empaques = filasPlanas.map((f) => ({
      CodigoEmpaque: f.CodigoEmpaque.trim(),
      IdTipoEmpaque: Number(f.IdTipoEmpaque),
      PesoKg: Number(f.PesoKg),
    }));

    setEnviando(true);
    try {
      const data = await cargarLoteEmpaque(
        Number(idProveedor),
        Number(cantidadToneladasPedida),
        empaques,
      );
      setResultado(data);
      setBloques([nuevoBloque(tipos[0]?.IdTipoEmpaque ?? "")]);
      setCantidadToneladasPedida("");
      setTocado(false);
      const total = data.Resumen.reduce((s, r) => s + r.CantidadEmpaques, 0);
      toast.success(`${total} empaques ingresados al almacén`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrorEnvio(e.message);
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const totalPesoKg = filasPlanas.reduce(
    (s, f) => s + (Number(f.PesoKg) > 0 ? Number(f.PesoKg) : 0),
    0,
  );

  const totalResultado = resultado
    ? resultado.Resumen.reduce((s, r) => s + r.CantidadEmpaques, 0)
    : 0;

  const nombreTipo = (idTipoEmpaque) =>
    tipos.find((t) => t.IdTipoEmpaque === idTipoEmpaque)?.NombreTipoEmpaque ?? "";

  return (
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        volver
        titulo="Almacén · Materia Prima"
        subtitulo="Registrar ingreso de empaques"
        contador={{
          valor: filasPlanas.length,
          singular: "empaque en el lote",
          plural: "empaques en el lote",
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
              <div className="flex flex-col gap-1">
                <div className="text-base font-extrabold text-slate-900">
                  Lote registrado
                </div>
                <div className="text-sm text-slate-600">
                  {totalResultado} empaques · Recepción{" "}
                  {dateFormatter(resultado.Resumen[0]?.FechaRecepcion)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resultado.Resumen.map((r) => (
                    <Badge
                      key={r.IdTipoEmpaque}
                      variant="outline"
                      className="border-emerald-300 font-bold text-emerald-700"
                    >
                      {r.NombreTipoEmpaque}: {r.CantidadEmpaques}
                    </Badge>
                  ))}
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
              Se aplican al pedido completo, no a cada empaque
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:gap-6">
            <div className="flex flex-1 flex-col gap-1.5">
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

            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Toneladas pedidas
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cantidadToneladasPedida}
                onChange={(e) => setCantidadToneladasPedida(e.target.value)}
                placeholder="Ej. 12.5"
                className={cn(
                  "h-11",
                  tocado &&
                    (!cantidadToneladasPedida ||
                      Number(cantidadToneladasPedida) <= 0) &&
                    "border-red-300 focus-visible:ring-red-300",
                )}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-base font-extrabold text-slate-900">
                Empaques del lote
              </div>
              <div className="text-sm text-slate-500">
                Agrupados por tipo de empaque
              </div>
              {errorTipos && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
                  {errorTipos}
                  <Button
                    variant="outline"
                    onClick={cargarTipos}
                    className="h-7 border-red-300 px-2 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    Reintentar
                  </Button>
                </div>
              )}
              {!loadingTipos && !errorTipos && tipos.length === 0 && (
                <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                  No hay tipos de empaque registrados.
                </div>
              )}
            </div>
            <Button
              onClick={agregarBloque}
              disabled={loadingTipos || tipos.length === 0}
              className="h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
            >
              <Layers size={16} strokeWidth={2.75} />
              Agregar tipo de empaque
            </Button>
          </div>

          {loadingTipos && <Skeleton className="h-64 w-full rounded-2xl" />}

          {!loadingTipos &&
            bloques.map((b, bi) => {
              const acento = ACENTOS[bi % ACENTOS.length];
              const errTipo = tocado ? erroresBloques[b.id] : null;
              return (
                <div
                  key={b.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border-2 bg-white shadow-sm",
                    errTipo ? "border-red-300" : acento.border,
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5",
                      acento.soft,
                    )}
                  >
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Tipo {bi + 1}
                      </span>
                      <div className="min-w-[220px] flex-1 sm:max-w-xs">
                        <SelectEntidad
                          opciones={tipos}
                          valor={b.IdTipoEmpaque}
                          onCambio={(v) => actualizarTipoBloque(b.id, v)}
                          campoValor="IdTipoEmpaque"
                          campoEtiqueta="NombreTipoEmpaque"
                          placeholder="Selecciona el tipo"
                          invalido={!!errTipo}
                          className="h-10! bg-white"
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("border font-bold", acento.text, acento.border)}
                      >
                        {b.filas.length} {b.filas.length === 1 ? "bobina" : "bobinas"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => quitarBloque(b.id)}
                      disabled={bloques.length === 1}
                      className="h-9 gap-1.5 font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Quitar tipo
                    </Button>
                  </div>

                  <div className="hidden md:block">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          <th className="w-12 px-5 py-2.5">#</th>
                          <th className="px-3 py-2.5">Código</th>
                          <th className="w-36 px-3 py-2.5">Peso (kg)</th>
                          <th className="w-14 px-3 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.filas.map((f, i) => {
                          const err = tocado ? erroresFilas[f.id] : null;
                          return (
                            <tr
                              key={f.id}
                              className={cn(
                                "border-b border-slate-100 last:border-0",
                                err && "bg-red-50/60",
                              )}
                            >
                              <td className="px-5 py-2 text-sm font-bold text-slate-400">
                                {i + 1}
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  ref={(el) => (refsCodigo.current[f.id] = el)}
                                  value={f.CodigoEmpaque}
                                  onChange={(e) =>
                                    actualizarFila(b.id, f.id, "CodigoEmpaque", aCodigo(e.target.value))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && i === b.filas.length - 1)
                                      agregarFila(b.id);
                                  }}
                                  placeholder="Ej. EMP-2026-0148"
                                  className={cn(
                                    "h-10 font-mono",
                                    err && "border-red-300 focus-visible:ring-red-300",
                                  )}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={f.PesoKg}
                                  onChange={(e) =>
                                    actualizarFila(b.id, f.id, "PesoKg", e.target.value)
                                  }
                                  placeholder="0.00"
                                  className={cn(
                                    "h-10",
                                    err && "border-red-300 focus-visible:ring-red-300",
                                  )}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => quitarFila(b.id, f.id)}
                                  disabled={b.filas.length === 1}
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
                  </div>

                  <div className="flex flex-col gap-3 p-4 md:hidden">
                    {b.filas.map((f, i) => {
                      const err = tocado ? erroresFilas[f.id] : null;
                      return (
                        <div
                          key={f.id}
                          className={cn(
                            "flex flex-col gap-3 rounded-xl border p-3.5",
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
                              onClick={() => quitarFila(b.id, f.id)}
                              disabled={b.filas.length === 1}
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
                              value={f.CodigoEmpaque}
                              onChange={(e) =>
                                actualizarFila(b.id, f.id, "CodigoEmpaque", aCodigo(e.target.value))
                              }
                              placeholder="Ej. EMP-2026-0148"
                              className="h-11 bg-white font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                              Peso (kg)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={f.PesoKg}
                              onChange={(e) =>
                                actualizarFila(b.id, f.id, "PesoKg", e.target.value)
                              }
                              placeholder="0.00"
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

                  <div className="border-t border-slate-100 px-5 py-3">
                    <Button
                      variant="outline"
                      onClick={() => agregarFila(b.id)}
                      className={cn("h-10 gap-2 font-bold", acento.text, acento.border)}
                    >
                      <Plus size={15} strokeWidth={2.75} />
                      Agregar bobina {nombreTipo(b.IdTipoEmpaque) && `de ${nombreTipo(b.IdTipoEmpaque)}`}
                    </Button>
                  </div>
                </div>
              );
            })}
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
                {filasPlanas.length} {filasPlanas.length === 1 ? "empaque" : "empaques"}
              </span>
              <span className="text-slate-400">
                en {bloques.length} {bloques.length === 1 ? "tipo" : "tipos"}
              </span>
              <span className="text-slate-400">
                Peso total{" "}
                <strong className="text-slate-200">
                  {totalPesoKg.toFixed(2)} kg
                </strong>
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
