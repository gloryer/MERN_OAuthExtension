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
        subjectAttributes:{},
        objectAttributes:{},
        authorization:String,
        actionAttributes:{
        },
        environmentContext: [],
        Default:{
        }
    }
});

module.exports=Policy=mongoose.model('Policy', PolicySchema);