export const movimientosOperador = [
    {
        IdTipoMovimientoOperadorLogs: 1,
        NombreMovimiento: "Ingreso",
        DescripcionTipoMovimientoOperadorLogs:
        "Registro de logs producidos por el operador durante el turno",
    },
    {
        IdTipoMovimientoOperadorLogs: 2,
        NombreMovimiento: "Descuento",
        DescripcionTipoMovimientoOperadorLogs:
        "Corrección que resta logs registrados por error",
    },
    {
        IdTipoMovimientoOperadorLogs: 3,
        NombreMovimiento: "Aumento",
        DescripcionTipoMovimientoOperadorLogs:
        "Corrección que suma logs no contabilizados previamente",
    },
];


export const ObservacionesInsertarLogs = [
    {
        id: 2, // Descuento: corrección que resta logs registrados por error
        motivos: [
            "Error de registro de logs",
            "Doble registro del mismo movimiento",
            "Cantidad ingresada mayor a la real",
            "Logs contabilizados de otra producción",
        ],
    },
    {
        id: 3, // Aumento: corrección que suma logs no contabilizados previamente
        motivos: [
            "Logs no registrados en el turno",
            "Cantidad ingresada menor a la real",
            "Registro omitido por falla del sistema",
            "Ajuste tras reconteo físico",
        ],
    },
];
