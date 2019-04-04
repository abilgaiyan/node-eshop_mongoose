const Product = require('../models/product');
const Order = require('../models/order');
exports.getProducts = (req, res, next) => {
  
  Product.find().then(products =>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });

  }).catch(err =>{
      console.log(err);
  });
  
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product.findById(prodId).then((product) => {
    //console.log(product[0]);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err=> {
    console.log(err);
  });
};

exports.getIndex = (req, res, next) => {
  
  Product.find()
  .then(products =>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err =>{
    console.log(err);
  });
  
  
};

exports.getCart = (req, res, next) => {
   // req.user.find().populate('user.cart')
   req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
       //console.log('cart ...', user.cart.items);
        const products =user.cart.items;
        if (products)
         return products;
        else 
        return new Promise((resolve,reject) =>{
           resolve([]);
        })  
     })
    .then(cartProducts => {

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });

    }) 
    .catch(err => {
      console.log(err);
    })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product=>{
    return req.user.addToCart(product);
  })
  .then(result =>{
    //console.log(result);
    res.redirect('/cart');
  })
  .catch(err=>{
    console.log(err);
  })
  
 
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
   req.user
     .deleteProductFromCart(prodId)
     .then(result =>{
       //console.log(result);
       res.redirect('/cart');
     })
     .catch(err => {
       console.log(err);
   })

};


exports.postOrder =(req,res,next) => {


  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(item=>{
          return {quantity: item.quantity, product:{...item.product._doc}}
      })
      console.log(products);
      const order = new Order({
        items:products,
        user:{
          userId: req.user,
          name: req.user.name,
          email: req.user.email
        }
      });
      return order.save();
    })  
    .then(result =>{
      //console.log(result);
      // clear the basket
      //req.user.cart = {items:[]};
      return req.user.clearCart();
      
    })
    .then(result=>{
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
  });
  
 
}

exports.getOrders = (req, res, next) => {

   Order.find({'user.userId': req.user._id })
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};


exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
