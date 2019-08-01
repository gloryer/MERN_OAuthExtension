


function HealthSubjectValidation(req, res, next) {
    const {subject_id, name, role, department} = req.body;

    // console.log(JSON.stringify(req.body));
    // next();


    if(!subject_id){
        return res.status(400).json({msg:"Must have 'subject_id'"});
    } else if(!name){
        return res.status(400).json({msg:"Must have 'name'"});
    }else if(!role
        ||!(role instanceof Array )
        ||(role.length===0)){
        return res.status(400).json({msg:"Must have a non-empty 'role' array."});
    } else if (!department
        ||!(department instanceof Array )
        ||(department.length===0)){
        return res.status(400).json({msg:"Must have a non-empty 'department' array."});
    }

    next();

}



//res.status(400).json({msg: 'Token is not valid'});

module.exports=HealthSubjectValidation;
