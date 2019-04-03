const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  active:{
    type:Boolean,
    required:false,
    default:false
  },

  cart:{ 
    items:[
      {
       product: {type: Schema.Types.ObjectId,ref:'Product' , required: true},
       quantity: { type: Number, required: true}
      }
    ] 
  }
});

userSchema.methods.addToCart = function(product){
  const productIndex = this.cart.items.findIndex(item =>{
    return item.product.toString() === product._id.toString()
  })
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (productIndex >= 0){
    newQuantity = updatedCartItems[productIndex].quantity + 1;
    updatedCartItems[productIndex].quantity = newQuantity;
  }
  else{
    updatedCartItems.push({product: product._id, quantity: newQuantity});
  }

  const updatedCart = {items: updatedCartItems};
  this.cart = updatedCart;
  return this.save();

}
userSchema.methods.deleteProductFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(item =>{
        return item.product.toString() !== productId.toString()
    })

    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
  }

module.exports = mongoose.model('User',userSchema);
