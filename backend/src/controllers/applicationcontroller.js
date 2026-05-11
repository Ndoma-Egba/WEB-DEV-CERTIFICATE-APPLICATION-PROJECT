const Application = require('../models/application');

// Citizen submits a new application
exports.applyForCertificate = async (req, res) => {
  try {
    const application = await Application.create({
      userId: req.user.id,   // comes from JWT middleware
      certificateType: req.body.certificateType,
      documents: req.body.documents
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Citizen views their own applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id });
    res.json(applications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
