const express= require('express');
const app= express();
const mongoose = require('mongoose');

//Config MongoDB
const db= require('./ config/key').MongoURI;

//Connect to MongoDB
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{console.log("Connected to MongoDB")})
.catch((err)=> {console.log(err)});


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on ${PORT}`));