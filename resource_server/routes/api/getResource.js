const express =require('express');
const router =express.Router();
const TokenValidation = require('../../Middleware/TokenValidation');
//const ContextValidation=require('../../Middleware/ContextValidate')
const _ = require("lodash");
const axios =require("axios");


//Item Model

const Resource=require('../../models/resources');
const context ={result: 'True'}

//route GET api/users
router.get('/',TokenValidation, (req,res)=>{
    console.log("enter")
    const {objectAttributes,actionAttributes,environmenContext} = req.token1
    const resourceType =objectAttributes.resourceType
    /*const resource_set_id =structured_scope.resource_set_id
    //const resourceType =structured_scope.resourceType
    const securityLabel = structured_scope.securityLabel
    const actions = structured_scope.actions;*/
    //let flag =0
    //console.log(resourceType)

    //console.log(ContextUserAtHospital)post
    Resource.find({resourceType})
        .then(data=>{
            //console.log(data)

            let ContextUserAtHospital

            if (data) {
                var content =[]
                data.forEach(element=>{
                    content.push(element.content)
                })
                if (actionAttributes.actions.includes("view")) {
                    if (environmenContext) {

                        axios.post('http://localhost:4995/api/userathospital')
                            .then(res => {
                                //console.log(res.data)
                                if ((_.isEqual(res.data, context))) {
                                    ContextUserAtHospital = true
                                }
                                return ContextUserAtHospital;
                            }).then(ContextUserAtHospital => {
                            if (ContextUserAtHospital) {
                                console.log("Context Valid")
                                return res.status(400).json(content)
                            } else {
                                return res.status(400).json({msg: 'Context Info not valid'});
                            }
                        }).catch(err => {
                            res.status(400).json({msg: err.name})
                        })
                    } else {
                            return res.status(400).json(content)
                    }
                } else {
                    return res.status(400).json({msg: 'action not allowed'});
                }
            }else{
                return res.status(400).json({msg: 'resource not found'});
            }


        })
});

/*router.get('/',TokenValidation, (req,res)=>{
    const {objectAttributes,actionAttributes,environmenContext} = req.token
    const resourceType =objectAttributes.resourceType
    /!*const resource_set_id =structured_scope.resource_set_id
    //const resourceType =structured_scope.resourceType
    const securityLabel = structured_scope.securityLabel
    const actions = structured_scope.actions;*!/
    let flag =0

    //console.log(ContextUserAtHospital)
    Resource.find({resourceType})
        .then(data=>{
            //console.log(data)

            let ContextUserAtHospital

            if(!data){
                return res.status(400).json({msg: 'resource not found'});
            }
            if (data){
                //dataArray=[data]
                data.forEach(eachData =>{
                    /!*console.log(eachData)
                    console.log(resource_set_id)
                    console.log(eachData.resource_set_id)
                    console.log(securityLabel)
                    console.log(eachData.securityLabel)
                    console.log(actions)*!/
                    //console.log(eachData.actions)


                    if (_.isEqual(resourceType,eachData.resourceType )&&
                        _.isEqual(securityLabel,eachData.securityLabel)&&
                        actionValidation(actions)
                    ){
                        //console.log("findone")
                        flag++

                        axios.post('http://localhost:4995/api/userathospital')
                            .then(res=> {
                                //console.log(res.data)
                                if ((_.isEqual(res.data, context))) {
                                    ContextUserAtHospital = true
                                }
                                return ContextUserAtHospital;
                            }).then(ContextUserAtHospital=>{
                            if (ContextUserAtHospital){
                                console.log("Context Valid")
                                return res.status(400).json(eachData.content);
                            }else{
                                return res.status(400).json({msg: 'Context Info not valid'});
                            }
                        }).catch(err=>{res.status(400).json({msg:err.name})})

                        //console.log(ContextUserAtHospital)

                    }
                })}
            console.log(flag)
            if (flag ===0){
                return res.status(400).json({msg: 'resource not found'});
            }
        })
});*/
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
