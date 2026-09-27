import datetime

INITIAL_DEPARTMENTS = [
    {
        "id": "dept-mea",
        "code": "MEA",
        "name": "Ministry of External Affairs, Consular, Passport and Visa Division",
        "description": "Apex central authority administering the Passports Act 1967 and Passport Rules across India.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://portal2.passportindia.gov.in",
        "contact_helpline": "1800-258-1800"
    },
    {
        "id": "dept-morth",
        "code": "MORTH",
        "name": "Ministry of Road Transport and Highways (Sarathi Portal)",
        "description": "Central ministry regulating driving licences, vehicle registrations, and road safety protocols.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://parivahan.gov.in",
        "contact_helpline": "0120-2459169"
    },
    {
        "id": "dept-uidai",
        "code": "UIDAI",
        "name": "Unique Identification Authority of India",
        "description": "Statutory authority under MeitY responsible for Aadhaar enrolment, biometric authentication and updates.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://uidai.gov.in",
        "contact_helpline": "1947"
    },
    {
        "id": "dept-itd",
        "code": "ITD",
        "name": "Income Tax Department (Central Board of Direct Taxes)",
        "description": "Administering direct taxes and Permanent Account Number (PAN) issuance under the Income Tax Act 1961.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://www.incometax.gov.in",
        "contact_helpline": "1800-180-1961"
    },
    {
        "id": "dept-eci",
        "code": "ECI",
        "name": "Election Commission of India",
        "description": "Autonomous constitutional authority administering electoral rolls, voter registration, and EPIC issuance.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://voters.eci.gov.in",
        "contact_helpline": "1950"
    },
    {
        "id": "dept-msme",
        "code": "MSME",
        "name": "Ministry of Micro, Small and Medium Enterprises",
        "description": "Facilitating industrial enterprise registration and incentives via the paperless Udyam portal.",
        "country": "India",
        "state": "All-India",
        "official_portal_url": "https://udyamregistration.gov.in",
        "contact_helpline": "011-23063288"
    },
    {
        "id": "dept-rev-tg",
        "code": "TG-REV",
        "name": "Revenue Department, Government of Telangana (MeeSeva)",
        "description": "State revenue administration responsible for statutory income, residence, caste certificates, and land mutation.",
        "country": "India",
        "state": "Telangana",
        "official_portal_url": "https://tg.meeseva.telangana.gov.in",
        "contact_helpline": "040-48560012"
    },
    {
        "id": "dept-maud-tg",
        "code": "TG-MAUD",
        "name": "Municipal Administration & Urban Development (GHMC/CDMA)",
        "description": "State urban administration managing vital civil registrations including births, deaths, and trade licences.",
        "country": "India",
        "state": "Telangana",
        "official_portal_url": "https://ghmc.gov.in",
        "contact_helpline": "040-21111111"
    },
    {
        "id": "dept-welf-tg",
        "code": "TG-WELF",
        "name": "Backward Classes, SC & ST Welfare Departments (ePASS Telangana)",
        "description": "Administering post-matric and overseas scholarship reimbursements for eligible students.",
        "country": "India",
        "state": "Telangana",
        "official_portal_url": "https://telanganaepass.cgg.gov.in",
        "contact_helpline": "040-23390228"
    }
]

INITIAL_USERS = [
    {
        "id": "usr-admin-1",
        "email": "admin@civicguide.gov.in",
        "password_hash": "$2a$10$Bvkv7HDS86LgvlBy3xZDQ.4tzl.i9CfmZDqr5oG.UmLu7HcdhYGqa",  # Password@123
        "full_name": "Official Civic Administrator",
        "role": "admin",
        "country": "India",
        "state": "Telangana",
        "district": "Hyderabad",
        "preferred_language": "en"
    },
    {
        "id": "usr-citizen-1",
        "email": "citizen@example.com",
        "password_hash": "$2a$10$Bvkv7HDS86LgvlBy3xZDQ.4tzl.i9CfmZDqr5oG.UmLu7HcdhYGqa",  # Password@123
        "full_name": "Shiva Sai",
        "role": "citizen",
        "country": "India",
        "state": "Telangana",
        "district": "Hyderabad",
        "preferred_language": "en"
    }
]

INITIAL_SERVICES = [
    {
        "id": "srv-passport",
        "service_code": "MEA-PASS-01",
        "title": "Ordinary Fresh / Reissue Passport Application",
        "category": "Identity & Citizenship",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-mea",
        "description": "Official Indian passport application for citizens seeking international travel documentation under the Passports Act 1967. Includes standard 36-page or 60-page booklet under Normal and Tatkaal quotas with biometric capture at Passport Seva Kendra (PSK) or Post Office PSK (POPSK).",
        "short_summary": "Apply for a new 10-year Indian passport or reissue an expired passport with online appointment at PSK.",
        "eligibility_criteria": "Must be a citizen of India by birth, descent, or registration. No pending criminal summons or active warrant in any Indian criminal court.",
        "official_url": "https://portal2.passportindia.gov.in/AppOnlineProject/welcomeLink",
        "fee_structure": "Normal Quota (36 pages): ₹1,500; Normal Quota (60 pages): ₹2,000; Tatkaal Quota (36 pages): ₹3,500; Minors (<18 years): ₹1,000.",
        "processing_time": "Normal: 15-30 working days (post police verification); Tatkaal: 1-3 working days.",
        "application_mode": "HYBRID",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-15",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-driving-licence",
        "service_code": "MORTH-DL-02",
        "title": "Learner's Licence & Permanent Driving Licence",
        "category": "Transport & Driving",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-morth",
        "description": "Unified national workflow for issuing Motor Vehicle Driving Licences across all RTOs in India via the Sarathi Parivahan portal. Citizens first qualify for an online contactless or in-person Learner Licence (LLR) followed by a mandatory practical driving test at the Regional Transport Office for a Permanent DL.",
        "short_summary": "Apply for Learner Licence online and schedule slot for permanent driving licence test at your RTO.",
        "eligibility_criteria": "Age 16+ for gearless 2-wheelers up to 50cc; Age 18+ for light motor vehicles (cars/motorcycles with gear); Age 20+ for transport/commercial vehicles.",
        "official_url": "https://parivahan.gov.in/parivahan//en/content/driving-licence-0",
        "fee_structure": "Learner Licence: ₹200 (including ₹50 test fee per class); Permanent Driving Licence: ₹700 (including ₹200 DL fee + ₹300 driving test fee + ₹200 smart card fee).",
        "processing_time": "Learner Licence: Same day (online test); Permanent DL: 7-15 days after passing RTO driving test.",
        "application_mode": "HYBRID",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-18",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-income-cert",
        "service_code": "TG-REV-INC-03",
        "title": "Income Certificate Issuance",
        "category": "Revenue & Certificates",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-rev-tg",
        "description": "Statutory certificate issued by the Revenue Department (Tahsildar) certifying the total annual household income of the applicant or family. Essential for fee reimbursement, scholarship sanction, welfare housing, EWS reservations, and government hospital concessions.",
        "short_summary": "Obtain official proof of annual household income through MeeSeva or the Prajavani Revenue portal.",
        "eligibility_criteria": "Permanent resident of Telangana residing in the jurisdictional Mandal. Household income must be verified by local Revenue Inspector (RI) and Village Revenue Officer (VRO).",
        "official_url": "https://tg.meeseva.telangana.gov.in",
        "fee_structure": "MeeSeva Service Charge: ₹45 (Statutory Govt Fee: Nil, User Convenience Fee: ₹45).",
        "processing_time": "7 to 15 working days.",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-20",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-birth-cert",
        "service_code": "TG-MAUD-BRT-04",
        "title": "Birth Certificate Registration & Download",
        "category": "Civil Registration",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-maud-tg",
        "description": "Official vital registration of a birth under the Registration of Births and Deaths Act 1969. Provides conclusive legal proof of date of birth, parentage, and place of birth. Institutional hospital births are reported digitally within 21 days.",
        "short_summary": "Register or download official digital birth certificates for births within municipal or gram panchayat limits.",
        "eligibility_criteria": "Birth must have occurred within the municipal limits or gram panchayat jurisdiction. Institutional births reported by hospitals within 21 days qualify for direct search and print.",
        "official_url": "https://ghmc.gov.in/BirthAndDeath.aspx",
        "fee_structure": "Registration within 21 days: Free; Late registration (22-30 days): ₹2; Delayed (31 days - 1 year): ₹5 + Tahsildar order; MeeSeva digital copy print: ₹35 per certified copy.",
        "processing_time": "Instant download for pre-registered digital hospital births; 3-7 days for MeeSeva counter issuance.",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-12",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-caste-cert",
        "service_code": "TG-REV-CST-05",
        "title": "Caste & Integrated Community Certificate (SC/ST/BC)",
        "category": "Revenue & Certificates",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-rev-tg",
        "description": "Legal document validating an individual's community and caste classification under the Telangana Issue of Community, Nativity and Date of Birth Certificates Act. Mandatory for claiming educational reservations, fee concessions, and government recruitment benefits.",
        "short_summary": "Get official certification of community, nativity, and sub-caste status for education and employment reservations.",
        "eligibility_criteria": "Applicant must belong to recognized Scheduled Caste (SC), Scheduled Tribe (ST), or Backward Class (BC) list of Telangana. Parents must possess land or lineage records in the Mandal.",
        "official_url": "https://tg.meeseva.telangana.gov.in",
        "fee_structure": "MeeSeva application fee: ₹45 (inclusive of user charge and digital certificate generation).",
        "processing_time": "15 to 30 working days (requires local enquiry by Revenue Inspector).",
        "application_mode": "HYBRID",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-14",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-pan-card",
        "service_code": "ITD-PAN-06",
        "title": "Instant e-PAN & New Physical PAN Card (Form 49A)",
        "category": "Business & Taxation",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-itd",
        "description": "Issuance of 10-digit alphanumeric Permanent Account Number (PAN) by the Income Tax Department. Acts as primary national financial identifier for opening bank accounts, filing income tax returns, high-value financial transactions, and investments.",
        "short_summary": "Get instant paperless digital PAN within 10 minutes using Aadhaar e-KYC or order physical laminated card.",
        "eligibility_criteria": "Any Indian citizen with an Aadhaar number linked with an active mobile phone (for Instant e-PAN) or any individual with valid identity/address proof.",
        "official_url": "https://www.incometax.gov.in/iec/foportal/services/instant-epan",
        "fee_structure": "Instant digital e-PAN (via Income Tax Portal): FREE (₹0); Physical laminated card delivery (India): ₹107; Physical card (Foreign dispatch): ₹1,017.",
        "processing_time": "Instant e-PAN: 10 minutes (PDF download); Physical Card: 7-15 days dispatched via Speed Post.",
        "application_mode": "ONLINE",
        "target_audience": "ALL",
        "last_verified": "2026-09-22",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-aadhaar-update",
        "service_code": "UIDAI-ADH-07",
        "title": "Aadhaar Online Demographic Update & Document Revalidation",
        "category": "Identity & Citizenship",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-uidai",
        "description": "Service by the Unique Identification Authority of India allowing residents to update demographic information (Address, Name correction, Date of Birth with supporting documentary evidence) via the myAadhaar portal. Also facilitates periodic 10-year document revalidation.",
        "short_summary": "Update your residential address or re-validate identity and address documents online on myAadhaar.",
        "eligibility_criteria": "Existing 12-digit Aadhaar number holder with mobile phone registered with Aadhaar for receiving OTP.",
        "official_url": "https://myaadhaar.uidai.gov.in",
        "fee_structure": "Document Revalidation online: Free; Online Address Update: ₹50; Demographic update at Aadhaar Seva Kendra: ₹50; Biometric update: ₹100.",
        "processing_time": "5 to 15 working days post back-end verification against uploaded proofs.",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-25",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-voter-id",
        "service_code": "ECI-EPIC-08",
        "title": "New Voter Registration (Form 6) & Voter ID Download",
        "category": "Identity & Citizenship",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-eci",
        "description": "Constitutional citizen enrolment on the national electoral rolls administered by the Election Commission of India. Citizens completing 18 years can register on the National Voters' Service Portal (VSP) to obtain their digital and physical Elector's Photo Identity Card (e-EPIC).",
        "short_summary": "Register as a new voter online and download digitally signable digital e-EPIC card.",
        "eligibility_criteria": "Indian citizen residing in the assembly constituency who has turned 18 years of age (or turning 18 on the qualifying dates: 1 Jan, 1 Apr, 1 Jul, 1 Oct).",
        "official_url": "https://voters.eci.gov.in",
        "fee_structure": "Completely FREE (₹0). Electoral registration and issuance of first EPIC is an uncharged constitutional entitlement.",
        "processing_time": "15 to 30 days (subject to field verification by Booth Level Officer / BLO).",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-10",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-scholarship-epass",
        "service_code": "TG-WELF-SCH-09",
        "title": "Post-Matric Scholarship & Fee Reimbursement (ePASS)",
        "category": "Education & Scholarships",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-welf-tg",
        "description": "Comprehensive state government welfare scheme providing 100% Tuition Fee Reimbursement (RTF) and Maintenance Charges (MTF) to underprivileged college students pursuing Intermediate, ITI, Polytechnic, Degree, PG, Engineering, and Medical courses.",
        "short_summary": "Apply for complete tuition fee reimbursement and maintenance hostel allowance for higher education.",
        "eligibility_criteria": "Must be a native of Telangana admitted to recognized college. SC/ST annual parental income < ₹2,00,000; BC/EBC/Minority/Physically Challenged rural < ₹1,50,000 (urban < ₹2,00,000). Minimum 75% college attendance mandatory.",
        "official_url": "https://telanganaepass.cgg.gov.in",
        "fee_structure": "Completely FREE (₹0). MeeSeva scanning charges if done at external center: ~₹30.",
        "processing_time": "Sanctioned during state academic session following institutional verification and biometric authentication.",
        "application_mode": "ONLINE",
        "target_audience": "STUDENT",
        "last_verified": "2026-09-17",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-residence-cert",
        "service_code": "TG-REV-RES-10",
        "title": "Residence & Nativity Certificate",
        "category": "Revenue & Certificates",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-rev-tg",
        "description": "Official proof of continuous residence in a specified village, town, or city issued by the Revenue Department (Tahsildar). Required for quota admissions in state universities, civil service regional allocation, and welfare entitlements.",
        "short_summary": "Certify your domicile and permanent residential address through the local Tahsildar.",
        "eligibility_criteria": "Resident residing continuously in the state/district for a minimum qualifying period (ordinarily 4 to 7 years continuous study/living proof).",
        "official_url": "https://tg.meeseva.telangana.gov.in",
        "fee_structure": "MeeSeva Service Charge: ₹45 (Statutory Govt Fee: Nil, User Convenience Fee: ₹45).",
        "processing_time": "7 to 15 working days.",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-16",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-udyam-msme",
        "service_code": "MSME-UDY-11",
        "title": "Udyam MSME Business Registration",
        "category": "Business & Taxation",
        "country": "India",
        "state": "All-India",
        "department_id": "dept-msme",
        "description": "Zero-cost paperless national business registration portal by the Ministry of MSME. Provides a lifetime digital Udyam Registration Certificate with a dynamic QR code. Unlocks priority sector bank loans, collateral exemptions, and government tender preferences.",
        "short_summary": "Register your micro, small, or medium business enterprise online for free with zero document uploads.",
        "eligibility_criteria": "Any sole proprietorship, partnership firm, LLP, or private limited company in India with a valid Aadhaar and PAN linked with the promoter/director.",
        "official_url": "https://udyamregistration.gov.in",
        "fee_structure": "100% FREE (₹0). Beware of fraudulent intermediary websites that charge processing fees.",
        "processing_time": "Instant acknowledgment; certificate issued within 3-5 working days post CBDT/GSTN verification.",
        "application_mode": "ONLINE",
        "target_audience": "BUSINESS",
        "last_verified": "2026-09-24",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    },
    {
        "id": "srv-death-cert",
        "service_code": "TG-MAUD-DTH-12",
        "title": "Death Certificate Registration & Extract",
        "category": "Civil Registration",
        "country": "India",
        "state": "Telangana",
        "department_id": "dept-maud-tg",
        "description": "Statutory document issued by Municipal Corporation (GHMC) or Gram Panchayat certifying the demise of an individual. Essential for insurance claims, settlement of bank accounts, inheritance of property, and pension closure.",
        "short_summary": "Obtain certified legal proof of death from the municipal civil registrar.",
        "eligibility_criteria": "Demise occurred within the territorial jurisdiction of the municipality or panchayat. Cause of death certificate from attending physician/hospital required.",
        "official_url": "https://ghmc.gov.in/BirthAndDeath.aspx",
        "fee_structure": "Registration within 21 days: Free; Late registration (22-30 days): ₹2; Delayed registration up to 1 year: ₹5; Certified digital copy at MeeSeva: ₹35.",
        "processing_time": "Instant for pre-registered hospital cases; 3 to 7 working days for fresh registrations.",
        "application_mode": "ONLINE",
        "target_audience": "CITIZEN",
        "last_verified": "2026-09-11",
        "source_type": "GOVERNMENT_PORTAL",
        "verification_status": "VERIFIED",
        "is_active": True
    }
]

INITIAL_DOCUMENTS = [
    {
        "id": "doc-pass-1",
        "service_id": "srv-passport",
        "document_name": "Proof of Present Address (Aadhaar / Utility Bill / Bank Passbook)",
        "purpose": "Validates the current physical residential jurisdiction for police verification.",
        "accepted_formats": "Original + 1 Self-Attested Photocopy (PDF upload)",
        "is_original_required": True,
        "is_upload_required": True,
        "notes": "Must have applicant’s complete present address. Utility bills must not be older than 3 months.",
        "display_order": 1
    },
    {
        "id": "doc-pass-2",
        "service_id": "srv-passport",
        "document_name": "Proof of Date of Birth (Birth Certificate / SSC Certificate)",
        "purpose": "Conclusive legal proof of date of birth under Passport Rules.",
        "accepted_formats": "Original + 1 Photocopy (PDF upload)",
        "is_original_required": True,
        "is_upload_required": True,
        "notes": "For applicants born on or after 26/01/1989, Municipal Birth Certificate or School Leaving Certificate is accepted.",
        "display_order": 2
    },
    {
        "id": "doc-pass-3",
        "service_id": "srv-passport",
        "document_name": "Educational Qualification Proof (Class 10 / Matriculation Pass Certificate)",
        "purpose": "Determines eligibility for Non-ECR (Emigration Check Not Required) category status.",
        "accepted_formats": "Original + 1 Photocopy (PDF upload)",
        "is_original_required": True,
        "is_upload_required": True,
        "notes": "Submitting 10th pass certificate grants Non-ECR endorsement automatically.",
        "display_order": 3
    },
    {
        "id": "doc-pass-4",
        "service_id": "srv-passport",
        "document_name": "Old / Expired Passport (Original Booklet)",
        "purpose": "Required only in case of Passport Reissue.",
        "accepted_formats": "Original Booklet",
        "is_original_required": True,
        "is_upload_required": False,
        "notes": "Original old passport must be produced for physical cancellation at PSK counter.",
        "display_order": 4
    },
    {
        "id": "doc-dl-1",
        "service_id": "srv-driving-licence",
        "document_name": "Proof of Age (Aadhaar Card / School Certificate / Birth Certificate)",
        "purpose": "Validates compliance with minimum age requirements (18 years for LMV).",
        "accepted_formats": "PDF / JPG (Max 500KB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Aadhaar e-KYC can auto-verify age without separate document scan on Parivahan.",
        "display_order": 1
    },
    {
        "id": "doc-dl-2",
        "service_id": "srv-driving-licence",
        "document_name": "Proof of Present Address (Aadhaar / Voter ID / Passport / Electricity Bill)",
        "purpose": "Designates jurisdiction of Regional Transport Office (RTO).",
        "accepted_formats": "PDF / JPG (Max 500KB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Address on proof determines the RTO where practical driving test is taken.",
        "display_order": 2
    },
    {
        "id": "doc-dl-3",
        "service_id": "srv-driving-licence",
        "document_name": "Active Learner Licence (LLR) Number",
        "purpose": "Pre-requisite for booking permanent DL slot on Sarathi portal.",
        "accepted_formats": "Alphanumeric LL Number",
        "is_original_required": False,
        "is_upload_required": False,
        "notes": "Learner Licence must be between 30 and 180 days old.",
        "display_order": 3
    },
    {
        "id": "doc-inc-1",
        "service_id": "srv-income-cert",
        "document_name": "Aadhaar Card of Applicant & Family Head",
        "purpose": "Identity and biographical authentication.",
        "accepted_formats": "PDF / JPG (Max 2MB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Original must be presented if asked by Revenue Inspector.",
        "display_order": 1
    },
    {
        "id": "doc-inc-2",
        "service_id": "srv-income-cert",
        "document_name": "Ration Card / Food Security Card (FSC)",
        "purpose": "Validates family composition and economic tier.",
        "accepted_formats": "PDF / JPG (Max 2MB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Helpful for expedited verification by Village Revenue Officer.",
        "display_order": 2
    },
    {
        "id": "doc-inc-3",
        "service_id": "srv-income-cert",
        "document_name": "Self-Declaration Form / Income Affidavit",
        "purpose": "Sworn declaration of all annual household earnings from all sources.",
        "accepted_formats": "Signed Standard MeeSeva Form",
        "is_original_required": True,
        "is_upload_required": True,
        "notes": "Download official format from MeeSeva portal, sign, and upload.",
        "display_order": 3
    },
    {
        "id": "doc-brt-1",
        "service_id": "srv-birth-cert",
        "document_name": "Discharge Summary / Birth Slip from Hospital",
        "purpose": "Institutional proof of birth from obstetric ward with time and date.",
        "accepted_formats": "Original Hospital Slip",
        "is_original_required": True,
        "is_upload_required": True,
        "notes": "Hospital directly enters institutional births in CRS; slip has registration reference.",
        "display_order": 1
    },
    {
        "id": "doc-cst-1",
        "service_id": "srv-caste-cert",
        "document_name": "Father's / Sibling's Existing Caste Certificate or School Certificate",
        "purpose": "Conclusive lineage proof of recognized community status.",
        "accepted_formats": "PDF (Max 2MB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Strongest proof; speeds up Tahsildar approval without field hearing.",
        "display_order": 1
    },
    {
        "id": "doc-pan-1",
        "service_id": "srv-pan-card",
        "document_name": "Aadhaar Card with Linked Mobile Number",
        "purpose": "Sole required document for instant digital e-PAN (paperless e-KYC).",
        "accepted_formats": "12-digit Aadhaar Number",
        "is_original_required": False,
        "is_upload_required": False,
        "notes": "No paper scan required if doing instant Aadhaar OTP e-KYC.",
        "display_order": 1
    },
    {
        "id": "doc-vtr-1",
        "service_id": "srv-voter-id",
        "document_name": "Proof of Age (Birth Certificate, Aadhaar, SSC Marksheet)",
        "purpose": "Verifies eligibility date for electoral registration.",
        "accepted_formats": "PDF / JPG (Max 2MB)",
        "is_original_required": False,
        "is_upload_required": True,
        "notes": "Self-attested copy uploaded to Voter Portal.",
        "display_order": 1
    }
]

INITIAL_STEPS = [
    {
        "id": "stp-pass-1",
        "service_id": "srv-passport",
        "step_number": 1,
        "title": "Register on Official Passport Seva Portal",
        "description": "Visit portal2.passportindia.gov.in. Register using an active email ID and select your regional passport office. Beware of fake phishing domains.",
        "estimated_time": "15 minutes",
        "is_online_step": True,
        "tips": "Always verify the domain ends in .gov.in. No genuine agent login exists on private sites."
    },
    {
        "id": "stp-pass-2",
        "service_id": "srv-passport",
        "step_number": 2,
        "title": "Complete Application Form (Form 1)",
        "description": "Fill in personal particulars, parentage, spouse details, present residential address, and two local references with phone numbers.",
        "estimated_time": "30 minutes",
        "is_online_step": True,
        "tips": "Ensure spelling matches your Class 10 memo and Aadhaar precisely to prevent rejection."
    },
    {
        "id": "stp-pass-3",
        "service_id": "srv-passport",
        "step_number": 3,
        "title": "Pay Official Fee & Schedule PSK Appointment",
        "description": "Pay ₹1,500 online using SBI ePay / Netbanking / UPI and book an appointment slot at your nearest PSK or POPSK.",
        "estimated_time": "10 minutes",
        "is_online_step": True,
        "tips": "Appointments can be rescheduled up to 3 times within 1 year from the date of payment."
    },
    {
        "id": "stp-pass-4",
        "service_id": "srv-passport",
        "step_number": 4,
        "title": "Attend PSK Biometric & Document Verification Slot",
        "description": "Visit the PSK 15 minutes before slot with printed Appointment Slip and original documents plus 1 self-attested photocopy.",
        "estimated_time": "45-90 minutes at PSK",
        "is_online_step": False,
        "tips": "Counter A captures photo/fingerprints; Counter B verifies originals; Counter C approves issuance."
    },
    {
        "id": "stp-pass-5",
        "service_id": "srv-passport",
        "step_number": 5,
        "title": "Police Verification & Speed Post Delivery",
        "description": "Local police station will conduct physical address verification or use mPassport Police App. Upon clearance, passport is printed and dispatched via India Post.",
        "estimated_time": "7 to 20 days",
        "is_online_step": False,
        "tips": "Track parcel using Speed Post tracking number sent via official SMS."
    },
    {
        "id": "stp-dl-1",
        "service_id": "srv-driving-licence",
        "step_number": 1,
        "title": "Apply for Learner's Licence (LLR) Online",
        "description": "Access parivahan.gov.in -> Drivers/Learners Licence -> Select your State. Choose 'Application with Aadhaar Authentication' for contactless test from home without visiting RTO.",
        "estimated_time": "20 minutes",
        "is_online_step": True,
        "tips": "Aadhaar authentication allows taking the online road safety video and quiz test directly from home."
    },
    {
        "id": "stp-dl-2",
        "service_id": "srv-driving-licence",
        "step_number": 2,
        "title": "Watch Road Safety Tutorial & Pass Online Learner Test",
        "description": "Complete mandatory 15-minute road safety video tutorial on Sarathi portal. Take the 15-question road signs and traffic rules quiz (passing mark: 10/15).",
        "estimated_time": "30 minutes",
        "is_online_step": True,
        "tips": "You can re-attempt the test after 24 hours if you do not qualify on first attempt."
    },
    {
        "id": "stp-dl-3",
        "service_id": "srv-driving-licence",
        "step_number": 3,
        "title": "Download Instant Digital Learner's Licence (Form 3)",
        "description": "Once test is passed, download your digital Learner Licence immediately. Valid for 6 months across India.",
        "estimated_time": "5 minutes",
        "is_online_step": True,
        "tips": "Ensure you display red 'L' sign on vehicle while driving under supervision of a permanent DL holder."
    }
]

INITIAL_SOURCES = [
    {
        "id": "src-pass-01",
        "service_id": "srv-passport",
        "authority_name": "Consular, Passport and Visa Division, Ministry of External Affairs, Govt of India",
        "source_type": "GOVERNMENT_PORTAL",
        "source_url": "https://portal2.passportindia.gov.in/AppOnlineProject/online/feeSchedule",
        "document_title": "Passport Rules & Fee Schedule 2026",
        "publication_date": "2026-01-01",
        "last_checked_date": "2026-09-15",
        "authenticity_score": 100,
        "citation_text": "Official Ministry of External Affairs fee schedule and document advisory published under the Passports Act 1967.",
        "verification_badge": "OFFICIAL_VERIFIED"
    },
    {
        "id": "src-dl-01",
        "service_id": "srv-driving-licence",
        "authority_name": "Ministry of Road Transport and Highways, Govt of India",
        "source_type": "GOVERNMENT_PORTAL",
        "source_url": "https://parivahan.gov.in/parivahan//en/content/driving-licence-0",
        "document_title": "Central Motor Vehicles Rules 1989 - Rule 14 & 32 Fee Schedule",
        "publication_date": "2025-06-01",
        "last_checked_date": "2026-09-18",
        "authenticity_score": 100,
        "citation_text": "Parivahan Sarathi National Citizen Portal official fee structure and testing syllabus.",
        "verification_badge": "OFFICIAL_VERIFIED"
    },
    {
        "id": "src-inc-01",
        "service_id": "srv-income-cert",
        "authority_name": "Revenue Department, Government of Telangana",
        "source_type": "DEPARTMENT_ORDER",
        "source_url": "https://tg.meeseva.telangana.gov.in",
        "document_title": "G.O.Ms.No. 45 Revenue Guidelines on Digital Certificates",
        "publication_date": "2023-11-20",
        "last_checked_date": "2026-09-20",
        "authenticity_score": 100,
        "citation_text": "Official Telangana MeeSeva Citizen Charter for Tahsildar issuance of statutory income certificates.",
        "verification_badge": "OFFICIAL_VERIFIED"
    }
]

INITIAL_FAQS = [
    {
        "id": "faq-pass-1",
        "service_id": "srv-passport",
        "question": "Can I apply for an Indian passport without visiting the Passport Seva Kendra (PSK)?",
        "answer": "No. Physical appearance at the PSK or Post Office PSK is mandatory for capturing live biometric fingerprints, Iris scan, and live digital photograph.",
        "official_reference": "Passport Rules 1980, Rule 5",
        "display_order": 1
    },
    {
        "id": "faq-pass-2",
        "service_id": "srv-passport",
        "question": "What is the key difference between Normal and Tatkaal passport schemes?",
        "answer": "Normal scheme costs ₹1,500 and issues the passport after standard police verification (typically 15-30 days). Tatkaal costs ₹3,500 and issues the passport in 1 to 3 days on Post-Police Verification basis.",
        "official_reference": "MEA Citizen Charter Schedule 2",
        "display_order": 2
    },
    {
        "id": "faq-dl-1",
        "service_id": "srv-driving-licence",
        "question": "Can I give the Learner Licence test from home without going to the RTO?",
        "answer": "Yes. In most states (including Telangana, Maharashtra, Karnataka, Delhi), if you apply using Aadhaar authentication on parivahan.gov.in, you are eligible for the contactless online LL test from home.",
        "official_reference": "MoRTH Notification G.S.R. 138(E)",
        "display_order": 1
    }
]

INITIAL_VERIFICATIONS = [
    {
        "id": "vr-pass-01",
        "service_id": "srv-passport",
        "verified_by_user_id": "usr-admin-1",
        "status": "VERIFIED",
        "previous_status": "NEEDS_VERIFICATION",
        "findings": "Verified against Ministry of External Affairs portal2.passportindia.gov.in fee schedule and 2026 police verification guidelines. Fees confirmed at ₹1,500 for normal and ₹3,500 for tatkaal.",
        "verified_at": "2026-09-15T10:30:00Z",
        "source_url_checked": "https://portal2.passportindia.gov.in/AppOnlineProject/online/feeSchedule"
    },
    {
        "id": "vr-dl-01",
        "service_id": "srv-driving-licence",
        "verified_by_user_id": "usr-admin-1",
        "status": "VERIFIED",
        "previous_status": "NEEDS_VERIFICATION",
        "findings": "Cross-referenced against Parivahan Sarathi national rules and Central Motor Vehicles Rules 1989 fees. Contactless Aadhaar testing confirmed active.",
        "verified_at": "2026-09-18T11:15:00Z",
        "source_url_checked": "https://parivahan.gov.in/parivahan//en/content/driving-licence-0"
    }
]

INITIAL_USER_APPLICATIONS = [
    {
        "id": "app-demo-1",
        "user_id": "usr-citizen-1",
        "service_id": "srv-driving-licence",
        "service_title": "Learner's Licence & Permanent Driving Licence",
        "application_reference_number": "TS009/LLR/2026/89421",
        "applied_on": "2026-09-10",
        "status": "SUBMITTED",
        "next_action": "Complete online Road Safety Tutorial and take LL quiz",
        "notes": "Aadhaar e-KYC completed. Need to take online quiz before Oct 10.",
        "submission_portal_url": "https://parivahan.gov.in",
        "created_at": datetime.datetime.now().isoformat(),
        "updated_at": datetime.datetime.now().isoformat()
    }
]

INITIAL_APPLICATION_DOCUMENTS = [
    {
        "id": "appdoc-1",
        "application_id": "app-demo-1",
        "document_id": "doc-dl-1",
        "document_name": "Proof of Age (Aadhaar Card)",
        "status": "UPLOADED",
        "user_notes": "Verified via Aadhaar OTP"
    },
    {
        "id": "appdoc-2",
        "application_id": "app-demo-1",
        "document_id": "doc-dl-2",
        "document_name": "Proof of Present Address (Aadhaar)",
        "status": "UPLOADED",
        "user_notes": "Permanent residence Hyderabad address"
    }
]

INITIAL_REMINDERS = [
    {
        "id": "rem-1",
        "user_id": "usr-citizen-1",
        "service_id": "srv-driving-licence",
        "service_title": "Driving Licence",
        "title": "Book Permanent Driving Licence RTO Slot",
        "reminder_date": "2026-10-15",
        "notes": "Minimum 30 days completed since Learner Licence issuance. Book Kondapur RTO track slot.",
        "is_completed": False,
        "created_at": datetime.datetime.now().isoformat()
    }
]
