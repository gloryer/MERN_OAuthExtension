

const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");
const axios =require("axios");

//const Patient =require('../models/Patient');
//const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const audience_address="http://localhost:4990/patientrecord";
const issuer_address="http://localhost:5000/authorization"
const eso_address="http://localhost:4995/userathospital"
const context ={
    result: 'True'
}




function ContextValidation (req, res, next) {
   // let accessToken = req.header('x-oauth-token');



    //console.log(claimToken)

/*    if (!accessToken) {
        return res.status(401).json({msg: 'No access token, authorization denied'});
    }

    if(accessToken){
        try{
            var token=jwt.verify(accessToken,config.get('jwtSecretRS'));
            req.token=token;

        }catch(err){
            return res.status(403).json({msg:`The token can not be verified because of ${ err.name}`})}
    }*/
    //console.log("hello")
    axios.post('http://localhost:4995/api/userathospital')
        .then(res=> {
            console.log(res.data)
            if((_.isEqual(res.data,context))) {
                window.localStorage.setItem('ContextUserAtHospital', "true");
            }
        })
        .catch(err=>{
            })



    //console.log(permitPolicy)
    //return permitPolicy
    /*if(!(_.isEqual(req.response,context))) {
        return res.status(403).json({msg: `context checking failed`})
    }*/

    next()

}



module.exports=ContextValidation;