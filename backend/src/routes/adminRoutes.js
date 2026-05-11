const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const adminController = require('../controllers/admincontroller');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

router.get(
  '/applications/pending',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getPendingApplications
);

router.patch(
  '/applications/:id/approve',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.approveApplication
);

router.patch(
  '/applications/:id/reject',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.rejectApplication
);

module.exports = router;
