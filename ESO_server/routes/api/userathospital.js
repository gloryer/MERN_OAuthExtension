const express =require('express');
const router =express.Router();
const _ = require("lodash");


//Item Model

//const Patient =require('../../models/Patient');


//route GET api/users
router.post('/',(req,res)=>{


    return res.status(200).json({result:"True"})
});



module.exports=router;