# Frontend Development Guide
## Web Development Certificate Application Project

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setup Instructions](#setup-instructions)
3. [Project Structure](#project-structure)
4. [API Documentation](#api-documentation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Component Requirements](#component-requirements)
7. [Form Specifications](#form-specifications)
8. [Application Workflows](#application-workflows)
9. [Certificate Types](#certificate-types)
10. [State Management](#state-management)
11. [Styling Guidelines](#styling-guidelines)
12. [Error Handling](#error-handling)
13. [Testing Guidelines](#testing-guidelines)
14. [Deployment](#deployment)

---

## Project Overview

### Application Purpose
A web-based certificate application system that allows citizens to apply for vital certificates (birth, death, marriage) and enables administrators to review, approve, and manage these applications.

### Key Features
- **User Authentication**: Sign up, login with JWT tokens
- **Certificate Applications**: Submit applications for birth, death, or marriage certificates
- **Document Upload**: Upload required documents (PDF, JPG, PNG)
- **Admin Dashboard**: Review, approve/reject applications, manage certificates
- **Certificate Issuance**: Auto-generate PDF certificates upon approval
- **Access Control**: Restrict/restore document and certificate access
- **Audit Logging**: Track all admin actions

### Technology Stack
- **Frontend**: React
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation Steps

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Running the Application
```bash
npm start
```
The application will open at `http://localhost:3000`

---

## Project Structure

### Recommended Frontend Directory Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── AuthGuard.js
│   │   ├── Citizen/
│   │   │   ├── Dashboard.js
│   │   │   ├── ApplicationForm.js
│   │   │   ├── BirthCertificateForm.js
│   │   │   ├── DeathCertificateForm.js
│   │   │   ├── MarriageCertificateForm.js
│   │   │   ├── ApplicationHistory.js
│   │   │   └── CertificateDownload.js
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ApplicationReview.js
│   │   │   ├── CertificateManagement.js
│   │   │   ├── CitizenManagement.js
│   │   │   ├── AuditLogs.js
│   │   │   └── AccessControl.js
│   │   ├── Common/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── ErrorAlert.js
│   │   │   ├── SuccessAlert.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── Modal.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── applicationService.js
│   │   ├── certificateService.js
│   │   ├── adminService.js
│   │   └── apiClient.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useForm.js
│   │   └── useApi.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── SignupPage.js
│   │   ├── CitizenDashboardPage.js
│   │   ├── AdminDashboardPage.js
│   │   └── NotFoundPage.js
│   ├── styles/
│   │   ├── App.css
│   │   ├── index.css
│   │   └── variables.css
│   ├── App.js
│   ├── index.js
│   └── reportWebVitals.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

### Authentication Endpoints

#### Sign Up
```
POST /auth/signup
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

#### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### Application Endpoints

#### Submit Application
```
POST /applications
```
**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Request Body (multipart):**
```
- type: "birth" | "death" | "marriage"
- details: {
    "fullName": "Jane Doe",
    "dateOfEvent": "1990-01-15",
    "placeOfEvent": "New York",
    "parentNames": "John Doe, Mary Doe",  // for birth
    "nextOfKinName": "James Smith",       // for death
    "spouseName": "John Smith"            // for marriage
  }
- files: [hospitalRecord, parentID, proofOfResidence] // depends on type
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "type": "birth",
  "details": {
    "fullName": "Jane Doe",
    "dateOfEvent": "1990-01-15",
    "placeOfEvent": "New York",
    "parentNames": "John Doe, Mary Doe"
  },
  "documents": {
    "birth": {
      "hospitalRecord": {
        "fileName": "hospital.pdf",
        "fileUrl": "/api/applications/507f1f77bcf86cd799439011/documents/1234567890-hospital.pdf"
      },
      "parentID": { ... },
      "proofOfResidence": { ... }
    }
  },
  "status": "pending",
  "createdAt": "2024-05-13T10:30:00.000Z",
  "updatedAt": "2024-05-13T10:30:00.000Z"
}
```

#### Get My Applications
```
GET /applications/mine
```
**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "type": "birth",
    "status": "pending",
    "details": { ... },
    "documents": { ... },
    "createdAt": "2024-05-13T10:30:00.000Z"
  },
  ...
]
```

#### Download Application Document
```
GET /applications/{applicationId}/documents/{filename}
```
**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Response:** File download (PDF/JPG/PNG)

---

### Certificate Endpoints

#### Get My Certificates
```
GET /certificates/mine
```
**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "applicationId": "507f1f77bcf86cd799439011",
    "type": "birth",
    "certificateNumber": "CERT-1715593800000",
    "issueDate": "2024-05-13T12:00:00.000Z",
    "isAccessible": true,
    "createdAt": "2024-05-13T12:00:00.000Z"
  },
  ...
]
```

#### Download Certificate
```
GET /certificates/{certificateId}/download
```
**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Response:** PDF file download

---

### Admin Endpoints

#### Get All Applications
```
GET /admin/applications?status=pending
```
**Query Parameters:**
- `status` (optional): "pending", "approved", "rejected"

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": { ... },
    "type": "birth",
    "status": "pending",
    "details": { ... },
    "documents": { ... },
    "createdAt": "2024-05-13T10:30:00.000Z"
  },
  ...
]
```

#### Get Pending Applications
```
GET /admin/applications/pending
```

#### Get Single Application
```
GET /admin/applications/{applicationId}
```

#### Approve Application
```
PATCH /admin/applications/{applicationId}/approve
```

**Response (200):**
```json
{
  "application": { ... },
  "certificate": {
    "_id": "507f1f77bcf86cd799439020",
    "certificateNumber": "CERT-1715593800000",
    "type": "birth",
    "issueDate": "2024-05-13T12:00:00.000Z"
  }
}
```

#### Reject Application
```
PATCH /admin/applications/{applicationId}/reject
```

#### Restrict/Restore Document Access
```
PATCH /admin/applications/{applicationId}/document-access
```
**Request Body:**
```json
{
  "documentsAccessible": false
}
```

#### Get All Citizens
```
GET /admin/citizens
```

#### Delete Citizen
```
DELETE /admin/citizens/{citizenId}
```

#### Get Certificates
```
GET /admin/certificates
```

#### Update Certificate
```
PATCH /admin/certificates/{certificateId}
```
**Request Body (any of these fields):**
```json
{
  "certificateNumber": "CERT-NEW-123",
  "issueDate": "2024-05-13T12:00:00.000Z",
  "type": "birth",
  "isAccessible": true
}
```

#### Delete Certificate
```
DELETE /admin/certificates/{certificateId}
```

#### Set Certificate Access
```
PATCH /admin/certificates/{certificateId}/access
```
**Request Body:**
```json
{
  "isAccessible": false
}
```

#### Get Audit Logs
```
GET /admin/audit-logs
```

---

## Authentication & Authorization

### JWT Token Handling

1. **Storing Token**
   - Store JWT in localStorage after login/signup
   - Include token in all protected requests

2. **Token Structure**
   ```javascript
   {
     id: "userId",
     role: "citizen" | "admin",
     iat: 1234567890,
     exp: 1234654290
   }
   ```

3. **Token Expiration**
   - Tokens expire after 24 hours
   - Redirect to login when token expires

### Role-Based Access

#### Citizen Permissions
- View own applications
- Submit new applications
- Download own certificates
- Download own application documents

#### Admin Permissions
- View all applications (filtered by status)
- Approve/reject applications
- Manage certificates
- View/delete citizens
- Update certificate metadata
- Control document access
- View audit logs

### Implementation Example (AuthContext)
```javascript
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // Verify token and fetch user data
      validateToken();
    }
  }, []);

  const validateToken = async () => {
    try {
      // Decode token to get user info
      const decoded = decodeToken(token);
      setUser(decoded);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    setLoading(false);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Component Requirements

### Auth Components

#### Login Component
- Email input field
- Password input field
- Login button
- "Don't have account?" link to signup
- Error message display
- Loading state
- Form validation

#### Signup Component
- Name input field
- Email input field
- Password input field
- Confirm password input field
- Signup button
- "Already have account?" link to login
- Terms & conditions checkbox
- Error message display
- Loading state
- Form validation

### Citizen Components

#### Application Form
- Certificate type selector (Birth/Death/Marriage)
- Dynamic form fields based on type
- Document upload with file validation
- Progress indicator
- Save as draft option
- Submit button with validation
- Success/error notifications

#### Application History
- List of user's applications
- Status badge (pending/approved/rejected)
- Timestamp display
- View details button
- Download documents button
- Filter by status option

#### Certificate Download
- List of issued certificates
- Certificate number display
- Issue date display
- Download button
- Print button

### Admin Components

#### Application Review
- List of applications with filters
- Application details modal
- Document preview
- Approve/Reject buttons
- Add notes/comments
- Decision confirmation dialog

#### Certificate Management
- List of all certificates
- Edit certificate details
- Delete certificate
- Restrict/restore access toggle
- Audit trail display

#### Audit Logs
- Timeline of admin actions
- Filter by action type
- Filter by date range
- Filter by admin user
- Export logs functionality

---

## Form Specifications

### Birth Certificate Application Form

**Required Fields:**
- Full Name (text)
- Date of Birth (date picker)
- Place of Birth (text)
- Parent Names (text)

**Required Documents:**
- Hospital Record (file upload - PDF/JPG/PNG)
- Parent ID (file upload - PDF/JPG/PNG)

**Optional Documents:**
- Proof of Residence (file upload - PDF/JPG/PNG)

**Validation Rules:**
- All fields required
- Date must be in the past
- Each file ≤ 5MB
- Maximum 5 files total
- File format: PDF, JPG, PNG only

### Death Certificate Application Form

**Required Fields:**
- Full Name (text)
- Date of Death (date picker)
- Place of Death (text)
- Next of Kin Name (text)

**Required Documents:**
- Medical Death Report (file upload)
- Next of Kin ID (file upload)

**Optional Documents:**
- Burial Permit (file upload)
- Police Report (file upload)

**Validation Rules:**
- All fields required
- Date must be in the past or today
- Each file ≤ 5MB
- Maximum 5 files total

### Marriage Certificate Application Form

**Required Fields:**
- Full Name (text)
- Spouse Name (text)
- Date of Marriage (date picker)
- Place of Marriage (text)

**Required Documents:**
- Marriage License (file upload)
- Spouse IDs (multiple file uploads)
- Ceremony Proof (file upload)

**Optional Documents:**
- Witness Affidavit (file upload)

**Validation Rules:**
- All fields required
- Date must be in the past or today
- Spouse IDs: at least 1 required
- Each file ≤ 5MB
- Maximum 5 files total

---

## Application Workflows

### Citizen Application Workflow

```
1. User logs in/signs up
   ↓
2. User clicks "Apply for Certificate"
   ↓
3. User selects certificate type
   ↓
4. User fills dynamic form based on type
   ↓
5. User uploads required documents
   ↓
6. User submits application
   ↓
7. Application status: PENDING
   ↓
8. Citizen can view application status
   ↓
9. Admin approves/rejects application
   ↓
10. If approved:
    - Certificate generated (PDF)
    - Citizen notified
    - Certificate available for download
   If rejected:
    - Citizen notified with reason
    - Can resubmit new application
```

### Admin Approval Workflow

```
1. Admin logs in
   ↓
2. Admin views pending applications
   ↓
3. Admin clicks "Review" on application
   ↓
4. Admin views all details and documents
   ↓
5. Admin can:
   a) Download documents for verification
   b) Preview application details
   c) Approve application
   d) Reject application
   ↓
6. If approved:
   - Citizen application status → APPROVED
   - Certificate auto-generated
   - Certificate issued with unique number
   - Audit log created
   
7. If rejected:
   - Citizen application status → REJECTED
   - Citizen can reapply
   - Audit log created
```

---

## Certificate Types

### Birth Certificate Details

**PDF Content:**
- Title: "Certificate of Birth"
- Subject name (full name from application)
- Date of Birth
- Place of Birth
- Parent Names
- Certificate Number
- Issue Date
- Application ID
- Recipient Email
- Authorized Officer signature line

**User Access:**
- Citizen: Can download certificate
- Admin: Can restrict/restore access

### Death Certificate Details

**PDF Content:**
- Title: "Certificate of Death"
- Deceased name (full name)
- Date of Death
- Place of Death
- Next of Kin Name
- Certificate Number
- Issue Date
- Application ID
- Recipient Email
- Authorized Officer signature line

### Marriage Certificate Details

**PDF Content:**
- Title: "Certificate of Marriage"
- Applicant name
- Spouse Name
- Date of Marriage
- Place of Marriage
- Certificate Number
- Issue Date
- Application ID
- Recipient Email
- Authorized Officer signature line

---

## State Management

### Recommended: Context API + useReducer

```javascript
// appReducer.js
const initialState = {
  applications: [],
  certificates: [],
  currentApplication: null,
  filter: 'pending',
  loading: false,
  error: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app._id === action.payload._id ? action.payload : app
        )
      };
    default:
      return state;
  }
};
```

### Alternative: Redux or Zustand

For more complex state management, consider Redux or Zustand.

---

## Styling Guidelines

### CSS Structure
- Use CSS modules or styled-components
- Follow BEM naming convention
- Maintain consistent color scheme
- Responsive design for mobile, tablet, desktop

### Color Scheme
```css
--primary: #007bff;
--success: #28a745;
--danger: #dc3545;
--warning: #ffc107;
--info: #17a2b8;
--light: #f8f9fa;
--dark: #343a40;
--pending: #ffc107;
--approved: #28a745;
--rejected: #dc3545;
```

### Breakpoints
```css
Mobile: 320px - 480px
Tablet: 481px - 768px
Desktop: 769px+
```

### Component Styling Example
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: var(--warning);
  color: #000;
}

.status-badge.approved {
  background-color: var(--success);
  color: white;
}

.status-badge.rejected {
  background-color: var(--danger);
  color: white;
}
```

---

## Error Handling

### Common Error Scenarios

#### Authentication Errors
- Invalid credentials (401)
- Token expired (401)
- Missing token (401)

**Handling:**
```javascript
if (response.status === 401) {
  // Clear token and redirect to login
  logout();
  navigate('/login');
}
```

#### Validation Errors
- Missing required fields (400)
- Invalid file format (400)
- File size too large (400)

**Handling:**
```javascript
if (response.status === 400) {
  // Display error message to user
  setError(data.error);
}
```

#### Server Errors
- Database errors (500)
- Server unavailable (503)

**Handling:**
```javascript
if (response.status >= 500) {
  // Show generic error message
  setError('Server error. Please try again later.');
}
```

### User-Friendly Error Messages

| Error Code | User Message |
|-----------|--------------|
| 400 | Please check your input and try again |
| 401 | Please log in to continue |
| 403 | You don't have permission to access this |
| 404 | The requested item was not found |
| 500 | Server error. Please try again later |

---

## Testing Guidelines

### Unit Tests (Jest)
```javascript
// components/__tests__/Login.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('submits form with valid credentials', async () => {
  render(<Login />);
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  // Assert behavior
});
```

### Integration Tests
- Test complete flows (login → apply → download)
- Test API communication
- Test state management

### E2E Tests (Cypress)
```javascript
// cypress/integration/application.spec.js
describe('Certificate Application', () => {
  it('allows citizen to submit application', () => {
    cy.visit('/');
    cy.login('citizen@example.com', 'password');
    cy.contains('Apply for Certificate').click();
    cy.selectOption('Birth');
    cy.fillForm({
      fullName: 'Jane Doe',
      dateOfBirth: '1990-01-15',
      placeOfBirth: 'New York',
      parentNames: 'John & Mary Doe'
    });
    cy.uploadFile('documents/hospital.pdf');
    cy.contains('Submit').click();
    cy.contains('Application submitted successfully');
  });
});
```

### Test Coverage
- Aim for 80%+ code coverage
- Test all user paths
- Test error scenarios
- Test edge cases

---

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deployment Options

#### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/repo-name"

# Build and deploy
npm run build
npm run deploy
```

#### Option 4: Docker
```dockerfile
# Dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables for Production
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Backend API running and accessible
- [ ] SSL certificate configured (if using HTTPS)
- [ ] Database backup taken
- [ ] Documentation updated
- [ ] Performance optimized

---

## Best Practices

### Code Quality
1. **Use ESLint** - Enforce code standards
2. **Use Prettier** - Format code consistently
3. **Write meaningful comments** - Explain complex logic
4. **DRY principle** - Don't repeat code
5. **Component reusability** - Create generic components

### Performance
1. **Code splitting** - Load components on demand
2. **Lazy loading** - Load images and components lazily
3. **Memoization** - Use React.memo for expensive components
4. **Optimize re-renders** - Use useCallback, useMemo
5. **Bundle size** - Monitor and reduce bundle size

### Security
1. **Never expose secrets** - Keep API keys in .env
2. **Validate inputs** - Client and server-side
3. **Sanitize outputs** - Prevent XSS attacks
4. **Use HTTPS** - Encrypt data in transit
5. **CORS handling** - Configure backend CORS properly

### Accessibility
1. **Semantic HTML** - Use proper HTML tags
2. **ARIA labels** - Add labels for screen readers
3. **Keyboard navigation** - Support tab/arrow keys
4. **Color contrast** - Ensure readable text
5. **Alt text** - Describe images

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Ensure backend allows frontend origin
```javascript
// Backend app.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: Token Expired
**Solution:** Implement token refresh logic
```javascript
// Refresh token before expiry
if (isTokenExpiringSoon()) {
  refreshToken();
}
```

### Issue: File Upload Not Working
**Solution:** Ensure correct multipart/form-data content type
```javascript
const formData = new FormData();
formData.append('type', 'birth');
formData.append('details', JSON.stringify(details));
formData.append('files', fileInput.files[0]);
```

### Issue: State Not Updating
**Solution:** Ensure immutable state updates
```javascript
// Wrong
state.user.name = 'John';

// Correct
setState({ ...state, user: { ...state.user, name: 'John' } });
```

---

## Support & Contact

For questions or issues:
1. Check the backend API logs
2. Review browser console for errors
3. Check network tab for API responses
4. Consult the API documentation above
5. Contact the backend team

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-05-13 | Initial frontend guide |

---

**Document Version:** 1.0  
**Last Updated:** May 13, 2024  
**Status:** Active
