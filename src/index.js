require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse incoming requests
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Protect against NoSQL injection and HTTP parameter pollution
app.use(mongoSanitize());
app.use(hpp());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  },
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const mfaRoutes = require('./routes/mfaRoutes');
app.use('/api/mfa', mfaRoutes);
const gigRoutes = require('./routes/gigRoutes');
app.use('/api/gigs', gigRoutes);
const verificationRoutes = require('./routes/verificationRoutes');
app.use('/api/verification', verificationRoutes);
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
