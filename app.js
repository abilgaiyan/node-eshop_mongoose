const mongoose = require('mongoose');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const errorController = require('./controllers/error');
const mongooseConnect = require('./util/database');
const csrfProtection = csrf();
const flash = require('connect-flash');
const User = require('./models/user');

const app = express();
const store = new MongoDbSession({
  uri: mongooseConnect.uri,
  collection: 'mysession'
});



app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session(
    {
      secret:'my secret key', 
      resave:false, 
      saveUninitialized: false,
      store:store

    })
  );

  
// add a middleware to add a user with request. 
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});

app.use(csrfProtection);
app.use(flash());
app.use((req,res,next)=>{

  res.locals.isAuthenticated = req.session.isLoggedIn ?req.session.isLoggedIn : false ;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

// middleware for all 500 errors
app.use((error, req,res,next)=>{
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '/500',
    errorMessage:error
  });
});

//const uri = mongooseConnect;
mongoose.connect(mongooseConnect.uri)
 .then(results => {
   //console.log(results);
  app.listen(3000, ()=>{
    console.log('listening on port 3000');
  })
})
.catch(err=>{
  const error = new Error(err);
  error.httpStatusCode= 500;
  return next(error);
});
