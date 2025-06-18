// routes/storeRoute.js
import express from 'express';
import { renderStorePage } from '../controllers/storeController.js';
import { addToCart, viewCart } from '../controllers/cartController.js';
import { bookService, viewBookings } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/', renderStorePage);
router.post('/add-to-cart', addToCart);
router.get('/cart', viewCart);
router.post('/book-service', bookService);
router.get('/bookings', viewBookings);

export default router;
