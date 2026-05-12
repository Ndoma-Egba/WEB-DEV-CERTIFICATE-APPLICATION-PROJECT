const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const certificateController = require('../controllers/certificatecontroller');

router.get(
  '/mine',
  authMiddleware.authenticate,
  authMiddleware.requireCitizen,
  certificateController.getMyCertificates
);
router.get('/:id/download', authMiddleware.authenticate, certificateController.downloadCertificate);

module.exports = router;
