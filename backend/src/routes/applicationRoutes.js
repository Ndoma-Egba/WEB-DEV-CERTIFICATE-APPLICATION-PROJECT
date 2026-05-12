const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const { uploadDocuments } = require('../middleware/uploadmiddleware');
const applicationController = require('../controllers/applicationcontroller');

router.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.requireCitizen,
  uploadDocuments.any(),
  applicationController.applyForCertificate
);
router.get(
  '/mine',
  authMiddleware.authenticate,
  authMiddleware.requireCitizen,
  applicationController.getMyApplications
);
router.get(
  '/:id/documents/:filename',
  authMiddleware.authenticate,
  applicationController.downloadApplicationDocument
);

module.exports = router;
