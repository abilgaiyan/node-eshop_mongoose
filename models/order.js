const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
   items: [{
     product:{type: Object},
     quantity: {type: Number, required:true}
   }],
   user:{
     name:{type:String, required: true},
     email:{type:String, required: true},
     userId:{ type: Schema.Types.ObjectId, require: true, ref:'User'}
   }
});

module.exports = mongoose.model('Order',orderSchema);