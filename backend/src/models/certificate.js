const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['birth', 'death', 'marriage'], required: true },
  certificateNumber: { type: String, unique: true, required: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String, required: true },
  isAccessible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
