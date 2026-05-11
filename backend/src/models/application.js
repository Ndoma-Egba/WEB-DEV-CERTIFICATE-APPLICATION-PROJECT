const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateType: { 
    type: String, 
    enum: ['birth', 'marriage', 'death'], 
    required: true 
  },
  documents: [
    {
      name: String,
      url: String   // link to uploaded file (e.g., S3 or local storage)
    }
  ],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
