const cors = require('cors');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Validate required environment variables
if (!process.env.PORT) {
  throw new Error('Environment variable PORT is required but not set.');
}
if (!process.env.MONGODB_URI) {
  throw new Error('Environment variable MONGODB_URI is required but not set.');
}

// Updated CORS configuration to be more permissive for development
// This will allow requests from any origin during development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or any origin in development environment (especially GitHub codespaces)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS middleware before defining routes
app.use(cors(corsOptions));

// Enable JSON parsing for request bodies
app.use(express.json());

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware to log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Add a test endpoint to verify CORS functionality
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working properly!' });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`CORS is configured to accept requests from any origin in development`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });