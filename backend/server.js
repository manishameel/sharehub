const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');




dotenv.config();
const connectDB = require('./config/db');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ShareHub backend running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});