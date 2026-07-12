from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Usuario.UsuarioRepository import UsuarioRepository
from app.Auth.Security import VerificarClave,EstructuraClave,HashPassword
from app.Auth.Jwt import crear_token_acceso
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Models.Usuario.UsuarioLogIn import UsuarioLogin, UsuarioLoginResponse

ESTADO_ACTIVO = 1

class UsuarioService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def crear_usuario(self, data: UsuarioCreate) -> dict:
        if not EstructuraClave(data.Clave):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La clave debe tener el formato: 3 letras mayúsculas seguidas de 3 dígitos (ej. ABC123)"
            )

        clave_hasheada = HashPassword(data.Clave)

        params = {
            "p_IdRol": data.IdRol,
            "p_IdEstadoUsuario": data.IdEstadoUsuario,
            "p_Ci": data.Ci,
            "p_Clave": clave_hasheada,
            "p_PrimerNombre": data.PrimerNombre,
            "p_SegundoNombre": data.SegundoNombre,
            "p_ApellidoPaterno": data.ApellidoPaterno,
            "p_ApellidoMaterno": data.ApellidoMaterno,
        }

        try:
            usuario = self.repository.crear_usuario(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "Ya existe un usuario registrado con el CI" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Ya existe un usuario registrado con el CI {data.Ci}"
                )
            if "El rol especificado no existe" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El rol con id {data.IdRol} no existe"
                )
            if "El estado de usuario especificado no existe" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El estado de usuario con id {data.IdEstadoUsuario} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el usuario, verifica los datos ingresados"
            )

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el usuario"
            )

        return usuario
    
    def login(self, data: UsuarioLogin) -> UsuarioLoginResponse:
        usuario = self.repository.verificacion_usuario(data.Ci)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        if usuario["IdEstadoUsuario"] != ESTADO_ACTIVO:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario {usuario['NombreEstadoUsuario'].lower()}"
            )

        if not VerificarClave(usuario["Clave"], data.Clave):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        token = crear_token_acceso({
            "sub": str(usuario["IdUsuario"]),
            "rol": usuario["NombreRol"],
        })

        return UsuarioLoginResponse(
            access_token=token,
            IdUsuario=usuario["IdUsuario"],
            IdRol=usuario["IdRol"],
            NombreRol=usuario["NombreRol"],
            PrimerNombre=usuario["PrimerNombre"],
            ApellidoPaterno=usuario["ApellidoPaterno"],
        )
    