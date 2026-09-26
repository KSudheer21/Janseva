# JanSeva – Smart Citizen Complaint Management System

**JanSeva** is a complete, production-grade, full-stack civic grievance redressal and complaint management platform connecting citizens directly with municipal officers. It features dual role-based workflows, GPS geolocation with reverse geocoding and interactive Leaflet maps, multi-modal problem description (speech-to-text voice recognition + keyboard typing), automated priority heuristic calculation, photo upload evidence, before/after resolution proof, live status pipelines, real-time in-app notifications, and comprehensive municipal analytics reports.

---

## 🌐 Live Deployments & Demo Credentials

| Service | Platform | Live URL |
|---|---|---|
| **Frontend Web App** | Vercel | [**https://janseva-web-one.vercel.app**](https://janseva-web-one.vercel.app) |
| **Backend REST API** | Render | [**https://janseva-api.onrender.com**](https://janseva-api.onrender.com) |
| **Cloud Database & Storage** | Supabase | `https://eoqresrefkxmbrzzrjea.supabase.co` |
| **GitHub Repository** | GitHub | [**https://github.com/KSudheer21/Janseva**](https://github.com/KSudheer21/Janseva) |

### 🔑 Demo Login Credentials

* **Citizen Access**:
  * Mobile Number: Any 10-digit number (e.g. `9876543210`)
  * OTP: `123456`
* **Municipal Officer Access**:
  * Officer ID: `OFF001`
  * Password: `1234`
  * Designation: Senior Municipal Engineer (Sanitation & Civil Infrastructure)

---

## 🏛️ Key Features

### 1. Two Completely Isolated User Roles
* **Citizen / Sender**:
  * Mobile number + 6-digit OTP authentication (with configurable Demo OTP mode).
  * Profile management with preferred language (English, Telugu, Hindi) and residential address.
  * Personal dashboard displaying ONLY their own grievances (department-wide metrics are strictly isolated).
  * In-app notification center tracking status transitions.
* **Municipal Officer / Receiver**:
  * Secure Officer ID + password authentication using `bcryptjs` hashing and role-verified JWT.
  * Real-time Operations Dashboard driven strictly by live MongoDB aggregations:
    * **TODAY'S REPORTS**
    * **HIGH PRIORITY** (prominently flagged in red)
    * **IN PROGRESS**
    * **DONE**
    * **PENDING**
  * Officer personal stats: Total Assigned, Completed Proofs, Pending Cases.
  * Searchable and filterable queue (Priority, Category, Status, Date, Assignment Scope).
  * Priority-based workflow with state machine: `ASSIGN` &rarr; `START WORK` &rarr; `MARK COMPLETED` &rarr; `REJECT`.
  * Mandatory **Before / After Proof** side-by-side comparison for completed problems.
  * Three-dot action menu with **Weekly** and **Monthly** analytical reports with category breakdowns.

### 2. Multi-Modal Problem Reporting
* **Photo Evidence**:
  * Direct camera capture (`capture="environment"`) on mobile devices.
  * Gallery selection from laptop / desktop.
  * Photo preview, replacement, and removal.
  * Validated file types: JPG, JPEG, PNG, WEBP (5MB limit).
* **Dual Input Description**:
  * **Voice Input (Speech-to-Text)**: Web Speech API integration supporting Telugu (`te-IN`), Hindi (`hi-IN`), and English (`en-IN`). Speech automatically populates into an editable textarea without premature submission.
  * **Keyboard Typing**: Standard manual input with live character counter.
* **Multilingual UI**:
  * Instant dynamic localization across English, Telugu (తెలుగు), and Hindi (हिंदी).
* **Category Selection**:
  * 9 civic categories: *Roads, Street Lights, Garbage, Water, Drainage, Electricity, Public Facilities, Environment, Other*.
* **Automated Smart Priority Engine**:
  * Evaluates keywords (e.g., danger, spark, electric shock, burst, flood, accident) and category severity to suggest *High*, *Moderate*, or *Low* priority before submission.
* **Automatic Geolocation (GPS)**:
  * Browser GPS coordinate capture (`latitude`, `longitude`).
  * Reverse geocoding via OpenStreetMap Nominatim extracting Village, Mandal, District, and Exact Address.
  * Interactive Leaflet map with custom pinpoint marker and coordinates display.
  * Permission denied detection with retry option (never creates silent fake coordinates).
* **Unique Sequential Grievance ID**:
  * Format: `JS-YYYY-000001` (e.g. `JS-2026-000001`).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Leaflet.js, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | MongoDB with Mongoose ODM (includes automatic zero-config MongoMemoryServer fallback) |
| **Authentication** | JWT (JSON Web Tokens), Bcryptjs password hashing, OTP verification |
| **File Storage** | Multer disk storage in `/uploads/` with MIME-type and size validation |
| **Maps & Geocoding** | Leaflet.js, OpenStreetMap, Nominatim Reverse Geocoding API |

---

## 📁 Project Structure

```
hack/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & MongoMemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js     # Citizen OTP & Officer login logic
│   │   └── complaintController.js# Citizen submit, Officer dashboard, status transitions & reports
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization (requireCitizen, requireOfficer)
│   │   └── upload.js             # Multer image upload filter & storage
│   ├── models/
│   │   ├── Citizen.js            # Citizen model (mobile, name, language, address)
│   │   ├── Officer.js            # Officer model (officerId, passwordHash, department)
│   │   ├── Complaint.js          # Complaint model (location, timeline, photos, status, priority)
│   │   ├── Counter.js            # Atomic sequence counter for JS-YYYY-000001 IDs
│   │   └── Notification.js       # In-app notifications
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── complaintRoutes.js    # /api/complaints routes
│   │   └── notificationRoutes.js # /api/notifications routes
│   ├── scripts/
│   │   ├── sampleData.js         # Realistic seed data with photos, coordinates, and timelines
│   │   ├── seed.js               # CLI seed script
│   │   └── testE2E.js            # Automated 10-step full lifecycle verification test
│   ├── services/
│   │   ├── geocoding.js          # Reverse geocoding helper
│   │   ├── idGenerator.js        # Atomic Grievance ID generator
│   │   └── priorityEngine.js     # Multilingual rule-based priority calculator
│   ├── uploads/                  # Uploaded photo files served statically
│   ├── server.js                 # Express application entrypoint
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BeforeAfterViewer.jsx   # Side-by-side Before/After proof comparison
│   │   │   ├── ComplaintMap.jsx        # Leaflet interactive map component
│   │   │   ├── Navbar.jsx              # Civic header, emblem, language selector, notifications
│   │   │   ├── NotificationsModal.jsx  # In-app alerts modal
│   │   │   ├── PriorityBadge.jsx       # High, Moderate, Low priority badge
│   │   │   ├── StatusBadge.jsx         # SUBMITTED, ASSIGNED, IN PROGRESS, COMPLETED, REJECTED badge
│   │   │   └── StatusTimeline.jsx      # Step-by-step progress pipeline & history audit
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication, user state, language state
│   │   ├── locales/
│   │   │   └── translations.js         # Complete English, Telugu, Hindi translation dictionary
│   │   ├── pages/
│   │   │   ├── citizen/
│   │   │   │   ├── CitizenHome.jsx     # Hero banner, large Report CTA, isolated stats
│   │   │   │   ├── CitizenLogin.jsx    # Mobile + OTP login with demo OTP helper
│   │   │   │   ├── CitizenProfileModal.jsx # Profile edit modal
│   │   │   │   ├── ComplaintDetailModal.jsx# Full grievance details, timeline, before/after proof
│   │   │   │   ├── MyComplaints.jsx    # Filterable & searchable grievance list
│   │   │   │   └── ReportProblem.jsx   # Photo capture, voice-to-text, GPS Leaflet map, submit
│   │   │   └── officer/
│   │   │       ├── OfficerComplaintDetailModal.jsx # Case inspection, assign, start work, complete, reject
│   │   │       ├── OfficerDashboard.jsx# Real 5-card dashboard, officer stats, priority queue
│   │   │       ├── OfficerLogin.jsx    # Officer ID & password login
│   │   │       └── ReportsModal.jsx    # Weekly & Monthly reports with category progress bars
│   │   ├── services/
│   │   │   └── api.js                  # Centralized fetch API client with Bearer JWT
│   │   ├── App.jsx                     # Root application coordinator
│   │   ├── index.css                   # Civic design system tokens & responsive rules
│   │   └── main.jsx
│   ├── index.html                      # HTML entry with Google Fonts & Leaflet
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (`node -v`)
* **npm**: v9.0.0 or higher (`npm -v`)
* **MongoDB**: Optional! If a local MongoDB instance is running at `mongodb://127.0.0.1:27017/janseva`, it connects directly. If not running, **JanSeva automatically boots `mongodb-memory-server`** for 100% turnkey zero-config execution.

---

### Step 1: Clone & Setup Environment

#### Backend Configuration
Navigate to `backend/`:
```bash
cd backend
npm install
```

Copy the environment file:
```bash
cp .env.example .env
```
Default `.env` contents:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/janseva
JWT_SECRET=janseva_smart_citizen_complaint_management_system_jwt_secret_2026
DEMO_OTP_ENABLED=true
DEMO_OTP=123456
CLIENT_URL=http://localhost:5173
NOMINATIM_USER_AGENT=JanSevaCitizenApp/1.0
```

#### Frontend Configuration
Navigate to `frontend/`:
```bash
cd ../frontend
npm install
```

---

### Step 2: Start the Application

#### Start the Backend API (Port 5000):
```bash
cd backend
npm run dev
```
Output:
```
[JanSeva DB] Connected successfully to in-memory MongoDB at: mongodb://127.0.0.1:XXXXX/
[JanSeva DB] Demo Officer initialized: OFF001 / 1234
[JanSeva DB] Seeded 5 sample complaints successfully.
====================================================
 JanSeva Smart Citizen Complaint Management System 
 Backend API running on port 5000
 Health check: http://localhost:5000/api/health
====================================================
```

#### Start the Frontend React App (Port 5173):
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Credentials

### 1. Citizen Portal
* **URL**: [http://localhost:5173](http://localhost:5173)
* **Mobile Number**: `9876543210` (or any 10-digit number)
* **Demo OTP**: `123456`
* *Note: A convenient "Demo Citizen (9876543210 / 123456)" auto-fill button is provided on the login page.*

### 2. Officer Portal
* **URL**: Click *"Are you a Municipal Officer? Click here to Login"* on login screen
* **Officer ID**: `OFF001`
* **Password**: `1234`
* *Note: A convenient "Fill Demo" auto-fill button is provided on the officer login page.*

---

## 🧪 Automated Testing

An automated end-to-end integration test script is included. It tests the complete 10-step complaint lifecycle from citizen OTP to officer completion:
```bash
cd backend
node scripts/testE2E.js
```
The test verifies:
1. Citizen OTP dispatch
2. Citizen OTP verification and JWT issuance
3. Multilingual smart priority suggestion
4. Citizen complaint creation with atomic ID (`JS-YYYY-000001`)
5. Citizen complaint isolation in "My Complaints"
6. Officer authentication
7. Officer dashboard metrics retrieval from MongoDB
8. Self-assignment (`ASSIGNED` status & timeline)
9. Work commencement (`IN PROGRESS` status & timeline)
10. Final resolution with photo proof (`COMPLETED` status, before/after proof & notification)

---

## 📡 REST API Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/citizen/request-otp` | Public | Generates and sends OTP for 10-digit mobile number |
| `POST` | `/api/auth/citizen/verify-otp` | Public | Verifies OTP and returns Citizen JWT token |
| `POST` | `/api/auth/officer/login` | Public | Authenticates Officer ID + password with Bcrypt and returns Officer JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated profile |
| `PATCH` | `/api/auth/citizen/profile` | Citizen | Updates citizen name, language, or address |

### Citizen Complaint Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/complaints/suggest-priority` | Public/Auth | Evaluates category & description keywords for suggested priority |
| `POST` | `/api/complaints` | Citizen | Submits grievance with photo (`multipart/form-data`) & GPS coordinates |
| `GET` | `/api/complaints/my` | Citizen | Retrieves only the logged-in citizen's complaints with filters |
| `GET` | `/api/complaints/my/:id` | Citizen | Retrieves detailed grievance with timeline, before/after proof, and map |

### Officer Complaint Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/complaints/officer/dashboard` | Officer | Live MongoDB counts: Today's, High Priority, In Progress, Done, Pending |
| `GET` | `/api/complaints/officer/list` | Officer | Searchable, filterable, and sortable complaints queue |
| `GET` | `/api/complaints/officer/:id` | Officer | Full complaint case including citizen contact for processing |
| `PATCH` | `/api/complaints/officer/:id/assign` | Officer | Self-assigns grievance to officer |
| `PATCH` | `/api/complaints/officer/:id/status` | Officer | Updates status to `IN PROGRESS` or `REJECTED` with reason |
| `PATCH` | `/api/complaints/officer/:id/complete` | Officer | Marks as `COMPLETED` with mandatory resolution photo & note |
| `GET` | `/api/complaints/officer/reports` | Officer | Weekly and Monthly aggregated analytics and category breakdown |

### Notification Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Fetches user in-app notifications and unread count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Marks notification as read |

---

## 🌐 External APIs & Future Integrations

| Feature | Provider / Service | Config Key / Notes |
|---|---|---|
| **Reverse Geocoding** | OpenStreetMap Nominatim | Zero cost, configured via `NOMINATIM_USER_AGENT` in `.env` |
| **Interactive Map Tiles** | OpenStreetMap / Leaflet | Free public tiles, zero API key required |
| **SMS Gateway (Production)** | Twilio / Fast2SMS / MSG91 | Replace demo OTP in `authController.js` when SMS gateway is provisioned |
| **Cloud Photo Storage (Production)** | AWS S3 / Google Cloud Storage | Backend multer is abstracted to allow pluggable S3/GCS storage adapters |

---

## 🛡️ Security Features
* **Zero Plaintext Passwords**: Officer passwords hashed with `bcryptjs` (salt rounds: 10).
* **Strict Role-Based Authorization**: Citizens cannot access Officer endpoints; Officers cannot submit citizen grievances.
* **Citizen Data Isolation**: Citizen queries strictly filtered by `citizenId: req.user.id`. Citizens never see other citizens' complaints or department-wide statistics.
* **File Upload Hardening**: Only JPEG, JPG, PNG, and WEBP formats permitted. Strict 5MB file size limit. Uploaded files given unique randomized names.
* **CORS Protection**: Configurable allowed origins via `CLIENT_URL`.

---

## 👨‍💻 Developed For
**JanSeva – Smart Citizen Complaint Management System**  
Civic Technology & Urban Governance Redressal Platform (2026).
