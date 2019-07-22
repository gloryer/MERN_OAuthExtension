const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const PatientSchema =new Schema({
    resource_set_id:{
        patientId:String
    },
    resourceType:[],
    securityLabel:[],
    content:{},

});

module.exports=User=mongoose.model('patient', PatientSchema);