import { ObtenerTiposPapelBobina } from "@/services/BobinaPapel/BobinaPapel";

export const TIPO_BOBINA_PAPEL = {
  cargar: ObtenerTiposPapelBobina,
  campo: "IdsTipoBobina",
  campoValor: "IdTipoBobina",
  campoEtiqueta: "NombreTipoBobina",
  etiqueta: "Tipo de bobina",
};

export const CODIGO_BOBINA_PAPEL = {
  campo: "CodigoBobina",
  etiqueta: "Código de bobina",
  placeholder: "Ej. 963-R20",
};
