require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var authRoutes = require('./src/routes/authRoutes');
var applicationRoutes = require('./src/routes/applicationRoutes');
var adminRoutes = require('./src/routes/adminRoutes');
var certificateRoutes = require('./src/routes/certificateRoutes');

var app = express();

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(function() {
      console.log('MongoDB connected');
    })
    .catch(function(err) {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  console.warn('MONGO_URI is not set; database routes will fail until it is configured.');
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificateRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: err.message || 'Server error'
  });
});

module.exports = app;
