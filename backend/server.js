require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file serving for uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'JanSeva Backend API',
    status: 'ONLINE',
    serverTime: new Date().toISOString(),
    demoOtpEnabled: process.env.DEMO_OTP_ENABLED !== 'false'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[JanSeva Error]', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(` JanSeva Smart Citizen Complaint Management System `);
      console.log(` Backend API running on port ${PORT} (0.0.0.0 - all interfaces)`);
      console.log(` Local:   http://localhost:${PORT}/api/health`);
      console.log(` Network: http://<your-ip>:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('[JanSeva Fatal] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
