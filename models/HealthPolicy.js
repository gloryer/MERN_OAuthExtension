const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const HealthPolicySchema =new Schema({
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
            actions: [],
        },
        context: [],
        Default:{
            authorization: String,
        }
    }
});

module.exports=HealthPolicy=mongoose.model('HealthPolicy', HealthPolicySchema);