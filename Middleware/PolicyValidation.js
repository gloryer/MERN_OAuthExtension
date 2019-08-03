
function policyValidation(req, res, next) {
    const {type, name, rules} = req.body;

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
}else {
    try {
        typeValidation(type);
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


function ruleValidation(rules){
    const {SubjectAttribute,ObjectAttribute, authorization, Obligation,context,Default} = rules;
    console.log(context)

    const contextList=["clientlocationhospital", "clientlocationclinic"];
    //console.log(contextList.includes(context))
    const authorizationList=["permit","deny"];
if (!SubjectAttribute) {
    throw {
        error: "invalid_policy",
        message: "Must have 'SubjectAttributes'."
    };
} else if (!ObjectAttribute) {
    throw {
        error: "invalid_policy",
        message: "Must have 'SubjectAttributes'."
    };

} else if (!Obligation||Obligation.actions==="") {
    throw {
        error: "invalid_policy",
        message: "Must have an Obligation object with non-empty action field."
    };
} else if (context|| context === "") {
    if (!(context.every(currentvalue=> contextList.includes(currentvalue)))){
        throw {
        error: "invalid_policy",
        message: "Context is not supported in AS."
};
} else if (authorization||authorization){
        if (!(authorizationList.includes(authorization))){
            throw {
                error: "invalid_policy",
                message: ` Current support authorization type is ${authorizationList}`
            };
        }
    }else if (!Default||Default.authorization===""){
        throw {
            error: "invalid_policy",
            message: "Must have 'authorization' in 'Default'"
        };
    }

}}


//res.status(400).json({msg: 'Token is not valid'});

module.exports=policyValidation;
