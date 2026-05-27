import { useMemo, useRef, useState, useEffect } from "react";

// Safe JSON parser for responses that may be empty or non-JSON
async function parseJsonSafe(res) {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/*
  DOXTracker Citizen Portal
  -------------------------
  This file is intentionally written as a small set of readable React
  components instead of one large HTML block. Each component owns one piece of
  the screen, which makes it easier to change copy, fields, lists, or styling
  later without hunting through unrelated code.
*/

// The available pages in the portal. Keeping navigation in one array means the
// nav buttons and the active-page logic always stay in sync.
const NAV_ITEMS = [
  { id: "signup", label: "Signup" },
  { id: "login", label: "Login" },
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" },
  { id: "submit", label: "Apply" },
  { id: "certificates", label: "Certificates" },
];

// Dashboard counts are data, not layout. In a real MERN app these would come
// from an endpoint such as GET /api/v1/certificates/summary.
const APPLICATION_STATS = [
  { id: "pending", label: "Pending Review", value: 2, icon: "clock" },
  { id: "approved", label: "Approved", value: 3, icon: "check" },
  { id: "rejected", label: "Rejected", value: 1, icon: "x" },
];

// Recent applications are mocked here so the frontend can run before the
// certificate backend endpoints exist. Replacing this array with API data later
// should not require changing the DashboardPage markup.
const RECENT_APPLICATIONS = [
  {
    id: "DOX-2026-0091",
    type: "Birth Certificate",
    title: "Chidi Okonkwo",
    submittedAt: "6 May 2026",
    status: "pending",
    icon: "birth",
  },
  {
    id: "DOX-2026-0077",
    type: "Marriage Certificate",
    title: "Okonkwo & Eze",
    submittedAt: "28 Apr 2026",
    status: "approved",
    icon: "marriage",
  },
  {
    id: "DOX-2026-0054",
    type: "Death Certificate",
    title: "Emeka Okonkwo",
    submittedAt: "10 Apr 2026",
    status: "rejected",
    icon: "death",
  },
  {
    id: "DOX-2026-0031",
    type: "Birth Certificate",
    title: "Ngozi Okonkwo",
    submittedAt: "2 Mar 2026",
    status: "approved",
    icon: "birth",
  },
];

// These options drive the certificate-type picker on the application form.
const CERTIFICATE_TYPES = [
  { id: "birth", label: "Birth", symbol: "B" },
  { id: "marriage", label: "Marriage", symbol: "M" },
  { id: "death", label: "Death", symbol: "D" },
];

// Required documents for each certificate type
const REQUIRED_DOCUMENTS = {
  birth: [
    { name: "Hospital Record", description: "Medical/hospital records from birth" },
    { name: "Parent/Guardian ID", description: "Valid identification of parents or guardians" },
    { name: "Proof of Residence", description: "Proof of residence at time of birth" }
  ],
  marriage: [
    { name: "Marriage License", description: "Official marriage license or certificate" },
    { name: "Spouse IDs", description: "Valid identification of both spouses" },
    { name: "Ceremony Proof", description: "Evidence of marriage ceremony (photos, invitation, etc.)" },
    { name: "Witness Affidavit", description: "Affidavit from marriage witnesses" }
  ],
  death: [
    { name: "Medical Death Report", description: "Medical report or death certificate from hospital/clinic" },
    { name: "Next of Kin ID", description: "Valid identification of next of kin" },
    { name: "Burial Permit", description: "Burial permit or funeral arrangement documents" },
    { name: "Police Report", description: "Police report (if applicable)" }
  ]
};

// Supporting document filenames used by the demo upload button.
const SAMPLE_FILES = ["hospital_record.pdf", "nok_id_scan.pdf", "registry_form.pdf"];

function App() {
  // activePage controls which page is visible. This replaces direct DOM
  // manipulation from the static prototype with normal React state.
  const [activePage, setActivePage] = useState(() => {
    try {
      return window.localStorage.getItem('token') ? 'dashboard' : 'login';
    } catch {
      return 'login';
    }
  });

  // selectedCertificateType stores the form picker selection.
  const [selectedCertificateType, setSelectedCertificateType] = useState("birth");

  // uploadedFile stores a fake file name for the demo upload preview.
  const [uploadedFile, setUploadedFile] = useState("");

  // toastMessage stores short user feedback. An empty string means no toast.
  const [toastMessage, setToastMessage] = useState("");

  // currentUser stores the signed-up / logged-in user for the demo UI.
  const [currentUser, setCurrentUser] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Try to restore session from localStorage token on load
  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) return;

    // attempt to fetch the current user's profile using the token
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
          setActivePage('dashboard');
        }
      })
      .catch(() => {});
  }, []);

  

  // Fetch applications for the signed-in user
  useEffect(() => {
    async function loadApps() {
      const token = window.localStorage.getItem('token');
      if (!token || !currentUser) {
        setMyApplications([]);
        return;
      }

      try {
        const res = await fetch('/api/applications/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load applications');
        const apps = (await parseJsonSafe(res)) || [];
        setMyApplications(apps);
      } catch (err) {
        setMyApplications([]);
      }
    }

    loadApps();
  }, [currentUser]);

  // Fetch certificates for the signed-in user
  useEffect(() => {
    async function loadCertificates() {
      const token = window.localStorage.getItem('token');
      if (!token || !currentUser) {
        setMyCertificates([]);
        setCertificateLoading(false);
        return;
      }

      setCertificateLoading(true);
      try {
        const res = await fetch('/api/certificates/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load certificates');
        const certificates = (await parseJsonSafe(res)) || [];
        setMyCertificates(certificates);
      } catch (err) {
        setMyCertificates([]);
      } finally {
        setCertificateLoading(false);
      }
    }

    loadCertificates();
  }, [currentUser]);

  // toastTimer stores the current timeout without causing a re-render.
  const toastTimer = useRef(null);

  // showToast gives every child component one simple way to show feedback.
  function showToast(message) {
    setToastMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), 2800);
  }

  // navigate changes the active page and scrolls to the top so every route-like
  // view starts in a predictable position.
  function navigate(pageId) {
    // Protect routes: only allow access to non-auth pages when not signed in
    const publicPages = ['login', 'signup'];
    if (!currentUser && !publicPages.includes(pageId)) {
      showToast('Please sign in to continue.');
      setActivePage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // simulateUpload lets the interface demonstrate upload behavior without a
  // backend file endpoint yet. Later this becomes a FormData POST request.
  function simulateUpload() {
    const randomIndex = Math.floor(Math.random() * SAMPLE_FILES.length);
    setUploadedFile(SAMPLE_FILES[randomIndex]);
    showToast("File uploaded successfully.");
  }

  // submitApplication mimics the happy path and returns the user to dashboard.
  // The generated reference number gives the UI a realistic confirmation.
  async function submitApplication(submission) {
    // submission: { selectedCertificateType, uploadedFile, formFields }
    const token = window.localStorage.getItem('token');
    try {
      const body = new FormData();
      body.append('type', submission.selectedCertificateType || selectedCertificateType);
      // include details as JSON string
      body.append('details', JSON.stringify(submission.details || {}));

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body
      });

      if (!res.ok) throw new Error('Failed to submit application');
      const app = (await parseJsonSafe(res)) || {};
      showToast(`Application submitted. REF #${app._id || app.id || '—'}`);
      // refresh applications list
      const appsRes = await fetch('/api/applications/mine', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (appsRes.ok) setMyApplications(await appsRes.json());
      window.setTimeout(() => navigate('dashboard'), 1200);
    } catch (err) {
      showToast(err.message || 'Submission failed');
    }
  }

  // useMemo picks the current page component. It keeps the return block below
  // clean and makes future pages easy to add.
  const activePageView = useMemo(() => {
    const commonProps = {
      navigate,
      showToast,
      currentUser,
      setCurrentUser,
      myApplications,
      setMyApplications,
    };

    if (activePage === "login") {
      return <AuthPage mode="login" {...commonProps} />;
    }

    if (activePage === "dashboard") {
      return <DashboardPage {...commonProps} />;
    }

    if (activePage === "profile") {
      return <ProfilePage {...commonProps} />;
    }

    if (activePage === "submit") {
      return (
        <SubmissionPage
          selectedCertificateType={selectedCertificateType}
          uploadedFile={uploadedFile}
          onCertificateTypeChange={setSelectedCertificateType}
          onUpload={simulateUpload}
          onRemoveFile={() => setUploadedFile("")}
          onSubmit={submitApplication}
          {...commonProps}
        />
      );
    }

    if (activePage === "certificates") {
      return (
        <CertificatesPage
          certificates={myCertificates}
          loading={certificateLoading}
          {...commonProps}
        />
      );
    }

    return <AuthPage mode="signup" {...commonProps} />;
  }, [activePage, selectedCertificateType, uploadedFile, currentUser, myApplications]);

  return (
    <div className="portal-shell">
      <h1 className="sr-only">
        DOXTracker Certificate Application System Citizen Portal
      </h1>

      <Navigation activePage={activePage} onNavigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />

      <main>{activePageView}</main>

      <Toast message={toastMessage} />
    </div>
  );
}

function Navigation({ activePage, onNavigate, currentUser, setCurrentUser }) {
  function handleLogout() {
    window.localStorage.removeItem('token');
    setCurrentUser(null);
    onNavigate('login');
  }

  return (
    <header className="site-header">
      <button
        type="button"
        className="brand-mark"
        onClick={() => onNavigate("dashboard")}
        aria-label="Go to dashboard"
      >
        DOX<span>Tracker</span>
      </button>

      <nav className="nav-tabs" aria-label="Citizen portal sections">
        {(
          currentUser
            ? NAV_ITEMS.filter((i) => i.id !== 'login' && i.id !== 'signup')
            : NAV_ITEMS.filter((i) => i.id === 'login' || i.id === 'signup')
        ).map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-tab ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="user-actions">
        {currentUser ? (
          <>
            <span className="user-name">{currentUser.name}</span>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

function AuthPage({ mode, navigate, showToast, setCurrentUser, setMyApplications }) {
  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const name = form.get("fullName") || "Citizen";
    const email = form.get("email") || "";
    const password = form.get("password") || "";

    try {
      const url = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
      });

      const data = (await parseJsonSafe(res)) || {};
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      // store token and set user
      if (data.token) window.localStorage.setItem('token', data.token);
      if (data.user) setCurrentUser(data.user);
      showToast(isSignup ? 'Account created.' : 'Logged in successfully.');
      // refresh applications after login/signup
      if (setMyApplications) {
        try {
          const appsRes = await fetch('/api/applications/mine', {
            headers: { Authorization: `Bearer ${data.token}` }
          });
          if (appsRes.ok) setMyApplications((await parseJsonSafe(appsRes)) || []);
        } catch {}
      }

      navigate('dashboard');
    } catch (err) {
      showToast(err.message || 'Authentication error');
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-split">
        {!isSignup && (
          <aside className="auth-hero">
            <h3>DOXTracker</h3>
            <p>
              Apply for official birth, marriage, and death certificates.
              Track application status and securely download your documents when approved.
            </p>
            <p className="auth-cta">Secure, simple, and official.</p>
          </aside>
        )}

        <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">{isSignup ? "Citizen Portal" : "Secure Login"}</p>
        <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
        <p className="form-intro">
          {isSignup
            ? "Register to apply for official government certificates."
            : "Sign in to manage your certificate applications."}
        </p>

        {isSignup && (
          <FormField
            label="Full Name"
            name="fullName"
            placeholder="Ada Okonkwo"
            autoComplete="name"
          />
        )}

        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="ada@example.com"
          autoComplete="email"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {isSignup && (
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        )}

        <button type="submit" className="primary-button">
          {isSignup ? "Create Account" : "Sign In"}
        </button>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to DOXTracker?"}{" "}
          <button
            type="button"
            onClick={() => navigate(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </p>
        </form>
      </div>
    </section>
  );
}

function DashboardPage({ navigate, currentUser, myApplications }) {
  return (
    <section className="page-container">
      <PageHeading
        title={`Good morning, ${currentUser?.name || "Ada"}`}
        description="Here is the current status of your certificate applications."
      />

      <div className="stats-grid">
        {APPLICATION_STATS.map((stat) => (
          <article key={stat.id} className={`stat-card ${stat.id}`}>
            <Icon name={stat.icon} />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>

      <SectionTitle
        title="Recent Applications"
        actionLabel="New Application"
        onAction={() => navigate("submit")}
      />

      <div className="application-list">
        {myApplications && myApplications.length > 0 ? (
          myApplications.map((application) => (
            <ApplicationItem key={application._id || application.id} application={{
              id: application._id || application.id,
              type: application.type,
              title: application.details?.fullName || application.title || 'Application',
              submittedAt: new Date(application.createdAt).toLocaleDateString(),
              status: application.status || 'pending',
              icon: application.type || 'file'
            }} />
          ))
        ) : (
          <div className="empty-state">You have no applications yet.</div>
        )}
      </div>

      <h3 className="section-heading">Quick Actions</h3>
      <div className="action-grid">
        <ActionCard
          tone="submit"
          icon="file"
          title="Submit Application"
          description="Apply for a new birth, marriage, or death certificate."
          onClick={() => navigate("submit")}
        />
        <ActionCard
          tone="view"
          icon="certificate"
          title="View Certificates"
          description="Preview or download your approved certificates securely."
          onClick={() => navigate("certificates")}
        />
      </div>
    </section>
  );
}

function SubmissionPage({
  selectedCertificateType,
  uploadedFile,
  onCertificateTypeChange,
  onUpload,
  onRemoveFile,
  onSubmit,
  navigate,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const details = {
      fullName: form.get('certificateNames'),
      dateOfEvent: form.get('eventDate'),
      placeOfEvent: form.get('eventLocation'),
      parentNames: form.get('parentNames') || undefined,
      spouseName: form.get('spouseName') || undefined,
      nextOfKinName: form.get('nextOfKinName') || undefined,
    };

    onSubmit({
      selectedCertificateType,
      uploadedFile,
      details
    });
  }

  return (
    <section className="page-container narrow">
      <PageHeading
        title="Apply for a Certificate"
        description="Select the certificate type and upload your required documents below."
      />

      <form className="form-panel" onSubmit={handleSubmit}>
        <fieldset className="certificate-fieldset">
          <legend>Certificate Type</legend>

          <div className="certificate-options">
            {CERTIFICATE_TYPES.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`certificate-option ${
                  selectedCertificateType === type.id ? "selected" : ""
                }`}
                onClick={() => onCertificateTypeChange(type.id)}
              >
                <span>{type.symbol}</span>
                {type.label}
              </button>
            ))}
          </div>
        </fieldset>

        <FormField
          label="Full Name(s) on Certificate"
          name="certificateNames"
          placeholder="As it should appear on the certificate"
        />
        <FormField label="Date of Event" name="eventDate" type="date" />
        <FormField
          label="State / LGA of Event"
          name="eventLocation"
          placeholder="e.g. Lagos, Ikeja LGA"
        />

        {selectedCertificateType === 'birth' && (
          <FormField
            label="Parent(s) / Guardian"
            name="parentNames"
            placeholder="Names of parents or guardian"
          />
        )}

        {selectedCertificateType === 'marriage' && (
          <FormField label="Spouse Name" name="spouseName" placeholder="Name of spouse" />
        )}

        {selectedCertificateType === 'death' && (
          <FormField label="Next of Kin" name="nextOfKinName" placeholder="Next of kin name" />
        )}

        <div className="field-group">
          <label>Required Supporting Documents</label>
          <div className="required-documents-list">
            {REQUIRED_DOCUMENTS[selectedCertificateType]?.map((doc, index) => (
              <div key={index} className="required-document-item">
                <span className="document-badge">{index + 1}</span>
                <div className="document-info">
                  <strong>{doc.name}</strong>
                  <p>{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Upload Supporting Documents</label>
          <button type="button" className="upload-box" onClick={onUpload}>
            <Icon name="upload" />
            <strong>Click to upload or drag and drop</strong>
            <span>PDF, JPG, PNG, max 10MB each</span>
          </button>

          {uploadedFile && (
            <div className="uploaded-file">
              <Icon name="fileCheck" />
              <span>{uploadedFile}</span>
              <button type="button" onClick={onRemoveFile}>
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("dashboard")}
          >
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Submit Application
          </button>
        </div>
      </form>
    </section>
  );
}

function CertificatesPage({ certificates, loading, showToast }) {
  return (
    <section className="page-container certificates-page">
      <PageHeading
        title="My Certificates"
        description="Download or preview your approved official certificates."
      />

      <ProgressStepper />

      <div className="certificate-list">
        {loading ? (
          <div className="empty-state">Loading certificates...</div>
        ) : certificates && certificates.length > 0 ? (
          certificates.map((certificate) => {
            const application = certificate.applicationId || {};
            return (
              <CertificateCard
                key={certificate._id || certificate.id}
                certificate={{
                  id: certificate._id || certificate.id,
                  type: certificate.type,
                  title: application.details?.fullName || 'Certificate',
                  issuedAt: certificate.issueDate
                    ? new Date(certificate.issueDate).toLocaleDateString()
                    : 'Pending release',
                  registry: 'Official Registry',
                  released: certificate.isAccessible !== false,
                  pdfUrl: certificate.pdfUrl,
                }}
                onDownload={() => showToast("Downloading certificate.")}
                onPreview={() => showToast("Opening preview." )}
              />
            );
          })
        ) : (
          <div className="empty-state">You have no certificates yet.</div>
        )}
      </div>
    </section>
  );
}

function PageHeading({ title, description }) {
  return (
    <div className="page-heading">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function SectionTitle({ title, actionLabel, onAction }) {
  return (
    <div className="section-title-row">
      <h3>{title}</h3>
      {actionLabel && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder = "",
  autoComplete = "off",
  defaultValue = undefined,
}) {
  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function ApplicationItem({ application }) {
  return (
    <article className="application-item">
      <div className={`record-icon ${application.icon}`}>
        <Icon name={application.icon} />
      </div>

      <div className="application-copy">
        <h4>
          {application.type} - {application.title}
        </h4>
        <p>
          Submitted {application.submittedAt} | REF #{application.id}
        </p>
      </div>

      <StatusBadge status={application.status} />
    </article>
  );
}

function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`status-badge ${status}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

function ActionCard({ tone, icon, title, description, onClick }) {
  return (
    <button type="button" className={`action-card ${tone}`} onClick={onClick}>
      <span className="action-icon">
        <Icon name={icon} />
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function ProgressStepper() {
  const steps = [
    { label: "Submitted", state: "done" },
    { label: "Reviewed", state: "done" },
    { label: "Approved", state: "active" },
    { label: "Download", state: "idle" },
  ];

  return (
    <ol className="progress-stepper" aria-label="Certificate progress">
      {steps.map((step, index) => (
        <li key={step.label} className={step.state}>
          <span>{step.state === "done" ? "OK" : index + 1}</span>
          <p>{step.label}</p>
        </li>
      ))}
    </ol>
  );
}

function CertificateCard({ certificate, onDownload, onPreview }) {
  return (
    <article className={`certificate-card ${certificate.released ? "released" : "locked"}`}>
      <div className="certificate-icon">
        <Icon name={certificate.released ? "certificate" : "lock"} />
      </div>

      <div className="certificate-content">
        <h3>
          {certificate.type} - {certificate.title}
        </h3>
        <p>
          {certificate.released ? `Issued ${certificate.issuedAt}` : certificate.issuedAt} |
          REF #{certificate.id} | {certificate.registry}
        </p>

        {certificate.released ? (
          <div className="certificate-actions">
            <button type="button" className="download-button" onClick={onDownload}>
              Download PDF
            </button>
            <button type="button" className="preview-button" onClick={onPreview}>
              Preview
            </button>
          </div>
        ) : (
          <div className="restricted-message">
            <Icon name="alert" />
            <span>
              Access restricted. This certificate has not been released by the
              administrator yet.
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function ProfilePage({ currentUser, setCurrentUser, showToast, navigate }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');

    try {
      const token = window.localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ name, email, password: password || undefined })
      });
      const data = (await parseJsonSafe(res)) || {};
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setCurrentUser(data.user);
      showToast('Profile updated');
    } catch (err) {
      showToast(err.message || 'Update error');
    }
  }

  function handleLogout() {
    window.localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('login');
  }

  return (
    <section className="page-container narrow">
      <PageHeading title="My profile" description="Manage your account details." />

      <form className="form-panel" onSubmit={handleSubmit}>
        <FormField label="Full name" name="name" placeholder="Your full name" defaultValue={currentUser?.name || ''} />
        <FormField label="Email" name="email" type="email" placeholder="you@example.com" defaultValue={currentUser?.email || ''} />
        <FormField label="New password" name="password" type="password" placeholder="Leave blank to keep current" />

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
          <button type="submit" className="primary-button">Save changes</button>
        </div>
      </form>
    </section>
  );
}

function Toast({ message }) {
  return (
    <div className={`toast ${message ? "show" : ""}`} role="status" aria-live="polite">
      <Icon name="check" />
      <span>{message || "Done"}</span>
    </div>
  );
}

function Icon({ name }) {
  const icons = {
    alert: "!",
    birth: "B",
    certificate: "C",
    check: "OK",
    clock: "...",
    death: "D",
    file: "+",
    fileCheck: "OK",
    lock: "L",
    marriage: "M",
    upload: "↑",
    x: "X",
  };

  return (
    <span className="ui-icon" aria-hidden="true">
      {icons[name] || "•"}
    </span>
  );
}

export default App;
