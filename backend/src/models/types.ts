export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'citizen' | 'admin';
  country: string;
  state: string;
  district?: string;
  preferred_language: 'en' | 'te' | 'hi';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  country: string;
  state: string;
  official_portal_url: string;
  contact_helpline?: string;
  created_at?: string;
}

export interface GovernmentService {
  id: string;
  service_code: string;
  title: string;
  category: string;
  country: string;
  state: string;
  department_id: string;
  description: string;
  short_summary: string;
  eligibility_criteria: string;
  official_url: string;
  fee_structure: string;
  processing_time: string;
  application_mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  target_audience: 'CITIZEN' | 'BUSINESS' | 'STUDENT' | 'SENIOR' | 'ALL';
  last_verified: string;
  source_type: string;
  verification_status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICTING';
  is_active: boolean;
  department?: Department;
  documents?: DocumentItem[];
  steps?: ServiceStep[];
  sources?: OfficialSource[];
  faqs?: ServiceFaq[];
  requirements?: ServiceRequirement[];
  verification_records?: VerificationRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequirement {
  id: string;
  service_id: string;
  requirement_type: string;
  description: string;
  mandatory: boolean;
  display_order: number;
}

export interface OfficialSource {
  id: string;
  service_id: string;
  authority_name: string;
  source_type: 'GOVERNMENT_PORTAL' | 'GAZETTE_NOTIFICATION' | 'OFFICIAL_DOCUMENT' | 'DEPARTMENT_ORDER';
  source_url: string;
  document_title?: string;
  publication_date?: string;
  last_checked_date: string;
  authenticity_score: number;
  citation_text: string;
  verification_badge: string;
}

export interface DocumentItem {
  id: string;
  service_id: string;
  document_name: string;
  purpose: string;
  accepted_formats: string;
  is_original_required: boolean;
  is_upload_required: boolean;
  official_source_id?: string;
  notes?: string;
  display_order: number;
}

export interface ServiceStep {
  id: string;
  service_id: string;
  step_number: number;
  title: string;
  description: string;
  estimated_time?: string;
  is_online_step: boolean;
  tips?: string;
}

export interface ServiceFaq {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  official_reference?: string;
  display_order: number;
}

export interface UserApplication {
  id: string;
  user_id: string;
  service_id: string;
  service_title: string;
  application_reference_number?: string;
  applied_on?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_SCRUTINY' | 'FIELD_VERIFICATION' | 'APPROVED' | 'REJECTED';
  next_action?: string;
  notes?: string;
  submission_portal_url?: string;
  documents?: ApplicationDocument[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_id: string;
  document_name: string;
  status: 'NOT_READY' | 'READY' | 'UPLOADED';
  user_notes?: string;
  file_name?: string;
  updated_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  service_id?: string;
  service_title?: string;
  title: string;
  reminder_date: string;
  notes?: string;
  is_completed: boolean;
  created_at: string;
}

export interface VerificationRecord {
  id: string;
  service_id: string;
  verified_by_user_id?: string;
  status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICTING';
  previous_status?: string;
  findings: string;
  verified_at: string;
  source_url_checked: string;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  title: string;
  state_context: string;
  language: string;
  created_at: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources_json?: string;
  verification_badge?: string;
  intent?: string;
  created_at: string;
}
