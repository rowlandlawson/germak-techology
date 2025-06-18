// controllers/cartController.js
let cart = [];

export const addToCart = (req, res) => {
  const { id, name, quantity, price } = req.body;
  const item = { id, name, quantity: parseInt(quantity), price: parseInt(price) };
  cart.push(item);
  res.redirect('/store/cart');
};

export const viewCart = (req, res) => {
  res.render('cart', { cart, user: req.user });
};
