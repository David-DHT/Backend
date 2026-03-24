import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: verificado.id };
    next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};