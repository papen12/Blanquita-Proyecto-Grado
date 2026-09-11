INSERT INTO "Turno" ("NombreTurno", "HoraInicio", "HoraFin", "DescripcionTurno") VALUES
('Mañana', '06:00:00', '11:59:59', 'Turno regular, el más habitual (entra 06:00, suele extenderse hasta las 15:00)'),
('Tarde', '12:00:00', '15:00:00', 'Segundo turno regular, poco frecuente'),
('Horas Extra', '15:01:00', '05:59:59', 'Extensión del turno mañana para completar 8 horas; no aplica a todo el personal, solo al área que lo requiera (ej. rebobinado)');

INSERT INTO "Rol" ("NombreRol", "Descripcion") VALUES
('Operador', 'Personal encargado de registrar movimientos de materia prima y producción'),
('Líder de Inventario y Producción', 'Encargado de validar los ajustes/movimientos de inventario y producción');

INSERT INTO "EstadoUsuario" ("NombreEstadoUsuario", "DescripcionEstadoUsuario") VALUES
('Activo', 'Usuario habilitado para operar el sistema'),
('Inactivo', 'Usuario deshabilitado temporalmente'),
('Suspendido', 'Usuario bloqueado por incumplimiento de políticas');


INSERT INTO "EstadoProveedor" ("NombreEstadoProveedor", "DescripcionEstadoProveedor") VALUES
('Activo', 'Proveedor habilitado para recepción de materia prima'),
('Inactivo', 'Proveedor deshabilitado temporalmente');



INSERT INTO "TipoBobina" ("NombreTipoBobina", "DiametroMm", "Formato", "TaraKg") VALUES
('Higiénico', 1210, 2760, 38),
('Toalla', 1210, 2760, 38),
('Económico', 1210, 2760, 38);

INSERT INTO "TipoPallet" ("NumeroRodelas", "Descripcion") VALUES
(1, 'Pallet estándar de una rodela'),
(2, 'Pallet doble rodela');

INSERT INTO "EstadoMateriaPrima" ("TipoEstado") VALUES
('En almacén'),
('En producción'),
('Agotado'),
('Dado de baja'),
('Fuera de Inventario'),
('Abierta'),
('Terminada');

INSERT INTO "TipoEmpaque" ("NombreTipoEmpaque") VALUES
('Eco Pack'),
('Luxury'),
('Servilletas'),
('Toalla');

INSERT INTO "TipoMovimientoMateriaPrima" ("NombreMovimiento", "AplicaA", "DescripcionTipoMovimientoMateriaPrima") VALUES
('Ingreso a almacén', 'Todos', 'Registro de ingreso inicial de materia prima al almacén'),
('Traslado a producción', 'Todos', 'Movimiento de materia prima desde almacén hacia planta de producción'),
('Devolución a almacén', 'Todos', 'Retorno de materia prima no utilizada a almacén (evento raro)'),
('Baja por defecto', 'Todos', 'Retiro definitivo de materia prima por daño o defecto confirmado'),
('Retiro por falla operativa', 'Todos', 'Retiro de materia prima ya cargada en producción que no pudo procesarse; pasa a "Fuera de Inventario"'),
('Reingreso a inventario', 'Todos', 'Materia prima "Fuera de Inventario" regresa a "En almacén" para recontarse'),
('Producción terminada', 'Todos', 'Registra el cierre de una producción.');

INSERT INTO "EstadoProduccion" ("NombreEstadoProduccion", "DescripcionEstadoProduccion") VALUES
('En Producción', 'Proceso de producción activo y en curso'),
('Pausa', 'Producción detenida temporalmente (motivo libre: empalme, falta de pegamento, falta de personal, falla de maquinaria, limpieza, etc.)'),
('Finalizado', 'Proceso de producción concluido'),
('Cancelada', 'Producción interrumpida de forma definitiva por falla; no se reanuda con el mismo par de bobinas');

INSERT INTO "Producto" ("NombreProducto") VALUES
('Luxury'),
('EcoPack'),
('Servilleta'),
('Mega Rollo'),
('Economico'),
('Merma'),
('Toalla');

INSERT INTO "PresentacionProducto" ("IdProducto", "TipoContenedor", "CantidadRollosUnidades", "CantidadPorUnidadTerminada", "CodigoPresentacion") VALUES
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Luxury'), 'Jaba', 6, 6, 'LUX-J06'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Luxury'), 'Jaba', 12, 12, 'LUX-J12'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Luxury'), 'Jaba', 24, 24, 'LUX-J24'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'EcoPack'), 'Jaba', 4, 4, 'ECO-J04'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'EcoPack'), 'Jaba', 6, 6, 'ECO-J06'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'EcoPack'), 'Jaba', 12, 12, 'ECO-J12'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Servilleta'), 'Jaba', 50, 28, 'SRV-J50'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Servilleta'), 'Jaba', 200, 12, 'SRV-J200'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Servilleta'), 'Jaba', 500, 6, 'SRV-J500'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Mega Rollo'), 'Plancha', 12, 1, 'MRO-P12'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Economico'), 'Plancha', 20, 1, 'ECN-P20'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Toalla'), 'Jaba', 2, 12, 'TOA-J06'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Merma'), 'Plancha', 1, 1, 'MER-P01'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Merma'), 'Jaba', 1, 1, 'MER-S01'),
((SELECT "IdProducto" FROM "Producto" WHERE "NombreProducto" = 'Merma'), 'Jaba', 1, 1, 'MER-T01');




INSERT INTO "TipoMovimientoInventario" ("NombreTipoMovimientoInventario", "DescripcionTipoMovimientoInventario") VALUES
('Entrada', 'Ingreso de producto terminado desde producción'),
('Salida', 'Salida de producto por despacho/venta'),
('Descuento', 'Reducción por causa operativa distinta a venta'),
('Aumento', 'Incremento por causa operativa distinta a producción'),
('Ajuste Positivo', 'Corrección manual que incrementa el saldo'),
('Ajuste Negativo', 'Corrección manual que reduce el saldo');

INSERT INTO "InventarioProductoTerminado" ("IdPresentacion", "CantidadActual")
SELECT "IdPresentacion", 0
FROM "PresentacionProducto";

INSERT INTO "TipoMovimientoOperadorLogs" ("NombreMovimiento", "DescripcionTipoMovimientoOperadorLogs") VALUES
('Ingreso', 'Registro de logs producidos por el operador durante el turno'),
('Descuento', 'Corrección que resta logs registrados por error'),
('Aumento', 'Corrección que suma logs no contabilizados previamente');




INSERT INTO "TipoEmpaqueBolsa" ("NombreEmpaqueBolsa", "DescripcionEmpaqueBolsa") VALUES
('Económico', 'Plancha, papel higiénico económico'),
('Megarollo', 'Plancha, papel higiénico Megarollo'),
('Merma Plancha', 'Producto de segunda categoría, línea plancha'),
('Merma Servilletas', 'Producto de segunda categoría, línea servilleta');



INSERT INTO "InventarioEmpaqueBolsa" ("IdTipoEmpaqueBolsa", "CantidadActual")
SELECT "IdTipoEmpaqueBolsa", 0
FROM "TipoEmpaqueBolsa";



INSERT INTO "TipoMedidaSubBobina" ("MedidaMm", "Descripcion") VALUES
(435, 'Sub-bobina 435mm'),
(220, 'Sub-bobina 220mm');

INSERT INTO "TipoBobinaServilleta" ("NombreTipoBobinaServilleta", "DiametroMm", "CrepadoPorcentaje", "ResistenciaKgf") VALUES
('G-18 CR-14%', 1210, 14, 1.35);

INSERT INTO "FormatoSubBobina" ("DescripcionFormato", "CantidadBobina435", "CantidadBobina220") VALUES
('435x3', 3, 0),
('435x2+220x1', 2, 1);




INSERT INTO "Proveedor" ("NombreProveedor", "CelularProveedor", "CorreoProveedor","IdEstadoProveedor") VALUES
('Papelera del Sur S.R.L.', '70012345', 'ventas@papeleradelsur.com',1);
