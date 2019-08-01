const express =require('express');
const router =express.Router();
const RequestEvaluation = require('../../Middleware/RequestValidationandPolicyCheck');
const Policy =require('../../models/HealthPolicy');
const jwt =require('jsonwebtoken');


//route GET api/users
router.post('/',RequestEvaluation,(req,res)=> {

})

   /* jwt.sign(
        {id:user.id,
            expireIn:"1 day",
            subject:user.name,
            audience: "http://localhost:5000/petientResource",
            issuer: "http://localhost:5000/token",
            structured_scope:{
                permission: "read",
                label:"Observation",
            }},
        config.get('jwtSecret'),
        (err,token)=>{
            if (err) throw err;
            console.log(token, user);
            res.json({token, user})
        }
    )});

*/

module.exports=router;