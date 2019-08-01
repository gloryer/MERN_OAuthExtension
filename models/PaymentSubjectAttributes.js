const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const PaymentSubjectAttributeSchema =new Schema({
    subject_id:{
        type: String,
        required: true
    }
});

module.exports=PaymentSubjectAttribute=mongoose.model('PaymentSubjectAttribute', PaymentSubjectAttributeSchema);