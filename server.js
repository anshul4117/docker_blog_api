const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require(path.join(__dirname, 'src', 'app'));
const connectDB = require(path.join(__dirname, 'src', 'config', 'db'));

const PORT = process.env.PORT || 3000;

// Connect to DB, then start server
const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
        console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
        server.close(() => {
            console.log('✅ HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
