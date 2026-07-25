CREATE OR REPLACE FUNCTION "VerificacionUsuario"(
    p_ci TEXT
)
RETURNS TABLE (
    "IdUsuario" INTEGER,
    "Clave" TEXT,
    "IdRol" INTEGER,
    "NombreRol" TEXT,
    "IdEstadoUsuario" INTEGER,
    "NombreEstadoUsuario" TEXT,
    "PrimerNombre" TEXT,
    "SegundoNombre" TEXT,
    "ApellidoPaterno" TEXT,
    "ApellidoMaterno" TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u."IdUsuario",
        u."Clave",
        u."IdRol",
        r."NombreRol",
        u."IdEstadoUsuario",
        eu."NombreEstadoUsuario",
        u."PrimerNombre",
        u."SegundoNombre",
        u."ApellidoPaterno",
        u."ApellidoMaterno"
    FROM "Usuario" u
    JOIN "Rol" r ON r."IdRol" = u."IdRol"
    JOIN "EstadoUsuario" eu ON eu."IdEstadoUsuario" = u."IdEstadoUsuario"
    WHERE u."Ci" = p_ci;
END;
$$;




CREATE OR REPLACE FUNCTION "CrearRefreshToken"(
  p_IdUsuario INTEGER,
  p_TokenHash TEXT,
  p_FechaExpiracion TIMESTAMPTZ,
  p_IpOrigen TEXT,
  p_UserAgent TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_IdRefreshToken INTEGER;
BEGIN
  INSERT INTO "RefreshToken" AS rt (
    "IdUsuario", "IdEstadoRefreshToken", "TokenHash",
    "FechaExpiracion", "IpOrigen", "UserAgent"
  )
  VALUES (
    p_IdUsuario, 1, p_TokenHash,
    p_FechaExpiracion, p_IpOrigen, p_UserAgent
  )
  RETURNING rt."IdRefreshToken" INTO v_IdRefreshToken;

  RETURN v_IdRefreshToken;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "ValidarRefreshToken"(
  p_TokenHash TEXT
)
RETURNS TABLE (
  "Valido" BOOLEAN,
  "IdUsuarioOut" INTEGER,
  "IdRefreshTokenOut" INTEGER,
  "Motivo" TEXT
) AS $$
DECLARE
  v_row "RefreshToken"%ROWTYPE;
BEGIN
  SELECT rt.* INTO v_row
  FROM "RefreshToken" AS rt
  WHERE rt."TokenHash" = p_TokenHash;

  -- No existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, NULL::INTEGER, 'No encontrado'::TEXT;
    RETURN;
  END IF;

  -- Reuso detectado: token ya fue reemplazado antes -> posible robo
  IF v_row."IdEstadoRefreshToken" = 3 THEN
    RETURN QUERY SELECT FALSE, v_row."IdUsuario", v_row."IdRefreshToken", 'Reuso detectado'::TEXT;
    RETURN;
  END IF;

  -- Revocado manualmente
  IF v_row."IdEstadoRefreshToken" = 2 THEN
    RETURN QUERY SELECT FALSE, v_row."IdUsuario", v_row."IdRefreshToken", 'Revocado'::TEXT;
    RETURN;
  END IF;

  -- Expirado por tiempo
  IF v_row."FechaExpiracion" < now() THEN
    RETURN QUERY SELECT FALSE, v_row."IdUsuario", v_row."IdRefreshToken", 'Expirado'::TEXT;
    RETURN;
  END IF;

  -- Válido
  RETURN QUERY SELECT TRUE, v_row."IdUsuario", v_row."IdRefreshToken", 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION "RotarRefreshToken"(
  p_IdRefreshTokenViejo INTEGER,
  p_IdUsuario INTEGER,
  p_TokenHashNuevo TEXT,
  p_FechaExpiracionNueva TIMESTAMPTZ,
  p_IpOrigen TEXT,
  p_UserAgent TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_IdRefreshTokenNuevo INTEGER;
BEGIN
  INSERT INTO "RefreshToken" AS rt (
    "IdUsuario", "IdEstadoRefreshToken", "TokenHash",
    "FechaExpiracion", "IpOrigen", "UserAgent"
  )
  VALUES (
    p_IdUsuario, 1, p_TokenHashNuevo,
    p_FechaExpiracionNueva, p_IpOrigen, p_UserAgent
  )
  RETURNING rt."IdRefreshToken" INTO v_IdRefreshTokenNuevo;

  UPDATE "RefreshToken" AS rt
  SET "IdEstadoRefreshToken" = 3,
      "IdTokenReemplazo" = v_IdRefreshTokenNuevo
  WHERE rt."IdRefreshToken" = p_IdRefreshTokenViejo;

  RETURN v_IdRefreshTokenNuevo;
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION "RevocarCadenaRefreshToken"(
  p_IdUsuario INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_Afectados INTEGER;
BEGIN
  UPDATE "RefreshToken" AS rt
  SET "IdEstadoRefreshToken" = 2
  WHERE rt."IdUsuario" = p_IdUsuario
    AND rt."IdEstadoRefreshToken" <> 2;

  GET DIAGNOSTICS v_Afectados = ROW_COUNT;
  RETURN v_Afectados;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION "RevocarRefreshToken"(
  p_TokenHash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_Afectados INTEGER;
BEGIN
  UPDATE "RefreshToken" AS rt
  SET "IdEstadoRefreshToken" = 2
  WHERE rt."TokenHash" = p_TokenHash
    AND rt."IdEstadoRefreshToken" = 1;

  GET DIAGNOSTICS v_Afectados = ROW_COUNT;
  RETURN v_Afectados > 0;
END;
$$ LANGUAGE plpgsql;