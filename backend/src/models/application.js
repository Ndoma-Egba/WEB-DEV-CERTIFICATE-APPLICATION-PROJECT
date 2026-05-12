const mongoose = require('mongoose');

const documentFileSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['birth', 'death', 'marriage'], required: true },
  details: {
    fullName: { type: String, required: true },
    dateOfEvent: { type: Date, required: true },
    placeOfEvent: { type: String, required: true },
    parentNames: String,
    nextOfKinName: String,
    spouseName: String
  },
  documents: {
    type: new mongoose.Schema({
      birth: {
        hospitalRecord: documentFileSchema,
        parentID: documentFileSchema,
        proofOfResidence: documentFileSchema
      },
      death: {
        medicalDeathReport: documentFileSchema,
        nextOfKinID: documentFileSchema,
        burialPermit: documentFileSchema,
        policeReport: documentFileSchema
      },
      marriage: {
        marriageLicense: documentFileSchema,
        spouseIDs: [documentFileSchema],
        ceremonyProof: documentFileSchema,
        witnessAffidavit: documentFileSchema
      }
    }, { _id: false }),
    default: {}
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  documentsAccessible: { type: Boolean, default: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
}, { timestamps: true });

const requiredDocumentsByType = {
  birth: ['hospitalRecord', 'parentID'],
  death: ['medicalDeathReport', 'nextOfKinID'],
  marriage: ['marriageLicense', 'spouseIDs', 'ceremonyProof']
};

const requiredDetailsByType = {
  birth: ['parentNames'],
  death: ['nextOfKinName'],
  marriage: ['spouseName']
};

function getMissingDetails(application) {
  const requiredDetails = requiredDetailsByType[application.type] || [];
  const details = application.details || {};

  return requiredDetails.filter(function(fieldName) {
    return !details[fieldName];
  });
}

function getMissingDocuments(application) {
  const requiredDocuments = requiredDocumentsByType[application.type] || [];
  const typeDocuments = (application.documents && application.documents[application.type]) || {};

  return requiredDocuments.filter(function(fieldName) {
    const value = typeDocuments[fieldName];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
}

applicationSchema.pre('validate', function(next) {
  const missingDetails = getMissingDetails(this);
  const missingDocuments = getMissingDocuments(this);

  if (missingDetails.length > 0) {
    this.invalidate(
      'details',
      `Missing required ${this.type} detail(s): ${missingDetails.join(', ')}`
    );
  }

  if (missingDocuments.length > 0) {
    this.invalidate(
      'documents',
      `Missing required ${this.type} document(s): ${missingDocuments.join(', ')}`
    );
  }

  next();
});

module.exports = mongoose.model('Application', applicationSchema);
