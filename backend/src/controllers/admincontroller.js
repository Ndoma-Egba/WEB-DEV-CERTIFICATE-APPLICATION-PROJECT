const fs = require('fs');
const Application = require('../models/application');
const Certificate = require('../models/certificate');
const User = require('../models/users');
const AuditLog = require('../models/auditLog');
const { generateCertificatePdf, getCertificateFilePath } = require('../utils/generateCertificatePdf');

function logAdminAction(req, action, targetModel, targetId, metadata = {}) {
  return AuditLog.create({
    adminId: req.user.id,
    action,
    targetModel,
    targetId,
    metadata
  });
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function deleteCertificateFile(certificate) {
  const filePath = getCertificateFilePath(certificate);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Admin views all pending applications
exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'pending' }).populate('userId');
    res.json(applications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views applications, optionally filtered by status
exports.getApplications = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const applications = await Application.find(filter).populate('userId');
    res.json(applications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views one application for audit/review
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('userId');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    res.json(application);
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
    application.adminId = req.user.id;
    application.reviewedAt = Date.now();
    await application.save();

    const certificate = new Certificate({
      applicationId: application._id,
      userId: application.userId._id,
      type: application.type,
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
    await logAdminAction(req, 'approve_application', 'Application', application._id, {
      certificateId: certificate._id,
      certificateNumber: certificate.certificateNumber
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
    application.adminId = req.user.id;
    application.reviewedAt = Date.now();
    await application.save();
    await logAdminAction(req, 'reject_application', 'Application', application._id);

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views citizens
exports.getCitizens = async (req, res) => {
  try {
    const citizens = await User.find({ role: 'citizen' });
    res.json(citizens);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin deletes a citizen and their certificate records
exports.deleteCitizen = async (req, res) => {
  try {
    const citizen = await User.findOne({ _id: req.params.id, role: 'citizen' });
    if (!citizen) return res.status(404).json({ error: 'Citizen not found' });

    const certificates = await Certificate.find({ userId: citizen._id });
    certificates.forEach(deleteCertificateFile);

    const deletedCertificates = await Certificate.deleteMany({ userId: citizen._id });
    await Application.deleteMany({ userId: citizen._id });
    await User.deleteOne({ _id: citizen._id });
    await logAdminAction(req, 'delete_citizen', 'User', citizen._id, {
      deletedCertificates: deletedCertificates.deletedCount
    });

    res.json({ message: 'Citizen deleted', deletedCertificates: deletedCertificates.deletedCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views certificate records
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('userId', '-password')
      .populate('applicationId');

    res.json(certificates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin updates certificate records
exports.updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const allowedUpdates = ['certificateNumber', 'issueDate', 'type', 'isAccessible'];
    const updatedFields = allowedUpdates.filter(function(fieldName) {
      return Object.prototype.hasOwnProperty.call(req.body, fieldName);
    });
    if (updatedFields.length === 0) {
      return res.status(400).json({
        error: `Provide at least one editable field: ${allowedUpdates.join(', ')}`
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'isAccessible') &&
      parseBoolean(req.body.isAccessible) === null) {
      return res.status(400).json({ error: 'isAccessible must be true or false' });
    }

    allowedUpdates.forEach(function(fieldName) {
      if (Object.prototype.hasOwnProperty.call(req.body, fieldName)) {
        certificate[fieldName] = fieldName === 'isAccessible'
          ? parseBoolean(req.body[fieldName])
          : req.body[fieldName];
      }
    });

    if (updatedFields.some(function(fieldName) {
      return ['certificateNumber', 'issueDate', 'type'].includes(fieldName);
    })) {
      const application = await Application.findById(certificate.applicationId);
      const user = await User.findById(certificate.userId);
      if (!application || !user) {
        return res.status(400).json({ error: 'Certificate application or user is missing' });
      }

      application.type = certificate.type;
      await generateCertificatePdf({ certificate, application, user });
    }

    await certificate.save();
    await logAdminAction(req, 'update_certificate', 'Certificate', certificate._id, {
      updatedFields
    });

    res.json(certificate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin deletes a certificate record
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    deleteCertificateFile(certificate);
    await Certificate.deleteOne({ _id: certificate._id });
    await logAdminAction(req, 'delete_certificate', 'Certificate', certificate._id, {
      certificateNumber: certificate.certificateNumber
    });

    res.json({ message: 'Certificate deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin restricts or restores citizen access to a certificate
exports.setCertificateAccess = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const isAccessible = parseBoolean(req.body.isAccessible);
    if (isAccessible === null) {
      return res.status(400).json({ error: 'isAccessible must be true or false' });
    }

    certificate.isAccessible = isAccessible;
    await certificate.save();
    await logAdminAction(
      req,
      certificate.isAccessible ? 'restore_certificate_access' : 'restrict_certificate_access',
      'Certificate',
      certificate._id
    );

    res.json(certificate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin restricts or restores citizen access to uploaded application documents
exports.setApplicationDocumentAccess = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const documentsAccessible = parseBoolean(req.body.documentsAccessible);
    if (documentsAccessible === null) {
      return res.status(400).json({ error: 'documentsAccessible must be true or false' });
    }

    application.documentsAccessible = documentsAccessible;
    await application.save();
    await logAdminAction(
      req,
      application.documentsAccessible ? 'restore_document_access' : 'restrict_document_access',
      'Application',
      application._id
    );

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin views audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .populate('adminId', '-password');

    res.json(auditLogs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
