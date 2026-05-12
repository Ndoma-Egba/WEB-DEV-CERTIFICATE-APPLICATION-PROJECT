const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const adminController = require('../controllers/admincontroller');

router.get(
  '/applications',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getApplications
);

router.get(
  '/applications/pending',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getPendingApplications
);

router.get(
  '/applications/:id',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getApplication
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

router.patch(
  '/applications/:id/document-access',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.setApplicationDocumentAccess
);

router.get(
  '/citizens',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getCitizens
);

router.delete(
  '/citizens/:id',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.deleteCitizen
);

router.get(
  '/certificates',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getCertificates
);

router.patch(
  '/certificates/:id',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.updateCertificate
);

router.delete(
  '/certificates/:id',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.deleteCertificate
);

router.patch(
  '/certificates/:id/access',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.setCertificateAccess
);

router.get(
  '/audit-logs',
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  adminController.getAuditLogs
);

module.exports = router;
