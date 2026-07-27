export const ACENTOS = [
  {
    text: "text-c3",
    bg: "bg-c4",
    soft: "bg-c4/8",
    border: "border-c4/30",
    ring: "ring-c4/40",
  },
  {
    text: "text-serv3",
    bg: "bg-serv3",
    soft: "bg-serv3/8",
    border: "border-serv3/30",
    ring: "ring-serv3/40",
  },
  {
    text: "text-lux2",
    bg: "bg-lux1",
    soft: "bg-lux1/8",
    border: "border-lux1/30",
    ring: "ring-lux1/40",
  },
  {
    text: "text-eco2",
    bg: "bg-eco1",
    soft: "bg-eco1/8",
    border: "border-eco1/30",
    ring: "ring-eco1/40",
  },
];

export const fmt = (n) =>
  Number(n || 0).toLocaleString("es-BO", { maximumFractionDigits: 1 });