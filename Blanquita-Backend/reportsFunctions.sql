CREATE OR REPLACE FUNCTION "ReporteMovimientosOperadorLogs"(p_IdProduccion integer)
RETURNS TABLE (
  "IdMovimientoOperadorLogs" integer,
  "IdProduccionBobinaTubo" integer,
  "CantidadLogs" integer,
  "FechaMovimiento" timestamp,
  "Observacion" text,
  "NombreMovimiento" text,
  "Ci" text,
  "PrimerNombre" text,
  "ApellidoPaterno" text,
  "NombreRol" text
)
LANGUAGE sql
AS $$
  SELECT
    mol."IdMovimientoOperadorLogs", mol."IdProduccionBobinaTubo", mol."CantidadLogs",
    mol."FechaMovimiento", mol."Observacion",
    tmol."NombreMovimiento",
    u."Ci", u."PrimerNombre", u."ApellidoPaterno",
    r."NombreRol"
  FROM "MovimientoOperadorLogs" AS mol
  INNER JOIN "TipoMovimientoOperadorLogs" AS tmol
    ON mol."IdTipoMovimientoOperadorLogs" = tmol."IdTipoMovimientoOperadorLogs"
  INNER JOIN "Usuario" AS u
    ON mol."IdUsuario" = u."IdUsuario"
  INNER JOIN "Rol" AS r
    ON u."IdRol" = r."IdRol"
  WHERE mol."IdProduccionBobinaTubo" = p_IdProduccion
  ORDER BY mol."FechaMovimiento" ASC;
$$;
CREATE OR REPLACE FUNCTION "VerBobinasPapel"(
  p_CodigoBobina text DEFAULT NULL,
  p_IdProveedor integer DEFAULT NULL,
  p_IdsTipoBobina integer[] DEFAULT NULL,
  p_IdEstadoMateriaPrima integer DEFAULT NULL,
  p_IdBobinaPapel integer DEFAULT NULL
)
RETURNS TABLE (
  "IdBobinaPapel" integer,
  "CodigoBobina" text,
  "PesoBrutoKg" numeric,
  "Gramaje" numeric,
  "NombreTipoBobina" text,
  "TipoEstado" text,
  "NombreProveedor" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    bp."IdBobinaPapel",
    bp."CodigoBobina",
    bp."PesoBrutoKg",
    bp."Gramaje",
    tb."NombreTipoBobina",
    emp."TipoEstado",
    p."NombreProveedor"
  FROM "BobinaPapel" bp
  JOIN "TipoBobina" tb ON bp."IdTipoBobina" = tb."IdTipoBobina"
  JOIN "EstadoMateriaPrima" emp ON bp."IdEstadoMateriaPrima" = emp."IdEstadoMateriaPrima"
  JOIN "LoteBobina" lb ON bp."IdLoteBobina" = lb."IdLoteBobina"
  JOIN "Proveedor" p ON p."IdProveedor" = lb."IdProveedor"
  WHERE
    (p_CodigoBobina IS NULL OR bp."CodigoBobina" = p_CodigoBobina)
    AND (p_IdProveedor IS NULL OR lb."IdProveedor" = p_IdProveedor)
    AND (p_IdsTipoBobina IS NULL OR bp."IdTipoBobina" = ANY(p_IdsTipoBobina))
    AND (p_IdEstadoMateriaPrima IS NULL OR bp."IdEstadoMateriaPrima" = p_IdEstadoMateriaPrima)
    AND (p_IdBobinaPapel IS NULL OR bp."IdBobinaPapel" = p_IdBobinaPapel)
  ORDER BY bp."CodigoBobina";
$$;

CREATE OR REPLACE FUNCTION "ReporteHistorialMovimientosBobina"(
  p_IdBobinaPapel integer
)
RETURNS TABLE (
  "IdMovimientoBobina" integer,
  "NombreMovimiento" text,
  "FechaMovimiento" timestamptz,
  "Observacion" text,
  "Ci" text,
  "PrimerNombre" text,
  "ApellidoPaterno" text,
  "NombreRol" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    mb."IdMovimientoBobina",
    tmmp."NombreMovimiento",
    mb."FechaMovimiento",
    mb."Observacion",
    u."Ci",
    u."PrimerNombre",
    u."ApellidoPaterno",
    r."NombreRol"
  FROM "MovimientoBobina" mb
  JOIN "TipoMovimientoMateriaPrima" tmmp ON mb."IdTipoMovimiento" = tmmp."IdTipoMovimiento"
  JOIN "Usuario" u ON mb."IdUsuario" = u."IdUsuario"
  JOIN "Rol" r ON u."IdRol" = r."IdRol"
  WHERE mb."IdBobinaPapel" = p_IdBobinaPapel
  ORDER BY mb."FechaMovimiento" ASC;
$$;
CREATE OR REPLACE FUNCTION "VerCancelacionesProduccionBobinaTubo"(
  p_FechaInicio date DEFAULT NULL,
  p_FechaFin date DEFAULT NULL
)
RETURNS TABLE (
  "IdProduccionBobinaTubo" integer,
  "FechaHoraCancelacion" timestamptz,
  "MotivoCancelacion" text,
  "Ci" text,
  "PrimerNombre" text,
  "ApellidoPaterno" text,
  "NombreRol" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    cpbt."IdProduccionBobinaTubo",
    cpbt."FechaHoraCancelacion",
    cpbt."MotivoCancelacion",
    u."Ci",
    u."PrimerNombre",
    u."ApellidoPaterno",
    r."NombreRol"
  FROM "CancelacionProduccionBobinaTubo" cpbt
  JOIN "Usuario" u ON u."IdUsuario" = cpbt."IdUsuario"
  JOIN "Rol" r ON r."IdRol" = u."IdRol"
  WHERE
    (p_FechaInicio IS NULL OR cpbt."FechaHoraCancelacion" >= p_FechaInicio)
    AND (p_FechaFin IS NULL OR cpbt."FechaHoraCancelacion" < (p_FechaFin + 1))
  ORDER BY cpbt."FechaHoraCancelacion" DESC;
$$;
CREATE OR REPLACE FUNCTION "ReporteCancelacionProduccionBobinaTubo"(
  p_IdProduccion integer
)
RETURNS TABLE (
  "FechaHoraCancelacion" timestamptz,
  "MotivoCancelacion" text,
  "Ci" text,
  "Operador" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    cpbt."FechaHoraCancelacion",
    cpbt."MotivoCancelacion",
    u."Ci",
    u."PrimerNombre" || ' ' || u."ApellidoPaterno" AS "Operador"
  FROM "CancelacionProduccionBobinaTubo" cpbt
  JOIN "Usuario" u ON u."IdUsuario" = cpbt."IdUsuario"
  WHERE cpbt."IdProduccionBobinaTubo" = p_IdProduccion
  ORDER BY cpbt."FechaHoraCancelacion" DESC
  LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION "ReporteLoteBobinaPapelDetalle"(
  p_IdLoteBobina integer
)
RETURNS TABLE (
  "CodigoBobina" text,
  "NombreTipoBobina" text,
  "PesoBrutoKg" numeric,
  "Gramaje" numeric,
  "PesoNetoKg" numeric,
  "FechaRecepcion" date,
  "NombreProveedor" text,
  "CantidadBobinas" bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    bp."CodigoBobina",
    tb."NombreTipoBobina",
    bp."PesoBrutoKg",
    bp."Gramaje",
    bp."PesoNetoKg",
    lb."FechaRecepcion",
    p."NombreProveedor",
    COUNT(*) OVER () AS "CantidadBobinas"
  FROM "BobinaPapel" bp
  JOIN "LoteBobina" lb ON bp."IdLoteBobina" = lb."IdLoteBobina"
  JOIN "Proveedor" p ON p."IdProveedor" = lb."IdProveedor"
  JOIN "TipoBobina" tb ON bp."IdTipoBobina" = tb."IdTipoBobina"
  WHERE bp."IdLoteBobina" = p_IdLoteBobina
  ORDER BY tb."NombreTipoBobina", bp."CodigoBobina";
$$;
CREATE OR REPLACE FUNCTION "VerLotesBobinaPapel"(
  p_FechaInicio date DEFAULT NULL,
  p_FechaFin date DEFAULT NULL,
  p_IdProveedor integer DEFAULT NULL,
  p_IdsTipoBobina integer[] DEFAULT NULL
)
RETURNS TABLE (
  "IdLoteBobina" integer,
  "FechaRecepcion" date,
  "NombreProveedor" text,
  "CantidadBobinas" bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    lb."IdLoteBobina",
    lb."FechaRecepcion",
    p."NombreProveedor",
    COUNT(bp."IdBobinaPapel") AS "CantidadBobinas"
  FROM "LoteBobina" lb
  JOIN "Proveedor" p ON p."IdProveedor" = lb."IdProveedor"
  LEFT JOIN "BobinaPapel" bp
    ON bp."IdLoteBobina" = lb."IdLoteBobina"
    AND (p_IdsTipoBobina IS NULL OR bp."IdTipoBobina" = ANY(p_IdsTipoBobina))
  WHERE
    (p_FechaInicio IS NULL OR lb."FechaRecepcion" >= p_FechaInicio)
    AND (p_FechaFin IS NULL OR lb."FechaRecepcion" <= p_FechaFin)
    AND (p_IdProveedor IS NULL OR lb."IdProveedor" = p_IdProveedor)
  GROUP BY lb."IdLoteBobina", lb."FechaRecepcion", p."NombreProveedor"
  HAVING (p_IdsTipoBobina IS NULL OR COUNT(bp."IdBobinaPapel") > 0)
  ORDER BY lb."FechaRecepcion" DESC;
$$;

CREATE OR REPLACE FUNCTION "ReportePausasProduccionBobinaTubo"(
  p_IdProduccion integer DEFAULT NULL,
  p_FechaInicio date DEFAULT NULL,
  p_FechaFin date DEFAULT NULL,
  p_IdTurno integer DEFAULT NULL,
  p_SoloAbiertas boolean DEFAULT NULL
)
RETURNS TABLE (
  "IdPausaProduccionBobinaTubo" integer,
  "IdProduccionBobinaTubo" integer,
  "CodigoBobina1" text,
  "CodigoBobina2" text,
  "NombreTurno" text,
  "FechaHoraPausa" timestamptz,
  "MotivoPausaProduccion" text,
  "FechaHoraReanudacion" timestamptz,
  "DuracionPausa" interval,
  "OperadorPausa" text,
  "RolPausa" text,
  "EstadoPausa" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ppbt."IdPausaProduccionBobinaTubo",
    ppbt."IdProduccionBobinaTubo",
    bp1."CodigoBobina" AS "CodigoBobina1",
    bp2."CodigoBobina" AS "CodigoBobina2",
    t."NombreTurno",
    ppbt."FechaHoraPausa",
    ppbt."MotivoPausaProduccion",
    ppbt."FechaHoraReanudacion",
    ppbt."FechaHoraReanudacion" - ppbt."FechaHoraPausa" AS "DuracionPausa",
    u."PrimerNombre" || ' ' || u."ApellidoPaterno" AS "OperadorPausa",
    r."NombreRol" AS "RolPausa",
    CASE
      WHEN ppbt."FechaHoraReanudacion" IS NULL THEN 'Abierta'
      ELSE 'Cerrada'
    END AS "EstadoPausa"
  FROM "PausaProduccionBobinaTubo" ppbt
  JOIN "ProduccionBobinaTubo" pbt ON pbt."IdProduccionBobinaTubo" = ppbt."IdProduccionBobinaTubo"
  JOIN "BobinaPapel" bp1 ON bp1."IdBobinaPapel" = pbt."IdBobina_1"
  JOIN "BobinaPapel" bp2 ON bp2."IdBobinaPapel" = pbt."IdBobina_2"
  JOIN "Turno" t ON t."IdTurno" = pbt."IdTurno"
  JOIN "Usuario" u ON u."IdUsuario" = ppbt."IdUsuario"
  JOIN "Rol" r ON r."IdRol" = u."IdRol"
  WHERE
    (p_IdProduccion IS NULL OR ppbt."IdProduccionBobinaTubo" = p_IdProduccion)
    AND (p_FechaInicio IS NULL OR ppbt."FechaHoraPausa" >= p_FechaInicio)
    AND (p_FechaFin IS NULL OR ppbt."FechaHoraPausa" < (p_FechaFin + 1))
    AND (p_IdTurno IS NULL OR pbt."IdTurno" = p_IdTurno)
    AND (
      p_SoloAbiertas IS NULL
      OR (p_SoloAbiertas IS TRUE AND ppbt."FechaHoraReanudacion" IS NULL)
      OR (p_SoloAbiertas IS FALSE AND ppbt."FechaHoraReanudacion" IS NOT NULL)
    )
  ORDER BY ppbt."FechaHoraPausa" DESC;
$$;

CREATE OR REPLACE FUNCTION "ReporteProduccionBobinaTuboDetalle"(
  p_IdProduccion integer
)
RETURNS TABLE (
  "IdProduccionBobinaTubo" integer,
  "NombreEstadoProduccion" text,
  "NombreTurno" text,
  "Operador" text,
  "Ci" text,
  "NombreRol" text,
  "TipoBobina" text,
  "CodigoBobina1" text,
  "PesoNeto1" numeric,
  "Gramaje1" numeric,
  "Proveedor1" text,
  "Recepcion1" date,
  "CodigoBobina2" text,
  "PesoNeto2" numeric,
  "Gramaje2" numeric,
  "Proveedor2" text,
  "Recepcion2" date,
  "FechaInicioProduccion" timestamptz,
  "FechaFinProduccion" timestamptz,
  "DuracionTotal" interval,
  "CantidadLogsActual" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pbt."IdProduccionBobinaTubo",
    ep."NombreEstadoProduccion",
    t."NombreTurno",
    u."PrimerNombre" || ' ' || u."ApellidoPaterno" AS "Operador",
    u."Ci",
    r."NombreRol",
    tb1."NombreTipoBobina" AS "TipoBobina",
    bp1."CodigoBobina" AS "CodigoBobina1",
    bp1."PesoNetoKg" AS "PesoNeto1",
    bp1."Gramaje" AS "Gramaje1",
    pv1."NombreProveedor" AS "Proveedor1",
    lb1."FechaRecepcion" AS "Recepcion1",
    bp2."CodigoBobina" AS "CodigoBobina2",
    bp2."PesoNetoKg" AS "PesoNeto2",
    bp2."Gramaje" AS "Gramaje2",
    pv2."NombreProveedor" AS "Proveedor2",
    lb2."FechaRecepcion" AS "Recepcion2",
    pbt."FechaInicioProduccion",
    pbt."FechaFinProduccion",
    pbt."FechaFinProduccion" - pbt."FechaInicioProduccion" AS "DuracionTotal",
    pbt."CantidadLogsActual"
  FROM "ProduccionBobinaTubo" pbt
  JOIN "BobinaPapel" bp1 ON bp1."IdBobinaPapel" = pbt."IdBobina_1"
  JOIN "BobinaPapel" bp2 ON bp2."IdBobinaPapel" = pbt."IdBobina_2"
  JOIN "TipoBobina" tb1 ON tb1."IdTipoBobina" = bp1."IdTipoBobina"
  JOIN "LoteBobina" lb1 ON lb1."IdLoteBobina" = bp1."IdLoteBobina"
  JOIN "LoteBobina" lb2 ON lb2."IdLoteBobina" = bp2."IdLoteBobina"
  JOIN "Proveedor" pv1 ON pv1."IdProveedor" = lb1."IdProveedor"
  JOIN "Proveedor" pv2 ON pv2."IdProveedor" = lb2."IdProveedor"
  JOIN "Turno" t ON t."IdTurno" = pbt."IdTurno"
  JOIN "EstadoProduccion" ep ON ep."IdEstadoProduccion" = pbt."IdEstadoProduccion"
  JOIN "Usuario" u ON u."IdUsuario" = pbt."IdUsuario"
  JOIN "Rol" r ON r."IdRol" = u."IdRol"
  WHERE pbt."IdProduccionBobinaTubo" = p_IdProduccion;
$$;
DROP FUNCTION IF EXISTS "VerProduccionesBobinaTubo"(
  date, date, integer, integer[], text, text, integer
);

CREATE OR REPLACE FUNCTION "VerProduccionesBobinaTubo"(
  p_FechaInicio date DEFAULT NULL,
  p_FechaFin date DEFAULT NULL,
  p_IdTurno integer DEFAULT NULL,
  p_IdsTipoBobina integer[] DEFAULT NULL,
  p_CodigoBobina text DEFAULT NULL,
  p_Operador text DEFAULT NULL,
  p_IdEstadoProduccion integer DEFAULT NULL
)
RETURNS TABLE (
  "IdProduccionBobinaTubo" integer,
  "NombreEstadoProduccion" text,
  "NombreTurno" text,
  "Operador" text,
  "Ci" text,
  "NombreRol" text,
  "TipoBobina" text,
  "CodigoBobina1" text,
  "CodigoBobina2" text,
  "FechaInicioProduccion" timestamptz,
  "FechaFinProduccion" timestamptz,
  "DuracionTotal" interval,
  "CantidadLogsActual" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pbt."IdProduccionBobinaTubo",
    ep."NombreEstadoProduccion",
    t."NombreTurno",
    u."PrimerNombre" || ' ' || u."ApellidoPaterno" AS "Operador",
    u."Ci",
    r."NombreRol",
    tb1."NombreTipoBobina" AS "TipoBobina",
    bp1."CodigoBobina" AS "CodigoBobina1",
    bp2."CodigoBobina" AS "CodigoBobina2",
    pbt."FechaInicioProduccion",
    pbt."FechaFinProduccion",
    pbt."FechaFinProduccion" - pbt."FechaInicioProduccion" AS "DuracionTotal",
    pbt."CantidadLogsActual"
  FROM "ProduccionBobinaTubo" pbt
  JOIN "BobinaPapel" bp1 ON bp1."IdBobinaPapel" = pbt."IdBobina_1"
  JOIN "BobinaPapel" bp2 ON bp2."IdBobinaPapel" = pbt."IdBobina_2"
  JOIN "TipoBobina" tb1 ON tb1."IdTipoBobina" = bp1."IdTipoBobina"
  JOIN "TipoBobina" tb2 ON tb2."IdTipoBobina" = bp2."IdTipoBobina"
  JOIN "Turno" t ON t."IdTurno" = pbt."IdTurno"
  JOIN "EstadoProduccion" ep ON ep."IdEstadoProduccion" = pbt."IdEstadoProduccion"
  JOIN "Usuario" u ON u."IdUsuario" = pbt."IdUsuario"
  JOIN "Rol" r ON r."IdRol" = u."IdRol"
  WHERE
    (
      p_FechaInicio IS NULL
      OR COALESCE(pbt."FechaFinProduccion", pbt."FechaInicioProduccion") >= p_FechaInicio
    )
    AND (
      p_FechaFin IS NULL
      OR COALESCE(pbt."FechaFinProduccion", pbt."FechaInicioProduccion") < (p_FechaFin + 1)
    )
    AND (p_IdTurno IS NULL OR pbt."IdTurno" = p_IdTurno)
    AND (
      p_IdsTipoBobina IS NULL
      OR tb1."IdTipoBobina" = ANY(p_IdsTipoBobina)
      OR tb2."IdTipoBobina" = ANY(p_IdsTipoBobina)
    )
    AND (
      p_CodigoBobina IS NULL
      OR bp1."CodigoBobina" = p_CodigoBobina
      OR bp2."CodigoBobina" = p_CodigoBobina
    )
    AND (
      p_Operador IS NULL
      OR u."Ci" = p_Operador
      OR (u."PrimerNombre" || ' ' || u."ApellidoPaterno") ILIKE '%' || p_Operador || '%'
    )
    AND (p_IdEstadoProduccion IS NULL OR pbt."IdEstadoProduccion" = p_IdEstadoProduccion)
  ORDER BY COALESCE(pbt."FechaFinProduccion", pbt."FechaInicioProduccion") DESC;
$$;
CREATE OR REPLACE FUNCTION "ReporteInventarioBobinaPapel"(
    "p_IdsTipoBobina" integer[] DEFAULT NULL
)
RETURNS TABLE (
    "FechaGeneracion"          timestamptz,
    "TotalBobinasInforme"      bigint,
    "PesoNetoGeneralKg"        numeric,
    "IdTipoBobina"             integer,
    "NombreTipoBobina"         text,
    "CantidadBobinasTipo"      bigint,
    "PesoNetoTotalTipoKg"      numeric,
    "GramajePromedioTipo"      numeric,
    "RecepcionMasAntiguaTipo"  date,
    "RecepcionMasRecienteTipo" date,
    "IdBobinaPapel"            integer,
    "CodigoBobina"             text,
    "CodigoLote"               text,
    "FechaRecepcion"           date,
    "NombreProveedor"          text,
    "PesoBrutoKg"              numeric,
    "PesoNetoKg"               numeric,
    "Gramaje"                  numeric
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        now()                                                                          AS "FechaGeneracion",
        COUNT(*) OVER ()                                                                AS "TotalBobinasInforme",
        COALESCE(SUM(b."PesoNetoKg") OVER (), 0)                                        AS "PesoNetoGeneralKg",

        t."IdTipoBobina",
        t."NombreTipoBobina",
        COUNT(*) OVER (PARTITION BY b."IdTipoBobina")                                   AS "CantidadBobinasTipo",
        COALESCE(SUM(b."PesoNetoKg") OVER (PARTITION BY b."IdTipoBobina"), 0)           AS "PesoNetoTotalTipoKg",
        COALESCE(ROUND(AVG(b."Gramaje") OVER (PARTITION BY b."IdTipoBobina"), 2), 0)    AS "GramajePromedioTipo",
        MIN(l."FechaRecepcion") OVER (PARTITION BY b."IdTipoBobina")                    AS "RecepcionMasAntiguaTipo",
        MAX(l."FechaRecepcion") OVER (PARTITION BY b."IdTipoBobina")                    AS "RecepcionMasRecienteTipo",

        b."IdBobinaPapel",
        b."CodigoBobina",
        l."IdLoteBobina"::text   AS "CodigoLote",   
        l."FechaRecepcion",
        p."NombreProveedor",
        b."PesoBrutoKg",
        b."PesoNetoKg",
        b."Gramaje"
    FROM "BobinaPapel" b
    JOIN "TipoBobina" t ON t."IdTipoBobina" = b."IdTipoBobina"
    JOIN "LoteBobina" l ON l."IdLoteBobina" = b."IdLoteBobina"
    JOIN "Proveedor"  p ON p."IdProveedor"  = l."IdProveedor"
    WHERE b."IdEstadoMateriaPrima" = 1
      AND ("p_IdsTipoBobina" IS NULL OR b."IdTipoBobina" = ANY("p_IdsTipoBobina"))
    ORDER BY t."NombreTipoBobina", l."FechaRecepcion", b."CodigoBobina";
$$;

CREATE OR REPLACE FUNCTION "VerBobinasServilleta"(
  p_CodigoBobina text DEFAULT NULL,
  p_IdProveedor integer DEFAULT NULL,
  p_IdTipoBobinaServilleta integer DEFAULT NULL,
  p_IdEstadoMateriaPrima integer DEFAULT NULL,
  p_IdBobinaServilleta integer DEFAULT NULL
)
RETURNS TABLE (
  "IdBobinaServilleta"         integer,
  "IdUnidadBobinaServilleta"   integer,
  "CodigoBobina"               text,
  "PesoBrutoKg"                numeric,
  "GramajeGr"                  numeric,
  "NombreTipoBobinaServilleta" text,
  "TipoEstado"                 text,
  "DescripcionFormato"         text,
  "CantidadBobina435"          integer,
  "CantidadBobina220"          integer,
  "NombreProveedor"            text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    bs."IdBobinaServilleta",
    ubs."IdUnidadBobinaServilleta",
    ubs."CodigoBobina",
    ubs."PesoBrutoKg",
    ubs."GramajeGr",
    tbs."NombreTipoBobinaServilleta",
    emp."TipoEstado",
    fsb."DescripcionFormato",
    fsb."CantidadBobina435",
    fsb."CantidadBobina220",
    p."NombreProveedor"
  FROM "UnidadBobinaServilleta" ubs
  JOIN "BobinaServilleta" bs ON bs."IdBobinaServilleta" = ubs."IdBobinaServilleta"
  JOIN "EstadoMateriaPrima" emp ON bs."IdEstadoMateriaPrima" = emp."IdEstadoMateriaPrima"
  JOIN "TipoBobinaServilleta" tbs ON bs."IdTipoBobinaServilleta" = tbs."IdTipoBobinaServilleta"
  JOIN "FormatoSubBobina" fsb ON ubs."IdFormatoSubBobina" = fsb."IdFormatoSubBobina"
  JOIN "LoteBobinaServilleta" lbs ON bs."IdLoteBobinaServilleta" = lbs."IdLoteBobinaServilleta"
  JOIN "Proveedor" p ON p."IdProveedor" = lbs."IdProveedor"
  WHERE
    (p_CodigoBobina IS NULL OR ubs."CodigoBobina" = p_CodigoBobina)
    AND (p_IdProveedor IS NULL OR lbs."IdProveedor" = p_IdProveedor)
    AND (p_IdTipoBobinaServilleta IS NULL OR bs."IdTipoBobinaServilleta" = p_IdTipoBobinaServilleta)
    AND (p_IdEstadoMateriaPrima IS NULL OR bs."IdEstadoMateriaPrima" = p_IdEstadoMateriaPrima)
    AND (p_IdBobinaServilleta IS NULL OR bs."IdBobinaServilleta" = p_IdBobinaServilleta)
  ORDER BY ubs."CodigoBobina";
$$;