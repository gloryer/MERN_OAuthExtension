const express =require('express');
const router =express.Router();
const PatientdataValidation = require('../../Middleware/PatientdataValidation');
const _ = require("lodash");


//Item Model

const Patient =require('../../models/Patient');

router.get('/',(req,res)=>{
    Patient.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',PatientdataValidation,(req,res)=>{
    const{resource_set_id, resourceType, securityLabel, content}=req.body;
    const patientId=resource_set_id.patientId
    Patient.findOne({patientId})
        .then(data=>{
            //console.log(data)
            if (data){
            data.forEach(eachData =>{
                if (_.isEqual(resourceType,eachData.resourceType )&&
                _.isEqual(securityLabel,eachData.securityLabel)&&
                _.isEqual(content,eachData.content)){
                    return res.status(400).json({msg:'Data already exist'});
                }

                //console.log(decisionPool)
            })}


            const newData = new Patient({
                resource_set_id: resource_set_id,
                resourceType:resourceType,
                securityLabel: securityLabel,
                content:content,
            });
            newData.save()
                .then(data=> {
                    res.json({
                        resource_set_id: data.resource_set_id,
                        resourceType: data.resourceType,
                        securityLabel: data.securityLabel,
                        content: data.content
                    })
                })

        });
});

router.delete('/:id',(req,res)=>{
    Patient.findById(req.params.id)
        .then(data=>data.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;