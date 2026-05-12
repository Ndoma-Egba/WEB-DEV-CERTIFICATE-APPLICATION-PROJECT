# Web Dev Certificate Application Project

## Application Submission Fields

Applications are submitted to `POST /api/applications` with an authenticated request.

Required body fields:

- `type`: one of `birth`, `death`, or `marriage`
- `details.fullName`, `details.dateOfEvent`, and `details.placeOfEvent`
- `details.parentNames` for birth applications
- `details.nextOfKinName` for death applications
- `details.spouseName` for marriage applications

When sending JSON, pass documents in this shape:

```json
{
  "type": "birth",
  "details": {
    "fullName": "Jane Doe",
    "dateOfEvent": "2026-05-12",
    "placeOfEvent": "Lagos",
    "parentNames": "John Doe and Mary Doe"
  },
  "documents": {
    "birth": {
      "hospitalRecord": {
        "fileUrl": "/uploads/hospital-record.pdf",
        "fileName": "hospital-record.pdf"
      },
      "parentID": {
        "fileUrl": "/uploads/parent-id.png",
        "fileName": "parent-id.png"
      }
    }
  }
}
```

For death applications, use `details.nextOfKinName` instead of `details.parentNames`.

For marriage applications, use `details.spouseName` instead of `details.parentNames`.

When sending `multipart/form-data`, upload files using the document field names below. The backend will place each file under the correct `documents[type]` section.

Required birth documents:

- `hospitalRecord`
- `parentID`

Optional birth document:

- `proofOfResidence`

Required death documents:

- `medicalDeathReport`
- `nextOfKinID`

Optional death documents:

- `burialPermit`
- `policeReport`

Required marriage documents:

- `marriageLicense`
- `spouseIDs`
- `ceremonyProof`

Optional marriage document:

- `witnessAffidavit`

## Role-Based Access

Citizen routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/applications`
- `GET /api/applications/mine`
- `GET /api/certificates/mine`
- `GET /api/certificates/:id/download`
- `GET /api/applications/:id/documents/:filename`

Admin routes:

- `POST /api/auth/login`
- `GET /api/admin/applications`
- `GET /api/admin/applications?status=pending`
- `GET /api/admin/applications/pending`
- `GET /api/admin/applications/:id`
- `PATCH /api/admin/applications/:id/approve`
- `PATCH /api/admin/applications/:id/reject`
- `PATCH /api/admin/applications/:id/document-access`
- `GET /api/admin/citizens`
- `DELETE /api/admin/citizens/:id`
- `GET /api/admin/certificates`
- `PATCH /api/admin/certificates/:id`
- `DELETE /api/admin/certificates/:id`
- `PATCH /api/admin/certificates/:id/access`
- `GET /api/admin/audit-logs`

To revoke certificate access, send:

```json
{
  "isAccessible": false
}
```

To revoke uploaded document access, send:

```json
{
  "documentsAccessible": false
}
```
