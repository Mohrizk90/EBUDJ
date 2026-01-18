const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/database');
    const supabase = db.getSupabase();
    
    // Check Supabase connection
    const { data, error } = await supabase
      .from('contexts')
      .select('id')
      .limit(1);
    
    const health = {
      status: 'ok',
      database: {
        connected: !error,
        error: error ? {
          code: error.code,
          message: error.message,
          hint: error.code === 'PGRST116' ? 'Tables not created. Run supabase-migration.sql in Supabase SQL Editor.' : null
        } : null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
      }
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// API Routes
app.use('/api/contexts', require('./routes/contexts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/export', require('./routes/export'));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Provide more detailed error information in development
  const errorResponse = {
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(500).json(errorResponse);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Personal Finance Tracker API ready!`);
});
