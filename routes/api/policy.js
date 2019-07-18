const express =require('express');
const router =express.Router();
const policyValidation = require('../../Middleware/PolicyValidation');


//Item Model

const Policy =require('../../models/Policy');

router.get('/',(req,res)=>{
    Policy.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',policyValidation,(req,res)=>{
    const{type,name, content,Default}=req.body;

    Policy.findOne({name})
        .then(policy=>{
            if(policy) return res.status(400).json({msg:'Policy already exist'});

            const newPolicy = new Policy({
                type: type,
                name:name,
                content: content,
                Default:Default,
            });
            newPolicy.save()
                .then(policy=> {
                    res.json({
                        type: policy.type,
                        name: policy.name,
                        content: policy.content,
                        Default: policy.Default
                    })
                })

        });
});

router.delete('/:id',(req,res)=>{
    Policy.findById(req.params.id)
        .then(policy=>policy.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;