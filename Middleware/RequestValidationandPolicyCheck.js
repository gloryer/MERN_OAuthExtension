const config=require('config');
const jwt=require('jsonwebtoken');
const _ = require("lodash");

const Policy =require('../models/Policy');
const SubjectAttributes = require('../models/SubjectAttributes');
const JWT_BEARER_CLIENT_ASSERTION_TYPE= "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

var clientToPublicKey={
    "1000": "client1000publickey",
    "1001":"client1001publickey",
    "1002":"client1002publickey",
    "client_A":"client_Apublickey",
    "client_B":"client_Bpublickey"
}

function RequestEvaluation (req, res, next) {
    let grantType=req.header('grant-type');
    let clientAssertionType=req.header('client-assertion-type');
    let claimToken = req.header('client-assertion');



    //console.log(claimToken)

    if (!claimToken) {
        return res.status(401).json({msg: 'No claim token, authorization denied'});
    }

    if(claimToken){
        var decoded = jwt.decode(claimToken);
        //console.log(decoded)
        var clientId = decoded.client_id;
        var clientPublickey = clientToPublicKey[clientId];
        //console.log(clientPublickey)
        try{
            var claim=jwt.verify(claimToken,config.get(clientPublickey),{algorithms: ['RS256']});
            req.decoded=claim;
        }catch(err){
            return res.status(403).json({msg:`The claim token can not be verified because of ${ err}`})}
    }

    try{
        FieldValidation(grantType,clientAssertionType);
        //console.log(claim)

        //console.log(accessEvaluate(claim));
        //accessEvaluate(claim);
        //AccessValidate(decoded);
        //console.log(permitPolicy)

    }catch(err){
        return res.status(400).json({msg: err.message});
    }


    // Access evaluation and token generation if access is allowed by policy
    let permitPolicy
    var decisionPool=[];
    const {application}=req.decoded
    //console.log(claim)

    Policy.find({application})
        .then(policy=>{
            //console.log(policy)
            policy.forEach(eachPolicy =>{
                    //console.log(eachPolicy)
                    if (matchRules(claim,eachPolicy)==="Permit"){
                        decisionPool.push("Permit")
                        permitPolicy=eachPolicy;}
                    else{
                        decisionPool.push("Deny")
                    }

                    //console.log(decisionPool)
                }
            )
            console.log(decisionPool)
            console.log(permitPolicy)
            if(!(decisionPool.includes("Permit"))) {
                return res.status(401).json({msg:"Access denied or access not applicable"});
            }
            //return permitPolicy

            jwt.sign(
                {
                    expireIn: "1 day",
                    subject: claim.client_id,
                    audience: "http://localhost:4990/patientrecord",
                    issuer: "http://localhost:5000/authorization",
                    objectAttributes: permitPolicy.objectAttributes,
                    subjectAttributes: permitPolicy.subjectAttributes,
                    environmentContext: permitPolicy.environmentContext,
                },
                config.get('ASprivatekey'),
                {algorithm: 'RS256'},
                (err,token)=>{
                    if (err) throw {
                        error:"token_generation_failed",
                        message:`${err.name}`,
                    };
                    //console.log(token);
                    res.json({token})
                }
            )


        }).catch(err=>res.status(400).json({msg:err.name}))
    //console.log(permitPolicy)
    //return permitPolicy
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



/*function accessEvaluate(claim) {
    let permitPolicy
    var decisionPool=[];
    Policy.find()
        .then(policy=>{
            policy.forEach(eachPolicy =>{
                decisionPool.push(matchRules(claim,eachPolicy))
                if (matchRules(claim,eachPolicy)==="Permit"){
                    permitPolicy=eachPolicy;}

                //console.log(decisionPool)
                }
            )
            console.log(decisionPool)
            console.log(permitPolicy)
            if(!(decisionPool.includes("Permit"))) {
                throw {
                    error: "access_denied",
                    message: "Access denied or access not applicable",
                }
            }

            try{
                tokenGeneration(permitPolicy)
            }catch (err){
                throw{
                    error:"token_generation_failed",
                    message:`${err.name}`
            }}

            //return permitPolicy

    //console.log(permitPolicy)
    //return permitPolicy

})}*/

/*

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



   /!*  Object.keys(claim).forEach(element=>{
        console.log(element)
    })*!/
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


}*/

function matchRules(claim,policy){
    //let evaluationResults=[];
    //console.log(policy)
    var matchedRule =true

    //console.log(subjectEvaluation(claim,policy.rules))
    //console.log(actionEvaluation(claim,policy.rules))
    const {client_id} = claim;
    const subject_id=client_id
    const rules=policy.rules

    try {
        SubjectAttributes.find({subject_id})
            .then(attributes => {
                //console.log(attributes)
                // console.log(Object.keys(rules.subjectAttributes))
                //console.log(Object.keys(attributes[0].customizedAttributes))
                //console.log(Object.keys(rules.subjectAttributes).every(element => {
                //Object.keys(attributes[0].customizedAttributes).includes(element)
                //}))
                if (Object.keys(rules.subjectAttributes).every(element =>
                    Object.keys(attributes[0].customizedAttributes).includes(element)
                )) {
                    //console.log("yeah")

                    Object.keys(rules.subjectAttributes).forEach(field =>
                        matchedRule = matchedRule &&
                            attributes[0].customizedAttributes[field].some(val =>
                                rules.subjectAttributes[field].includes(val))
                    )
                    //console.log(singleEvaluation)
                    return matchedRule

                }
            }).then(matchedRule => {

            if (claim.structured_scope.actions.every(element =>
                rules.actionAttributes.actions.includes(element)
            )) {
                //console.log("yeah")

                claim.structured_scope.actions.forEach(action => {
                    matchedRule = matchedRule && (_.isEqual(claim.structured_scope[action], rules.actionAttributes[action]))
                })
                //console.log(singleEvaluation)
                return matchedRule
            }
        })
    }catch (err) {
        throw{
            error: "Policy Evaluation failed",
            message: `${err.name}`
        }

    }


    console.log(matchedRule)
    if (matchedRule===true) {
        return rules.authorization
    }else{
        return rules.Default.authorization
    }

}

function subjectEvaluation (claim, rules) {
    //console.log("yeah")
    const {client_id} = claim;
    const subject_id=client_id
    var singleEvaluation = true;
    try {
        SubjectAttributes.find({subject_id})
            .then(attributes => {
                //console.log(attributes)
               // console.log(Object.keys(rules.subjectAttributes))
                //console.log(Object.keys(attributes[0].customizedAttributes))
                //console.log(Object.keys(rules.subjectAttributes).every(element => {
                    //Object.keys(attributes[0].customizedAttributes).includes(element)
                //}))
                if (Object.keys(rules.subjectAttributes).every(element =>
                    Object.keys(attributes[0].customizedAttributes).includes(element)
                )) {
                    //console.log("yeah")

                    Object.keys(rules.subjectAttributes).forEach(field =>
                        singleEvaluation = singleEvaluation &&
                        attributes[0].customizedAttributes[field].some(val =>
                            rules.subjectAttributes[field].includes(val))
                    )
                    //console.log(singleEvaluation)
                    return singleEvaluation
                }else{
                    return false
                }


            })
    } catch (err) {
        throw{
            error: "SubjectAttributes evaluation failed",
            message: `${err.name}`
        }
    }
}

function actionEvaluation (claim, rules) {

    var singleEvaluation = true;
    //console.log("hey")

    try {
        //console.log("hey")
        //console.log(claim.structured_scope.actions)
        //console.log(rules.actionAttributes.actions)
        if (claim.structured_scope.actions.every(element =>
            rules.actionAttributes.actions.includes(element)
        )) {
            //console.log("yeah")

            claim.structured_scope.actions.forEach(action => {
                singleEvaluation = singleEvaluation && (_.isEqual(claim.structured_scope[action], rules.actionAttributes[action]))
            })
            //console.log(singleEvaluation)
            return singleEvaluation
        } else {
            return false
        }
    } catch (err) {
        throw{
            error: "action evaluation failed",
            message: `${err.name}`
        }
    }
}

//res.status(400).json({msg: 'Token is not valid'});

module.exports=RequestEvaluation;