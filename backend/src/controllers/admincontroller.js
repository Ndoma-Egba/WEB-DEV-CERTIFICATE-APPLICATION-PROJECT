const Application = require('../models/application');
const Certificate = require('../models/certificate');

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
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending applications can be approved' });
    }

    application.status = 'approved';
    application.reviewedAt = Date.now();
    await application.save();

    const certificate = await Certificate.create({
      applicationId: application._id,
      userId: application.userId,
      certificateNumber: `CERT-${Date.now()}`,
      pdfUrl: '/path/to/generated/pdf'
    });

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
