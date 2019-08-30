const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");
var SHA256 = require("crypto-js/sha256");

const Resource =require('../models/resources');
//const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const audience_address="http://localhost:4990/getResource";
const issuer_address="http://localhost:5000/authorization"

function TokenValidation (req, res, next) {
    let accessToken = req.header('x-oauth-token');
    let eso_token=req.header('x-eso-token')



    //console.log(claimToken)

    if (!accessToken) {
        return res.status(401).json({msg: 'No access token, authorization denied'});
    }

    if (!eso_token) {
        return res.status(401).json({msg: 'No ESO Token, authorization denied'});
    }

    if(accessToken && eso_token){
        try{
            var token1=jwt.verify(accessToken,config.get('ASpublickey'));
            req.token1=token1;
            console.log(token1)
            var token2=jwt.verify(eso_token,config.get('ASpublickey'))
            req.token2=token2
            console.log(token2)

        }catch(err){
            return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}
    }

    accessTokenHash=SHA256(accessToken)
    console.log(JSON.stringify(accessTokenHash))
    console.log(JSON.stringify(token2.hashAT))
    try{
    if (!(_.isEqual(accessTokenHash.words,token2.hashAT.words))) {
        //console.log("no")
        throw {
            error: "bad_request",
            message: "ESO_token does not math with the access token"
        }
    }

    Validation(token1,token2);

    }catch(err){
            return res.status(400).json({msg: err});
    }


        //console.log(permitPolicy)
        //return permitPolicy
        next()


}



function Validation(token1, token2){

    //const {structured_scope} = token
    //const {resource_set_id, resourceType, securityLabel,actions}= structured_scope;


    if (token1.audience !== audience_address) {
        throw {
            error: "bad_request",
            message: `Audience does not match. Access Denied`,
        }
    } else if (token1.issuer !== issuer_address) {
        throw {
            error: "bad_request",
            message: "Issuer verification failed",
        }
    }else if (!token1.objectAttributes
        ||!token1.actionAttributes
        ||!token1.actionAttributes.actions){
        throw {
            error: "bad_request",
            message: "Incomplete information in the token",
        }
    }

    // Validate the binding of two tokens

}




module.exports=TokenValidation;