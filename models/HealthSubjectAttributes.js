const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const HealthSubjectAttributeSchema =new Schema({
    subject_id:{
        type: String,
        required: true
    },
    name: String,
    role: [],
    department: []
});

module.exports=HealthSubjectAttribute=mongoose.model('HealthSubjectAttribute', HealthSubjectAttributeSchema);