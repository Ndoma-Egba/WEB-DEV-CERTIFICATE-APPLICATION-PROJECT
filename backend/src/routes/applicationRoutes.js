const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const { uploadDocuments } = require('../middleware/uploadmiddleware');
const applicationController = require('../controllers/applicationcontroller');

router.post(
  '/',
  authMiddleware.authenticate,
  uploadDocuments.array('documents', 5),
  applicationController.applyForCertificate
);
router.get('/mine', authMiddleware.authenticate, applicationController.getMyApplications);
router.get(
  '/:id/documents/:filename',
  authMiddleware.authenticate,
  applicationController.downloadApplicationDocument
);

module.exports = router;
