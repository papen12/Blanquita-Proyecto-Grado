CREATE OR REPLACE FUNCTION "InsertarBobinasServilleta"(
  p_IdProveedor            INTEGER,
  p_IdTipoBobinaServilleta INTEGER,
  p_IdUsuario              INTEGER,
  p_Bobinas                JSONB
) RETURNS TABLE (
  "FechaRecepcion"          DATE,
  "CantidadBobinasServilleta" INTEGER,
  "CantidadUnidades"        INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdLoteBobinaServilleta INTEGER;
  v_FechaRecepcion         DATE;
  v_bobina                 JSONB;
  v_unidad                 JSONB;
  v_IdBobinaServilleta     INTEGER;
  v_CantidadUnidadesBobina INTEGER;
  v_CantidadBobinas        INTEGER := 0;
  v_CantidadUnidadesTotal  INTEGER := 0;
  c_IdEstadoAlmacen        CONSTANT INTEGER := 1;
BEGIN
  IF p_Bobinas IS NULL OR jsonb_array_length(p_Bobinas) = 0 THEN
    RAISE EXCEPTION 'Debe proporcionar al menos una BobinaServilleta.';
  END IF;

  INSERT INTO "LoteBobinaServilleta" AS lbs ("IdProveedor", "IdUsuario", "FechaRecepcion")
  VALUES (p_IdProveedor, p_IdUsuario, CURRENT_DATE)
  RETURNING lbs."IdLoteBobinaServilleta", lbs."FechaRecepcion" INTO v_IdLoteBobinaServilleta, v_FechaRecepcion;

  FOR v_bobina IN SELECT * FROM jsonb_array_elements(p_Bobinas)
  LOOP
    IF v_bobina->'Unidades' IS NULL OR jsonb_array_length(v_bobina->'Unidades') <> 2 THEN
      RAISE EXCEPTION 'Cada BobinaServilleta debe tener exactamente 2 unidades. Recibido: %', COALESCE(jsonb_array_length(v_bobina->'Unidades'), 0);
    END IF;

    INSERT INTO "BobinaServilleta" AS bs (
      "IdLoteBobinaServilleta",
      "IdTipoBobinaServilleta",
      "IdEstadoMateriaPrima"
    ) VALUES (
      v_IdLoteBobinaServilleta,
      p_IdTipoBobinaServilleta,
      c_IdEstadoAlmacen
    )
    RETURNING bs."IdBobinaServilleta" INTO v_IdBobinaServilleta;

    v_CantidadUnidadesBobina := 0;

    FOR v_unidad IN SELECT * FROM jsonb_array_elements(v_bobina->'Unidades')
    LOOP
      IF v_unidad->>'CodigoBobina' IS NULL OR btrim(v_unidad->>'CodigoBobina') = '' THEN
        RAISE EXCEPTION 'CodigoBobina es obligatorio para cada UnidadBobinaServilleta.';
      END IF;

      IF v_unidad->>'IdFormatoSubBobina' IS NULL THEN
        RAISE EXCEPTION 'IdFormatoSubBobina es obligatorio para la unidad con CodigoBobina = %', v_unidad->>'CodigoBobina';
      END IF;

      INSERT INTO "UnidadBobinaServilleta" (
        "IdBobinaServilleta",
        "IdFormatoSubBobina",
        "CodigoBobina",
        "PesoBrutoKg",
        "GramajeGr"
      ) VALUES (
        v_IdBobinaServilleta,
        (v_unidad->>'IdFormatoSubBobina')::INTEGER,
        v_unidad->>'CodigoBobina',
        (v_unidad->>'PesoBrutoKg')::NUMERIC,
        (v_unidad->>'GramajeGr')::NUMERIC
      );

      v_CantidadUnidadesBobina := v_CantidadUnidadesBobina + 1;
    END LOOP;

    v_CantidadBobinas := v_CantidadBobinas + 1;
    v_CantidadUnidadesTotal := v_CantidadUnidadesTotal + v_CantidadUnidadesBobina;
  END LOOP;

  RETURN QUERY
  SELECT
    v_FechaRecepcion,
    v_CantidadBobinas,
    v_CantidadUnidadesTotal;
END;
$$;




CREATE OR REPLACE FUNCTION "AbrirBobinaServilleta"(
  p_IdBobinaServilleta INTEGER,
  p_IdUsuario           INTEGER,
  p_Observacion         TEXT DEFAULT NULL
) RETURNS TABLE (
  "IdBobinaServilleta"     INTEGER,
  "IdEstadoMateriaPrima"   INTEGER,
  "CantidadSubBobinas435"  INTEGER,
  "CantidadSubBobinas220"  INTEGER,
  "CantidadSubBobinasTotal" INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoActual         INTEGER;
  v_IdEstadoAlmacenBobina  CONSTANT INTEGER := 1;
  v_IdEstadoAbierta        CONSTANT INTEGER := 6;
  v_IdEstadoAlmacenSub     CONSTANT INTEGER := 1;
  v_IdTipoMovimientoIngreso CONSTANT INTEGER := 1;
  v_IdTipoMedida435        INTEGER;
  v_IdTipoMedida220        INTEGER;
  v_unidad                 RECORD;
  v_i                      INTEGER;
  v_Cantidad435            INTEGER;
  v_Cantidad220            INTEGER;
  v_TotalSub435            INTEGER := 0;
  v_TotalSub220            INTEGER := 0;
  v_IdSubBobina            INTEGER;
BEGIN
  SELECT bs."IdEstadoMateriaPrima" INTO v_IdEstadoActual
  FROM "BobinaServilleta" AS bs
  WHERE bs."IdBobinaServilleta" = p_IdBobinaServilleta
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la BobinaServilleta con IdBobinaServilleta = %', p_IdBobinaServilleta;
  END IF;

  IF v_IdEstadoActual <> v_IdEstadoAlmacenBobina THEN
    RAISE EXCEPTION 'La BobinaServilleta % no está En almacén (estado actual: %), no puede abrirse', p_IdBobinaServilleta, v_IdEstadoActual;
  END IF;

  SELECT tm."IdTipoMedidaSubBobina" INTO v_IdTipoMedida435
  FROM "TipoMedidaSubBobina" AS tm WHERE tm."MedidaMm" = 435 LIMIT 1;

  SELECT tm."IdTipoMedidaSubBobina" INTO v_IdTipoMedida220
  FROM "TipoMedidaSubBobina" AS tm WHERE tm."MedidaMm" = 220 LIMIT 1;

  IF v_IdTipoMedida435 IS NULL OR v_IdTipoMedida220 IS NULL THEN
    RAISE EXCEPTION 'No se encontraron los tipos de medida de sub-bobina (435/220) en TipoMedidaSubBobina.';
  END IF;

  UPDATE "BobinaServilleta" AS bs
  SET "IdEstadoMateriaPrima" = v_IdEstadoAbierta
  WHERE bs."IdBobinaServilleta" = p_IdBobinaServilleta;

  FOR v_unidad IN
    SELECT
      ub."IdUnidadBobinaServilleta",
      fsb."CantidadBobina435",
      fsb."CantidadBobina220"
    FROM "UnidadBobinaServilleta" AS ub
    INNER JOIN "FormatoSubBobina" AS fsb
      ON fsb."IdFormatoSubBobina" = ub."IdFormatoSubBobina"
    WHERE ub."IdBobinaServilleta" = p_IdBobinaServilleta
    FOR UPDATE OF ub
  LOOP
    v_Cantidad435 := COALESCE(v_unidad."CantidadBobina435", 0);
    v_Cantidad220 := COALESCE(v_unidad."CantidadBobina220", 0);

    FOR v_i IN 1..v_Cantidad435 LOOP
      INSERT INTO "SubBobinaServilleta" AS sb (
        "IdUnidadBobinaServilleta",
        "IdTipoMedidaSubBobina",
        "IdEstadoMateriaPrima"
      ) VALUES (
        v_unidad."IdUnidadBobinaServilleta",
        v_IdTipoMedida435,
        v_IdEstadoAlmacenSub
      )
      RETURNING sb."IdSubBobinaServilleta" INTO v_IdSubBobina;

      INSERT INTO "MovimientoSubBobina" (
        "IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion"
      ) VALUES (
        v_IdSubBobina,
        v_IdTipoMovimientoIngreso,
        p_IdUsuario,
        COALESCE(p_Observacion, 'Generada por apertura de BobinaServilleta #' || p_IdBobinaServilleta)
      );

      v_TotalSub435 := v_TotalSub435 + 1;
    END LOOP;

    FOR v_i IN 1..v_Cantidad220 LOOP
      INSERT INTO "SubBobinaServilleta" AS sb (
        "IdUnidadBobinaServilleta",
        "IdTipoMedidaSubBobina",
        "IdEstadoMateriaPrima"
      ) VALUES (
        v_unidad."IdUnidadBobinaServilleta",
        v_IdTipoMedida220,
        v_IdEstadoAlmacenSub
      )
      RETURNING sb."IdSubBobinaServilleta" INTO v_IdSubBobina;

      INSERT INTO "MovimientoSubBobina" (
        "IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion"
      ) VALUES (
        v_IdSubBobina,
        v_IdTipoMovimientoIngreso,
        p_IdUsuario,
        COALESCE(p_Observacion, 'Generada por apertura de BobinaServilleta #' || p_IdBobinaServilleta)
      );

      v_TotalSub220 := v_TotalSub220 + 1;
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT
    p_IdBobinaServilleta,
    v_IdEstadoAbierta,
    v_TotalSub435,
    v_TotalSub220,
    v_TotalSub435 + v_TotalSub220;
END;
$$;








CREATE OR REPLACE FUNCTION "IniciarProduccionServilleta"(
  p_IdSubBobina INTEGER,
  p_IdUsuario   INTEGER
) RETURNS TABLE (
  "IdProduccionServilleta" INTEGER,
  "FechaInicioProduccion"  TIMESTAMPTZ,
  "IdTurno"                INTEGER,
  "NombreTurno"            TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoProduccion    INTEGER := 1;
  v_IdEstadoAlmacenSub    INTEGER := 1;
  v_IdEstadoEnProdMP      INTEGER := 2;
  v_IdTipoMovimiento      INTEGER := 2;
  v_EstadoSubBobinaActual INTEGER;
  v_HoraLocal             TIME;
  v_IdTurno               INTEGER;
  v_IdProduccionServilleta INTEGER;
  v_FechaInicioProduccion TIMESTAMPTZ;
BEGIN
  IF p_IdSubBobina IS NULL THEN
    RAISE EXCEPTION 'IdSubBobina es obligatorio para iniciar producción de Servilleta.';
  END IF;

  SELECT sb."IdEstadoMateriaPrima"
  INTO v_EstadoSubBobinaActual
  FROM "SubBobinaServilleta" AS sb
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la sub-bobina con IdSubBobinaServilleta = %', p_IdSubBobina;
  END IF;

  IF v_EstadoSubBobinaActual <> v_IdEstadoAlmacenSub THEN
    RAISE EXCEPTION 'La sub-bobina % no está En almacén (estado actual: %), no puede ingresar a producción', p_IdSubBobina, v_EstadoSubBobinaActual;
  END IF;

  v_HoraLocal := (now() AT TIME ZONE 'America/La_Paz')::TIME;

  SELECT t."IdTurno" INTO v_IdTurno
  FROM "Turno" t
  WHERE
    (t."HoraInicio" <= t."HoraFin" AND v_HoraLocal BETWEEN t."HoraInicio" AND t."HoraFin")
    OR
    (t."HoraInicio" > t."HoraFin" AND (v_HoraLocal >= t."HoraInicio" OR v_HoraLocal <= t."HoraFin"))
  LIMIT 1;

  INSERT INTO "ProduccionServilleta" AS ps (
    "IdEstadoProduccion",
    "IdUsuario",
    "IdSubBobina",
    "IdTurno",
    "FechaInicioProduccion",
    "FechaFinProduccion"
  ) VALUES (
    v_IdEstadoProduccion,
    p_IdUsuario,
    p_IdSubBobina,
    v_IdTurno,
    now(),
    NULL
  )
  RETURNING ps."IdProduccionServilleta", ps."FechaInicioProduccion"
  INTO v_IdProduccionServilleta, v_FechaInicioProduccion;

  UPDATE "SubBobinaServilleta" AS sb
  SET "IdEstadoMateriaPrima" = v_IdEstadoEnProdMP
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina;

  INSERT INTO "MovimientoSubBobina" ("IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion")
  VALUES (p_IdSubBobina, v_IdTipoMovimiento, p_IdUsuario, 'Traslado a producción - Producción Servilleta');

  RETURN QUERY
  SELECT
    v_IdProduccionServilleta,
    v_FechaInicioProduccion,
    v_IdTurno,
    t."NombreTurno"
  FROM "Turno" t
  WHERE t."IdTurno" = v_IdTurno;
END;
$$;













CREATE OR REPLACE FUNCTION "PausaProduccionServilleta"(
  p_IdProduccionServilleta INTEGER,
  p_IdUsuario              INTEGER,
  p_MotivoPausaProduccion  TEXT
) RETURNS TABLE (
  "IdPausaProduccionServilleta" INTEGER,
  "IdProduccionServilleta"      INTEGER,
  "FechaHoraPausa"              TIMESTAMPTZ,
  "MotivoPausaProduccion"       TEXT,
  "FechaHoraReanudacion"        TIMESTAMPTZ,
  "IdEstadoProduccion"          INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoProduccionActual  INTEGER;
  v_IdEstadoEnProduccion      INTEGER := 1;
  v_IdEstadoPausa             INTEGER := 2;
  v_IdPausaProduccionServilleta INTEGER;
  v_FechaHoraPausa            TIMESTAMPTZ;
BEGIN
  SELECT ps."IdEstadoProduccion"
  INTO v_IdEstadoProduccionActual
  FROM "ProduccionServilleta" AS ps
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la producción con IdProduccionServilleta = %', p_IdProduccionServilleta;
  END IF;

  IF v_IdEstadoProduccionActual <> v_IdEstadoEnProduccion THEN
    RAISE EXCEPTION 'La producción % no se encuentra En Producción, no puede pausarse', p_IdProduccionServilleta;
  END IF;

  INSERT INTO "PausaProduccionServilleta" AS pps (
    "IdProduccionServilleta",
    "IdUsuario",
    "FechaHoraPausa",
    "MotivoPausaProduccion",
    "FechaHoraReanudacion"
  ) VALUES (
    p_IdProduccionServilleta,
    p_IdUsuario,
    now(),
    p_MotivoPausaProduccion,
    NULL
  )
  RETURNING pps."IdPausaProduccionServilleta", pps."FechaHoraPausa"
  INTO v_IdPausaProduccionServilleta, v_FechaHoraPausa;

  UPDATE "ProduccionServilleta" AS ps
  SET "IdEstadoProduccion" = v_IdEstadoPausa
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta;

  RETURN QUERY
  SELECT
    v_IdPausaProduccionServilleta,
    p_IdProduccionServilleta,
    v_FechaHoraPausa,
    p_MotivoPausaProduccion,
    NULL::TIMESTAMPTZ,
    v_IdEstadoPausa;
END;
$$;










CREATE OR REPLACE FUNCTION "ReanudarProduccionServilleta"(
  p_IdProduccionServilleta INTEGER,
  p_IdUsuario              INTEGER
) RETURNS TABLE (
  "IdPausaProduccionServilleta" INTEGER,
  "IdProduccionServilleta"      INTEGER,
  "FechaHoraPausa"              TIMESTAMPTZ,
  "MotivoPausaProduccion"       TEXT,
  "FechaHoraReanudacion"        TIMESTAMPTZ,
  "IdEstadoProduccion"          INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoProduccionActual    INTEGER;
  v_IdEstadoEnProduccion        INTEGER := 1;
  v_IdEstadoPausa               INTEGER := 2;
  v_IdPausaProduccionServilleta INTEGER;
  v_FechaHoraPausa              TIMESTAMPTZ;
  v_MotivoPausaProduccion       TEXT;
  v_FechaHoraReanudacion        TIMESTAMPTZ;
BEGIN
  SELECT ps."IdEstadoProduccion"
  INTO v_IdEstadoProduccionActual
  FROM "ProduccionServilleta" AS ps
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la producción con IdProduccionServilleta = %', p_IdProduccionServilleta;
  END IF;

  IF v_IdEstadoProduccionActual <> v_IdEstadoPausa THEN
    RAISE EXCEPTION 'La producción % no se encuentra en Pausa, no puede reanudarse', p_IdProduccionServilleta;
  END IF;

  SELECT pps."IdPausaProduccionServilleta", pps."FechaHoraPausa", pps."MotivoPausaProduccion"
  INTO v_IdPausaProduccionServilleta, v_FechaHoraPausa, v_MotivoPausaProduccion
  FROM "PausaProduccionServilleta" AS pps
  WHERE pps."IdProduccionServilleta" = p_IdProduccionServilleta
    AND pps."FechaHoraReanudacion" IS NULL
  ORDER BY pps."FechaHoraPausa" DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe una pausa activa para la producción %', p_IdProduccionServilleta;
  END IF;

  UPDATE "PausaProduccionServilleta" AS pps
  SET "FechaHoraReanudacion" = now()
  WHERE pps."IdPausaProduccionServilleta" = v_IdPausaProduccionServilleta
  RETURNING pps."FechaHoraReanudacion" INTO v_FechaHoraReanudacion;

  UPDATE "ProduccionServilleta" AS ps
  SET "IdEstadoProduccion" = v_IdEstadoEnProduccion
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta;

  RETURN QUERY
  SELECT
    v_IdPausaProduccionServilleta,
    p_IdProduccionServilleta,
    v_FechaHoraPausa,
    v_MotivoPausaProduccion,
    v_FechaHoraReanudacion,
    v_IdEstadoEnProduccion;
END;
$$;














CREATE OR REPLACE FUNCTION "CancelarProduccionServilleta"(
  p_id_produccion       INTEGER,
  p_id_usuario          INTEGER,
  p_motivo_cancelacion  TEXT DEFAULT NULL
)
RETURNS TABLE (
  "IdCancelacionProduccionServilleta" INTEGER,
  "IdProduccionServilleta"            INTEGER,
  "FechaHoraCancelacion"              TIMESTAMPTZ,
  "MotivoCancelacion"                 TEXT,
  "IdEstadoProduccion"                INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado_actual                       INTEGER;
  v_IdSubBobina                         INTEGER;
  v_IdEstadoFueraInventario             INTEGER := 5;
  v_IdTipoMovimientoFalla               INTEGER := 5;
  v_IdCancelacionProduccionServilleta   INTEGER;
  v_FechaHoraCancelacion                TIMESTAMPTZ;
BEGIN
  SELECT ps."IdEstadoProduccion", ps."IdSubBobina"
  INTO v_estado_actual, v_IdSubBobina
  FROM "ProduccionServilleta" AS ps
  WHERE ps."IdProduccionServilleta" = p_id_produccion
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la producción con ID %', p_id_produccion;
  END IF;

  IF v_estado_actual <> 2 THEN
    RAISE EXCEPTION 'La producción % no está en Pausa (estado actual: %), no se puede cancelar', p_id_produccion, v_estado_actual;
  END IF;

  UPDATE "ProduccionServilleta" AS ps
  SET "IdEstadoProduccion" = 4,
      "FechaFinProduccion" = now()
  WHERE ps."IdProduccionServilleta" = p_id_produccion;

  UPDATE "SubBobinaServilleta" AS sb
  SET "IdEstadoMateriaPrima" = v_IdEstadoFueraInventario
  WHERE sb."IdSubBobinaServilleta" = v_IdSubBobina;

  INSERT INTO "MovimientoSubBobina" ("IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion")
  VALUES (v_IdSubBobina, v_IdTipoMovimientoFalla, p_id_usuario, 'Retiro por cancelación de producción - Servilleta #' || p_id_produccion);

  INSERT INTO "CancelacionProduccionServilleta" AS cps (
    "IdProduccionServilleta",
    "IdUsuario",
    "MotivoCancelacion"
  ) VALUES (
    p_id_produccion,
    p_id_usuario,
    p_motivo_cancelacion
  )
  RETURNING cps."IdCancelacionProduccionServilleta", cps."FechaHoraCancelacion"
  INTO v_IdCancelacionProduccionServilleta, v_FechaHoraCancelacion;

  RETURN QUERY
  SELECT
    v_IdCancelacionProduccionServilleta,
    p_id_produccion,
    v_FechaHoraCancelacion,
    p_motivo_cancelacion,
    4;
END;
$$;











CREATE OR REPLACE FUNCTION "ReingresarSubBobinaAInventario"(
  p_IdSubBobina   INTEGER,
  p_IdUsuario     INTEGER,
  p_Observacion   TEXT DEFAULT NULL
) RETURNS TABLE (
  "IdSubBobina"          INTEGER,
  "IdEstadoMateriaPrima" INTEGER,
  "FechaMovimiento"      TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoActual            INTEGER;
  v_IdEstadoFueraInventario   INTEGER := 5;
  v_IdEstadoAlmacen           INTEGER := 1;
  v_IdTipoMovimientoReingreso INTEGER := 6;
  v_FechaMovimiento           TIMESTAMPTZ;
BEGIN
  SELECT sb."IdEstadoMateriaPrima" INTO v_IdEstadoActual
  FROM "SubBobinaServilleta" AS sb
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la sub-bobina con IdSubBobinaServilleta = %', p_IdSubBobina;
  END IF;

  IF v_IdEstadoActual <> v_IdEstadoFueraInventario THEN
    RAISE EXCEPTION 'La sub-bobina % no está Fuera de Inventario (estado actual: %), no puede reingresarse', p_IdSubBobina, v_IdEstadoActual;
  END IF;

  UPDATE "SubBobinaServilleta" AS sb
  SET "IdEstadoMateriaPrima" = v_IdEstadoAlmacen
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina;

  INSERT INTO "MovimientoSubBobina" AS msb ("IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion")
  VALUES (p_IdSubBobina, v_IdTipoMovimientoReingreso, p_IdUsuario, p_Observacion)
  RETURNING msb."FechaMovimiento" INTO v_FechaMovimiento;

  RETURN QUERY
  SELECT
    p_IdSubBobina,
    v_IdEstadoAlmacen,
    v_FechaMovimiento;
END;
$$;













CREATE OR REPLACE FUNCTION "DarDeBajaSubBobina"(
  p_IdSubBobina   INTEGER,
  p_IdUsuario     INTEGER,
  p_Observacion   TEXT DEFAULT NULL
) RETURNS TABLE (
  "IdSubBobina"          INTEGER,
  "IdEstadoMateriaPrima" INTEGER,
  "FechaMovimiento"      TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoActual          INTEGER;
  v_IdEstadoFueraInventario INTEGER := 5;
  v_IdEstadoBaja            INTEGER := 4;
  v_IdTipoMovimientoBaja    INTEGER := 4;
  v_FechaMovimiento         TIMESTAMPTZ;
BEGIN
  SELECT sb."IdEstadoMateriaPrima" INTO v_IdEstadoActual
  FROM "SubBobinaServilleta" AS sb
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la sub-bobina con IdSubBobinaServilleta = %', p_IdSubBobina;
  END IF;

  IF v_IdEstadoActual <> v_IdEstadoFueraInventario THEN
    RAISE EXCEPTION 'La sub-bobina % no está Fuera de Inventario (estado actual: %), no puede darse de baja', p_IdSubBobina, v_IdEstadoActual;
  END IF;

  UPDATE "SubBobinaServilleta" AS sb
  SET "IdEstadoMateriaPrima" = v_IdEstadoBaja
  WHERE sb."IdSubBobinaServilleta" = p_IdSubBobina;

  INSERT INTO "MovimientoSubBobina" AS msb ("IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion")
  VALUES (p_IdSubBobina, v_IdTipoMovimientoBaja, p_IdUsuario, p_Observacion)
  RETURNING msb."FechaMovimiento" INTO v_FechaMovimiento;

  RETURN QUERY
  SELECT
    p_IdSubBobina,
    v_IdEstadoBaja,
    v_FechaMovimiento;
END;
$$;














CREATE OR REPLACE FUNCTION "FinalizarProduccionServilleta"(
  p_IdProduccionServilleta INTEGER,
  p_IdUsuario              INTEGER
) RETURNS TABLE (
  "IdProduccionServilleta"  INTEGER,
  "FechaFinProduccion"      TIMESTAMPTZ,
  "IdEstadoProduccion"      INTEGER,
  "NombreEstadoProduccion"  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_IdEstadoProduccionActual INTEGER;
  v_IdEstadoEnProduccion     INTEGER := 1;
  v_IdEstadoFinalizado       INTEGER := 3;
  v_IdEstadoAgotadoMP        INTEGER := 3;
  v_IdTipoMovimientoFin      INTEGER := 7;
  v_IdSubBobina              INTEGER;
  v_FechaFinProduccion       TIMESTAMPTZ;
BEGIN
  SELECT ps."IdEstadoProduccion", ps."IdSubBobina"
  INTO v_IdEstadoProduccionActual, v_IdSubBobina
  FROM "ProduccionServilleta" AS ps
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe la producción con IdProduccionServilleta = %', p_IdProduccionServilleta;
  END IF;

  IF v_IdEstadoProduccionActual <> v_IdEstadoEnProduccion THEN
    RAISE EXCEPTION 'La producción % no se encuentra En Producción, no puede finalizarse', p_IdProduccionServilleta;
  END IF;

  UPDATE "ProduccionServilleta" AS ps
  SET
    "IdEstadoProduccion" = v_IdEstadoFinalizado,
    "FechaFinProduccion" = now()
  WHERE ps."IdProduccionServilleta" = p_IdProduccionServilleta
  RETURNING ps."FechaFinProduccion" INTO v_FechaFinProduccion;

  UPDATE "SubBobinaServilleta" AS sb
  SET "IdEstadoMateriaPrima" = v_IdEstadoAgotadoMP
  WHERE sb."IdSubBobinaServilleta" = v_IdSubBobina;

  INSERT INTO "MovimientoSubBobina" ("IdSubBobinaServilleta", "IdTipoMovimiento", "IdUsuario", "Observacion")
  VALUES (v_IdSubBobina, v_IdTipoMovimientoFin, p_IdUsuario, 'Producción terminada - Producción Servilleta #' || p_IdProduccionServilleta);

  RETURN QUERY
  SELECT
    p_IdProduccionServilleta,
    v_FechaFinProduccion,
    v_IdEstadoFinalizado,
    ep."NombreEstadoProduccion"
  FROM "EstadoProduccion" AS ep
  WHERE ep."IdEstadoProduccion" = v_IdEstadoFinalizado;
END;
$$;















CREATE OR REPLACE FUNCTION "VerResumenInventarioBobinaServilleta"()
RETURNS TABLE (
  "IdTipoBobinaServilleta"     INTEGER,
  "NombreTipoBobinaServilleta" TEXT,
  "CantidadBobinaServilleta"   BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  c_IdEstadoAlmacen CONSTANT INTEGER := 1;
BEGIN
  RETURN QUERY
  SELECT
    tbs."IdTipoBobinaServilleta",
    tbs."NombreTipoBobinaServilleta",
    COUNT(bs."IdBobinaServilleta") AS "CantidadBobinaServilleta"
  FROM "TipoBobinaServilleta" AS tbs
  LEFT JOIN "BobinaServilleta" AS bs
    ON bs."IdTipoBobinaServilleta" = tbs."IdTipoBobinaServilleta"
    AND bs."IdEstadoMateriaPrima" = c_IdEstadoAlmacen
  GROUP BY
    tbs."IdTipoBobinaServilleta", tbs."NombreTipoBobinaServilleta"
  ORDER BY tbs."IdTipoBobinaServilleta";
END;
$$;


CREATE OR REPLACE FUNCTION "VerDetalleInventarioBobinaServilleta"(
  p_IdTipoBobinaServilleta INTEGER
) RETURNS TABLE (
  "IdBobinaServilleta"  INTEGER,
  "FechaRecepcion"      DATE,
  "NombreProveedor"     TEXT,
  "IdUnidad1"           INTEGER,
  "CodigoUnidad1"       TEXT,
  "IdFormatoSubBobina1" INTEGER,
  "DescripcionFormato1" TEXT,
  "IdUnidad2"           INTEGER,
  "CodigoUnidad2"       TEXT,
  "IdFormatoSubBobina2" INTEGER,
  "DescripcionFormato2" TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  c_IdEstadoAlmacen CONSTANT INTEGER := 1;
BEGIN
  RETURN QUERY
  SELECT
    bs."IdBobinaServilleta",
    bs."FechaRecepcion",
    pro."NombreProveedor",
    u1."IdUnidadBobinaServilleta",
    u1."CodigoBobina",
    fsb1."IdFormatoSubBobina",
    fsb1."DescripcionFormato",
    u2."IdUnidadBobinaServilleta",
    u2."CodigoBobina",
    fsb2."IdFormatoSubBobina",
    fsb2."DescripcionFormato"
  FROM "BobinaServilleta" AS bs
  INNER JOIN "LoteBobina" AS lb
    ON lb."IdLoteBobina" = bs."IdLoteBobina"
  INNER JOIN "Proveedor" AS pro
    ON pro."IdProveedor" = lb."IdProveedor"
  LEFT JOIN LATERAL (
    SELECT ub."IdUnidadBobinaServilleta", ub."CodigoBobina", ub."IdFormatoSubBobina"
    FROM "UnidadBobinaServilleta" ub
    WHERE ub."IdBobinaServilleta" = bs."IdBobinaServilleta"
    ORDER BY ub."IdUnidadBobinaServilleta"
    LIMIT 1
  ) AS u1 ON true
  LEFT JOIN "FormatoSubBobina" AS fsb1
    ON fsb1."IdFormatoSubBobina" = u1."IdFormatoSubBobina"
  LEFT JOIN LATERAL (
    SELECT ub."IdUnidadBobinaServilleta", ub."CodigoBobina", ub."IdFormatoSubBobina"
    FROM "UnidadBobinaServilleta" ub
    WHERE ub."IdBobinaServilleta" = bs."IdBobinaServilleta"
    ORDER BY ub."IdUnidadBobinaServilleta"
    OFFSET 1 LIMIT 1
  ) AS u2 ON true
  LEFT JOIN "FormatoSubBobina" AS fsb2
    ON fsb2."IdFormatoSubBobina" = u2."IdFormatoSubBobina"
  WHERE bs."IdTipoBobinaServilleta" = p_IdTipoBobinaServilleta
    AND bs."IdEstadoMateriaPrima" = c_IdEstadoAlmacen
  ORDER BY bs."IdBobinaServilleta";
END;
$$;











CREATE OR REPLACE FUNCTION "VerResumenInventarioSubBobinaServilleta"()
RETURNS TABLE (
  "IdTipoMedidaSubBobina" INTEGER,
  "NombreTipoMedida"      TEXT,
  "CantidadSubBobinas"    BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  c_IdEstadoAlmacen CONSTANT INTEGER := 1;
BEGIN
  RETURN QUERY
  SELECT
    tm."IdTipoMedidaSubBobina",
    tm."Descripcion",
    COUNT(sb."IdSubBobinaServilleta") AS "CantidadSubBobinas"
  FROM "TipoMedidaSubBobina" AS tm
  LEFT JOIN "SubBobinaServilleta" AS sb
    ON sb."IdTipoMedidaSubBobina" = tm."IdTipoMedidaSubBobina"
    AND sb."IdEstadoMateriaPrima" = c_IdEstadoAlmacen
  GROUP BY
    tm."IdTipoMedidaSubBobina", tm."Descripcion"
  ORDER BY tm."IdTipoMedidaSubBobina";
END;
$$;


CREATE OR REPLACE FUNCTION "VerDetalleInventarioSubBobinaServilleta"(
  p_IdTipoMedidaSubBobina INTEGER
) RETURNS TABLE (
  "IdSubBobinaServilleta" INTEGER,
  "CodigoUnidadOrigen"    TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  c_IdEstadoAlmacen CONSTANT INTEGER := 1;
BEGIN
  RETURN QUERY
  SELECT
    sb."IdSubBobinaServilleta",
    ub."CodigoBobina"
  FROM "SubBobinaServilleta" AS sb
  INNER JOIN "UnidadBobinaServilleta" AS ub
    ON ub."IdUnidadBobinaServilleta" = sb."IdUnidadBobinaServilleta"
  WHERE sb."IdEstadoMateriaPrima" = c_IdEstadoAlmacen
    AND sb."IdTipoMedidaSubBobina" = p_IdTipoMedidaSubBobina
  ORDER BY sb."IdSubBobinaServilleta";
END;
$$;













CREATE OR REPLACE FUNCTION "VerPausasProduccionServilletaActivas"()
RETURNS TABLE (
  "IdPausaProduccionServilleta" INTEGER,
  "IdProduccionServilleta"      INTEGER,
  "IdSubBobina"                 INTEGER,
  "CodigoUnidadOrigen"          TEXT,
  "FechaHoraPausa"              TIMESTAMPTZ,
  "NombreEstadoProduccion"      TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pps."IdPausaProduccionServilleta",
    pps."IdProduccionServilleta",
    sb."IdSubBobinaServilleta",
    ub."CodigoBobina",
    pps."FechaHoraPausa",
    ep."NombreEstadoProduccion"
  FROM "PausaProduccionServilleta" AS pps
  INNER JOIN "ProduccionServilleta" AS ps
    ON ps."IdProduccionServilleta" = pps."IdProduccionServilleta"
  INNER JOIN "EstadoProduccion" AS ep
    ON ep."IdEstadoProduccion" = ps."IdEstadoProduccion"
  INNER JOIN "SubBobinaServilleta" AS sb
    ON sb."IdSubBobinaServilleta" = ps."IdSubBobina"
  INNER JOIN "UnidadBobinaServilleta" AS ub
    ON ub."IdUnidadBobinaServilleta" = sb."IdUnidadBobinaServilleta"
  WHERE ps."IdEstadoProduccion" = 2
    AND pps."FechaHoraReanudacion" IS NULL;
END;
$$;










CREATE OR REPLACE FUNCTION "VerSubBobinasServilletaFueraInventario"()
RETURNS TABLE (
  "IdSubBobinaServilleta" INTEGER,
  "CodigoUnidadOrigen"    TEXT,
  "NombreTipoMedida"      TEXT,
  "UltimaObservacion"     TEXT,
  "FechaUltimoMovimiento" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  c_IdEstadoFueraInventario CONSTANT INTEGER := 5;
BEGIN
  RETURN QUERY
  SELECT
    sb."IdSubBobinaServilleta",
    ub."CodigoBobina",
    tm."Descripcion",
    um."Observacion",
    um."FechaMovimiento"
  FROM "SubBobinaServilleta" AS sb
  INNER JOIN "UnidadBobinaServilleta" AS ub
    ON ub."IdUnidadBobinaServilleta" = sb."IdUnidadBobinaServilleta"
  INNER JOIN "TipoMedidaSubBobina" AS tm
    ON tm."IdTipoMedidaSubBobina" = sb."IdTipoMedidaSubBobina"
  LEFT JOIN LATERAL (
    SELECT msb."Observacion", msb."FechaMovimiento"
    FROM "MovimientoSubBobina" AS msb
    WHERE msb."IdSubBobinaServilleta" = sb."IdSubBobinaServilleta"
    ORDER BY msb."FechaMovimiento" DESC
    LIMIT 1
  ) AS um ON true
  WHERE sb."IdEstadoMateriaPrima" = c_IdEstadoFueraInventario
  ORDER BY um."FechaMovimiento" DESC;
END;
$$;

















CREATE OR REPLACE FUNCTION "VerProduccionServilletaActivas"(
  p_IdTipoMedidaSubBobina INTEGER DEFAULT NULL
)
RETURNS TABLE (
  "IdProduccionServilleta" INTEGER,
  "NombreEstadoProduccion" TEXT,
  "IdSubBobina"            INTEGER,
  "CodigoUnidadOrigen"     TEXT,
  "IdTipoMedidaSubBobina"  INTEGER,
  "NombreTurno"            TEXT,
  "FechaInicioProduccion"  TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps."IdProduccionServilleta",
    ep."NombreEstadoProduccion",
    sb."IdSubBobinaServilleta",
    ub."CodigoBobina",
    sb."IdTipoMedidaSubBobina",
    t."NombreTurno",
    ps."FechaInicioProduccion"
  FROM "ProduccionServilleta" AS ps
  INNER JOIN "EstadoProduccion" AS ep
    ON ep."IdEstadoProduccion" = ps."IdEstadoProduccion"
  INNER JOIN "SubBobinaServilleta" AS sb
    ON sb."IdSubBobinaServilleta" = ps."IdSubBobina"
  INNER JOIN "UnidadBobinaServilleta" AS ub
    ON ub."IdUnidadBobinaServilleta" = sb."IdUnidadBobinaServilleta"
  INNER JOIN "Turno" AS t
    ON t."IdTurno" = ps."IdTurno"
  WHERE ps."IdEstadoProduccion" = 1
    AND (p_IdTipoMedidaSubBobina IS NULL OR sb."IdTipoMedidaSubBobina" = p_IdTipoMedidaSubBobina)
  ORDER BY ps."FechaInicioProduccion" DESC;
END;
$$;