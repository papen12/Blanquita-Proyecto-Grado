def EsCantidadValida(CantidadIngreso: int, Limite: int) -> bool:
    if CantidadIngreso > Limite: return  False
    return True


def ValidarTexto(minLengthText:int,maxLengthText:int,texto:str)->bool:
    if not isinstance(texto,str):
        return False
    else:
        l=len(texto)
        if l<minLengthText or l>maxLengthText: return False
    
    return True