const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");
var SHA256 = require("crypto-js/sha256");
const axios =require("axios");
const rsasign = require('jsrsasign')


//const Resource =require('../models/resources');
//const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const audience_address_rs="http://localhost:4990/getResource";
const audience_address_eso="http://localhost:4995/userathospital"
const issuer_address="http://localhost:5000/authorization"

const context ={result: 'True'}
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
            //console.log(token1)
            var token2=jwt.decode(eso_token,config.get('ASpublickey'))
            req.token2=token2
            //console.log(token2)

        }catch(err){
            return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}
    }

    accessTokenHash=SHA256(accessToken)
    //console.log(JSON.stringify(accessTokenHash))
    //console.log(JSON.stringify(token2.hashAT))
    try{
    if (!(_.isEqual(accessTokenHash.words,token2.hashAT.words))) {
        //console.log("no")
        throw {
            error: "bad_request",
            message: "ESO_token does not math with the access token"
        }}

        Validation(token1,token2);
    }catch(err){
        return res.status(400).json({msg: err});
    }
    var sig =new rsasign.Signature({"alg":"SHA256withRSA"});
    sig.init(config.get('RSprivatekey'))
    sig.updateString(eso_token)
    var SigVal =sig.sign()
    //Validation(token1,token2);
    //console.log (SigVal)
    let Context
    const {environmentContext} =token2
    if (environmentContext) {

        axios.defaults.baseURL='http://localhost:4995/api/userathospital'
        axios.defaults.headers.common['x-eso-token']=eso_token;
        axios.defaults.headers.common['RS-sign']= SigVal;
        axios.defaults.headers.post['Content-Type']='application/json';


    //console.log("yeah")
    axios.post()
        .then(res => {
            console.log("yeah")
            //console.log(res.data)
            if ((_.isEqual(res.data, context))) {
                Context = true
            }
            return Context
        }).then(Context => {
        if (!Context) {
            return res.status(401).json({msg: 'Context Info not valid'});
        }
    }).catch(error=>{console.log(error)})

    }






        //console.log(permitPolicy)
        //return permitPolicy
        next()


}


function Validation(token1, token2){

    //const {structured_scope} = token
    //const {resource_set_id, resourceType, securityLabel,actions}= structured_scope;


    if (token1.audience !== audience_address_rs) {
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
    }else if(token2.audience !== audience_address_eso){
        throw {
            error: "bad_request",
            message: `Audience does not match. Access Denied`,
        }
    }else if(token2.issuer !== issuer_address){
        throw {
            error: "bad_request",
            message: "Issuer verification failed",
        }
    }
    //console.log("yeah")
    // Validate the binding of two tokens

}




module.exports=TokenValidation;