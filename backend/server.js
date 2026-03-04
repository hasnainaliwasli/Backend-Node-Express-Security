const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pingLimiter = require('./src/components/ratelimiter');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123'; // Use env in production

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// CSRF Protection Middleware (using cookies)
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-site cookies
    }
});

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden: Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
};

// 0. Base Health Check (to verify backend is alive)
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Security Backend is Live!',
        frontend_allowed: FRONTEND_URL
    });
});

// 0. CSRF Token Endpoint (Frontend calls this to get a token)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// 1. Rate Limiter Test Endpoint (Applying the limiter here)
app.get('/api/ping', pingLimiter, (req, res) => {
    res.status(200).json({ message: 'Pong! Backend is reachable.' });
});

// 2. CSURF Test Endpoint (Form submission - protected by csrfProtection)
app.post('/api/login/csrf', csrfProtection, (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt: ${username}`);
    res.status(200).json({ message: `Login successful for ${username} (CSRF test endpoint)` });
});

// 3. Helmet Test Endpoint (Check response headers)
app.get('/api/headers', (req, res) => {
    res.status(200).json({
        message: 'Check your network tab to see security headers!',
        headers: res.getHeaders()
    });
});

// 4. Password Hashing Test (Bcrypt)
app.post('/api/register', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'Password is required' });

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log(`Original: ${password}`);
        console.log(`Hashed: ${hashedPassword}`);

        res.status(200).json({
            message: 'Password hashed successfully!',
            originalPassword: password,
            hashedPassword: hashedPassword
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during hashing' });
    }
});

// 5. JWT Login (Issue a token)
app.post('/api/login/jwt', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    // In a real app, you would verify password with bcrypt here
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
        message: 'Login successful! Token issued.',
        token: token
    });
});

// 6. Protected Route (Requires JWT)
app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({
        message: 'Welcome to the protected route!',
        user: req.user
    });
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
