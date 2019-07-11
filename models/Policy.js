const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const PolicySchema =new Schema({
    type:String,
    name:{
        type: String,
        unique: true
    },
    content:{
        rules:{
            matchAnyOf:[],
            decision: {
                authorization:String,
                obligations:{}
            },
            context: []
        },
    },
    Default:{
        authorization: String,
        obligations: {}
    }
});

module.exports=User=mongoose.model('policy', PolicySchema);