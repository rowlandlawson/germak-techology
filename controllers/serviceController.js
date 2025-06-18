// controllers/serviceController.js
let bookings = [];

export const bookService = (req, res) => {
  const { id, name, description } = req.body;
  const booking = { id, name, description, user: req.user.email };
  bookings.push(booking);
  res.redirect('/store/bookings');
};

export const viewBookings = (req, res) => {
  res.render('bookings', { bookings, user: req.user });
};

