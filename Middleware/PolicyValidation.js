
function policyValidation(req, res, next) {
    const {type, name, content, Default} = req.body;

   // console.log(JSON.stringify(req.body));
    // next();


if(!type){
    return res.status(400).json({msg:"Must have 'type'"});
} else if (!content
    ||!content.rules
    ||!(content.rules instanceof Object )
    ||(Object.keys(content.rules).length===0)){
    //console.log(rules,rules instanceof object,Object.keys(rules).length)
    return res.status(400).json({msg:"Must have 'content' with non-empty 'rules' object."});
}else if(!name){
    return res.status(400).json({msg:"Must have 'name'"});
}else if(!Default
    ||!(Default instanceof Object )
    ||(Object.keys(Default).length===0)){
    return res.status(400).json({msg:"Must have a non-empty 'Default'  object."});
}else {
    try {
        typeValidation(type);
        ruleValidation(content.rules);
        DefaultValidation(Default)

    } catch (err) {
        return res.status(400).json({msg: "Error in 'rule':" + err.message});
    }
}
    next();

}

function typeValidation(type) {
    const typeList = ["simple-policy"];

    if (!(typeList.includes(type))) {
        throw {
            error: "invalid_policy",
            message: `The policy type is not supported. Current support type is ${typeList}`
        }
    }
}


function ruleValidation(rules){
    const {matchAnyOf, decision, context} = rules;

    const contextList=["clientlocationhospital", "clientlocationclinic"];
if (!matchAnyOf) {
    throw {
        error: "invalid_policy",
        message: "Must have 'matchAnyOf'."
    };
} else if (!decision) {
    throw {
        error: "invalid_policy",
        message: "Must have 'decision'."
    };

} else if (context|| context === "") {
    if (!(contextList.includes(context))){
        throw {
            error: "invalid_policy",
            message: "Context and ESO not registered at AS"
        };
    }
}}


function DefaultValidation(Default) {
    const {authorization} = Default;

    if (!authorization) {
        throw {
            error: "invalid_policy",
            message: "Must have 'authorization' in 'Default'"
        };
    }
}


//res.status(400).json({msg: 'Token is not valid'});

module.exports=policyValidation;
