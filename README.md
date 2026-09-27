# 🏛️ CivicGuide AI – Government Process Assistant
### Python Full Stack Web Application (HTML, CSS, JavaScript + FastAPI)

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
- Full support for **Google Gemini API** (`GEMINI_API_KEY`) with an automatic, resilient built-in Python RAG generator.

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

## 🏗️ Python Full Stack Architecture

```text
civic-guide/
│
├── app/                          # Core Python Full Stack Application
│   ├── main.py                   # FastAPI Application Entrypoint & Static Server
│   ├── config.py                 # Pydantic Settings & Environment Variables
│   ├── database.py               # Relational Database Repository Layer
│   ├── auth.py                   # JWT Auth, Bcrypt Passwords, Dependencies
│   ├── seed_data.py              # Authentic Indian Government Datasets (12+ services)
│   │
│   ├── ai/                       # Python AI & RAG Engine Layer
│   │   ├── prompts.py            # Guardrails, Hallucination-prevention Prompts
│   │   ├── verifier.py           # Domain Verification & Trust Scoring (.gov.in/.nic.in)
│   │   └── rag_engine.py         # Multi-language Retrieval & Answer Synthesis Engine
│   │
│   ├── models/
│   │   └── schemas.py            # Pydantic Request & Response Data Models
│   │
│   ├── routers/                  # FastAPI Modular Routers
│   │   ├── auth.py               # /api/auth (Login, Register, /me)
│   │   ├── services.py           # /api/services (Catalog, Search, Sub-resources)
│   │   ├── ai.py                 # /api/ai (RAG Query, Term Explainer, Wizard)
│   │   ├── applications.py       # /api/applications (Tracker, Bookmarks, Checklist)
│   │   ├── reminders.py          # /api/reminders (CRUD Civic Reminders)
│   │   └── admin.py              # /api/admin (Stats, Verification, Audit History)
│   │
│   └── static/                   # Pure HTML5, CSS3, Modern JavaScript Frontend
│       ├── index.html            # Semantic, Glassmorphic HTML5 Interface
│       ├── css/
│       │   └── style.css         # Curated HSL Civic Design Tokens, Glassmorphism, Animations
│       └── js/
│           ├── app.js            # Modular Vanilla JavaScript Application State & Views
│           └── i18n.js           # Multi-language Translations (English, Telugu, Hindi)
│
├── database/                     # SQL Reference Files
│   ├── schema/schema.sql         # PostgreSQL DDL
│   └── seed/seed.sql             # SQL Seed Data
│
├── run.py                        # Standalone Python Launcher (`python run.py`)
├── test_suite.py                 # Automated Python Test Suite (25+ tests)
├── requirements.txt              # Python Dependencies
├── render.yaml                   # Render Python Web Service Deployment Blueprint
├── Procfile                      # Render / Heroku Web Process Definition
├── runtime.txt                   # Python 3.11.9 Runtime Specification
└── README.md
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Python**: v3.10 or higher (Python 3.11 recommended)
- **pip**: package manager
- *(Zero Node.js or TypeScript dependencies needed!)*

### 1. Clone & Enter Project Directory
```bash
git clone https://github.com/GandlaShivasai89/civic-guide.git
cd civic-guide
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch the Server
```bash
python run.py
```
Or with Uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

Open **`http://localhost:5000`** in your browser to experience the application.

---

## 🧪 Running Automated Tests

Run the comprehensive Python test suite:
```bash
python test_suite.py
```
Validates:
- Health check & API router availability
- 12+ government services catalog, search, and state filtering
- Multi-language RAG queries in **English, Telugu, and Hindi**
- Personalized guidance wizard checklist generation
- User registration, authentication, JWT tokens, and demo logins
- Application tracker CRUD & document readiness toggles
- Reminders scheduling
- Admin verification audit trail
- Static HTML, CSS, and JavaScript asset delivery

---

## 🚀 Deploying to Render

This repository is pre-configured with `render.yaml` and `Procfile` for 1-click Python deployment:

1. Connect your GitHub repository (`GandlaShivasai89/civic-guide`) to Render.
2. Render detects the Python web service from `render.yaml`:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
3. Optional environment variables:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key for external LLM generation.
   - `JWT_SECRET`: Automatic secure secret for authentication.

---

## 🔐 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Citizen** | `citizen@example.com` | `Password@123` | Services, RAG Assistant, Applications Tracker, Reminders |
| **Administrator** | `admin@civicguide.gov.in` | `Password@123` | Full access + Admin Console & Source Verification Audits |

---

## ⚖️ Legal Disclaimer
CivicGuide AI is an independent, non-governmental civic assistance tool. It does not issue government documents, charge government fees, or represent any public authority. Always verify requirements on official `.gov.in` or `.nic.in` websites before making financial payments.
