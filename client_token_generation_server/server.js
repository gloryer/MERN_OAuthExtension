const express=require('express');
const mongoose=require('mongoose');

const path =require('path');
const config=require('config');

const app = express();
const cors = require('cors');

app.use(cors()) ;// Use this after the variable declaration

//Body parser Middleware
app.use(express.json());

//DB config

const db = config.get('mongoURI');

//connect to Mongo
mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true
})
    .then(()=>console.log('MongoDB connected...'))
    .catch(err=>console.log(err));

//Use Routes

app.use('/api/token', require('./routes/api/token'));


if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'));

    app.get('*', (req,res)=>{
        res.sendFile(path.resolve(dirname,'client','build','index.html'));
    })

}

const port =process.env.PORT || 5005;

app.listen(port,()=> console.log(`Server started on port ${port}`));
