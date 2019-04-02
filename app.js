const mongoose = require('mongoose');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');


const errorController = require('./controllers/error');
const mongooseConnect = require('./util/database');

const User = require('./models/user');

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// add a middleware to add a user with request. 
app.use((req,res,next)=>{
    User.findOne({email:'test@test.com'})
    .then(user=>{
     // console.log('1.',user);
      if (!user){
         user = new User({
           name:'Ajay Bilgaiyan',
           email:'test@test.com',
           cart: { items:[] }
         });
        return user.save();
      }
      return user;
    }).then(user =>{
      req.user = user;
      //console.log('req.user', req.user);
      next();
    })
    .catch(err=> {
      console.log(err);
    });
    
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

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
