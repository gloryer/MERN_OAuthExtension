const express =require('express');
const router =express.Router();
const _ = require("lodash");



const TokenValidation=require('../../Middleware/TokenValidation')

//Item Model

//const Patient =require('../../models/Patient');
/*router.get('/',(req,res)=>{
    return res.status(200).json({result:"True"})
});*/

//route GET api/users
router.post('/', TokenValidation,(req,res)=>{
    //console.log("yeah")
    //console.log("yeah")

    return res.status(200).json({result:"True"})
});



module.exports=router;