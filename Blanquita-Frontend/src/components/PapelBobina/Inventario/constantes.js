import { formatearNumero } from "@/utils/numeros";

export const fmt = (n) =>
  formatearNumero(n, { decimales: 1, decimalesMinimos: 0 });