-- ============================================================================
-- CivicGuide AI - Official Database Schema (PostgreSQL)
-- Government Process Assistant
-- ============================================================================

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS verification_records CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS user_applications CASCADE;
DROP TABLE IF EXISTS saved_services CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS service_steps CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS service_requirements CASCADE;
DROP TABLE IF EXISTS official_sources CASCADE;
DROP TABLE IF EXISTS government_services CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    country VARCHAR(64) DEFAULT 'India',
    state VARCHAR(64) DEFAULT 'Telangana',
    district VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Departments Table
CREATE TABLE departments (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(64) DEFAULT 'India',
    state VARCHAR(64) DEFAULT 'All-India',
    official_portal_url TEXT NOT NULL,
    contact_helpline VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_state ON departments(state);

-- 3. Government Services Table
CREATE TABLE government_services (
    id VARCHAR(64) PRIMARY KEY,
    service_code VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN (
        'Identity & Citizenship', 
        'Civil Registration', 
        'Transport & Driving', 
        'Revenue & Certificates', 
        'Welfare & Schemes', 
        'Education & Scholarships', 
        'Business & Taxation', 
        'Land & Property'
    )),
    country VARCHAR(64) DEFAULT 'India',
    state VARCHAR(64) DEFAULT 'All-India',
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    short_summary TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    official_url TEXT NOT NULL,
    fee_structure TEXT NOT NULL,
    processing_time VARCHAR(100) NOT NULL,
    application_mode VARCHAR(32) DEFAULT 'ONLINE' CHECK (application_mode IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    target_audience VARCHAR(32) DEFAULT 'CITIZEN' CHECK (target_audience IN ('CITIZEN', 'BUSINESS', 'STUDENT', 'SENIOR', 'ALL')),
    last_verified DATE NOT NULL,
    source_type VARCHAR(64) DEFAULT 'GOVERNMENT_PORTAL',
    verification_status VARCHAR(32) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gov_services_category ON government_services(category);
CREATE INDEX idx_gov_services_state ON government_services(state);
CREATE INDEX idx_gov_services_verification ON government_services(verification_status);

-- 4. Service Requirements (Eligibility breakdowns)
CREATE TABLE service_requirements (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    requirement_type VARCHAR(64) DEFAULT 'ELIGIBILITY', -- ELIGIBILITY, JURISDICTION, AGE_LIMIT
    description TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1
);

CREATE INDEX idx_service_req_service_id ON service_requirements(service_id);

-- 5. Official Sources (Authoritative Citations)
CREATE TABLE official_sources (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    authority_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(64) NOT NULL CHECK (source_type IN (
        'GOVERNMENT_PORTAL', 
        'GAZETTE_NOTIFICATION', 
        'OFFICIAL_DOCUMENT', 
        'DEPARTMENT_ORDER'
    )),
    source_url TEXT NOT NULL,
    document_title VARCHAR(255),
    publication_date DATE,
    last_checked_date DATE NOT NULL,
    authenticity_score INT DEFAULT 100, -- 0 - 100
    citation_text TEXT NOT NULL,
    verification_badge VARCHAR(32) DEFAULT 'OFFICIAL_VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_official_sources_service ON official_sources(service_id);

-- 6. Documents Checklist
CREATE TABLE documents (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    accepted_formats VARCHAR(100) DEFAULT 'PDF, JPG (Max 2MB)',
    is_original_required BOOLEAN DEFAULT FALSE,
    is_upload_required BOOLEAN DEFAULT TRUE,
    official_source_id VARCHAR(64) REFERENCES official_sources(id) ON DELETE SET NULL,
    notes TEXT,
    display_order INT DEFAULT 1
);

CREATE INDEX idx_documents_service ON documents(service_id);

-- 7. Service Steps (Step-by-step Process)
CREATE TABLE service_steps (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    estimated_time VARCHAR(100),
    is_online_step BOOLEAN DEFAULT TRUE,
    tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_steps_service ON service_steps(service_id, step_number);

-- 8. Frequently Asked Questions (FAQs)
CREATE TABLE faqs (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    official_reference TEXT,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_service ON faqs(service_id);

-- 9. Saved / Bookmarked Services
CREATE TABLE saved_services (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_id)
);

CREATE INDEX idx_saved_services_user ON saved_services(user_id);

-- 10. User Applications (Manual Application Tracker)
CREATE TABLE user_applications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    service_title VARCHAR(255) NOT NULL,
    application_reference_number VARCHAR(100),
    applied_on DATE,
    status VARCHAR(32) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 
        'SUBMITTED', 
        'UNDER_SCRUTINY', 
        'FIELD_VERIFICATION', 
        'APPROVED', 
        'REJECTED'
    )),
    next_action VARCHAR(255),
    notes TEXT,
    submission_portal_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_applications_user ON user_applications(user_id);

-- 11. Application Documents (Checklist tracking per application)
CREATE TABLE application_documents (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES user_applications(id) ON DELETE CASCADE,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'NOT_READY' CHECK (status IN ('NOT_READY', 'READY', 'UPLOADED')),
    user_notes TEXT,
    file_name VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, document_id)
);

CREATE INDEX idx_app_docs_app ON application_documents(application_id);

-- 12. Reminders
CREATE TABLE reminders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(64) REFERENCES government_services(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    reminder_date DATE NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_user ON reminders(user_id);

-- 13. Chat Sessions & Messages (AI Assistant)
CREATE TABLE chat_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Inquiry',
    state_context VARCHAR(64) DEFAULT 'All-India',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources_json TEXT, -- Serialized JSON array of cited official sources
    verification_badge VARCHAR(64) DEFAULT 'VERIFIED_OFFICIAL',
    intent VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- 14. Verification Records (Audit Trail for Government Data)
CREATE TABLE verification_records (
    id VARCHAR(64) PRIMARY KEY,
    service_id VARCHAR(64) NOT NULL REFERENCES government_services(id) ON DELETE CASCADE,
    verified_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING')),
    previous_status VARCHAR(32),
    findings TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_url_checked TEXT NOT NULL
);

CREATE INDEX idx_verification_service ON verification_records(service_id);
