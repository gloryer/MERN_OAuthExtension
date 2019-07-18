const config=require('config');
const jwt=require('jsonwebtoken');

function auth (req, res, next) {
    let token = req.header('x-auth-token');

    console.log(token);

    if (!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    if(token){
        try{

            let decoded=jwt.verify(token,config.get('jwtSecret'));
            req.decoded=decoded;
            next();

        }catch(err){
            res.status(403).send({
                msg:err.name
            })}
        }
    }


            //res.status(400).json({msg: 'Token is not valid'});

    module.exports=auth;