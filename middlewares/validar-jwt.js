const jwt = require('jsonwebtoken');

const validarJWT = (req, res = response, next) => {

    const token = req.header('x-token');    

    if(!token){
        return res.status(400).json({
            ok: false,
            msg: 'No hay token en la petición.'
        });
    }

    try {
        
        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        req.id = id;
        next();

    } catch (error) {
        
        return res.status(500).json({
            ok: false,
            msg: 'Token no válido.'
        });
    }    
}

module.exports = {
    validarJWT
}