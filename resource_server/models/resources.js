const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const ResourceSchema =new Schema({
    resource_set_id: String,
    resourceDescription: String,
    resourceType: [],
    content:{}
});

module.exports=User=mongoose.model('resource', ResourceSchema);