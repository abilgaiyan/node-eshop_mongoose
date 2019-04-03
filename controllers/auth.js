const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password.trim();
  
  User.findOne({email:email})
    .then(user => {
      if (!user){
        res.status=401;
       return res.send('Invalid User');
      }
      
      bcrypt
      .compare(password, user.password)
      .then(isMatch =>{
        if (!isMatch){
          res.status=401;
          return res.send("User name or password does not match.")
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
  
      })
      .catch(err=>{
        console.log(err);
      })
      
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password.trim();
  const confirmPassword = req.body.confirmPassword.trim();

  User
   .findOne({email: email})
   .then(user=>{
     if (user){
       res.redirect('/login');
     }
      bcrypt.hash(password,12).then(hashPassword =>{
      const newUser = new User({
        name: name,
        email: email,
        password: hashPassword,
        cart: { items: [] }
      });
      return newUser.save();
  
     });
   })
   .then(result =>{
     res.redirect('/login');
   })
   .catch(err=>{
    console.log(err);
  })

};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
