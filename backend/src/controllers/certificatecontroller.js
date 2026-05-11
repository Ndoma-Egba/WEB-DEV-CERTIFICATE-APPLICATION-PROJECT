const Certificate = require('../models/certificate');

// Citizen downloads their certificate
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
    if (req.user.role !== 'admin' && certificate.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this certificate' });
    }

    res.json({ pdfUrl: certificate.pdfUrl });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
