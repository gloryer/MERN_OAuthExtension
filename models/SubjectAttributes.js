const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const SubjectAttributeSchema =new Schema({
    subject_id:{
        type: String,
        required: true
    },
    application:String,
    customizedAttributes:{}
});

module.exports=SubjectAttributes=mongoose.model('SubjectAttributes', SubjectAttributeSchema);