import jwt from 'jsonwebtoken';


export const verificarToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: verificado.id, idPerfil: verificado.idPerfil };
    next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

export const verificarAdmin = (req, res, next) =>{

    //Verificamos si el usuario existe en el req.usuario, que se establece en verificarToken
    if(!req.usuario) return res.status(401).json({ message: 'Usuario no autenticado' });
    
    //comprobar si el idPerfil No es 3 (administrador)
    if(req.usuario.idPerfil !== 3) return res.status(403).json({ message: 'Acceso denegado: se requieren privilegios de administrador' });

    next();

};