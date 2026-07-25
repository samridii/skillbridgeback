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
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 2,
  },
}));app.use('/api', generalLimiter); // applies to every api route, auth routes get the stricter limiter on top of this
// csrf protection, registered before all feature routes so it actually applies to them
const { generateCsrfToken, doubleCsrfProtection } = require('./middleware/csrf');

app.get('/api/csrf-token', (req, res) => {
  req.session.csrfInitialized = true; // writes to session so express-session actually persists it with a stable id
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

app.use((req, res, next) => {
  if (req.method === 'GET') return next(); // reads dont need csrf protection
  doubleCsrfProtection(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const disputeRoutes = require('./routes/disputeRoutes');
app.use('/api/disputes', disputeRoutes);
// global error handler, catches thrown errors like invalid csrf token and returns clean json
app.use((err, req, res, next) => {
  if (err.message === 'invalid csrf token') {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  console.error(err); // log unexpected errors server side
  res.status(500).json({ error: 'Something went wrong' });
});
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});