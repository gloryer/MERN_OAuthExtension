

function SubjectAttributesValidation(req, res, next) {
    const {subject_id, application} = req.body;

    // console.log(JSON.stringify(req.body));
    // next();


    if(!subject_id){
        return res.status(400).json({msg:"Must have 'subject_id'"});
    } else if(!application) {
        return res.status(400).json({msg: "Must have 'application'"});
    }

    next();

}



//res.status(400).json({msg: 'Token is not valid'});

module.exports=SubjectAttributesValidation;
