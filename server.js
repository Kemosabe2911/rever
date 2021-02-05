const express= require('express');
const app= express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, forwardAuthenticated } = require('./ config/auth');

//User model
const User = require('./models/User');

// Passport Config
require('./ config/passport')(passport);

// Connect flash
app.use(flash());

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/',forwardAuthenticated,(req,res)=>{
    res.render('register');
})

app.get('/login',forwardAuthenticated,(req,res)=>{
    res.render('login',{expressFlash: req.flash('success_msg'),
    expressFlashError : req.flash('error_msg')});
})

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

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
    }else{
        User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email already exists' });
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2
              });
            } else {
            const newUser = new User({
                name,
                email,
                password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if (err) throw err;
                      newUser.password = hash;
                      newUser
                        .save()
                        .then(user => {
                          req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                          );
                          res.redirect('/login');
                        })
                        .catch(err => console.log(err));
                    });
                });   
            }
    })}
})

// Login
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  });


app.get('/home',ensureAuthenticated,(req,res) =>{
    res.render('home',{
        user: req.user
    });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on ${PORT}`))