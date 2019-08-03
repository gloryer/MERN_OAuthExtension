const express =require('express');
const router =express.Router();
const paymentSubjectValidation = require('../../Middleware/PaymentSubjectValidation');
const _ = require("lodash");

//Item Model

const PaymentSubjectAttribute =require('../../models/PaymentSubjectAttributes');

router.get('/',(req,res)=>{
    PaymentSubjectAttribute.find()
        .then(list => res.json(list))
});


//route GET api/users
router.post('/', paymentSubjectValidation,(req,res)=>{
    const {subject_id}=req.body;

    PaymentSubjectAttribute.findOne({subject_id})
        .then(subject=>{
            // console.log(subject.subject_id)
            //console.log(subject_id)
            if(subject) {
                    return res.status(400).json({msg: 'Attributes already exist'});
                }


            if(!subject) {
                const newSubject = new PaymentSubjectAttribute({
                    subject_id: subject_id,
                });
                newSubject.save()
                    .then(subject => {
                        res.json({
                            subject_id: subject.subject_id,
                        })
                    })
            }

        });
});

router.delete('/:id',(req,res)=>{
    PaymentSubjectAttribute.findById(req.params.id)
        .then(subject=>subject.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({msg:err.name}));
});

module.exports=router;