const express =require('express');
const router =express.Router();

//Item Model

const Item =require('../../models/items');

//route GET api/items
router.get('/',(req,res)=>{
    Item.find()
        .sort({date: -1})
        .then(list => res.json(list))
});


router.post('/',(req,res)=>{
    const newItem = new Item({
        name: req.body.name
    });

    newItem.save()
           .then(list => res.json(list))
});


router.delete('/:id',(req,res)=>{
    Item.findById(req.params.id)
        .then(list=>list.remove()
            .then(()=>res.json({success:true})))
        .catch(err=>res.status(404).json({success:false}));
});




module.exports=router;