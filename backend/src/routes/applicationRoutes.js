const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const applicationController = require('../controllers/applicationcontroller');

router.post('/', authMiddleware.authenticate, applicationController.applyForCertificate);
router.get('/mine', authMiddleware.authenticate, applicationController.getMyApplications);

module.exports = router;
