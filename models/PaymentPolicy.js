const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const PaymentPolicySchema =new Schema({
    type:String,
    name:{
        type: String,
        unique: true
    },
    rules:{
        SubjectAttribute:{},
        ObjectAttribute:{},
        authorization:String,
        Obligation:{
            actions: String,
        },
        context: [],
        Default:{
            authorization: String,
        }
    }
});

module.exports=PaymentPolicy=mongoose.model('PaymentPolicy', PaymentPolicySchema);