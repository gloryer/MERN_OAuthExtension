const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const ResourceSchema =new Schema({
    resource_set_id: {},
    resourceDescription: {},
    resourceType: [],
    content:{}
});

module.exports=User=mongoose.model('resource', ResourceSchema);