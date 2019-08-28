const express =require('express');
const router =express.Router();
const SubjectAttributesValidation = require('../../Middleware/SubjectAttributesValidation');
const _ = require("lodash");

//Item Model

const SubjectAttributes =require('../../models/SubjectAttributes');

router.get('/',(req,res)=>{
    SubjectAttributes.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/', SubjectAttributesValidation,(req,res)=>{
    const {subject_id,application,customizedAttributes}=req.body;

    SubjectAttributes.findOne({subject_id})
        .then(subject=>{
           // console.log(subject.subject_id)
            //console.log(subject_id)
            if(subject)  {
                if (_.isEqual(subject.application, application) &&
                    _.isEqual(subject.customizedAttributes,customizedAttributes)) {
                        return res.status(400).json({msg: 'Attributes already exist'});
                }else if (_.isEqual(subject.application, application)){
                    subject.customizedAttributes=customizedAttributes
                }

                subject.save().then(subject=>res.json({subject}))

                }

            if(!subject) {
                const newSubject = new SubjectAttributes({
                    subject_id: subject_id,
                    application:application,
                    customizedAttributes:customizedAttributes
                });
                newSubject.save()
                    .then(subject => {
                        res.json({
                            subject_id: subject.subject_id,
                            application: subject.application,
                            customizedAttributes:subject.customizedAttributes
                        })
                    })
            }

        });
});


/*
router.post('/', SubjectAttributesValidation,(req,res)=>{
    const {subject_id,application}=req.body;

    SubjectAttributes.findOne({subject_id})
        .then(subject=>{
            // console.log(subject.subject_id)
            //console.log(subject_id)
            if(subject) {
                if (_.isEqual(subject.application, application) &&
                    _.isEqual(subject.role, role) &&
                    _.isEqual(subject.department, department)) {
                    return res.status(400).json({msg: 'Attributes already exist'});
                }

                if (!(_.isEqual(subject.name, name))||
                    !(_.isEqual(subject.role, role))||
                    !(_.isEqual(subject.department, department))){

                    subject.name = name
                    subject.role = role
                    subject.department = department
                }

                subject.save().then(subject=>res.json({subject}))

            }

            if(!subject) {
                const newSubject = new SubjectAttributes({
                    subject_id: subject_id,
                    name: name,
                    role: role,
                    department: department
                });
                newSubject.save()
                    .then(subject => {
                        res.json({
                            subject_id: subject.subject_id,
                            name: subject.name,
                            role: subject.role,
                            department: subject.department
                        })
                    })
            }

        });
});
*/

router.delete('/:id',(req,res)=>{
    SubjectAttributes.findById(req.params.id)
        .then(subject=>subject.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;