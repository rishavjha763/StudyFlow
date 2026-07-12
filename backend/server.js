require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const timerRoutes = require('./routes/timerRoutes');
const commitRoutes = require('./routes/commitRoutes');
const topicRoutes = require('./routes/topicRoutes');
const noteRoutes = require('./routes/noteRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const xpRoutes = require('./routes/xpRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const quizRoutes = require('./routes/quizRoutes');
const revisionRoutes = require('./routes/revisionRoutes');

const app = express();

// Connect to the database
connectDB();

// Security + logging middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Uploaded profile images are served from here, e.g. http://localhost:5000/uploads/profile-images/xyz.jpg
// helmet() sets Cross-Origin-Resource-Policy: same-origin by default, which silently
// blocks the browser from loading these images when the frontend runs on a different
// port/origin (e.g. localhost:5173). This override fixes that specifically for uploads,
// without weakening helmet's other protections.
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

// Basic rate limiter so the API can't be hammered with requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/commits', commitRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/revisions', revisionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
