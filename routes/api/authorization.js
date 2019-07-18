const express =require('express');
const router =express.Router();
const RequestEvaluation = require('../../Middleware/RequestValidationandPolicyCheck');
const Policy =require('../../models/Policy');


//route GET api/users
router.post('/',RequestEvaluation,(req,res)=>{
    Policy.find()
        .then(list => res.json(list))
});


module.exports=router;