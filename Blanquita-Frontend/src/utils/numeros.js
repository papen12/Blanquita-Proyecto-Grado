export const formatearNumero = (
  valor,
  { decimales = 2, decimalesMinimos = decimales, vacio } = {},
) => {
  if (vacio !== undefined && (valor === null || valor === undefined)) return vacio;
  return Number(valor || 0).toLocaleString("es-BO", {
    minimumFractionDigits: decimalesMinimos,
    maximumFractionDigits: decimales,
  });
};
