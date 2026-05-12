const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const certificatesDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function getCertificateFilePath(certificate) {
  return path.join(certificatesDir, `${certificate.certificateNumber}.pdf`);
}

function generateCertificatePdf({ certificate, application, user }) {
  return new Promise(function(resolve, reject) {
    fs.mkdirSync(certificatesDir, { recursive: true });

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
      .text('Certificate of Registration', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(13)
      .text('This certificate is issued to', { align: 'center' })
      .moveDown(0.8);

    doc
      .fontSize(24)
      .text(user.name, { align: 'center' })
      .moveDown(1.2);

    doc
      .fontSize(14)
      .text(`For a ${application.certificateType} certificate application.`, { align: 'center' })
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
