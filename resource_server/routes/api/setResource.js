const express =require('express');
const router =express.Router();
const resourceValidation = require('../../Middleware/resourceDataValidation');
const _ = require("lodash");


//Item Model

const Patient =require('../../models/resources');

router.get('/',(req,res)=>{
    Patient.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',resourceValidation,(req,res)=>{
    const{resource_set_id, resourceType, resourceDescription, content}=req.body;

    Patient.findOne({resource_set_id})
        .then(data=>{
            //console.log(data)
            if (data){
                if (_.isEqual(data.resourceType,resourceType )&&
                _.isEqual(data.resourceDescription,resourceDescription)&&
                _.isEqual(data.content,content)){
                    return res.status(400).json({msg:'Data already exist'});
                }

                //console.log(decisionPool)
            }else{
                data.resourceType = resourceType
                data.resourceDescription=resourceDescription
                data.content=content
                data.save().then(res.json(data))
            }


            const newData = new Patient({
                resource_set_id: resource_set_id,
                resourceType:resourceType,
                resourceDescription: resourceDescription,
                content:content,
            });
            newData.save()
                .then(data=> {
                    res.json({
                        resource_set_id: data.resource_set_id,
                        resourceType: data.resourceType,
                        resourceDescription: data. resourceDescription,
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