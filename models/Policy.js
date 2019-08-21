const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const PolicySchema =new Schema({
    type:String,
    name:{
        type: String,
        unique: true
    },
    application: String,
    rules:{
        SubjectAttributes:{},
        ObjectAttributes:{},
        authorization:String,
        ActionAttributes:{
            actions: [],
        },
        context: [],
        Default:{
            authorization: String,
        }
    }
});

module.exports=Policy=mongoose.model('Policy', PolicySchema);