const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateNumber: { type: String, unique: true, required: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String, required: true }   // link to generated PDF
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
