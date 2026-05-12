const Application = require('../models/application');
const path = require('path');
const { documentsDir } = require('../middleware/uploadmiddleware');

function parseBodyDocuments(documents) {
  if (!documents) return [];
  if (Array.isArray(documents)) return documents;

  try {
    const parsedDocuments = JSON.parse(documents);
    return Array.isArray(parsedDocuments) ? parsedDocuments : [];
  } catch {
    return [];
  }
}

// Citizen submits a new application
exports.applyForCertificate = async (req, res) => {
  try {
    const application = new Application({
      userId: req.user.id,
      certificateType: req.body.certificateType,
      documents: []
    });

    const uploadedDocuments = (req.files || []).map(function(file) {
      return {
        name: file.originalname,
        url: `/api/applications/${application._id}/documents/${file.filename}`
      };
    });

    application.documents = uploadedDocuments.length > 0
      ? uploadedDocuments
      : parseBodyDocuments(req.body.documents);

    await application.save();
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

// Citizen or admin downloads an uploaded application document
exports.downloadApplicationDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (req.user.role !== 'admin' && application.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this application' });
    }

    const document = application.documents.find(function(item) {
      return item.url.endsWith(`/${req.params.filename}`);
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    res.download(path.join(documentsDir, req.params.filename), document.name);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
