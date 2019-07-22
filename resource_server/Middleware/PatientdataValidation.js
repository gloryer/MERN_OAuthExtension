
function PatientdataValidation(req, res, next) {
    const{resource_set_id, resourceType, securityLabel, content}=req.body;

    // console.log(JSON.stringify(req.body));
    // next();


    if(!resource_set_id||!resource_set_id.patientId){
        return res.status(400).json({msg:"Must have resource_set_id (patientID) "});
    } else if(!resourceType ){
        return res.status(400).json({msg:"Must have resource Type."});
    }else if (!securityLabel){
        return res.status(400).json({msg:"Must have security Label"});
    }else if (!content||! (content instanceof Object)) {
        return res.status(400).json({msg:"Must have 'content' with non-empty object."});
    } else{
        try{
            resourceTypeValidation(resourceType);
        } catch(err){
            return res.status(400).json({msg: "Error in 'resourceType':" + err.message});
        }
        try{
            securityLabelValidation(securityLabel);
        } catch(err){
            return res.status(400).json({msg: "Error in 'securityLabel':" + err.message});
        }
    }
    next();

}

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




//res.status(400).json({msg: 'Token is not valid'});

module.exports=PatientdataValidation;
