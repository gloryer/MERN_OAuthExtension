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
    let flag =0

    Patient.findOne({resource_set_id})
        .then(data=>{


            if(!data){
                return res.status(400).json({msg: 'resource not found'});
            }
            if (data){
                dataArray=[data]
                dataArray.forEach(eachData =>{
                    /*console.log(eachData)
                    console.log(resource_set_id)
                    console.log(eachData.resource_set_id)
                    console.log(securityLabel)
                    console.log(eachData.securityLabel)
                    console.log(actions)*/
                    //console.log(eachData.actions)


                    if (_.isEqual(resourceType,eachData.resourceType )&&
                        _.isEqual(securityLabel,eachData.securityLabel)&&
                        actionValidation(actions)
                        ){
                        //console.log("findone")
                        flag++
                        return res.status(400).json(eachData.content);
                    }
                })}
            console.log(flag)
            if (flag ===0){
                return res.status(400).json({msg: 'resource not found'});
            }
        })
});

module.exports=router;
//.catch(err=>res.status(400).json({msg:err.name}))

function actionValidation(actions){
    const match=(actions.map((element)=> {
        if(element==="read"){
            return true
        }else{
            return false
        }}).reduce((acc, current) => (acc && current), true))

    return match
}
