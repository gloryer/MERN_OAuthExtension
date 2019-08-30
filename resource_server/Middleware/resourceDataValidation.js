
function resourceValidation(req, res, next) {
    const{resource_set_id, resourceType, content, resourceDescription}=req.body;

    // console.log(JSON.stringify(req.body));
    // next();


    if(!resource_set_id){
        return res.status(400).json({msg:"Must have resource_set_id "});
    } else if(!resourceType ){
        return res.status(400).json({msg:"Must have resource Type."});
    }else if (!resourceDescription){
        return res.status(400).json({msg:"Must have resource description"});
    }else if (!content||! (content instanceof Object)) {
        return res.status(400).json({msg:"Must have 'content' with non-empty object."});
    } /*else{
        try{
            resourceTypeValidation(resourceType);
        } catch(err){
            return res.status(400).json({msg: "Error in 'resourceType':" + err.message});
        }
    }*/
    next();

}

/*
function resourceTypeValidation(resourceType) {
    const resourceList = ["Observation","Immunization"];

    if (!( resourceType.every (eachType=>resourceList.includes(eachType)))){
        throw {
            error: "invalid_resourceType",
            message: `The resource type is not supported. Current support type is ${resourceList}`
        }
    }
}


function securityLabelValidation(securityLabel) {

    const securityLabelList = ["Normal", "Credential"];
    if (!( securityLabel.every (eachLabel=>securityLabelList.includes(eachLabel)))){
        throw {
            error: "invalid_securityLabel",
            message: `The security is not supported. Current support type is ${securityLabelList}`
        }
    }
}
*/




//res.status(400).json({msg: 'Token is not valid'});

module.exports=resourceValidation;
