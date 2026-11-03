export const estadoStock = (cantidad, { StockMinimo = null, StockPreventivo = null } = {}) => {
  const valor = Number(cantidad || 0);
  if (valor <= 0) return "agotado";
  if (StockMinimo === null) return "disponible";
  if (valor <= StockMinimo) return "critico";
  if (StockPreventivo !== null && valor <= StockPreventivo) return "bajo";
  return "disponible";
};

export const FILTROS_STOCK = [
  { id: "todos", texto: "Todos" },
  { id: "disponible", texto: "Con stock" },
  { id: "bajo", texto: "Stock bajo" },
  { id: "critico", texto: "Stock crítico" },
  { id: "agotado", texto: "Sin stock" },
];

export const coincideEstadoStock = (filtro, estado) => filtro === "todos" || filtro === estado;

export const RELLENO_STOCK = {
  disponible: "bg-emerald-500",
  bajo: "bg-amber-500",
  critico: "bg-red-500",
  agotado: "bg-slate-300",
};

export const ESTILO_STOCK = {
  disponible: {
    texto: "Disponible",
    clase: "bg-emerald-50 text-emerald-700",
    numero: "text-emerald-700",
  },
  bajo: {
    texto: "Stock bajo",
    clase: "bg-amber-50 text-amber-700",
    numero: "text-amber-600",
  },
  critico: {
    texto: "Stock crítico",
    clase: "bg-red-50 text-red-700",
    numero: "text-red-600",
  },
  agotado: {
    texto: "Sin stock",
    clase: "bg-slate-100 text-slate-500",
    numero: "text-slate-400",
  },
};
