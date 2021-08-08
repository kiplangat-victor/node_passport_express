const express= require('express');
const bcrypt= require('bcryptjs');
const router=express.Router();
const passport= require('passport');
//user model
const User = require('../models/User');
//login page
router.get('/login', (req, res)=>res.render('login'));
//register page
router.get('/register', (req, res)=>res.render('register'));

//register handle
router.post('/register', (req, res) =>{
    const { name, email, password, password2}= req.body; 
    let errors=[];

//check required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg:' please fill all the fields'});
    }
    //check password match
    if (password !==password2) {
        errors.push({msg:'password does not match'});
    }

    //check password lenght
    if (password.length < 6) {
        errors.push({msg:'password should be atleast 6 characters'})
    }

    if (errors.length > 0) {
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
       //validation passed
       User.findOne({ email: email})
       .then(user =>{
           if (user) {
               //user sxist
               errors.push({ msg:'Email is already used'})
                res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
               
           }else{
               const newUser = new User({
                   name,
                   email,
                   password
               });
               //hash password
               bcrypt.genSalt(10, (err,salt) => 
               bcrypt.hash(newUser.password, salt, (err, hash) => {
                   if(err) throw err;
                   //set password to hashed
                   newUser.password = hash;
                   //save new user
                   newUser.save()
                   .then(user => {
                       req.flash('success_msg','you are now registered and can log in')
                       res.redirect('/users/login');
                   })
                   .catch(err => console.log(err)); 

               }))
           }
       });
       
    }
});

//login handle
router.post('/login', (req, res, next) =>{
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true

    })(req, res, next);
});
//handle logout

router.get('/logout', (req, res) =>{
    req.logout();
    req.flash('success_msg', 'you are logout successfully');
    res.redirect('/users/login');
})


module.exports=router;