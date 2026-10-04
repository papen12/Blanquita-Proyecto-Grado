import { ObtenerTiposBobinaServilleta } from "@/services/BobinaServilleta/BobinaServilleta";

const TIPO = {
  cargar: ObtenerTiposBobinaServilleta,
  campoValor: "IdTipoBobinaServilleta",
  campoEtiqueta: "NombreTipoBobinaServilleta",
  etiqueta: "Tipo de bobina",
};

export const TIPO_BOBINA_SERVILLETA = { ...TIPO, campo: "IdTipoBobinaServilleta", unico: true };

export const TIPOS_BOBINA_SERVILLETA = { ...TIPO, campo: "IdsTipoBobinaServilleta" };

export const CODIGO_UNIDAD = {
  campo: "CodigoBobina",
  etiqueta: "Código de unidad",
  placeholder: "Ej. BSERV-260903-01A",
};
