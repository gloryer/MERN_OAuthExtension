
function policyValidation(req, res, next) {
    const {type, name,application, rules} = req.body;

   // console.log(JSON.stringify(req.body));
    // next();


if(!type){
    return res.status(400).json({msg:"Must have 'type'"});
} else if (!rules
    ||!(rules instanceof Object )
    ||(Object.keys(rules).length===0)){
    //console.log(rules,rules instanceof object,Object.keys(rules).length)
    return res.status(400).json({msg:"Must have non-empty 'rules' object."});
}else if(!name){
    return res.status(400).json({msg:"Must have 'name'"});
}else if (!application){
    return res.status(400).json({msg:"Must have 'application'"});
}else {
    try {
        typeValidation(type);
        //profileValidation(application);
        ruleValidation(rules);
        //DefaultValidation(Default)

    } catch (err) {
        return res.status(400).json({msg: "Error in 'rule': " + err.message});
    }
}
    next();

}

function typeValidation(type) {
    const typeList = ["ABAC policy"];

    if (!(typeList.includes(type))) {
        throw {
            error: "invalid_policy",
            message: `The policy type is not supported. Current support type is ${typeList}`
        }
    }
}
/*

function profileValidation(application) {
    const applicationList = ["Payment","Health"];

    if (!(applicationList.includes(application))) {
        throw {
            error: "invalid_policy",
            message: `The application is not supported. Current support type is ${applicationList}`
        }
    }
}
*/


function ruleValidation(rules){
    const {subjectAttributes,objectAttributes, authorization, actionAttributes,environmentContext,Default} = rules;
   // console.log(context)

    const contextList=["clientlocationhospital", "clientlocationclinic"];
    //console.log(contextList.includes(context))
    const authorizationList=["Permit","Deny"];
if (!subjectAttributes) {
    throw {
        error: "invalid_policy",
        message: "Must have 'SubjectAttributes'."
    };
} else if (!objectAttributes) {
    throw {
        error: "invalid_policy",
        message: "Must have 'SubjectAttributes'."
    };

} else if (!actionAttributes) {
    throw {
        error: "invalid_policy",
        message: "Must have an ActionAttributes object with non-empty action field."
    };
} else if (environmentContext|| environmentContext === "") {
    if (!(environmentContext.every(currentvalue=> contextList.includes(currentvalue)))){
        throw {
        error: "invalid_policy",
        message: "Context is not supported in AS."
};
} else if (!authorization) {
        throw {
            error: "invalid_policy",
            message: ` Must indicate authorization decision`
        }
} else if (!(authorizationList.includes(authorization))){
        throw {
            error: "invalid_policy",
            message: ` Current support authorization type is ${authorizationList}`
        };
}else if (!Default){
    throw {
        error: "invalid_policy",
        message: "Must have 'authorization' in 'Default'"
    };
    }

}}


//res.status(400).json({msg: 'Token is not valid'});

module.exports=policyValidation;
