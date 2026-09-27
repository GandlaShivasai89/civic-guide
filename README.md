# 🏛️ CivicGuide AI – Government Process Assistant

> **"Government Services, Explained Simply."**  
> An authoritative, transparent, and empathetic civic information platform helping ordinary citizens understand government procedures, documentation requirements, eligibility rules, and official fees.

---

## 🛡️ Official Civic Notice & Safety Principles

> **Official Notice:**  
> CivicGuide AI is an independent citizen information assistant and is **not an official government agency**. All information provided is retrieved, verified, and cited directly from official government portals (`.gov.in`, `.nic.in`, official gazettes, and state departments). Always confirm critical legal procedures, deadlines, and financial fees on the official government website before submitting an application or payment.

---

## 🚀 Key Features

### 1. 🔍 Authoritative Government Services Catalog
- Covers **12+ verified central and state public services**:
  - **Passport Application (Normal & Tatkaal)** – Ministry of External Affairs (`portal2.passportindia.gov.in`)
  - **Driving Licence (LLR & Permanent DL)** – MoRTH / Parivahan Sarathi (`parivahan.gov.in`)
  - **Birth Certificate Registration & Download** – CRS / Municipal Administration (`ghmc.gov.in` / `crsorgi.gov.in`)
  - **Death Certificate Registration** – Civil Registration System
  - **Income Certificate** – Revenue Department, Government of Telangana (`tg.meeseva.telangana.gov.in`)
  - **Caste & Community Certificate (SC/ST/BC)** – Revenue Department (MeeSeva / e-District)
  - **Residence / Domicile Certificate** – Tahsildar / Revenue Department
  - **Instant e-PAN & Physical Card** – Income Tax Department (`incometax.gov.in`)
  - **Aadhaar Demographic Update & Document Revalidation** – UIDAI (`myaadhaar.uidai.gov.in`)
  - **New Voter Registration (Form 6 & e-EPIC)** – Election Commission of India (`voters.eci.gov.in`)
  - **Post-Matric Scholarship & Fee Reimbursement (ePASS)** – Welfare Departments (`telanganaepass.cgg.gov.in`)
  - **Udyam MSME Business Registration** – Ministry of MSME (`udyamregistration.gov.in`)
- Instant keyword search, category filtering, state jurisdiction filtering, and application mode filtering (Online, Offline, Hybrid).

### 2. 🤖 CivicGuide AI (RAG Assistant)
- **RAG Architecture**:
  ```text
  Citizen Question
        ↓
  Intent Detection (DOCUMENTS, PROCEDURE, FEES, ELIGIBILITY, RENEWAL, STATUS)
        ↓
  Government Catalog Retrieval (Semantic & Keyword Search + State Filter)
        ↓
  Authoritative Context Extraction
        ↓
  Source Verification & Authenticity Check
        ↓
  Verified Response Synthesis (English, Telugu, Hindi) + Official URL Citations
  ```
- Grounded strictly in official government records. Never hallucinates or invents rules, fees, or legal requirements.
- Full support for **Google Gemini API** (`GEMINI_API_KEY`) with an automatic, resilient built-in RAG fallback generator.

### 3. 🌐 Multilingual Accessibility
- Full native support for:
  - **English (EN)**
  - **తెలుగు (Telugu - TE)**
  - **हिंदी (Hindi - HI)**
- Preserves official technical and departmental terms (e.g., *MeeSeva*, *Aadhaar e-KYC*, *Parivahan Sarathi*, *Non-ECR*, *Tahsildar*).

### 4. 📋 Interactive Document Checklist
- Every service features a detailed document requirement breakdown:
  - Document title & legal purpose
  - Accepted file formats (e.g. PDF, JPG max 2MB)
  - Original vs photocopy attestation requirements
  - Official advisory notes
- **Live Document Readiness Tracker**:
  - Mark individual items as `Not Ready (🔴)`, `Ready (🟡)`, or `Uploaded / Scanned (🟢)`.
  - Real-time progress bar (e.g., *4 / 7 documents ready - 57%*).

### 5. 🎯 Personalized Guidance Wizard
- 4-step interactive wizard tailored to user demographics:
  - Country & State / Jurisdiction
  - Age Group (Minor, 18-59, Senior 60+)
  - Citizen Status (General Citizen, Student, Salaried, Business/MSME)
  - Target Service
- Generates a customized, step-by-step preparation checklist with print/PDF export and one-click saving to **My Applications**.

### 6. 📂 Application Tracker & Reminders
- **Manual Application Tracker**:
  - Store application reference numbers (e.g. `TS009/LLR/2026/89421`).
  - Track progression across stages: *Draft → Submitted → Under Scrutiny → Field Verification → Approved*.
  - Log next actions and personal notes.
- **Citizen Reminders Hub**:
  - Set renewal reminders for driving licences, passports, and scholarship deadlines.

### 7. 🛡️ Verification & Admin Console
- Administrative console with audit tracking:
  - Add and update government services, fees, and steps.
  - Review source URLs and mark status: `VERIFIED`, `NEEDS_VERIFICATION`, or `CONFLICTING`.
  - Immutable audit history log of all verification actions.

---

## 🏗️ Project Architecture

```text
civicguide-ai/
│
├── frontend/                     # React 18 + TypeScript + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/           # UI Components (Header, Cards, Modals, Drawers)
│   │   ├── services/             # API Client (ApiService)
│   │   ├── utils/                # Multilingual translations (i18n)
│   │   ├── App.tsx               # Main Application Layout
│   │   └── main.tsx              # React Entrypoint
│   ├── index.html                # Single Page HTML
│   └── vite.config.ts            # Vite Build & Dev Proxy Config
│
├── backend/                      # Node.js + Express.js + TypeScript REST API
│   ├── src/
│   │   ├── controllers/          # Request Handlers (Auth, Services, AI, Admin, Reminders)
│   │   ├── routes/               # Express Routes
│   │   ├── middleware/           # Auth, Error Handler, Security
│   │   ├── models/               # TypeScript Entity Interfaces
│   │   ├── utils/                # Dual PostgreSQL / Embedded Database Adapter & Seed Data
│   │   └── server.ts             # Express Server Entrypoint
│   └── package.json
│
├── database/                     # Production Database Definitions
│   ├── schema/
│   │   └── schema.sql            # Full PostgreSQL DDL Schema (14 Tables, Foreign Keys, Indexes)
│   └── seed/
│       └── seed.sql              # Authentic Seed Data for 12+ Services
│
├── ai/                           # AI & RAG Engine Layer
│   ├── prompts/
│   │   └── systemPrompt.ts       # CivicGuide Guardrails & Instructions
│   ├── retrieval/
│   │   └── ragEngine.ts          # Intent Classification & RAG Synthesis Engine
│   └── verification/
│       └── sourceVerifier.ts     # URL Authenticity & Conflict Detection
│
├── test-suite.js                 # Automated 25-Point Verification Test Suite
└── README.md
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* **PostgreSQL**: v14+ (if not running, the application automatically uses the embedded high-performance relational engine).

### 1. Clone & Enter Project Directory
```bash
cd process
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Variables
Create a `.env` file in `backend/` (or copy `.env.example`):
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=civicguide_super_secure_jwt_secret_key_2026

# Optional PostgreSQL Connection (falls back automatically if not provided)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/civicguide_db

# Optional Google Gemini API Key for dynamic generation (built-in RAG runs automatically if not set)
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Build Frontend Assets
```bash
cd frontend
npm run build
cd ..
```

### 5. Launch the Application
```bash
# Start backend server (serves both API & Frontend bundle at http://localhost:5000)
cd backend
npm start
```
Open **`http://localhost:5000`** in your browser.

*(Optional for Frontend Hot-Reloading in Development)*:
```bash
cd frontend
npm run dev
# Accessible at http://localhost:3000 (proxies API calls to port 5000)
```

---

## 🧪 Automated Testing

Run the comprehensive 25-point integration test suite:
```bash
node test-suite.js
```

### Verified Test Matrix:
- ✅ **Test 1**: Health check endpoint (`/api/health`)
- ✅ **Test 2**: Services Catalog retrieval (12+ authentic services verified)
- ✅ **Test 3**: Smart Search & State Filtering (Telangana, Pan-India)
- ✅ **Test 4**: Service Sub-resources (Required Documents, Steps, Sources)
- ✅ **Test 5**: AI RAG Pipeline & Multi-Language Generation (English, Telugu, Hindi)
- ✅ **Test 6**: Legal & Government Terminology Explanation (*Non-ECR*, *MeeSeva*, *DigiLocker*)
- ✅ **Test 7**: Personalized Guidance & Checklist Generation (6 tailored steps)
- ✅ **Test 8**: Citizen & Administrator Authentication
- ✅ **Test 9**: Application Tracker & Document Checklist Progression (`NOT_READY` → `READY`)
- ✅ **Test 10**: Reminders System
- ✅ **Test 11**: Admin Verification Audit & History Logging

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Citizen Demo** | `citizen@example.com` | `Password@123` | View services, track applications, save bookmarks, set reminders |
| **Admin Demo** | `admin@civicguide.gov.in` | `Password@123` | Manage services, verify official sources, log audit findings |

*(Quick 1-Click login buttons are available directly inside the Sign-in modal).*

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` – Register new citizen account
- `POST /api/auth/login` – Citizen or admin login
- `GET /api/auth/me` – Current user session info

### Government Services
- `GET /api/services` – List all services (supports `?category=`, `?state=`, `?mode=`, `?audience=`)
- `GET /api/services/:id` – Detailed service view with documents, steps, sources, and FAQs
- `GET /api/services/search?q=` – Smart keyword search across services
- `GET /api/services/:id/documents` – Document checklist requirements
- `GET /api/services/:id/steps` – Step-by-step application walkthrough
- `GET /api/services/:id/sources` – Authoritative government sources & verification status

### AI Assistant (RAG)
- `POST /api/ai/ask` – Grounded RAG query answering citing official sources
- `POST /api/ai/explain` – Plain language explanation of complex government terminology
- `POST /api/ai/guidance` – Personalized checklist generator

### Citizen Tracker & Reminders
- `GET /api/applications` – User's tracked applications
- `POST /api/applications` – Save manual application reference
- `PATCH /api/applications/:id` – Update status / next action
- `PATCH /api/applications/documents/:docId` – Toggle document readiness (`NOT_READY`, `READY`, `UPLOADED`)
- `GET /api/applications/saved` – User bookmarked services
- `POST /api/applications/saved/toggle` – Toggle bookmark
- `GET /api/reminders` – List citizen reminders
- `POST /api/reminders` – Create reminder
- `PATCH /api/reminders/:id` – Toggle reminder completion

### Admin Verification
- `GET /api/admin/stats` – Service and audit statistics
- `POST /api/admin/services` – Create new government service
- `POST /api/admin/services/:id/verify` – Record official source verification action & findings
- `GET /api/admin/verification-history` – Verification audit trail

---

## 📄 License
This project is open-source under the MIT License.
