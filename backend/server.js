require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.get('/', (req, res) => res.send('Express + MySQL backend OK'));

app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
