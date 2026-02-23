const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const postRoutes = require('./routes/post.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --------------- Health Check ---------------
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// --------------- API Routes ---------------
app.use('/api/v1/posts', postRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
});

// --------------- Error Middleware ---------------
app.use(errorHandler);

module.exports = app;
