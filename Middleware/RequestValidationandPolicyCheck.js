const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");

const Policy =require('../models/Policy');
const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";


function RequestEvaluation (req, res, next) {
    let grantType=req.header('grant-type');
    let clientAssertionType=req.header('client-assertion-type');
    let claimToken = req.header('client-assertion');



    //console.log(claimToken)

    if (!claimToken) {
        return res.status(401).json({msg: 'No claim token, authorization denied'});
    }

    if(claimToken){
        try{
            var claim=jwt.verify(claimToken,config.get('jwtSecret'));
            req.decoded=claim;
        }catch(err){
            return res.status(403).json({msg:`The claim token can not be verified because of ${ err.name}`})}
    }

    try{
        FieldValidation(grantType,clientAssertionType);
        console.log(claim)
        //req.permitPolicy=accessEvaluate(claim);
        accessEvaluate(claim);
        //AccessValidate(decoded);
        //console.log(decisionPool)

    }catch(err){
        return res.status(400).json({msg: err.message});
    }

    next()

}




function FieldValidation(grantType,clientAssertionType){

    if (clientAssertionType !== JWT_BEARER_CLIENT_ASSERTION_TYPE) {
        throw {
            error: "bad_request",
            message: `Bad Request. Currently, only ${JWT_BEARER_CLIENT_ASSERTION_TYPE} is supported for 'client_assertion_type'.`,
        }
    } else if (grantType !=="client_credentials") {
        throw {
            error: "bad_request",
            message: "Bad Request. Currently, only 'client_credentials' is supported for 'grant_type'.",
        }
    }
}



function accessEvaluate(claim) {
    //let permitPolicy
    var decisionPool=[];
    Policy.find()
        .then(policy=>{
            policy.forEach(eachPolicy =>{
                decisionPool.push(matchRules(claim,eachPolicy))
                /*if (matchRules(claim,eachPolicy)==="Permit"){}
                    permitPolicy=eachPolicy;*/

                //console.log(decisionPool)
                }
            )
            console.log(decisionPool)
            if(!(decisionPool.includes("Permit"))) {
                throw {
                    error: "access_denied",
                    message: "Access denied or access not applicable",
                }
            }

           // return permitPolicy


      })
    //console.log(decisionPool)


}



function matchRules(claim,policy){
    //let evaluationResults=[];
    let rules=policy.content.rules;
    let scope=rules.decision.structuredScope;
    //console.log(scope)
    let claimScope=claim.structuredScope;
    //console.log(claimScope)
    const matchedRule=(rules.matchAnyOf.map((rule)=> (
        Object.keys(rule)
            .map((key) => (_.isEqual(claim[key], rule[key])))
            .reduce((acc, current) => (acc && current), true))
    ).reduce((acc, current) => (acc || current), false));



   /*  Object.keys(claim).forEach(element=>{
        console.log(element)
    })*/
    //console.log(matchedRule)
    //console.log(claimScope.resource_set_id)
    //console.log(scope.resource_set_id)
    if (matchedRule ===false){
        //console.log("false")
        //console.log(decisionPool)
        return policy.Default.authorization
    }

    if (matchedRule===true) {
        //onsole.log("true")
        if (!(_.isEqual(claimScope.resource_set_id,scope.resource_set_id))) {
           // console.log("1")
             return "Not applicable"
        } else if (!(_.isEqual(claimScope.resourceType,scope.resourceType))) {
            //console.log("2")
             return "Not applicable"
        } else if (!(_.isEqual(claimScope.securityLabel,scope.securityLabel))) {
           // console.log("3")
             return "Not applicable"
        } else if (!(_.isEqual(claimScope.actions,scope.actions))) {
           // console.log("4")
             return "Not applicable"
        } else {
             return rules.decision.authorization
        }
    }





    /*const matchRuleSignature =
        (rule.matchAnyOf.map((rule) => (
            Object.keys(rule)
                .map((key) => (_.isEqual(claims[key], rule[key])))
                .reduce((acc, current) => (acc && current), true))
        ).reduce((acc, current) => (acc || current), false));

    const matchesCondition = (!rule.condition) || evaluateCondition(claims, rule.condition);

    return matchesRuleSignature && matchesCondition;
*/
}



//res.status(400).json({msg: 'Token is not valid'});

module.exports=RequestEvaluation;