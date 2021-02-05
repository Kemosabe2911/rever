const express= require('express');
const app= express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');


//EJS
app.set('view engine', 'ejs');

//Public Folder
app.use(express.static(__dirname+'/public'));

//Config MongoDB
const db= require('./ config/key').MongoURI;

//Connect to MongoDB
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{console.log("Connected to MongoDB")})
.catch((err)=> {console.log(err)});

// Express body parser
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/',(req,res) =>{
    const {name, email, password,password2} = req.body;
    //console.log(name,email,password,password2);
    let errors = [];

    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    }
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on ${PORT}`));