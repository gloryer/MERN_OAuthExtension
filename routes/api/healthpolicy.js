const express =require('express');
const router =express.Router();
const PolicyValidation = require('../../Middleware/PolicyValidation');
const _ = require("lodash");

//Item Model

const HealthPolicy =require('../../models/HealthPolicy');

router.get('/',(req,res)=>{
    HealthPolicy.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',PolicyValidation,(req,res)=>{
    const {type, name,rules}=req.body;

    HealthPolicy.findOne({name})
        .then(subject=>{
            // console.log(subject.subject_id)
            //console.log(subject_id)
            if(subject) {
                if (_.isEqual(subject.rules, rules)) {
                    return res.status(400).json({msg: 'policy already exist'});
                }else if (
                    !(_.isEqual(subject.rules.SubjectAttribute,rules.SubjectAttribute))||
                    !(_.isEqual(subject.rules.ObjectAttribute,rules.ObjectAttribute))||
                    !(_.isEqual(subject.rules.authorization, rules.authorization))||
                    !(_.isEqual(subject.rules.Obligation, rules.Obligation))||
                    !(_.isEqual(subject.rules.context,rules.context))){

                        subject.rules.SubjectAttribute =rules.SubjectAttribute
                        subject.rules.ObjectAttribute=rules.ObjectAttribute
                        subject.rules.authorization=rules.authorization
                        subject.rules.Obligation=rules.Obligation
                        subject.rules.context=rules.context

                }
                subject.save().then(res.json(subject))
            }

            if(!subject) {
                const newSubject = new HealthPolicy({
                    type:type,
                    name:name,
                    rules: rules
                });
                newSubject.save()
                    .then(subject => {
                        res.json({
                            type:subject.type,
                            name: subject.name,
                            rules:subject.rules
                        })
                    })
            }

        });
});

router.delete('/:id',(req,res)=>{
    HealthPolicy.findById(req.params.id)
        .then(subject=>subject.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;