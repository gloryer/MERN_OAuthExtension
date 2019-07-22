const express =require('express');
const router =express.Router();
const TokenValidation = require('../../Middleware/TokenValidation');
const _ = require("lodash");


//Item Model

const Patient =require('../../models/Patient');


//route GET api/users
router.post('/',TokenValidation,(req,res)=>{
    const {structured_scope} = req.token
    const resource_set_id =structured_scope.resource_set_id
    const resourceType =structured_scope.resourceType
    const securityLabel = structured_scope.securityLabel
    const actions = structured_scope.actions;
    //const patientId=resource_set_id.patientId
    console.log(req.token)
    console.log(structured_scope)
    console.log(actions)

    let flag =0

    Patient.findOne({resource_set_id})
        .then(data=>{
            //console.log(data)

            if(!data){
                return res.status(400).json({msg: 'resource not found'});
            }
            if (data){
                data.forEach(eachData =>{
                    if (_.isEqual(resourceType,eachData.resourceType )&&
                        _.isEqual(securityLabel,eachData.securityLabel)&&
                        (actions === "read")){
                        flag++
                        return res.status(400).json(eachData.content);
                    }
                })}

            if (flag ===0){
                return res.status(400).json({msg: 'resource not found'});
            }
        })
});

module.exports=router;
//.catch(err=>res.status(400).json({msg:err.name}))