require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const seedRouter = require('./routes/seed');
const accountsRouter = require('./routes/accounts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/deepthought-crm';

app.use(cors());
app.use(express.json());

app.use('/api/seed', seedRouter);
app.use('/api/accounts', accountsRouter);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
