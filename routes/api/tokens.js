const express =require('express');
const router =express.Router();
const bcrypt=require('bcryptjs');
const config =require('config');
const jwt =require('jsonwebtoken');
const auth =require('../../Middleware/tokenValidation');


//Item Model

const User =require('../../models/User');

/*
router.get('/user',(req,res)=>{
    User.find()
        .sort({date: -1})
        .then(list => res.json(list))
});
*/


//route GET api/auth
// Auth user
// Public
router.post('/',(req,res)=>{
    const{email, password,label}=req.body;

    if(!email||!password){
        return res.status(400).json({msg:'Please enter all fields'});
    }

    User.findOne({email})
        .then(user=>{
            if(!user) return res.status(400).json({msg:'User does not exist'});


            // Validating the hash
            bcrypt.compare(password, user.password)
                .then(isMatch=>{
                    if(!isMatch) return res.status(400).json({msg:'Invalid Password'});

                    jwt.sign(
                        {id:user.id,
                        expireIn:"1 day",
                        subject:user.name,
                        audience: "http://localhost:5000/token/users",
                        issuer: "http://localhost:5000/token",
                        structured_scope:{
                        permission: "read",
                        label:"Observation",
                        }},
                        config.get('jwtSecret'),
                        (err,token)=>{
                            if (err) throw err;
                            console.log(token, user);
                            res.json({token, user})
                            }
                    )});
                })

        });

// GET api/token/user
// get user data
//private

router.get('/user',auth, (req,res)=>{
    User.findOne(req.decoded.email)
        .select('-password')
        .then(user=>{
            return res.json(user)
        })
});

module.exports=router;