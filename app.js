const mongoose = require('mongoose');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const errorController = require('./controllers/error');
const mongooseConnect = require('./util/database');

const User = require('./models/user');

const app = express();
const store = new MongoDbSession({
  uri: mongooseConnect.uri,
  collection: 'mysession'
});

const csrfProtection = csrf();

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

  app.use(csrfProtection);
// add a middleware to add a user with request. 
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req,res,next)=>{

  res.locals.isAuthenticated = req.session.isLoggedIn ?req.session.isLoggedIn : false ;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
//const uri = mongooseConnect;
mongoose.connect(mongooseConnect.uri)
 .then(results => {
   //console.log(results);
  app.listen(3000, ()=>{
    console.log('listening on port 3000');
  })
})
.catch(err =>{
  console.log(err);
})
