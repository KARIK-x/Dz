/**
 * Daraz Cashback - Main Server
 * Express + MongoDB backend with secure affiliate link generation
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Import routes
const activationRoutes = require('./routes/activation.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const userRoutes = require('./routes/user.routes');
const payoutRoutes = require('./routes/payout.routes');
const adminRoutes = require('./routes/admin.routes');
const redirectRoutes = require('./routes/redirect.routes');
const consentRoutes = require('./routes/consent.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from Chrome extension or configured origins
        if (!origin || config.ALLOWED_ORIGINS.some(allowed => {
            if (allowed.includes('*')) {
                const regex = new RegExp(allowed.replace('*', '.*'));
                return regex.test(origin);
            }
            return allowed === origin;
        })) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter (prevent DDoS)
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: config.RATE_LIMIT_MAX_REQUESTS_PER_IP,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV
    });
});

// API routes
app.use('/api', activationRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', userRoutes);
app.use('/api', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', consentRoutes);

// Redirect route (for signed affiliate URLs)
app.use('/r', redirectRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Daraz Cashback API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api/docs'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✓ MongoDB connected successfully');
        console.log(`  Database: ${config.MONGO_URI.split('/').pop()}`);
    })
    .catch((err) => {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    });

// MongoDB error handlers
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Daraz Cashback API Server Started   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`  Environment: ${config.NODE_ENV}`);
    console.log(`  Port: ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/health`);
    console.log('');
    console.log('  ⚠️  SECURITY WARNING ⚠️');
    console.log('  Replace all PLACEHOLDER values in config.js');
    console.log('  before deploying to production!');
    console.log('════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('\nReceived shutdown signal, closing server gracefully...');

    server.close(() => {
        console.log('HTTP server closed');

        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app; // For testing
