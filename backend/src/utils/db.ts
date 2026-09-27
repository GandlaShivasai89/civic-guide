import pg from 'pg';
import {
  User, Department, GovernmentService, DocumentItem, ServiceStep,
  OfficialSource, ServiceFaq, VerificationRecord, UserApplication,
  ApplicationDocument, Reminder
} from '../models/types.js';
import {
  INITIAL_DEPARTMENTS, INITIAL_USERS, INITIAL_SERVICES,
  INITIAL_DOCUMENTS, INITIAL_STEPS, INITIAL_SOURCES,
  INITIAL_FAQS, INITIAL_VERIFICATIONS, INITIAL_USER_APPLICATIONS,
  INITIAL_APPLICATION_DOCUMENTS, INITIAL_REMINDERS
} from './seedData.js';

const { Pool } = pg;

export class DatabaseAdapter {
  private static pool: pg.Pool | null = null;
  private static isPgAvailable: boolean = false;

  // In-memory relational storage
  private static users: User[] = [...INITIAL_USERS];
  private static departments: Department[] = [...INITIAL_DEPARTMENTS];
  private static services: GovernmentService[] = [...INITIAL_SERVICES];
  private static documents: DocumentItem[] = [...INITIAL_DOCUMENTS];
  private static steps: ServiceStep[] = [...INITIAL_STEPS];
  private static sources: OfficialSource[] = [...INITIAL_SOURCES];
  private static faqs: ServiceFaq[] = [...INITIAL_FAQS];
  private static verifications: VerificationRecord[] = [...INITIAL_VERIFICATIONS];
  private static userApplications: UserApplication[] = [...INITIAL_USER_APPLICATIONS];
  private static applicationDocs: ApplicationDocument[] = [...INITIAL_APPLICATION_DOCUMENTS];
  private static reminders: Reminder[] = [...INITIAL_REMINDERS];
  private static savedServices: { id: string; user_id: string; service_id: string; created_at: string }[] = [
    { id: 'save-1', user_id: 'usr-citizen-1', service_id: 'srv-passport', created_at: new Date().toISOString() },
    { id: 'save-2', user_id: 'usr-citizen-1', service_id: 'srv-driving-licence', created_at: new Date().toISOString() }
  ];

  public static async init(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        this.pool = new Pool({ connectionString, connectionTimeoutMillis: 3000 });
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        this.isPgAvailable = true;
        console.log('✅ Connected to PostgreSQL database');
        return;
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL connection failed, switching to high-performance local relational engine:', err.message);
        this.isPgAvailable = false;
        this.pool = null;
      }
    } else {
      console.log('ℹ️ No DATABASE_URL specified. Running with high-performance relational database engine.');
    }
  }

  public static isPostgres(): boolean {
    return this.isPgAvailable;
  }

  // --- Services ---
  public static async getAllServices(filters?: {
    category?: string;
    state?: string;
    audience?: string;
    mode?: string;
    departmentId?: string;
  }): Promise<GovernmentService[]> {
    let result = this.services.map(s => this.enrichService(s));

    if (filters) {
      if (filters.category && filters.category !== 'ALL') {
        result = result.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.state && filters.state !== 'ALL' && filters.state !== 'All-India') {
        result = result.filter(s => s.state === 'All-India' || s.state.toLowerCase() === filters.state!.toLowerCase());
      }
      if (filters.audience && filters.audience !== 'ALL') {
        result = result.filter(s => s.target_audience === 'ALL' || s.target_audience === filters.audience);
      }
      if (filters.mode && filters.mode !== 'ALL') {
        result = result.filter(s => s.application_mode === filters.mode);
      }
      if (filters.departmentId) {
        result = result.filter(s => s.department_id === filters.departmentId);
      }
    }

    return result;
  }

  public static async getServiceById(id: string): Promise<GovernmentService | null> {
    const s = this.services.find(item => item.id === id || item.service_code === id);
    if (!s) return null;
    return this.enrichService(s);
  }

  public static async searchServices(query: string, filters?: any): Promise<GovernmentService[]> {
    const q = query.toLowerCase().trim();
    let services = await this.getAllServices(filters);

    if (!q) return services;

    const scored = services.map(s => {
      let score = 0;
      const titleLower = s.title.toLowerCase();
      const descLower = s.description.toLowerCase();
      const codeLower = s.service_code.toLowerCase();
      const catLower = s.category.toLowerCase();
      const stateLower = s.state.toLowerCase();

      if (titleLower === q) score += 100;
      else if (titleLower.includes(q)) score += 50;
      else if (codeLower.includes(q)) score += 40;
      else if (descLower.includes(q)) score += 20;
      else if (catLower.includes(q)) score += 15;
      else if (stateLower.includes(q)) score += 15;

      // Word-level match
      const words = q.split(/\s+/);
      for (const w of words) {
        if (titleLower.includes(w)) score += 15;
        if (descLower.includes(w)) score += 5;
      }

      return { service: s, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.service);
  }

  public static async createService(serviceData: Partial<GovernmentService>): Promise<GovernmentService> {
    const id = `srv-${Date.now()}`;
    const newService: GovernmentService = {
      id,
      service_code: serviceData.service_code || `SRV-${Date.now()}`,
      title: serviceData.title || 'Untitled Service',
      category: serviceData.category || 'Identity & Citizenship',
      country: serviceData.country || 'India',
      state: serviceData.state || 'All-India',
      department_id: serviceData.department_id || 'dept-mea',
      description: serviceData.description || '',
      short_summary: serviceData.short_summary || '',
      eligibility_criteria: serviceData.eligibility_criteria || '',
      official_url: serviceData.official_url || '',
      fee_structure: serviceData.fee_structure || 'Statutory Fee: Check Official Portal',
      processing_time: serviceData.processing_time || '15-30 working days',
      application_mode: serviceData.application_mode || 'ONLINE',
      target_audience: serviceData.target_audience || 'CITIZEN',
      last_verified: new Date().toISOString().split('T')[0],
      source_type: 'GOVERNMENT_PORTAL',
      verification_status: serviceData.verification_status || 'NEEDS_VERIFICATION',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.services.unshift(newService);
    return this.enrichService(newService);
  }

  public static async updateService(id: string, updates: Partial<GovernmentService>): Promise<GovernmentService | null> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.services[index] = {
      ...this.services[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.enrichService(this.services[index]);
  }

  public static async verifyService(
    serviceId: string,
    verifiedByUserId: string,
    status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICTING',
    findings: string,
    sourceUrlChecked: string
  ): Promise<VerificationRecord> {
    const service = this.services.find(s => s.id === serviceId);
    const prevStatus = service?.verification_status || 'NEEDS_VERIFICATION';

    if (service) {
      service.verification_status = status;
      service.last_verified = new Date().toISOString().split('T')[0];
    }

    const record: VerificationRecord = {
      id: `vr-${Date.now()}`,
      service_id: serviceId,
      verified_by_user_id: verifiedByUserId,
      status,
      previous_status: prevStatus,
      findings,
      verified_at: new Date().toISOString(),
      source_url_checked: sourceUrlChecked
    };

    this.verifications.unshift(record);
    return record;
  }

  public static async getVerificationHistory(serviceId?: string): Promise<VerificationRecord[]> {
    if (serviceId) {
      return this.verifications.filter(v => v.service_id === serviceId);
    }
    return this.verifications;
  }

  // --- Users & Auth ---
  public static async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static async findUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  public static async createUser(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: userData.email!,
      password_hash: userData.password_hash!,
      full_name: userData.full_name || 'Citizen',
      role: userData.role || 'citizen',
      country: userData.country || 'India',
      state: userData.state || 'Telangana',
      district: userData.district || 'Hyderabad',
      preferred_language: userData.preferred_language || 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Applications Tracker ---
  public static async getUserApplications(userId: string): Promise<UserApplication[]> {
    const apps = this.userApplications.filter(a => a.user_id === userId);
    return apps.map(app => ({
      ...app,
      documents: this.applicationDocs.filter(d => d.application_id === app.id)
    }));
  }

  public static async createApplication(appData: Partial<UserApplication>): Promise<UserApplication> {
    const id = `app-${Date.now()}`;
    const newApp: UserApplication = {
      id,
      user_id: appData.user_id!,
      service_id: appData.service_id!,
      service_title: appData.service_title || 'Government Service',
      application_reference_number: appData.application_reference_number || '',
      applied_on: appData.applied_on || new Date().toISOString().split('T')[0],
      status: appData.status || 'DRAFT',
      next_action: appData.next_action || 'Complete document preparation',
      notes: appData.notes || '',
      submission_portal_url: appData.submission_portal_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.userApplications.unshift(newApp);

    // Populate required documents from service
    const serviceDocs = this.documents.filter(d => d.service_id === newApp.service_id);
    for (const doc of serviceDocs) {
      this.applicationDocs.push({
        id: `appdoc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        application_id: id,
        document_id: doc.id,
        document_name: doc.document_name,
        status: 'NOT_READY',
        user_notes: ''
      });
    }

    return {
      ...newApp,
      documents: this.applicationDocs.filter(d => d.application_id === id)
    };
  }

  public static async updateApplication(
    id: string,
    userId: string,
    updates: Partial<UserApplication>
  ): Promise<UserApplication | null> {
    const index = this.userApplications.findIndex(a => a.id === id && a.user_id === userId);
    if (index === -1) return null;

    this.userApplications[index] = {
      ...this.userApplications[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return {
      ...this.userApplications[index],
      documents: this.applicationDocs.filter(d => d.application_id === id)
    };
  }

  public static async deleteApplication(id: string, userId: string): Promise<boolean> {
    const initialLen = this.userApplications.length;
    this.userApplications = this.userApplications.filter(a => !(a.id === id && a.user_id === userId));
    this.applicationDocs = this.applicationDocs.filter(d => d.application_id !== id);
    return this.userApplications.length < initialLen;
  }

  public static async updateApplicationDocStatus(
    appDocId: string,
    status: 'NOT_READY' | 'READY' | 'UPLOADED',
    notes?: string
  ): Promise<ApplicationDocument | null> {
    const doc = this.applicationDocs.find(d => d.id === appDocId);
    if (!doc) return null;
    doc.status = status;
    if (notes !== undefined) doc.user_notes = notes;
    doc.updated_at = new Date().toISOString();
    return doc;
  }

  // --- Saved Services ---
  public static async getSavedServices(userId: string): Promise<GovernmentService[]> {
    const saved = this.savedServices.filter(s => s.user_id === userId);
    const serviceIds = saved.map(s => s.service_id);
    return this.services
      .filter(s => serviceIds.includes(s.id))
      .map(s => this.enrichService(s));
  }

  public static async toggleSavedService(userId: string, serviceId: string): Promise<{ isSaved: boolean }> {
    const existingIndex = this.savedServices.findIndex(s => s.user_id === userId && s.service_id === serviceId);
    if (existingIndex !== -1) {
      this.savedServices.splice(existingIndex, 1);
      return { isSaved: false };
    } else {
      this.savedServices.push({
        id: `save-${Date.now()}`,
        user_id: userId,
        service_id: serviceId,
        created_at: new Date().toISOString()
      });
      return { isSaved: true };
    }
  }

  // --- Reminders ---
  public static async getReminders(userId: string): Promise<Reminder[]> {
    return this.reminders.filter(r => r.user_id === userId);
  }

  public static async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      user_id: data.user_id!,
      service_id: data.service_id,
      service_title: data.service_title || 'Civic Reminder',
      title: data.title || 'Government Process Reminder',
      reminder_date: data.reminder_date || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      is_completed: false,
      created_at: new Date().toISOString()
    };
    this.reminders.push(newRem);
    return newRem;
  }

  public static async updateReminder(id: string, userId: string, isCompleted: boolean): Promise<Reminder | null> {
    const rem = this.reminders.find(r => r.id === id && r.user_id === userId);
    if (!rem) return null;
    rem.is_completed = isCompleted;
    return rem;
  }

  public static async deleteReminder(id: string, userId: string): Promise<boolean> {
    const len = this.reminders.length;
    this.reminders = this.reminders.filter(r => !(r.id === id && r.user_id === userId));
    return this.reminders.length < len;
  }

  // --- Departments ---
  public static async getDepartments(): Promise<Department[]> {
    return this.departments;
  }

  // --- Helper to enrich service with joins ---
  private static enrichService(service: GovernmentService): GovernmentService {
    const dept = this.departments.find(d => d.id === service.department_id);
    const docs = this.documents
      .filter(d => d.service_id === service.id)
      .sort((a, b) => a.display_order - b.display_order);
    const steps = this.steps
      .filter(s => s.service_id === service.id)
      .sort((a, b) => a.step_number - b.step_number);
    const sources = this.sources.filter(s => s.service_id === service.id);
    const faqs = this.faqs
      .filter(f => f.service_id === service.id)
      .sort((a, b) => a.display_order - b.display_order);
    const verifications = this.verifications.filter(v => v.service_id === service.id);

    return {
      ...service,
      department: dept,
      documents: docs,
      steps,
      sources,
      faqs,
      verification_records: verifications
    };
  }
}
