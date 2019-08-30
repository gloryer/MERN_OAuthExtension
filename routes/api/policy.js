const express =require('express');
const router =express.Router();
const PolicyValidation = require('../../Middleware/PolicyValidation');
const _ = require("lodash");
//const equal = require('deep-equal');
const config=require('config');

//Item Model

const Policy =require('../../models/Policy');

router.get('/',(req,res)=>{
    Policy.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',PolicyValidation,(req,res)=>{
    const {type, name,application,rules}=req.body;

    Policy.findOne({name})
        .then(subject=>{
            if(subject) {
                if(_.isEqual(subject.rules.actionAttributes, rules.actionAttributes)&&
                _.isEqual(subject.rules.subjectAttributes,rules.subjectAttributes)&&
                _.isEqual(subject.rules.objectAttributes,rules.objectAttributes)&&
                _.isEqual(subject.rules.authorization, rules.authorization)&&
                _.isEqual(subject.rules.environmentContext,rules.environmentContext)&&
                _.isEqual(subject.rules.Default,rules.Default)){

                    //console.log(config.get("clientprivatekey").trim())
                    //console.log(config.get("clientprivatekey"))

                    return res.status(400).json({msg: 'policy already exist'});

                } else {

                    subject.rules = rules
                    subject.save().then(res.json(subject))


                }
            }

                if (!subject) {
                    const newSubject = new Policy({
                        type: type,
                        name: name,
                        application: application,
                        rules: rules
                    });
                    newSubject.save()
                        .then(subject => {
                            res.json({
                                type: subject.type,
                                name: subject.name,
                                application: application,
                                rules: subject.rules
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