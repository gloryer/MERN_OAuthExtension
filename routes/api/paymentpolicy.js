const express =require('express');
const router =express.Router();
const policyValidation = require('../../Middleware/PolicyValidation');


//Item Model

const PaymentPolicy =require('../../models/HealthPolicy');

router.get('/',(req,res)=>{
    PaymentPolicy.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',policyValidation,(req,res)=>{
    const{type,name, rules}=req.body;

    PaymentPolicy.findOne({name})
        .then(policy=>{
            if(policy) return res.status(400).json({msg:'Policy already exist'});

            const newPolicy = new PaymentPolicy({
                type: type,
                name:name,
                rules: rules,
            });
            newPolicy.save()
                .then(policy=> {
                    res.json({
                        type: policy.type,
                        name: policy.name,
                        rules: policy.rules,
                    })
                })

        });
});

router.delete('/:id',(req,res)=>{
    PaymentPolicy.findById(req.params.id)
        .then(policy=>policy.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;