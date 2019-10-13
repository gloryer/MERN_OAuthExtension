const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");
//var SHA256 = require("crypto-js/sha256");
const rsasign = require('jsrsasign')

//const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const audience_address_eso="https://localhost:4995/userathospital";
const issuer_address="https://localhost:5000"
const subject="https://localhost:4990/getResource"
const accept_action=["read"]

function TokenValidation (req, res, next) {
    let eso_token=req.header('x-eso-token')
    let RS_sign=req.header('RS-sign')

    //console.log(RS_sign)
    //console.log(eso_token)

    if (!eso_token) {
        return res.status(401).json({msg: 'No ESO Token, authorization denied'});
    }

    if (!RS_sign) {
        return res.status(401).json({msg: 'No RS signature, authorization denied'});
    }
    //var sig = new rsasign.Signature({"alg": "SHA256withRSA"});
    //sig.init(config.get('RSpublickey'));
    //sig.updateString(eso_token);
    //var isValid = sig.verify(RS_sign);

    try{
        var tokenToBeValidate=jwt.verify(RS_sign,config.get('RSpublickey'))
        //req.token=token
        //console.log(tokenToBeValidate)
        var isValid=_.isEqual(tokenToBeValidate["eso-token"],eso_token)
        //console.log(isValid)


    }catch(err){
        return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}

    if (!isValid){
        return res.status(401).json({msg: 'Invalid signature, authorization denied'});
    }

    //console.log(isValid)

    if(eso_token){
        try{
            var token=jwt.verify(eso_token,config.get('ASpublickey'))
            req.token=token
           // console.log(token)

        }catch(err){
            return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}
    }

    try{

        Validation(token);

    }catch(err){
        return res.status(400).json({msg: err});
    }


    //console.log("pass")
    //return permitPolicy
    next()


}



function Validation(token){

    //const {structured_scope} = token
    //const {resource_set_id, resourceType, securityLabel,actions}= structured_scope;


    if (token.audience !== audience_address_eso) {
        throw {
            error: "bad_request",
            message: `Audience does not match. Access Denied`,
        }
    } else if (token.issuer !== issuer_address) {
        throw {
            error: "bad_request",
            message: "Issuer verification failed",
        }
    }else if (!(_.isEqual(token.action,accept_action )
        ||!token.action)){
        throw {
            error: "bad_request",
            message: "Incomplete information in the token",
        }
    }

    // Validate the binding of two tokens

}




module.exports=TokenValidation;