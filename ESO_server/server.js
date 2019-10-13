const express=require('express');
const mongoose=require('mongoose');

const path =require('path');
const config=require('config');
const https=require('https')
const fs=require('fs')

const app = express();
const cors = require('cors');
//var nodemon = require('nodemon');


app.use(cors()) ;// Use this after the variable declaration

//Bodyparser Middleware
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

app.use('/api/userathospital', require('./routes/api/userathospital'));



/*
if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'));

    app.get('*', (req,res)=>{
        res.sendFile(path.resolve(dirname,'client','build','index.html'));
    })

}
*/

const port =process.env.PORT || 4995;

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
},app).listen(port,()=> console.log(`Server started on port ${port}`));

process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });