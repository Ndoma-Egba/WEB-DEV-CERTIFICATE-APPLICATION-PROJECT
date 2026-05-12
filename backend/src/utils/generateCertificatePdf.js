const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const certificatesDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');

function formatDate(date) {
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function getCertificateFilePath(certificate) {
  return path.join(certificatesDir, `${certificate.certificateNumber}.pdf`);
}

function getCertificateContent(application) {
  const details = application.details || {};

  if (application.type === 'birth') {
    return {
      title: 'Certificate of Birth',
      subjectLabel: 'This certifies the birth of',
      lines: [
        `Date of Birth: ${formatDate(details.dateOfEvent)}`,
        `Place of Birth: ${details.placeOfEvent || 'N/A'}`,
        `Parent Names: ${details.parentNames || 'N/A'}`
      ]
    };
  }

  if (application.type === 'death') {
    return {
      title: 'Certificate of Death',
      subjectLabel: 'This certifies the death of',
      lines: [
        `Date of Death: ${formatDate(details.dateOfEvent)}`,
        `Place of Death: ${details.placeOfEvent || 'N/A'}`,
        `Next of Kin: ${details.nextOfKinName || 'N/A'}`
      ]
    };
  }

  if (application.type === 'marriage') {
    return {
      title: 'Certificate of Marriage',
      subjectLabel: 'This certifies the marriage of',
      lines: [
        `Spouse Name: ${details.spouseName || 'N/A'}`,
        `Date of Marriage: ${formatDate(details.dateOfEvent)}`,
        `Place of Marriage: ${details.placeOfEvent || 'N/A'}`
      ]
    };
  }

  return {
    title: 'Certificate',
    subjectLabel: 'This certificate is issued to',
    lines: [
      `Date of Event: ${formatDate(details.dateOfEvent)}`,
      `Place of Event: ${details.placeOfEvent || 'N/A'}`
    ]
  };
}

function generateCertificatePdf({ certificate, application, user }) {
  return new Promise(function(resolve, reject) {
    fs.mkdirSync(certificatesDir, { recursive: true });
    const certificateContent = getCertificateContent(application);

    const filePath = getCertificateFilePath(certificate);
    const doc = new PDFDocument({ size: 'A4', margin: 72 });
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', function() {
      resolve(filePath);
    });
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);

    doc
      .fontSize(14)
      .text('WEB DEV CERTIFICATE APPLICATION PROJECT', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(28)
      .text(certificateContent.title, { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(13)
      .text(certificateContent.subjectLabel, { align: 'center' })
      .moveDown(0.8);

    doc
      .fontSize(24)
      .text(application.details.fullName || user.name, { align: 'center' })
      .moveDown(1.2);

    doc
      .fontSize(14)
      .text(certificateContent.lines.join('\n'), { align: 'center', lineGap: 6 })
      .moveDown(2);

    doc
      .fontSize(11)
      .text(`Certificate Number: ${certificate.certificateNumber}`)
      .moveDown(0.5)
      .text(`Application ID: ${application._id}`)
      .moveDown(0.5)
      .text(`Issued Date: ${formatDate(certificate.issueDate)}`)
      .moveDown(0.5)
      .text(`Recipient Email: ${user.email}`)
      .moveDown(3);

    doc
      .moveTo(72, doc.y)
      .lineTo(250, doc.y)
      .stroke()
      .moveDown(0.5)
      .fontSize(11)
      .text('Authorized Officer');

    doc.end();
  });
}

module.exports = {
  generateCertificatePdf,
  getCertificateFilePath
};
