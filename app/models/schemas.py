from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth ---
class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    role: Optional[Literal['citizen', 'admin']] = 'citizen'
    country: Optional[str] = 'India'
    state: Optional[str] = 'Telangana'
    district: Optional[str] = 'Hyderabad'
    preferred_language: Optional[Literal['en', 'te', 'hi']] = 'en'

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    country: str = 'India'
    state: str = 'Telangana'
    district: Optional[str] = None
    preferred_language: str = 'en'

class TokenResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]

# --- Government Services ---
class DocumentItem(BaseModel):
    id: str
    service_id: str
    document_name: str
    purpose: str
    accepted_formats: str = 'PDF, JPG (Max 2MB)'
    is_original_required: bool = False
    is_upload_required: bool = True
    official_source_id: Optional[str] = None
    notes: Optional[str] = None
    display_order: int = 1

class ServiceStep(BaseModel):
    id: str
    service_id: str
    step_number: int
    title: str
    description: str
    estimated_time: Optional[str] = None
    is_online_step: bool = True
    tips: Optional[str] = None

class OfficialSource(BaseModel):
    id: str
    service_id: str
    authority_name: str
    source_type: str
    source_url: str
    document_title: Optional[str] = None
    publication_date: Optional[str] = None
    last_checked_date: str
    authenticity_score: int = 100
    citation_text: str
    verification_badge: str = 'OFFICIAL_VERIFIED'

class ServiceFaq(BaseModel):
    id: str
    service_id: str
    question: str
    answer: str
    official_reference: Optional[str] = None
    display_order: int = 1

class VerificationRecord(BaseModel):
    id: str
    service_id: str
    verified_by_user_id: Optional[str] = None
    status: Literal['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING']
    previous_status: Optional[str] = None
    findings: str
    verified_at: str
    source_url_checked: str

class GovernmentServiceOut(BaseModel):
    id: str
    service_code: str
    title: str
    category: str
    country: str = 'India'
    state: str = 'All-India'
    department_id: Optional[str] = None
    description: str
    short_summary: str
    eligibility_criteria: str
    official_url: str
    fee_structure: str
    processing_time: str
    application_mode: Literal['ONLINE', 'OFFLINE', 'HYBRID'] = 'ONLINE'
    target_audience: Literal['CITIZEN', 'BUSINESS', 'STUDENT', 'SENIOR', 'ALL'] = 'CITIZEN'
    last_verified: str
    source_type: str = 'GOVERNMENT_PORTAL'
    verification_status: Literal['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING'] = 'VERIFIED'
    is_active: bool = True
    department: Optional[Dict[str, Any]] = None
    documents: Optional[List[DocumentItem]] = []
    steps: Optional[List[ServiceStep]] = []
    sources: Optional[List[OfficialSource]] = []
    faqs: Optional[List[ServiceFaq]] = []
    verification_records: Optional[List[VerificationRecord]] = []

class ServiceCreate(BaseModel):
    service_code: Optional[str] = None
    title: str
    category: str
    country: Optional[str] = 'India'
    state: Optional[str] = 'All-India'
    department_id: Optional[str] = 'dept-mea'
    description: str
    short_summary: Optional[str] = None
    eligibility_criteria: str
    official_url: str
    fee_structure: Optional[str] = 'Statutory Fee: Check Official Portal'
    processing_time: Optional[str] = '15-30 working days'
    application_mode: Optional[Literal['ONLINE', 'OFFLINE', 'HYBRID']] = 'ONLINE'
    target_audience: Optional[Literal['CITIZEN', 'BUSINESS', 'STUDENT', 'SENIOR', 'ALL']] = 'CITIZEN'
    verification_status: Optional[Literal['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING']] = 'NEEDS_VERIFICATION'

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    official_url: Optional[str] = None
    fee_structure: Optional[str] = None
    processing_time: Optional[str] = None
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    verification_status: Optional[Literal['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING']] = None

class VerificationAction(BaseModel):
    status: Literal['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING']
    findings: str
    source_url: str

# --- Applications & Checklists ---
class ApplicationDocItem(BaseModel):
    id: str
    application_id: str
    document_id: str
    document_name: str
    status: Literal['NOT_READY', 'READY', 'UPLOADED'] = 'NOT_READY'
    user_notes: Optional[str] = None
    file_name: Optional[str] = None

class UserApplicationCreate(BaseModel):
    service_id: str
    service_title: Optional[str] = None
    application_reference_number: Optional[str] = None
    applied_on: Optional[str] = None
    status: Optional[Literal['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'FIELD_VERIFICATION', 'APPROVED', 'REJECTED']] = 'DRAFT'
    next_action: Optional[str] = None
    notes: Optional[str] = None
    submission_portal_url: Optional[str] = None

class UserApplicationUpdate(BaseModel):
    application_reference_number: Optional[str] = None
    applied_on: Optional[str] = None
    status: Optional[Literal['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'FIELD_VERIFICATION', 'APPROVED', 'REJECTED']] = None
    next_action: Optional[str] = None
    notes: Optional[str] = None

class ApplicationDocStatusUpdate(BaseModel):
    status: Literal['NOT_READY', 'READY', 'UPLOADED']
    notes: Optional[str] = None

# --- Reminders ---
class ReminderCreate(BaseModel):
    title: str
    reminder_date: str
    service_id: Optional[str] = None
    service_title: Optional[str] = None
    notes: Optional[str] = None

class ReminderUpdate(BaseModel):
    is_completed: bool

# --- AI & RAG ---
class RagQueryRequest(BaseModel):
    query: str
    serviceId: Optional[str] = None
    state: Optional[str] = 'Telangana'
    language: Optional[Literal['en', 'te', 'hi']] = 'en'
    userProfile: Optional[Dict[str, Any]] = None

class ExplainTermRequest(BaseModel):
    term: str
    language: Optional[Literal['en', 'te', 'hi']] = 'en'
    context: Optional[str] = None

class GuidanceRequest(BaseModel):
    country: Optional[str] = 'India'
    state: Optional[str] = 'Telangana'
    district: Optional[str] = 'Hyderabad'
    ageGroup: Optional[str] = 'ADULT_18_59'
    occupation: Optional[str] = 'CITIZEN'
    serviceId: Optional[str] = 'srv-passport'
