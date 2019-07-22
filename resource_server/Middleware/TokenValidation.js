const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");

const Patient =require('../models/Patient');
//const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const audience_address="http://localhost:4990/patientrecord";
const issuer_address="http://localhost:5000/authorization"

function TokenValidation (req, res, next) {
    let accessToken = req.header('x-oauth-token');



    //console.log(claimToken)

    if (!accessToken) {
        return res.status(401).json({msg: 'No access token, authorization denied'});
    }

    if(accessToken){
        try{
            var token=jwt.verify(accessToken,config.get('jwtSecretRS'));
            req.token=token;

        }catch(err){
            return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}
    }

    try{

        Validation(token);

    }catch(err){
        return res.status(400).json({msg: err.message});
    }

    //console.log(permitPolicy)
    //return permitPolicy
    next()

}



function Validation(token){

    const {structured_scope} = token
    const {resource_set_id, resourceType, securityLabel,actions}= structured_scope;

    if (token.audience !== audience_address) {
        throw {
            error: "bad_request",
            message: `Audience does not match. Access Denied`,
        }
    } else if (token.issuer !== issuer_address) {
        throw {
            error: "bad_request",
            message: "Issuer verification failed",
        }
    }else if (!structured_scope
        ||!resource_set_id
        ||!resource_set_id.patientId
        ||!resourceType
        ||!securityLabel
        ||!actions){
        throw {
            error: "bad_request",
            message: "Incomplete information in the token",
        }
    }
}




module.exports=TokenValidation;