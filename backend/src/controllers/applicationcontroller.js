const Application = require('../models/application');
const path = require('path');
const { documentsDir } = require('../middleware/uploadmiddleware');

function parseBodyDocuments(documents) {
  if (!documents) return {};
  if (typeof documents === 'object') return documents;

  try {
    return JSON.parse(documents);
  } catch {
    return {};
  }
}

function parseDetails(details, body) {
  if (details && typeof details === 'object') return details;

  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  }

  return {
    fullName: body.fullName,
    dateOfEvent: body.dateOfEvent,
    placeOfEvent: body.placeOfEvent,
    parentNames: body.parentNames || body.parentsOrSpouse,
    nextOfKinName: body.nextOfKinName,
    spouseName: body.spouseName || body.parentsOrSpouse
  };
}

function addUploadedDocument(documents, type, fieldName, file, applicationId) {
  if (!documents[type]) documents[type] = {};

  const uploadedDocument = {
    fileName: file.originalname,
    fileUrl: `/api/applications/${applicationId}/documents/${file.filename}`
  };

  if (fieldName === 'spouseIDs') {
    documents[type].spouseIDs = documents[type].spouseIDs || [];
    documents[type].spouseIDs.push(uploadedDocument);
    return;
  }

  documents[type][fieldName] = uploadedDocument;
}

function flattenDocuments(documents) {
  const flattenedDocuments = [];

  Object.values(documents || {}).forEach(function(typeDocuments) {
    Object.values(typeDocuments || {}).forEach(function(documentValue) {
      if (Array.isArray(documentValue)) {
        flattenedDocuments.push(...documentValue);
        return;
      }

      if (documentValue) flattenedDocuments.push(documentValue);
    });
  });

  return flattenedDocuments;
}

// Citizen submits a new application
exports.applyForCertificate = async (req, res) => {
  try {
    const type = req.body.type || req.body.certificateType;
    const application = new Application({
      userId: req.user.id,
      type,
      details: parseDetails(req.body.details, req.body),
      documents: parseBodyDocuments(req.body.documents)
    });

    (req.files || []).forEach(function(file) {
      addUploadedDocument(application.documents, type, file.fieldname, file, application._id);
    });

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
    if (req.user.role !== 'admin' && application.documentsAccessible === false) {
      return res.status(403).json({ error: 'Application document access has been restricted' });
    }

    const document = flattenDocuments(application.documents).find(function(item) {
      return item.fileUrl.endsWith(`/${req.params.filename}`);
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    res.download(path.join(documentsDir, req.params.filename), document.fileName);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
