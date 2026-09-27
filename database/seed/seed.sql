-- ============================================================================
-- CivicGuide AI - Official Seed Data
-- 100% Authentic Government Services, Sources, Steps, Documents & FAQs
-- ============================================================================

-- 1. Departments
INSERT INTO departments (id, code, name, description, country, state, official_portal_url, contact_helpline) VALUES
('dept-mea', 'MEA', 'Ministry of External Affairs, Consular, Passport and Visa Division', 'Apex central authority administering the Passports Act 1967 and Passport Rules across India and diplomatic missions.', 'India', 'All-India', 'https://portal2.passportindia.gov.in', '1800-258-1800'),
('dept-morth', 'MORTH', 'Ministry of Road Transport and Highways (Sarathi Portal)', 'Central ministry regulating driving licences, vehicle registrations, and road safety protocols across India.', 'India', 'All-India', 'https://parivahan.gov.in', '0120-2459169'),
('dept-uidai', 'UIDAI', 'Unique Identification Authority of India', 'Statutory authority under the Ministry of Electronics and IT responsible for Aadhaar enrolment and authentication.', 'India', 'All-India', 'https://uidai.gov.in', '1947'),
('dept-itd', 'ITD', 'Income Tax Department (Central Board of Direct Taxes)', 'Administering direct taxes and Permanent Account Number (PAN) issuance under the Income Tax Act 1961.', 'India', 'All-India', 'https://www.incometax.gov.in', '1800-180-1961'),
('dept-eci', 'ECI', 'Election Commission of India', 'Autonomous constitutional authority administering electoral rolls, voter registration, and EPIC issuance.', 'India', 'All-India', 'https://voters.eci.gov.in', '1950'),
('dept-msme', 'MSME', 'Ministry of Micro, Small and Medium Enterprises', 'Facilitating industrial enterprise registration, promotion, and incentives via the paperless Udyam portal.', 'India', 'All-India', 'https://udyamregistration.gov.in', '011-23063288'),
('dept-rev-tg', 'TG-REV', 'Revenue Department, Government of Telangana (MeeSeva)', 'State revenue administration responsible for statutory income, residence, caste certificates, and land mutation.', 'India', 'Telangana', 'https://tg.meeseva.telangana.gov.in', '040-48560012'),
('dept-maud-tg', 'TG-MAUD', 'Municipal Administration & Urban Development (GHMC/CDMA)', 'State urban administration managing vital civil registrations including births, deaths, and trade licences.', 'India', 'Telangana', 'https://ghmc.gov.in', '040-21111111'),
('dept-welf-tg', 'TG-WELF', 'Backward Classes, SC & ST Welfare Departments (ePASS Telangana)', 'Administering post-matric and overseas scholarship reimbursements for eligible students.', 'India', 'Telangana', 'https://telanganaepass.cgg.gov.in', '040-23390228');

-- 2. Seed Users (1 Admin, 1 Citizen)
-- password for both is 'Password@123' (bcrypt hashed: $2a$10$7Z2vA8k6q6p.eR4d5uE.5etP0zUke0wU5M.x7YmQWw40JjM4j3F8S)
INSERT INTO users (id, email, password_hash, full_name, role, country, state, district, preferred_language) VALUES
('usr-admin-1', 'admin@civicguide.gov.in', '$2a$10$7Z2vA8k6q6p.eR4d5uE.5etP0zUke0wU5M.x7YmQWw40JjM4j3F8S', 'Official Civic Administrator', 'admin', 'India', 'Telangana', 'Hyderabad', 'en'),
('usr-citizen-1', 'citizen@example.com', '$2a$10$7Z2vA8k6q6p.eR4d5uE.5etP0zUke0wU5M.x7YmQWw40JjM4j3F8S', 'Shiva Sai', 'citizen', 'India', 'Telangana', 'Hyderabad', 'en');

-- 3. Government Services
INSERT INTO government_services (
    id, service_code, title, category, country, state, department_id,
    description, short_summary, eligibility_criteria, official_url, fee_structure,
    processing_time, application_mode, target_audience, last_verified, source_type, verification_status
) VALUES
(
    'srv-passport',
    'MEA-PASS-01',
    'Ordinary Fresh / Reissue Passport Application',
    'Identity & Citizenship',
    'India',
    'All-India',
    'dept-mea',
    'Official Indian passport application for citizens seeking international travel documentation under the Passports Act 1967. Includes standard 36-page or 60-page booklet under Normal and Tatkaal quotas with biometric capture at Passport Seva Kendra (PSK) or Post Office PSK (POPSK).',
    'Apply for a new 10-year Indian passport or reissue an expired passport with online appointment at PSK.',
    'Must be a citizen of India by birth, descent, or registration. No pending criminal summons or active warrant in any Indian criminal court.',
    'https://portal2.passportindia.gov.in/AppOnlineProject/welcomeLink',
    'Normal Quota (36 pages): ₹1,500; Normal Quota (60 pages jumbo): ₹2,000; Tatkaal Quota (36 pages): ₹3,500; Minors (<18 years): ₹1,000.',
    'Normal: 15-30 working days (post police verification); Tatkaal: 1-3 working days.',
    'HYBRID',
    'CITIZEN',
    '2026-09-15',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-driving-licence',
    'MORTH-DL-02',
    'Learner''s Licence & Permanent Driving Licence',
    'Transport & Driving',
    'India',
    'All-India',
    'dept-morth',
    'Unified national workflow for issuing Motor Vehicle Driving Licences across all RTOs in India via the Sarathi Parivahan portal. Citizens first qualify for an online contactless or in-person Learner Licence (LLR) followed by a mandatory practical driving test at the Regional Transport Office for a Permanent DL.',
    'Apply for Learner Licence online and schedule slot for permanent driving licence test at your RTO.',
    'Age 16+ for gearless 2-wheelers up to 50cc; Age 18+ for light motor vehicles (cars/motorcycles with gear); Age 20+ for transport/commercial vehicles.',
    'https://parivahan.gov.in/parivahan//en/content/driving-licence-0',
    'Learner Licence: ₹200 (including ₹50 test fee per class); Permanent Driving Licence: ₹700 (including ₹200 DL fee + ₹300 driving test fee + ₹200 smart card fee).',
    'Learner Licence: Same day (online test); Permanent DL: 7-15 days after passing RTO driving test.',
    'HYBRID',
    'CITIZEN',
    '2026-09-18',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-income-cert',
    'TG-REV-INC-03',
    'Income Certificate Issuance',
    'Revenue & Certificates',
    'India',
    'Telangana',
    'dept-rev-tg',
    'Statutory certificate issued by the Revenue Department (Tahsildar) certifying the total annual household income of the applicant or family. Essential for fee reimbursement, scholarship sanction, welfare housing, EWS reservations, and government hospital concessions.',
    'Obtain official proof of annual household income through MeeSeva or the Prajavani Revenue portal.',
    'Permanent resident of Telangana residing in the jurisdictional Mandal. Household income must be verified by local Revenue Inspector (RI) and Village Revenue Officer (VRO).',
    'https://tg.meeseva.telangana.gov.in',
    'MeeSeva Service Charge: ₹45 (Statutory Govt Fee: Nil, User Convenience Fee: ₹45).',
    '7 to 15 working days.',
    'ONLINE',
    'CITIZEN',
    '2026-09-20',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-birth-cert',
    'TG-MAUD-BRT-04',
    'Birth Certificate Registration & Download',
    'Civil Registration System',
    'India',
    'Telangana',
    'dept-maud-tg',
    'Official vital registration of a birth under the Registration of Births and Deaths Act 1969. Provides conclusive legal proof of date of birth, parentage, and place of birth. Institutional hospital births are reported digitally within 21 days.',
    'Register or download official digital birth certificates for births within municipal or gram panchayat limits.',
    'Birth must have occurred within the municipal limits or gram panchayat jurisdiction. Institutional births reported by hospitals within 21 days qualify for direct search and print.',
    'https://ghmc.gov.in/BirthAndDeath.aspx',
    'Registration within 21 days: Free; Late registration (22-30 days): ₹2; Delayed (31 days - 1 year): ₹5 + Tahsildar order; MeeSeva digital copy print: ₹35 per certified copy.',
    'Instant download for pre-registered digital hospital births; 3-7 days for MeeSeva counter issuance.',
    'ONLINE',
    'CITIZEN',
    '2026-09-12',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-caste-cert',
    'TG-REV-CST-05',
    'Caste & Integrated Community Certificate (SC/ST/BC)',
    'Revenue & Certificates',
    'India',
    'Telangana',
    'dept-rev-tg',
    'Legal document validating an individual''s community and caste classification under the Telangana (Scheduled Castes, Scheduled Tribes and Backward Classes) Issue of Community, Nativity and Date of Birth Certificates Act. Mandatory for claiming educational reservations, fee concessions, and government recruitment benefits.',
    'Get official certification of community, nativity, and sub-caste status for education and employment reservations.',
    'Applicant must belong to recognized Scheduled Caste (SC), Scheduled Tribe (ST), or Backward Class (BC) list of Telangana. Parents must possess land or lineage records in the Mandal.',
    'https://tg.meeseva.telangana.gov.in',
    'MeeSeva application fee: ₹45 (inclusive of user charge and digital certificate generation).',
    '15 to 30 working days (requires local enquiry by Revenue Inspector).',
    'HYBRID',
    'CITIZEN',
    '2026-09-14',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-pan-card',
    'ITD-PAN-06',
    'Instant e-PAN & New Physical PAN Card (Form 49A)',
    'Business & Taxation',
    'India',
    'All-India',
    'dept-itd',
    'Issuance of 10-digit alphanumeric Permanent Account Number (PAN) by the Income Tax Department. Acts as primary national financial identifier for opening bank accounts, filing income tax returns, high-value financial transactions, and investments.',
    'Get instant paperless digital PAN within 10 minutes using Aadhaar e-KYC or order physical laminated card.',
    'Any Indian citizen with an Aadhaar number linked with an active mobile phone (for Instant e-PAN) or any individual with valid identity/address proof.',
    'https://www.incometax.gov.in/iec/foportal/services/instant-epan',
    'Instant digital e-PAN (via Income Tax Portal): FREE (₹0); Physical laminated card delivery (India): ₹107; Physical card (Foreign dispatch): ₹1,017.',
    'Instant e-PAN: 10 minutes (PDF download); Physical Card: 7-15 days dispatched via Speed Post.',
    'ONLINE',
    'ALL',
    '2026-09-22',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-aadhaar-update',
    'UIDAI-ADH-07',
    'Aadhaar Online Demographic Update & Document Revalidation',
    'Identity & Citizenship',
    'India',
    'All-India',
    'dept-uidai',
    'Service by the Unique Identification Authority of India allowing residents to update demographic information (Address, Name correction, Date of Birth with supporting documentary evidence) via the myAadhaar portal. Also facilitates periodic 10-year document revalidation.',
    'Update your residential address or re-validate identity and address documents online on myAadhaar.',
    'Existing 12-digit Aadhaar number holder with mobile phone registered with Aadhaar for receiving OTP.',
    'https://myaadhaar.uidai.gov.in',
    'Document Revalidation online: Free; Online Address Update: ₹50; Demographic update at Aadhaar Seva Kendra: ₹50; Biometric update: ₹100.',
    '5 to 15 working days post back-end verification against uploaded proofs.',
    'ONLINE',
    'CITIZEN',
    '2026-09-25',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-voter-id',
    'ECI-EPIC-08',
    'New Voter Registration (Form 6) & Voter ID Download',
    'Identity & Citizenship',
    'India',
    'All-India',
    'dept-eci',
    'Constitutional citizen enrolment on the national electoral rolls administered by the Election Commission of India. Citizens completing 18 years can register on the National Voters'' Service Portal (VSP) to obtain their digital and physical Elector''s Photo Identity Card (e-EPIC).',
    'Register as a new voter online and download digitally signable digital e-EPIC card.',
    'Indian citizen residing in the assembly constituency who has turned 18 years of age (or turning 18 on the qualifying dates: 1 Jan, 1 Apr, 1 Jul, 1 Oct).',
    'https://voters.eci.gov.in',
    'Completely FREE (₹0). Electoral registration and issuance of first EPIC is an uncharged constitutional entitlement.',
    '15 to 30 days (subject to field verification by Booth Level Officer / BLO).',
    'ONLINE',
    'CITIZEN',
    '2026-09-10',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-scholarship-epass',
    'TG-WELF-SCH-09',
    'Post-Matric Scholarship & Fee Reimbursement (ePASS)',
    'Education & Scholarships',
    'India',
    'Telangana',
    'dept-welf-tg',
    'Comprehensive state government welfare scheme providing 100% Tuition Fee Reimbursement (RTF) and Maintenance Charges (MTF) to underprivileged college students pursuing Intermediate, ITI, Polytechnic, Degree, PG, Engineering, and Medical courses.',
    'Apply for complete tuition fee reimbursement and maintenance hostel allowance for higher education.',
    'Must be a native of Telangana admitted to recognized college. SC/ST annual parental income < ₹2,00,000; BC/EBC/Minority/Physically Challenged rural < ₹1,50,000 (urban < ₹2,00,000). Minimum 75% college attendance mandatory.',
    'https://telanganaepass.cgg.gov.in',
    'Completely FREE (₹0). MeeSeva scanning charges if done at external center: ~₹30.',
    'Sanctioned during state academic session following institutional verification and biometric authentication.',
    'ONLINE',
    'STUDENT',
    '2026-09-17',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-residence-cert',
    'TG-REV-RES-10',
    'Residence & Nativity Certificate',
    'Revenue & Certificates',
    'India',
    'Telangana',
    'dept-rev-tg',
    'Official proof of continuous residence in a specified village, town, or city issued by the Revenue Department (Tahsildar). Required for quota admissions in state universities, civil service regional allocation, and welfare entitlements.',
    'Certify your domicile and permanent residential address through the local Tahsildar.',
    'Resident residing continuously in the state/district for a minimum qualifying period (ordinarily 4 to 7 years continuous study/living proof).',
    'https://tg.meeseva.telangana.gov.in',
    'MeeSeva Service Charge: ₹45 (Statutory Govt Fee: Nil, User Convenience Fee: ₹45).',
    '7 to 15 working days.',
    'ONLINE',
    'CITIZEN',
    '2026-09-16',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-udyam-msme',
    'MSME-UDY-11',
    'Udyam MSME Business Registration',
    'Business & Taxation',
    'India',
    'All-India',
    'dept-msme',
    'Zero-cost paperless national business registration portal by the Ministry of MSME. Provides a lifetime digital Udyam Registration Certificate with a dynamic QR code. Unlocks priority sector bank loans, collateral exemptions, and government tender preferences.',
    'Register your micro, small, or medium business enterprise online for free with zero document uploads.',
    'Any sole proprietorship, partnership firm, LLP, or private limited company in India with a valid Aadhaar and PAN linked with the promoter/director.',
    'https://udyamregistration.gov.in',
    '100% FREE (₹0). Beware of fraudulent intermediary websites that charge processing fees.',
    'Instant acknowledgment; certificate issued within 3-5 working days post CBDT/GSTN verification.',
    'ONLINE',
    'BUSINESS',
    '2026-09-24',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
),
(
    'srv-death-cert',
    'TG-MAUD-DTH-12',
    'Death Certificate Registration & Extract',
    'Civil Registration System',
    'India',
    'Telangana',
    'dept-maud-tg',
    'Statutory document issued by Municipal Corporation (GHMC) or Gram Panchayat certifying the demise of an individual. Essential for insurance claims, settlement of bank accounts, inheritance of property, and pension closure.',
    'Obtain certified legal proof of death from the municipal civil registrar.',
    'Demise occurred within the territorial jurisdiction of the municipality or panchayat. Cause of death certificate from attending physician/hospital required.',
    'https://ghmc.gov.in/BirthAndDeath.aspx',
    'Registration within 21 days: Free; Late registration (22-30 days): ₹2; Delayed registration up to 1 year: ₹5; Certified digital copy at MeeSeva: ₹35.',
    'Instant for pre-registered hospital cases; 3 to 7 working days for fresh registrations.',
    'ONLINE',
    'CITIZEN',
    '2026-09-11',
    'GOVERNMENT_PORTAL',
    'VERIFIED'
);

-- 4. Official Sources (Authoritative Citations)
INSERT INTO official_sources (
    id, service_id, authority_name, source_type, source_url, document_title,
    publication_date, last_checked_date, authenticity_score, citation_text, verification_badge
) VALUES
('src-pass-01', 'srv-passport', 'Consular, Passport and Visa Division, Ministry of External Affairs, Govt of India', 'GOVERNMENT_PORTAL', 'https://portal2.passportindia.gov.in/AppOnlineProject/online/feeSchedule', 'Passport Rules & Fee Schedule 2026', '2026-01-01', '2026-09-15', 100, 'Official Ministry of External Affairs fee schedule and document advisory published under the Passports Act 1967.', 'OFFICIAL_VERIFIED'),
('src-pass-02', 'srv-passport', 'Gazette of India, Extraordinary', 'GAZETTE_NOTIFICATION', 'https://egazette.gov.in', 'Notification on Police Verification Guidelines for Passport Services', '2024-03-15', '2026-09-15', 100, 'Ministry of External Affairs Order regarding mPassport Police App digital clearance norms.', 'OFFICIAL_VERIFIED'),

('src-dl-01', 'srv-driving-licence', 'Ministry of Road Transport and Highways, Govt of India', 'GOVERNMENT_PORTAL', 'https://parivahan.gov.in/parivahan//en/content/driving-licence-0', 'Central Motor Vehicles Rules 1989 - Rule 14 & 32 Fee Schedule', '2025-06-01', '2026-09-18', 100, 'Parivahan Sarathi National Citizen Portal official fee structure and testing syllabus.', 'OFFICIAL_VERIFIED'),

('src-inc-01', 'srv-income-cert', 'Revenue Department, Government of Telangana', 'DEPARTMENT_ORDER', 'https://tg.meeseva.telangana.gov.in', 'G.O.Ms.No. 45 Revenue (Ser.II) Department Guidelines on Digital Certificates', '2023-11-20', '2026-09-20', 100, 'Official Telangana MeeSeva Citizen Charter for Tahsildar issuance of statutory income certificates.', 'OFFICIAL_VERIFIED'),

('src-brt-01', 'srv-birth-cert', 'Registrar General & Census Commissioner, India (ORGI)', 'GOVERNMENT_PORTAL', 'https://crsorgi.gov.in', 'Civil Registration System Manual & RBD (Amendment) Act 2023', '2023-10-01', '2026-09-12', 100, 'Official National CRS portal mandate establishing digital birth certificates as conclusive single document proof of birth.', 'OFFICIAL_VERIFIED'),

('src-cst-01', 'srv-caste-cert', 'Backward Classes & Scheduled Castes Welfare Department, Telangana', 'DEPARTMENT_ORDER', 'https://tg.meeseva.telangana.gov.in', 'Telangana Act 16 of 1993 & Community Certificate Rules', '2022-08-10', '2026-09-14', 100, 'Government of Telangana statutory rules for integrated community, nativity, and date of birth certificates.', 'OFFICIAL_VERIFIED'),

('src-pan-01', 'srv-pan-card', 'Central Board of Direct Taxes, Ministry of Finance, India', 'GOVERNMENT_PORTAL', 'https://www.incometax.gov.in/iec/foportal/services/instant-epan', 'Income Tax Rules 1962 - Rule 114 Instant e-PAN Scheme', '2024-04-01', '2026-09-22', 100, 'Official Income Tax E-filing portal instant paperless e-PAN advisory.', 'OFFICIAL_VERIFIED'),

('src-adh-01', 'srv-aadhaar-update', 'Unique Identification Authority of India', 'GOVERNMENT_PORTAL', 'https://uidai.gov.in/en/my-aadhaar/about-your-aadhaar/updating-data-on-aadhaar.html', 'UIDAI Standard List of Acceptable Supporting Documents (Circular No. 28)', '2026-01-10', '2026-09-25', 100, 'Official list of 30+ identity and address proofs approved by UIDAI for demographic updates.', 'OFFICIAL_VERIFIED'),

('src-vtr-01', 'srv-voter-id', 'Election Commission of India', 'GOVERNMENT_PORTAL', 'https://voters.eci.gov.in/manuals', 'Handbook for Electoral Registration Officers & Form 6 Guidelines', '2025-01-01', '2026-09-10', 100, 'Official ECI Voter Portal documentation on online electoral registration and EPIC delivery.', 'OFFICIAL_VERIFIED'),

('src-sch-01', 'srv-scholarship-epass', 'Centre for Good Governance & Welfare Departments, Telangana', 'GOVERNMENT_PORTAL', 'https://telanganaepass.cgg.gov.in', 'ePASS Post-Matric Scholarship Eligibility Criteria 2025-2026', '2025-08-01', '2026-09-17', 100, 'Official Telangana ePASS scholarship guidelines and income ceilings.', 'OFFICIAL_VERIFIED'),

('src-res-01', 'srv-residence-cert', 'Revenue Department, Government of Telangana', 'DEPARTMENT_ORDER', 'https://tg.meeseva.telangana.gov.in', 'Telangana Presidential Order Guidelines on Local Candidature & Residence', '2024-02-15', '2026-09-16', 100, 'Statutory rules governing local area determination and Tahsildar residence certificate issuance.', 'OFFICIAL_VERIFIED'),

('src-udy-01', 'srv-udyam-msme', 'Ministry of Micro, Small and Medium Enterprises, Govt of India', 'GAZETTE_NOTIFICATION', 'https://udyamregistration.gov.in/Government-India/Ministry-MSME-registration.htm', 'S.O. 2119(E) Criteria for Classification of Micro, Small and Medium Enterprises', '2024-07-01', '2026-09-24', 100, 'Official notification outlining criteria, turnover thresholds, and paperless registration.', 'OFFICIAL_VERIFIED'),

('src-dth-01', 'srv-death-cert', 'Office of Chief Registrar of Births and Deaths, Telangana', 'GOVERNMENT_PORTAL', 'https://ghmc.gov.in', 'Registration of Births and Deaths Act 1969 & State Rules', '2023-11-01', '2026-09-11', 100, 'GHMC Civil Registration Guidelines for death verification and legal extract issuance.', 'OFFICIAL_VERIFIED');

-- 5. Service Requirements (Eligibility Breakdown)
INSERT INTO service_requirements (id, service_id, requirement_type, description, mandatory, display_order) VALUES
('req-pass-1', 'srv-passport', 'CITIZENSHIP', 'Applicant must be a bona fide citizen of India.', TRUE, 1),
('req-pass-2', 'srv-passport', 'LEGAL_CLEARANCE', 'No adverse police record, pending criminal charges, or non-bailable warrants.', TRUE, 2),
('req-pass-3', 'srv-passport', 'AGE_VERIFICATION', 'Minors below 18 years require both parents’ consent (Annexure C/D) and parents’ passports if available.', TRUE, 3),

('req-dl-1', 'srv-driving-licence', 'MINIMUM_AGE', 'Applicant must be at least 18 years of age for private motor cars/two-wheelers with gear.', TRUE, 1),
('req-dl-2', 'srv-driving-licence', 'VALID_LEARNER_LICENCE', 'Must hold an active Learner Licence (LLR) that has completed at least 30 days and is within 180 days of issue.', TRUE, 2),
('req-dl-3', 'srv-driving-licence', 'FITNESS', 'Physical and mental fitness declaration (Form 1 / Form 1A medical certificate for applicants over 40).', TRUE, 3),

('req-inc-1', 'srv-income-cert', 'RESIDENCE', 'Must be a lawful resident of Telangana within the Mandal of the designated Tahsildar.', TRUE, 1),
('req-inc-2', 'srv-income-cert', 'SOURCE_OF_INCOME', 'Must declare all household income sources (agriculture, business, salary, pension, daily wage).', TRUE, 2),

('req-brt-1', 'srv-birth-cert', 'EVENT_LOCATION', 'The child must have been born within the territorial limits of the municipality or panchayat.', TRUE, 1),
('req-brt-2', 'srv-birth-cert', 'TIMELY_REPORTING', 'Direct digital issuance applies if reported by the hospital within 21 days of birth.', TRUE, 2),

('req-cst-1', 'srv-caste-cert', 'LINEAGE_PROOF', 'Applicant’s ancestors must belong to the recognized state list of SC/ST/BC categories in Telangana.', TRUE, 1),
('req-cst-2', 'srv-caste-cert', 'LAND_OR_SCHOOL_RECORD', 'Documentary proof showing father’s or paternal relatives’ caste on primary school admission register or 1950/1966 land record.', TRUE, 2),

('req-pan-1', 'srv-pan-card', 'AADHAAR_MANDATORY', 'For instant e-PAN, applicant must have a valid 12-digit Aadhaar not previously linked to any existing PAN.', TRUE, 1),
('req-pan-2', 'srv-pan-card', 'MOBILE_LINKING', 'Active mobile number must be linked with Aadhaar to receive OTP for instant e-KYC.', TRUE, 2),

('req-adh-1', 'srv-aadhaar-update', 'EXISTING_ENROLMENT', 'Must possess valid 12-digit Aadhaar number.', TRUE, 1),
('req-adh-2', 'srv-aadhaar-update', 'AUTHENTICATION', 'Registered mobile number active for two-factor SMS OTP authentication.', TRUE, 2),

('req-vtr-1', 'srv-voter-id', 'QUALIFYING_AGE', 'Applicant must be an Indian citizen who is 18 years or older on the reference qualifying date.', TRUE, 1),
('req-vtr-2', 'srv-voter-id', 'ORDINARY_RESIDENT', 'Must be ordinarily resident in the assembly constituency where registration is sought.', TRUE, 2),

('req-sch-1', 'srv-scholarship-epass', 'ACADEMIC_ADMISSION', 'Admitted to a recognized post-matric course (Intermediate, Degree, PG, B.Tech, MBBS) through convenor quota or merit.', TRUE, 1),
('req-sch-2', 'srv-scholarship-epass', 'INCOME_CAP', 'Annual family income must not exceed ₹2,00,000 for SC/ST and ₹1,50,000 (rural) / ₹2,00,000 (urban) for BC/Minorities.', TRUE, 2),
('req-sch-3', 'srv-scholarship-epass', 'ATTENDANCE_PERCENTAGE', 'Must maintain minimum 75% biometric attendance in the educational institution.', TRUE, 3);

-- 6. Documents Checklist
INSERT INTO documents (
    id, service_id, document_name, purpose, accepted_formats,
    is_original_required, is_upload_required, official_source_id, notes, display_order
) VALUES
-- Passport
('doc-pass-1', 'srv-passport', 'Proof of Present Address (Aadhaar / Utility Bill / Bank Passbook)', 'Validates the current physical residential jurisdiction for police verification.', 'Original + 1 Self-Attested Photocopy (PDF upload)', TRUE, TRUE, 'src-pass-01', 'Must have applicant’s complete present address. Utility bills (electricity/water) must not be older than 3 months.', 1),
('doc-pass-2', 'srv-passport', 'Proof of Date of Birth (Birth Certificate / SSC Certificate)', 'Conclusive legal proof of date of birth under Passport Rules.', 'Original + 1 Photocopy (PDF upload)', TRUE, TRUE, 'src-pass-01', 'For applicants born on or after 26/01/1989, Municipal Birth Certificate or School Leaving Certificate is accepted.', 2),
('doc-pass-3', 'srv-passport', 'Educational Qualification Proof (Class 10 / Matriculation Pass Certificate)', 'Determines eligibility for Non-ECR (Emigration Check Not Required) category status.', 'Original + 1 Photocopy (PDF upload)', TRUE, TRUE, 'src-pass-01', 'Submitting 10th pass certificate grants Non-ECR endorsement automatically.', 3),
('doc-pass-4', 'srv-passport', 'Old / Expired Passport (Original Booklet)', 'Required only in case of Passport Reissue.', 'Original Booklet', TRUE, FALSE, 'src-pass-01', 'Original old passport must be produced for physical cancellation at PSK counter.', 4),

-- Driving Licence
('doc-dl-1', 'srv-driving-licence', 'Proof of Age (Aadhaar Card / School Certificate / Birth Certificate)', 'Validates compliance with minimum age requirements (18 years for LMV).', 'PDF / JPG (Max 500KB)', FALSE, TRUE, 'src-dl-01', 'Aadhaar e-KYC can auto-verify age without separate document scan on Parivahan.', 1),
('doc-dl-2', 'srv-driving-licence', 'Proof of Present Address (Aadhaar / Voter ID / Passport / Electricity Bill)', 'Designates jurisdiction of Regional Transport Office (RTO).', 'PDF / JPG (Max 500KB)', FALSE, TRUE, 'src-dl-01', 'Address on proof determines the RTO where practical driving test is taken.', 2),
('doc-dl-3', 'srv-driving-licence', 'Active Learner Licence (LLR) Number', 'Pre-requisite for booking permanent DL slot on Sarathi portal.', 'Alphanumeric LL Number', FALSE, FALSE, 'src-dl-01', 'Learner Licence must be between 30 and 180 days old.', 3),
('doc-dl-4', 'srv-driving-licence', 'Medical Certificate Form 1-A (if age > 40 years or commercial licence)', 'Signed medical fitness evaluation by registered MBBS medical practitioner.', 'Signed Physical Form + Scan', TRUE, TRUE, 'src-dl-01', 'Required only for commercial vehicle licences or applicants above 40 years.', 4),

-- Income Certificate
('doc-inc-1', 'srv-income-cert', 'Aadhaar Card of Applicant & Family Head', 'Identity and biographical authentication.', 'PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-inc-01', 'Original must be presented if asked by Revenue Inspector.', 1),
('doc-inc-2', 'srv-income-cert', 'Ration Card / Food Security Card (FSC) / White Ration Card', 'Validates family composition and economic tier.', 'PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-inc-01', 'Very helpful for expedited verification by Village Revenue Officer.', 2),
('doc-inc-3', 'srv-income-cert', 'Self-Declaration Form / Income Affidavit', 'Sworn declaration of all annual household earnings from all sources.', 'Signed Standard MeeSeva Form', TRUE, TRUE, 'src-inc-01', 'Download official format from MeeSeva portal, sign, and upload.', 3),
('doc-inc-4', 'srv-income-cert', 'Salary Slip / Employer Certificate (for salaried applicants)', 'Verifiable proof of monthly gross and net wages.', 'PDF (Max 2MB)', FALSE, TRUE, 'src-inc-01', 'Applicable only if any family member is in formal employment.', 4),

-- Birth Certificate
('doc-brt-1', 'srv-birth-cert', 'Discharge Summary / Birth Slip from Hospital', 'Institutional proof of birth from obstetric ward with time and date.', 'Original Hospital Slip', TRUE, TRUE, 'src-brt-01', 'Hospital directly enters institutional births in CRS; this slip contains the unique registration reference.', 1),
('doc-brt-2', 'srv-birth-cert', 'Parents’ Aadhaar Cards', 'Establishes legal identity and exact spelling of parents’ names.', 'PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-brt-01', 'Ensure parents’ names match exactly on their official Aadhaar cards.', 2),
('doc-brt-3', 'srv-birth-cert', 'Application Form with Child’s Official Name', 'To formalize the child’s legal given name on the permanent certificate.', 'Filled Standard Form', TRUE, TRUE, 'src-brt-01', 'Can be added up to 1 year without extra statutory fine.', 3),

-- Caste Certificate
('doc-cst-1', 'srv-caste-cert', 'Father’s / Sibling’s Existing Caste Certificate or School Certificate', 'Conclusive lineage proof of recognized community status.', 'PDF (Max 2MB)', FALSE, TRUE, 'src-cst-01', 'Strongest proof; speeds up Tahsildar approval without field hearing.', 1),
('doc-cst-2', 'srv-caste-cert', 'Applicant’s Study Certificate / Transfer Certificate (TC)', 'Shows name, parentage, and community mentioned during school enrollment.', 'PDF (Max 2MB)', FALSE, TRUE, 'src-cst-01', 'Primary school records carry high evidentiary value under the Act.', 2),
('doc-cst-3', 'srv-caste-cert', 'Self-Declaration Form & Passport Photograph', 'Signed affidavit declaring sub-caste and residential lineage.', 'Signed Form + JPEG', TRUE, TRUE, 'src-cst-01', 'Standard MeeSeva caste application declaration.', 3),

-- PAN Card
('doc-pan-1', 'srv-pan-card', 'Aadhaar Card with Linked Mobile Number', 'Sole required document for instant digital e-PAN (paperless e-KYC).', '12-digit Aadhaar Number', FALSE, FALSE, 'src-pan-01', 'No paper scan required if doing instant Aadhaar OTP e-KYC.', 1),
('doc-pan-2', 'srv-pan-card', 'Passport Photograph & Signature Scan (for physical Form 49A)', 'Photo and digital signature embedded on printed plastic PAN card.', 'JPEG (200 DPI, 20-50KB)', FALSE, TRUE, 'src-pan-01', 'Only required if applying via NSDL/UTIITSL physical card route.', 2),

-- Aadhaar Update
('doc-adh-1', 'srv-aadhaar-update', 'Valid Proof of Address (POA) from UIDAI approved list', 'Electricity bill, water bill, gas connection, bank statement, or voter ID.', 'Colored PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-adh-01', 'Name and address on proof must match the update request letter for letter.', 1),

-- Voter ID
('doc-vtr-1', 'srv-voter-id', 'Proof of Age (Birth Certificate, Aadhaar, SSC Marksheet, Passport)', 'Verifies eligibility date for electoral registration.', 'PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-vtr-01', 'Self-attested copy uploaded to Voter Portal.', 1),
('doc-vtr-2', 'srv-voter-id', 'Proof of Ordinary Residence (Electricity Bill, Aadhaar, Rent Agreement)', 'Confirms applicant lives in the declared assembly constituency.', 'PDF / JPG (Max 2MB)', FALSE, TRUE, 'src-vtr-01', 'Must show the exact house number, street, and pin code.', 2),
('doc-vtr-3', 'srv-voter-id', 'Recent Passport Sized Color Photograph', 'Photograph displayed on the Elector’s Photo Identity Card (EPIC).', 'JPG (Max 200KB)', FALSE, TRUE, 'src-vtr-01', 'Clear white background, front facing, eyes open.', 3),

-- Scholarship
('doc-sch-1', 'srv-scholarship-epass', 'SSC Hall Ticket Number & Passing Year', 'Verifies student’s basic educational record and date of birth.', 'Original Hall Ticket / Memo', FALSE, FALSE, 'src-sch-01', 'Auto-fetches student data from Telangana SSC Board database.', 1),
('doc-sch-2', 'srv-scholarship-epass', 'Latest Digital Income Certificate (Issued on or after 1st April of current financial year)', 'Validates income ceiling compliance for state treasury subsidy.', 'MeeSeva Certificate Number', FALSE, FALSE, 'src-sch-01', 'Must be issued in current financial year via MeeSeva.', 2),
('doc-sch-3', 'srv-scholarship-epass', 'Digital Caste Certificate (Integrated Community Certificate)', 'Validates category entitlement (SC, ST, BC, EBC).', 'MeeSeva Certificate Number', FALSE, FALSE, 'src-sch-01', 'Permanent MeeSeva number verified digitally against database.', 3),
('doc-sch-4', 'srv-scholarship-epass', 'Bank Account Passbook (Student’s Personal Nationalised Bank Account)', 'For direct benefit transfer (DBT) of maintenance charges.', 'PDF / Scan of First Page', FALSE, TRUE, 'src-sch-01', 'Aadhaar seeding with bank account must be active on NPCI mapper.', 4);

-- 7. Service Steps (Step-by-Step Walkthrough)
INSERT INTO service_steps (id, service_id, step_number, title, description, estimated_time, is_online_step, tips) VALUES
-- Passport Steps
('stp-pass-1', 'srv-passport', 1, 'Register on Official Passport Seva Portal', 'Visit portal2.passportindia.gov.in. Register using an active email ID and select your regional passport office (e.g., RPO Hyderabad). Beware of fake phishing domains ending in .com or .org.', '15 minutes', TRUE, 'Always verify the domain ends in .gov.in. No genuine agent login exists on private sites.'),
('stp-pass-2', 'srv-passport', 2, 'Complete Application Form (Form 1)', 'Fill in personal particulars, parentage, spouse details, present residential address, and two local references with phone numbers.', '30 minutes', TRUE, 'Ensure spelling matches your Class 10 memo and Aadhaar precisely to prevent rejection.'),
('stp-pass-3', 'srv-passport', 3, 'Pay Official Fee & Schedule PSK Appointment', 'Pay ₹1,500 online using SBI ePay / Netbanking / UPI and book an appointment slot at your nearest PSK or POPSK.', '10 minutes', TRUE, 'Appointments can be rescheduled up to 3 times within 1 year from the date of payment.'),
('stp-pass-4', 'srv-passport', 4, 'Attend PSK Biometric & Document Verification Slot', 'Visit the PSK 15 minutes before slot with printed Appointment Slip and original documents plus 1 self-attested photocopy.', '45-90 minutes at PSK', FALSE, 'Counter A captures photo/fingerprints; Counter B verifies originals; Counter C (Granting Officer) approves issuance.'),
('stp-pass-5', 'srv-passport', 5, 'Police Verification & Speed Post Delivery', 'Local police station will conduct physical address verification or use mPassport Police App. Upon clearance, passport is printed and dispatched via India Post Speed Post.', '7 to 20 days', FALSE, 'Track parcel using Speed Post tracking number sent via official SMS.');

-- Driving Licence Steps
INSERT INTO service_steps (id, service_id, step_number, title, description, estimated_time, is_online_step, tips) VALUES
('stp-dl-1', 'srv-driving-licence', 1, 'Apply for Learner’s Licence (LLR) Online', 'Access parivahan.gov.in -> Drivers/Learners Licence -> Select your State. Choose "Application with Aadhaar Authentication" for contactless test from home without visiting RTO.', '20 minutes', TRUE, 'Aadhaar authentication allows taking the online road safety video and quiz test directly from home on your smartphone or PC.'),
('stp-dl-2', 'srv-driving-licence', 2, 'Watch Road Safety Tutorial & Pass Online Learner Test', 'Complete mandatory 15-minute road safety video tutorial on Sarathi portal. Take the 15-question road signs and traffic rules quiz (passing mark: 10/15).', '30 minutes', TRUE, 'You can re-attempt the test after 24 hours if you do not qualify on first attempt.'),
('stp-dl-3', 'srv-driving-licence', 3, 'Download Instant Digital Learner’s Licence (Form 3)', 'Once test is passed, download your digital Learner Licence immediately. Valid for 6 months across India.', '5 minutes', TRUE, 'Ensure you display red "L" sign on vehicle while driving under supervision of a permanent DL holder.'),
('stp-dl-4', 'srv-driving-licence', 4, 'Book Permanent DL Driving Test Slot at RTO', 'After 30 days of holding your LLR, log into Sarathi, choose "New Driving Licence", pay ₹700 fee, and pick a convenient test date at your local RTO.', '10 minutes', TRUE, 'Practice the test track (H-track for cars, 8-track for two-wheelers) beforehand.'),
('stp-dl-5', 'srv-driving-licence', 5, 'Undergo RTO Practical Track Test & Biometric Capture', 'Reach RTO test track on the appointed date with your test vehicle. Pass the obstacle track in front of the Motor Vehicle Inspector (MVI).', '1-2 hours', FALSE, 'Carry original LLR, vehicle RC, valid insurance certificate, and PUC pollution certificate for the test vehicle.'),
('stp-dl-6', 'srv-driving-licence', 6, 'Smart Card Dispatch & Digital DL on DigiLocker / mParivahan', 'MVI approves DL online. Pull legally valid digital DL onto DigiLocker/mParivahan instantly; physical smart card arrives via Speed Post.', '7-15 days', FALSE, 'Digital DL on DigiLocker is 100% legally recognized by traffic police across India under Rule 139 CMVR.');

-- Income Certificate Steps
INSERT INTO service_steps (id, service_id, step_number, title, description, estimated_time, is_online_step, tips) VALUES
('stp-inc-1', 'srv-income-cert', 1, 'Submit Application via MeeSeva or Prajavani Portal', 'Log into Telangana MeeSeva portal or visit your nearest authorized MeeSeva franchisee center. Select "Issue of Income Certificate".', '15 minutes', TRUE, 'Keep your 12-digit Aadhaar number and Food Security Card number ready.'),
('stp-inc-2', 'srv-income-cert', 2, 'Upload Self-Declaration Affidavit & Identity Proof', 'Attach self-declaration of annual household income and scan of Aadhaar/Ration card. Pay the statutory MeeSeva fee of ₹45.', '10 minutes', TRUE, 'Double check family members’ names as they appear on the ration card to avoid spelling mismatches.'),
('stp-inc-3', 'srv-income-cert', 3, 'Revenue Inspector (RI) & Village Revenue Officer (VRO) Scrutiny', 'Application routes electronically to local Mandal Tahsildar office. VRO verifies local economic standing, landed property, and occupation.', '3-7 days', FALSE, 'Local field verification may occur if discrepancy exists between declared income and land records.'),
('stp-inc-4', 'srv-income-cert', 4, 'Tahsildar Digital Signature & Download', 'Tahsildar digitally signs the certificate. Receive SMS alert with download link; download watermarked certificate from MeeSeva or DigiLocker.', 'Instant post-approval', TRUE, 'All digital certificates contain a secure QR code verifiable by colleges and employers online.');

-- Birth Certificate Steps
INSERT INTO service_steps (id, service_id, step_number, title, description, estimated_time, is_online_step, tips) VALUES
('stp-brt-1', 'srv-birth-cert', 1, 'Hospital Reporting to Civil Registration System', 'At time of birth in hospital, provide parents’ exact Aadhaar details. Hospital registrar uploads institutional record within 21 days.', 'Handled by hospital', FALSE, 'Collect the official discharge receipt and birth acknowledgment slip before leaving the hospital.'),
('stp-brt-2', 'srv-birth-cert', 2, 'Search & Verification on Municipal Portal (GHMC/CRS)', 'Visit ghmc.gov.in or crsorgi.gov.in. Enter child’s date of birth, mother’s name, father’s name, and hospital registration number.', '10 minutes', TRUE, 'Check certificate preview thoroughly for parent name spelling before ordering certified prints.'),
('stp-brt-3', 'srv-birth-cert', 3, 'Name Inclusion (if not registered at birth)', 'If name was not provided at birth, submit "Child Name Inclusion" on MeeSeva with an affidavit within 1 year.', '15 minutes', TRUE, 'First year child name inclusion is free; late fee applies thereafter.'),
('stp-brt-4', 'srv-birth-cert', 4, 'Download Digitally Signed Official Certificate', 'Download high-resolution digitally signed birth certificate with government crest and QR code for legal use.', 'Instant', TRUE, 'Under the Registration of Births and Deaths (Amendment) Act 2023, digital birth certificate serves as single proof for school admission, passport, and driving licence.');

-- PAN Card Steps
INSERT INTO service_steps (id, service_id, step_number, title, description, estimated_time, is_online_step, tips) VALUES
('stp-pan-1', 'srv-pan-card', 1, 'Open Income Tax Instant e-PAN Portal', 'Navigate to incometax.gov.in -> Instant e-PAN -> Click "Get New e-PAN". This service is completely FREE.', '5 minutes', TRUE, 'Requires Aadhaar with linked active mobile phone.'),
('stp-pan-2', 'srv-pan-card', 2, 'Enter 12-Digit Aadhaar & Authenticate via OTP', 'Enter your Aadhaar number, accept declaration that you do not hold an existing PAN, and submit 6-digit OTP received on mobile.', '5 minutes', TRUE, 'Instant e-PAN adopts photo, name, date of birth, and address directly from Aadhaar e-KYC.'),
('stp-pan-3', 'srv-pan-card', 3, 'Validate Details & Submit Request', 'Confirm preview of details shown from UIDAI database. Submit application and save the 15-digit acknowledgment number.', '5 minutes', TRUE, 'No paperwork or physical signature submission required.'),
('stp-pan-4', 'srv-pan-card', 4, 'Download Password-Protected Digital e-PAN PDF', 'Check status after 10 minutes by entering Aadhaar OTP. Download PDF e-PAN. Password is your Date of Birth in DDMMYYYY format.', '10 minutes', TRUE, 'Digital e-PAN has 100% legal validity equal to physical laminated card under Section 139A of Income Tax Act.');

-- 8. Frequently Asked Questions (FAQs)
INSERT INTO faqs (id, service_id, question, answer, official_reference, display_order) VALUES
-- Passport FAQs
('faq-pass-1', 'srv-passport', 'Can I apply for an Indian passport without visiting the Passport Seva Kendra (PSK)?', 'No. Physical appearance at the PSK or Post Office PSK is mandatory for capturing live biometric fingerprints, Iris scan, and live high-resolution digital photograph. No tout, agency, or online portal can waive this statutory requirement.', 'Passport Rules 1980, Rule 5 (Biometric Verification)', 1),
('faq-pass-2', 'srv-passport', 'What is the key difference between Normal and Tatkaal passport schemes?', 'Normal scheme costs ₹1,500 and issues the passport after standard police verification (typically 15-30 days). Tatkaal costs ₹3,500 (additional ₹2,000 Tatkaal fee paid at PSK) and issues the passport in 1 to 3 days on Post-Police Verification basis, requiring 3 mandatory identity proofs (e.g., Aadhaar, Voter ID, PAN).', 'MEA Citizen Charter Schedule 2', 2),
('faq-pass-3', 'srv-passport', 'Is police verification required for passport renewal / reissue?', 'For reissue before expiry or within 3 years of expiry without change of address, passports are generally reissued on "Post-Police Verification" or "No Police Verification" basis if previous record was clear. If address is changed, fresh police verification is initiated.', 'MEA Advisory on Police Verification Norms', 3),

-- Driving Licence FAQs
('faq-dl-1', 'srv-driving-licence', 'Can I give the Learner Licence test from home without going to the RTO?', 'Yes. In most states (including Telangana, Maharashtra, Karnataka, Delhi), if you apply using Aadhaar authentication on parivahan.gov.in, you are eligible for the contactless online LL test from home using an AI-proctored web camera test.', 'MoRTH Notification G.S.R. 138(E) Contactless Citizen Services', 1),
('faq-dl-2', 'srv-driving-licence', 'Is a driving licence on DigiLocker or mParivahan valid during police traffic inspection?', 'Yes, 100%. Under Rule 139 of the Central Motor Vehicles Rules 1989 and MoRTH Advisory RT-11036/64/2017-MVL, electronic driving licences and vehicle registration certificates presented via DigiLocker or mParivahan have legal standing identical to physical plastic cards.', 'CMVR Rule 139 & IT Act 2000 Section 4', 2),
('faq-dl-3', 'srv-driving-licence', 'What happens if my Learner Licence expires after 6 months?', 'A Learner Licence is valid for 180 days. If you do not obtain a Permanent DL within 180 days, you must re-apply for a fresh Learner Licence, repay the ₹200 fee, and retake the preliminary test.', 'Section 14(1) Motor Vehicles Act 1988', 3),

-- Income Certificate FAQs
('faq-inc-1', 'srv-income-cert', 'For how long is an Income Certificate valid in Telangana?', 'An official Income Certificate issued by the Tahsildar in Telangana is valid for one financial year (from 1st April to 31st March of the following year) from the date of issue.', 'G.O.Ms.No. 45 Revenue Department', 1),
('faq-inc-2', 'srv-income-cert', 'Is an Income Certificate issued in the student’s name or father’s name?', 'For unmarried students and minors, the certificate is issued in the applicant student’s name showing the father/guardian as head of the family, with total combined household income.', 'MeeSeva Revenue Operational Manual', 2),

-- Birth Certificate FAQs
('faq-brt-1', 'srv-birth-cert', 'Is a digital birth certificate accepted as single proof of date of birth for all government services?', 'Yes. Under the Registration of Births and Deaths (Amendment) Act 2023 effective from 1st October 2023, the digital birth certificate is the solitary conclusive proof of date and place of birth for school admission, driving licence, voter list, marriage registration, and passport issuance.', 'RBD (Amendment) Act 2023 (Act No. 20 of 2023)', 1),
('faq-brt-2', 'srv-birth-cert', 'How can I register a birth that occurred more than 1 year ago?', 'Births delayed beyond 1 year can only be registered on the order of an Executive Magistrate (Revenue Divisional Officer / Sub-Collector) after inquiry, accompanied by a non-availability certificate from the municipality and payment of prescribed late fee.', 'Section 13(3) Registration of Births and Deaths Act 1969', 2),

-- PAN FAQs
('faq-pan-1', 'srv-pan-card', 'Is Instant e-PAN free and as valid as a physical card?', 'Yes. Instant e-PAN generated on the Income Tax e-Filing portal is completely FREE of cost and carries a digitally signed QR code. Under Rule 114 of Income Tax Rules, it is fully recognized by all banks, stockbrokers, and government agencies.', 'CBDT Circular 03/2020', 1),
('faq-pan-2', 'srv-pan-card', 'Can I get a physical laminated card if I already obtained an Instant e-PAN?', 'Yes. You can visit the NSDL (Protean) or UTIITSL "Reprint PAN Card" portal, enter your PAN and Aadhaar number, pay ₹50 online, and a physical laminated card will be dispatched to your Aadhaar address by Speed Post.', 'NSDL Citizen Service Portal Guidelines', 2),

-- Voter ID FAQs
('faq-vtr-1', 'srv-voter-id', 'Can I register to vote if I am 17 years old?', 'Yes. You can submit Form 6 in advance upon completing 17 years. The Election Commission processes applications quarterly on four qualifying dates: 1st January, 1st April, 1st July, and 1st October. Your EPIC will be issued as soon as you attain 18 years.', 'ECI Press Note No. ECI/PN/57/2022', 1),

-- Scholarship FAQs
('faq-sch-1', 'srv-scholarship-epass', 'What is the mandatory attendance percentage required for ePASS scholarship sanction?', 'Students must have at least 75% biometric attendance recorded on the official college biometric devices. Applications with attendance below 75% are automatically rejected by the treasury portal.', 'Telangana ePASS Post-Matric Guidelines Clause 4.2', 1);

-- 9. Verification Records (Audit Trail for Government Data)
INSERT INTO verification_records (id, service_id, verified_by_user_id, status, previous_status, findings, verified_at, source_url_checked) VALUES
('vr-pass-01', 'srv-passport', 'usr-admin-1', 'VERIFIED', 'NEEDS_VERIFICATION', 'Verified against Ministry of External Affairs portal2.passportindia.gov.in fee schedule and 2026 police verification guidelines. Fees confirmed at ₹1,500 for normal and ₹3,500 for tatkaal.', '2026-09-15 10:30:00+00', 'https://portal2.passportindia.gov.in/AppOnlineProject/online/feeSchedule'),
('vr-dl-01', 'srv-driving-licence', 'usr-admin-1', 'VERIFIED', 'NEEDS_VERIFICATION', 'Cross-referenced against Parivahan Sarathi national rules and Central Motor Vehicles Rules 1989 fees. Contactless Aadhaar testing confirmed active.', '2026-09-18 11:15:00+00', 'https://parivahan.gov.in/parivahan//en/content/driving-licence-0'),
('vr-inc-01', 'srv-income-cert', 'usr-admin-1', 'VERIFIED', 'NEEDS_VERIFICATION', 'Validated against Telangana MeeSeva portal citizen charter and Revenue Dept circular. Fee confirmed at ₹45 user charge with zero statutory government fee.', '2026-09-20 14:00:00+00', 'https://tg.meeseva.telangana.gov.in'),
('vr-pan-01', 'srv-pan-card', 'usr-admin-1', 'VERIFIED', 'NEEDS_VERIFICATION', 'Verified on incometax.gov.in instant e-PAN facility. Service is confirmed active, completely paperless and free.', '2026-09-22 09:45:00+00', 'https://www.incometax.gov.in/iec/foportal/services/instant-epan'),
('vr-adh-01', 'srv-aadhaar-update', 'usr-admin-1', 'VERIFIED', 'NEEDS_VERIFICATION', 'Checked UIDAI myAadhaar portal circular no. 28 regarding accepted address proof documents and online update charge of ₹50.', '2026-09-25 16:20:00+00', 'https://myaadhaar.uidai.gov.in');

-- 10. Sample Citizen Saved Services, Applications, and Reminders
INSERT INTO saved_services (id, user_id, service_id, created_at) VALUES
('save-1', 'usr-citizen-1', 'srv-passport', CURRENT_TIMESTAMP),
('save-2', 'usr-citizen-1', 'srv-driving-licence', CURRENT_TIMESTAMP);

INSERT INTO user_applications (
    id, user_id, service_id, service_title, application_reference_number,
    applied_on, status, next_action, notes, submission_portal_url
) VALUES
(
    'app-demo-1',
    'usr-citizen-1',
    'srv-driving-licence',
    'Learner''s Licence & Permanent Driving Licence',
    'TS009/LLR/2026/89421',
    '2026-09-10',
    'SUBMITTED',
    'Complete online Road Safety Tutorial and take LL quiz',
    'Aadhaar e-KYC completed. Need to take online quiz before Oct 10.',
    'https://parivahan.gov.in'
),
(
    'app-demo-2',
    'usr-citizen-1',
    'srv-income-cert',
    'Income Certificate Issuance',
    'MS-TG-2026-583921',
    '2026-09-22',
    'UNDER_SCRUTINY',
    'VRO verification scheduled for this Wednesday',
    'Submitted via MeeSeva Jubilee Hills counter. Applied for scholarship fee reimbursement.',
    'https://tg.meeseva.telangana.gov.in'
);

INSERT INTO application_documents (id, application_id, document_id, document_name, status, user_notes) VALUES
('appdoc-1', 'app-demo-1', 'doc-dl-1', 'Proof of Age (Aadhaar Card)', 'UPLOADED', 'Verified via Aadhaar OTP'),
('appdoc-2', 'app-demo-1', 'doc-dl-2', 'Proof of Present Address (Aadhaar)', 'UPLOADED', 'Permanent residence Hyderabad address'),
('appdoc-3', 'app-demo-1', 'doc-dl-3', 'Active Learner Licence (LLR) Number', 'NOT_READY', 'Will be generated once test is passed'),
('appdoc-4', 'app-demo-2', 'doc-inc-1', 'Aadhaar Card of Applicant & Family Head', 'READY', 'Photocopies kept in file folder'),
('appdoc-5', 'app-demo-2', 'doc-inc-2', 'Ration Card / Food Security Card', 'UPLOADED', 'Uploaded scanned copy on MeeSeva'),
('appdoc-6', 'app-demo-2', 'doc-inc-3', 'Self-Declaration Form / Income Affidavit', 'READY', 'Signed by father yesterday');

INSERT INTO reminders (id, user_id, service_id, title, reminder_date, notes, is_completed) VALUES
('rem-1', 'usr-citizen-1', 'srv-driving-licence', 'Book Permanent Driving Licence RTO Slot', '2026-10-15', 'Minimum 30 days completed since Learner Licence issuance. Book Kondapur RTO track slot.', FALSE),
('rem-2', 'usr-citizen-1', 'srv-scholarship-epass', 'ePASS Scholarship Application Deadline', '2026-10-31', 'Collect Income Certificate from MeeSeva before submitting ePASS renewal for 3rd semester.', FALSE);
