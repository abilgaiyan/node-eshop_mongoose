const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcryptjs');
const configKeys = require('../config/dev.key');

const sgoptions ={
  auth:{
    api_key: configKeys.SEND_GRID_API_KEY
  }
};



const client = nodemailer.createTransport(sgTransport(sgoptions));
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'E-Mail exists already, please pick a different one.');
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          const defineEmail = {
            from: 'test@eshop.com',
            to: email,
            subject: 'New user created',
            text: 'New user created',
            html: '<b>New user created</b>'
          };
          client.sendMail(defineEmail, (err,info)=>{
            if (err){
              console.log(err);
            }
            res.redirect('/login');  
          })
          
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}
 exports.getReset =(req,res,next) =>{
  let message = req.flash('error');
  if (message.length > 0){
    message= message[0];
  } 
  else{
    message =  null;
  }
  
  let infoMessage = req.flash('info');
  if (infoMessage.length > 0){
    infoMessage= infoMessage[0];
  } 
  else{
    infoMessage =  null;
  }
   res.render('auth/reset',{
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
    infoMessage: infoMessage
   }); 
 } 
 
 exports.postReset =(req, res, next) =>{
    crypto.randomBytes(32,(err, buffer) =>{
        if (err){
          console.log(err);
          return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User
        .findOne({email: req.body.email})
        .then(user =>{
          if (!user){
            req.flash('error', 'No account with this user found');
            res.redirect('/reset');
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(results =>{
          req.flash('info', 'Please check your inbox for a password reset email.');
          res.redirect('/reset');
          client.sendMail({
          to: req.body.email,
          from: 'shop@eshop.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="${configKeys.DOMAIN_URL}/reset/${token}">link</a> to set a new password.</p>
          `
        });
        })
        .catch(err=>{
          console.log(err);
        })
    });
 }


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user){
        req.flash('error', 'Your reset password link is invalid. Try Again');
       return res.redirect('/login');
      }
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
