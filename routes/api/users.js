const express =require('express');
const router =express.Router();
const bcrypt=require('bcryptjs');


//Item Model

const User =require('../../models/User');

router.get('/',(req,res)=>{
    User.find()
        .sort({date: -1})
        .then(list => res.json(list))
});


//route GET api/users
router.post('/',(req,res)=>{
    const{name,email, password,label}=req.body;

    if(!name||!email||!password){
        return res.status(400).json({msg:'Please enter all fields'});
    }

    User.findOne({email})
        .then(user=>{
            if(user) return res.status(400).json({msg:'User already exist'});

            const newUser = new User({
                name: name,
                email:email,
                password: password,
                label:label
            });

            // Generating salt and hash
            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    newUser.password=hash;
                    newUser.save()
                        .then(user=>{
                            res.json({user:{
                                    id: user.id,
                                    name:user.name,
                                    email:user.email,
                                    label:user.label
                                }
                            })
                        })
                })
            })

        });
});


module.exports=router;