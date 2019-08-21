const express =require('express');
const router =express.Router();
const PolicyValidation = require('../../Middleware/PolicyValidation');
const _ = require("lodash");

//Item Model

const Policy =require('../../models/Policy');

router.get('/',(req,res)=>{
    Policy.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',PolicyValidation,(req,res)=>{
    const {type, name,rules}=req.body;

    Policy.findOne({name})
        .then(subject=>{
            // console.log(subject.subject_id)
            //console.log(subject_id)
            if(subject) {
                if (_.isEqual(subject.rules, rules)) {
                    return res.status(400).json({msg: 'policy already exist'});
                }else if (
                    !(_.isEqual(subject.rules.SubjectAttributes,rules.SubjectAttributes))||
                    !(_.isEqual(subject.rules.ObjectAttributes,rules.ObjectAttributes))||
                    !(_.isEqual(subject.rules.authorization, rules.authorization))||
                    !(_.isEqual(subject.rules.ActionAttributes, rules.ActionAttributes))||
                    !(_.isEqual(subject.rules.context,rules.context))){

                        subject.rules.SubjectAttributes =rules.SubjectAttributes
                        subject.rules.ObjectAttributes=rules.ObjectAttributes
                        subject.rules.authorization=rules.authorization
                        subject.rules.ActionAttributes=rules.ActionAttributes
                        subject.rules.context=rules.context

                }
                subject.save().then(res.json(subject))
            }

            if(!subject) {
                const newSubject = new Policy({
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
    Policy.findById(req.params.id)
        .then(subject=>subject.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;