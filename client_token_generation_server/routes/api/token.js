const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");
const express =require('express');
const router =express.Router();


var clientToPrivateKey={
    "1000": "client1000privatekey",
    "1001":"client1001privatekey",
    "1002":"client1002privatekey",
    "client_A":"client_Aprivatekey",
    "client_B":"client_Bprivatekey"
}

router.post('/',(req,res)=> {
    const {client_id,issuer,objectAttributes,structured_scope,application}=req.body;

    var clientId = client_id;
    //console.log(client_id)
    var clientPrivatekey = clientToPrivateKey[clientId];
    //console.log(clientPrivatekey)
    //console.log(config.get(clientPrivatekey))

    jwt.sign(
        {
            expireIn: "30 days",
            client_id: client_id,
            audience: "https://localhost:5000/authorization",
            issuer: issuer,
            objectAttributes: objectAttributes,
            structured_scope: structured_scope,
            application:application
        },
        config.get(clientPrivatekey),
        {algorithm: 'RS256'},
        function(err,token){
            if (err) throw {
                error:"token_generation_failed",
                message:`${err.name}`,
            };
            console.log(token);
            res.json({token})
        }
    )
})



module.exports=router;