import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputForModal from "@/components/layout/InputForModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BotonEnviar, ErrorDialogo, ETIQUETA } from "@/components/Admin/Usuarios/Dialogos";
import { formatearNumero } from "@/utils/numeros";
import { TipoBobinaServilletaDatos } from "@/models/BobinaServilleta/TipoBobinaServilleta";
import {
  crearTipoBobinaServilleta,
  editarTipoBobinaServilleta,
} from "@/services/BobinaServilleta/BobinaServilleta";

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 30;
const DESCRIPCION_MIN = 5;
const DESCRIPCION_MAX = 150;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$/;
const PATRON_DECIMAL = /^\d{0,4}(\.\d{0,2})?$/;

const CAMPOS_MEDIDA = [
  { campo: "DiametroMm", etiqueta: "Diámetro (mm)", maximo: 5000 },
  { campo: "CrepadoPorcentaje", etiqueta: "Crepado (%)", maximo: 100 },
  { campo: "ResistenciaKgf", etiqueta: "Resistencia (kgf)", maximo: 1000 },
];

const VALORES_POR_DEFECTO = {
  NombreTipoBobinaServilleta: "",
  Descripcion: "",
  DiametroMm: "1210",
  CrepadoPorcentaje: "14",
  ResistenciaKgf: "1.35",
};

const aFormulario = (tipo) => ({
  NombreTipoBobinaServilleta: tipo.NombreTipoBobinaServilleta,
  Descripcion: tipo.Descripcion ?? "",
  DiametroMm: String(tipo.DiametroMm),
  CrepadoPorcentaje: String(tipo.CrepadoPorcentaje),
  ResistenciaKgf: String(tipo.ResistenciaKgf),
});

function erroresTipo(datos) {
  const errores = {};
  const { NombreTipoBobinaServilleta: nombre, Descripcion: descripcion } =
    TipoBobinaServilletaDatos(datos);
  if (nombre && (nombre.length < NOMBRE_MIN || !PATRON_NOMBRE.test(nombre)))
    errores.NombreTipoBobinaServilleta = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y guiones`;
  if (descripcion && descripcion.length < DESCRIPCION_MIN)
    errores.Descripcion = `Mínimo ${DESCRIPCION_MIN} caracteres`;
  for (const { campo, maximo } of CAMPOS_MEDIDA) {
    const valor = Number(datos[campo]);
    if (datos[campo] !== "" && (!(valor > 0) || valor > maximo))
      errores[campo] = `Mayor a 0 y hasta ${formatearNumero(maximo, { decimales: 0 })}`;
  }
  return errores;
}

function NombreFijo({ nombre }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className={ETIQUETA}>Nombre</Label>
      <div className="flex h-11 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700">
        <Lock size={14} className="shrink-0 text-slate-400" />
        <span className="truncate">{nombre}</span>
      </div>
      <span className="text-xs text-slate-500">El nombre no se puede cambiar.</span>
    </div>
  );
}

export function DialogoTipo({ abierto, tipo, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const editando = Boolean(tipo);

  useEffect(() => {
    if (!abierto) return;
    setDatos(tipo ? aFormulario(tipo) : VALORES_POR_DEFECTO);
    setConfirmado(false);
    setError("");
  }, [abierto, tipo]);

  const cambiar = (campo) => (valor) => setDatos((previos) => ({ ...previos, [campo]: valor }));

  const limpios = TipoBobinaServilletaDatos(datos);
  const errores = erroresTipo(datos);
  const completo =
    limpios.NombreTipoBobinaServilleta !== "" &&
    limpios.Descripcion !== "" &&
    CAMPOS_MEDIDA.every(({ campo }) => datos[campo] !== "");
  const sinCambios =
    editando &&
    JSON.stringify(TipoBobinaServilletaDatos(aFormulario(tipo))) === JSON.stringify(limpios);
  const valido =
    completo && Object.keys(errores).length === 0 && !sinCambios && (editando || confirmado);

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const guardado = editando
        ? await editarTipoBobinaServilleta(tipo.IdTipoBobinaServilleta, datos)
        : await crearTipoBobinaServilleta(datos);
      onGuardado(guardado, editando);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar tipo de bobina servilleta" : "Nuevo tipo de bobina servilleta"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? "Los cambios no modifican las bobinas ya registradas."
              : "El diámetro, el crepado y la resistencia son valores de referencia del tipo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {editando ? (
            <NombreFijo nombre={tipo.NombreTipoBobinaServilleta} />
          ) : (
            <InputForModal
              id="tipo-nombre"
              etiqueta="Nombre"
              valor={datos.NombreTipoBobinaServilleta}
              onCambio={(v) => {
                cambiar("NombreTipoBobinaServilleta")(v.slice(0, NOMBRE_MAX));
                setConfirmado(false);
              }}
              placeholder="Ej. Doble hoja"
              error={errores.NombreTipoBobinaServilleta}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo-descripcion" className={ETIQUETA}>
              Descripción
            </Label>
            <Textarea
              id="tipo-descripcion"
              value={datos.Descripcion}
              onChange={(e) => cambiar("Descripcion")(e.target.value.slice(0, DESCRIPCION_MAX))}
              placeholder="Ej. Papel tissue para servilleta de mesa, color blanco"
              className="min-h-20"
              maxLength={DESCRIPCION_MAX}
              aria-invalid={Boolean(errores.Descripcion)}
            />
            {errores.Descripcion ? (
              <p className="text-xs font-semibold text-red-600">{errores.Descripcion}</p>
            ) : (
              <span className="text-xs text-slate-500">
                {datos.Descripcion.length}/{DESCRIPCION_MAX} · mínimo {DESCRIPCION_MIN} caracteres
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CAMPOS_MEDIDA.map(({ campo, etiqueta }) => (
              <InputForModal
                key={campo}
                id={`tipo-${campo}`}
                etiqueta={etiqueta}
                valor={datos[campo]}
                onCambio={(v) => PATRON_DECIMAL.test(v) && cambiar(campo)(v)}
                inputMode="decimal"
                classNameInput="tabular-nums"
                error={errores[campo]}
              />
            ))}
          </div>

          {!editando && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-slate-900"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">
                  Confirmo la creación del tipo
                  {limpios.NombreTipoBobinaServilleta && ` «${limpios.NombreTipoBobinaServilleta}»`}
                </span>
                <span className="text-[12.5px] text-slate-600">
                  Una vez creado, el nombre no podrá ser editado. Solo se podrán cambiar la
                  descripción y las medidas.
                </span>
              </span>
            </label>
          )}

          {error && <ErrorDialogo mensaje={error} />}
        </div>

        <DialogFooter>
          <BotonEnviar
            onClick={confirmar}
            enviando={enviando}
            deshabilitado={!valido}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {editando ? "Guardar cambios" : "Crear tipo"}
          </BotonEnviar>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
