require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Test
app.get('/', (req, res) => res.send('Express + MySQL backend OK '));

// === IMPORT ROUTES ===
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const promotionsRouter = require('./routes/promotions');
const contentRouter = require('./routes/content');

// === USE ROUTES ===
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/content', contentRouter);

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
