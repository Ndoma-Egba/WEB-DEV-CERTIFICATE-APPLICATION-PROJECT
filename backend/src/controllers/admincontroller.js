const Application = require('../models/application');
const Certificate = require('../models/certificate');
const { generateCertificatePdf } = require('../utils/generateCertificatePdf');

// Admin views all pending applications
exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'pending' }).populate('userId');
    res.json(applications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin approves application and issues certificate
exports.approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('userId');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending applications can be approved' });
    }

    application.status = 'approved';
    application.reviewedAt = Date.now();
    await application.save();

    const certificate = new Certificate({
      applicationId: application._id,
      userId: application.userId._id,
      certificateNumber: `CERT-${Date.now()}`,
      pdfUrl: 'pending'
    });

    certificate.pdfUrl = `/api/certificates/${certificate._id}/download`;
    await generateCertificatePdf({
      certificate,
      application,
      user: application.userId
    });
    await certificate.save();

    res.json({ application, certificate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin rejects application
exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending applications can be rejected' });
    }

    application.status = 'rejected';
    application.reviewedAt = Date.now();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
