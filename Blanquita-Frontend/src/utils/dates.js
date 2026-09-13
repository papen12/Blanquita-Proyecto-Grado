import { format } from "date-fns";
import { es } from "date-fns/locale";

export function dateFormatter(fechaUtc) {
    return new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date(fechaUtc));
}

export function dateOnlyFormatter(fecha) {
    return format(new Date(`${fecha}T00:00:00`), "d 'de' LLL, y", { locale: es });
}