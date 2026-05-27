const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const authMiddleware = require('../middleware/authmiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Return current authenticated user
router.get('/me', authMiddleware.authenticate, authController.me);

// Update current authenticated user
router.put('/me', authMiddleware.authenticate, authController.updateMe);

module.exports = router;
