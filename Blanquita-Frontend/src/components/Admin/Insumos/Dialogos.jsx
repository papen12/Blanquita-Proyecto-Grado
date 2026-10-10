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
import { limpiarObservacion } from "@/utils/validators";
import { InsumoDatos } from "@/models/Insumo/Insumo";
import { crearInsumo, editarInsumo } from "@/services/Insumo/Insumo";

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 60;
const DESCRIPCION_MIN = 10;
const DESCRIPCION_MAX = 50;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,()/-]+$/;

const VALORES_POR_DEFECTO = {
  NombreInsumo: "",
  DescripcionInsumo: "",
};

const aFormulario = (insumo) => ({
  NombreInsumo: insumo.NombreInsumo,
  DescripcionInsumo: insumo.DescripcionInsumo ?? "",
});

function erroresInsumo(datos, editando) {
  const errores = {};
  const { NombreInsumo, DescripcionInsumo } = InsumoDatos(datos);
  if (!editando && NombreInsumo && (NombreInsumo.length < NOMBRE_MIN || !PATRON_NOMBRE.test(NombreInsumo)))
    errores.NombreInsumo = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y . , ( ) / -`;
  if (
    DescripcionInsumo &&
    (DescripcionInsumo.length < DESCRIPCION_MIN || DescripcionInsumo.length > DESCRIPCION_MAX)
  )
    errores.DescripcionInsumo = `Entre ${DESCRIPCION_MIN} y ${DESCRIPCION_MAX} caracteres`;
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
      <span className="text-xs text-slate-500">
        El nombre no se puede cambiar para conservar la trazabilidad de los movimientos.
      </span>
    </div>
  );
}

export function DialogoInsumo({ abierto, insumo, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const editando = Boolean(insumo);

  useEffect(() => {
    if (!abierto) return;
    setDatos(insumo ? aFormulario(insumo) : VALORES_POR_DEFECTO);
    setConfirmado(false);
    setError("");
  }, [abierto, insumo]);

  const cambiar = (campo) => (valor) => setDatos((previos) => ({ ...previos, [campo]: valor }));

  const limpios = InsumoDatos(datos);
  const errores = erroresInsumo(datos, editando);
  const completo = limpios.DescripcionInsumo !== "" && (editando || limpios.NombreInsumo !== "");
  const sinCambios =
    editando && InsumoDatos(aFormulario(insumo)).DescripcionInsumo === limpios.DescripcionInsumo;
  const valido =
    completo && Object.keys(errores).length === 0 && !sinCambios && (editando || confirmado);
  const largoDescripcion = limpios.DescripcionInsumo.length;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const guardado = editando
        ? await editarInsumo(insumo.IdTipoInsumo, datos)
        : await crearInsumo(datos);
      onGuardado(guardado, editando);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar insumo" : "Registrar insumo"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Solo se puede cambiar la descripción. Los movimientos registrados no se modifican."
              : "El insumo se crea con stock 0 y aparece en el inventario de insumos de la planta."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {editando ? (
            <NombreFijo nombre={insumo.NombreInsumo} />
          ) : (
            <InputForModal
              id="insumo-nombre"
              etiqueta="Nombre"
              valor={datos.NombreInsumo}
              onCambio={(v) => {
                cambiar("NombreInsumo")(v.slice(0, NOMBRE_MAX));
                setConfirmado(false);
              }}
              placeholder="Ej. Pegamento de laminado"
              error={errores.NombreInsumo}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="insumo-descripcion" className={ETIQUETA}>
              Descripción
            </Label>
            <Textarea
              id="insumo-descripcion"
              value={datos.DescripcionInsumo}
              onChange={(e) => cambiar("DescripcionInsumo")(limpiarObservacion(e.target.value))}
              placeholder="Ej. Llega en turriles; uso en rebobinadora"
              className="min-h-20"
              maxLength={DESCRIPCION_MAX}
              aria-invalid={Boolean(errores.DescripcionInsumo)}
            />
            <span
              className={
                errores.DescripcionInsumo ? "text-xs font-semibold text-red-600" : "text-xs text-slate-500"
              }
            >
              {errores.DescripcionInsumo ??
                `${largoDescripcion}/${DESCRIPCION_MAX} · mínimo ${DESCRIPCION_MIN} caracteres`}
            </span>
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
                  Confirmo el registro del insumo
                  {limpios.NombreInsumo && ` «${limpios.NombreInsumo}»`}
                </span>
                <span className="text-[12.5px] text-slate-600">
                  Una vez registrado, el insumo no se puede eliminar y su nombre no podrá ser
                  editado. Solo se podrá cambiar la descripción.
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
            {editando ? "Guardar cambios" : "Registrar insumo"}
          </BotonEnviar>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
