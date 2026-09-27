/**
 * CivicGuide AI - Automated Integration & Verification Test Suite
 * Validates backend endpoints, RAG pipeline, multi-language support,
 * document checklist tracking, reminders, and admin verification logs.
 */

const BASE_URL = 'http://localhost:5000';

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🧪  STARTING CIVICGUIDE AI SYSTEM VERIFICATION TESTS');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('[Test 1] Health Check Endpoint');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok && healthData.status === 'healthy', 'Health check is operational');

    // 2. Services List
    console.log('\n[Test 2] Services Catalog');
    const srvRes = await fetch(`${BASE_URL}/api/services`);
    const srvData = await srvRes.json();
    assert(srvData.success && Array.isArray(srvData.data), 'Fetched services list');
    assert(srvData.data.length >= 10, `Catalog contains authentic services (found ${srvData.data.length})`);
    
    const passportSrv = srvData.data.find(s => s.id === 'srv-passport');
    assert(passportSrv && passportSrv.verification_status === 'VERIFIED', 'Passport service is loaded and verified');

    // 3. Search Services
    console.log('\n[Test 3] Smart Search & State Filtering');
    const searchRes = await fetch(`${BASE_URL}/api/services/search?q=driving`);
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.data.length > 0, 'Found driving licence service via search');
    assert(searchData.data[0].id === 'srv-driving-licence', 'Top search hit is Driving Licence');

    const stateFilterRes = await fetch(`${BASE_URL}/api/services?state=Telangana`);
    const stateFilterData = await stateFilterRes.json();
    assert(stateFilterData.data.some(s => s.state === 'Telangana'), 'State filtering for Telangana returns state revenue services');

    // 4. Detailed Service Breakdown: Documents, Steps, Sources
    console.log('\n[Test 4] Service Sub-resources (Documents, Steps, Sources)');
    const docsRes = await fetch(`${BASE_URL}/api/services/srv-passport/documents`);
    const docsData = await docsRes.json();
    assert(docsData.documents && docsData.documents.length >= 3, `Retrieved required documents for Passport (${docsData.documents.length} docs)`);

    const stepsRes = await fetch(`${BASE_URL}/api/services/srv-passport/steps`);
    const stepsData = await stepsRes.json();
    assert(stepsData.steps && stepsData.steps.length >= 4, `Retrieved step-by-step procedure (${stepsData.steps.length} steps)`);

    const sourcesRes = await fetch(`${BASE_URL}/api/services/srv-passport/sources`);
    const sourcesData = await sourcesRes.json();
    assert(sourcesData.sources && sourcesData.sources.length >= 1, `Retrieved official sources (${sourcesData.sources.length} sources)`);

    // 5. AI RAG Question Answering (English, Telugu, Hindi)
    console.log('\n[Test 5] AI RAG Pipeline & Multi-Language Generation');
    
    // English Query
    const aiEnRes = await fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What documents do I need for an income certificate in Telangana?', language: 'en' })
    });
    const aiEnData = await aiEnRes.json();
    assert(aiEnData.success && aiEnData.data.intent === 'DOCUMENTS', 'AI intent correctly classified as DOCUMENTS');
    assert(aiEnData.data.sources && aiEnData.data.sources.length > 0, 'AI response cites official sources');
    assert(aiEnData.data.answer.includes('Income Certificate'), 'AI response answers with target service details');

    // Telugu Query
    const aiTeRes = await fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'డ్రైవింగ్ లైసెన్స్ ఫీజు ఎంత?', language: 'te' })
    });
    const aiTeData = await aiTeRes.json();
    assert(aiTeData.success && aiTeData.data.language === 'te', 'AI generated localized response in Telugu (తెలుగు)');

    // Hindi Query
    const aiHiRes = await fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'जन्म प्रमाण पत्र के लिए कौन से दस्तावेज चाहिए?', language: 'hi' })
    });
    const aiHiData = await aiHiRes.json();
    assert(aiHiData.success && aiHiData.data.language === 'hi', 'AI generated localized response in Hindi (हिंदी)');

    // 6. Terminology Explanation
    console.log('\n[Test 6] Legal & Government Terminology Explanation');
    const expRes = await fetch(`${BASE_URL}/api/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: 'Non-ECR', language: 'en' })
    });
    const expData = await expRes.json();
    assert(expData.success && expData.explanation.includes('Emigration Check Not Required'), 'Explained Non-ECR passport endorsement');

    // 7. Personalized Guidance
    console.log('\n[Test 7] Personalized Guidance & Checklist Generation');
    const guideRes = await fetch(`${BASE_URL}/api/ai/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: 'India',
        state: 'Telangana',
        district: 'Hyderabad',
        ageGroup: 'ADULT_18_59',
        occupation: 'CITIZEN',
        serviceId: 'srv-passport'
      })
    });
    const guideData = await guideRes.json();
    assert(guideData.success && Array.isArray(guideData.personalizedChecklist), 'Generated personalized checklist');
    assert(guideData.personalizedChecklist.length >= 5, `Checklist contains ${guideData.personalizedChecklist.length} actionable steps`);

    // 8. Authentication (Citizen & Admin)
    console.log('\n[Test 8] Authentication System');
    const citizenLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@example.com', password: 'Password@123' })
    });
    const citizenLoginData = await citizenLoginRes.json();
    assert(citizenLoginRes.ok && citizenLoginData.data.token, 'Citizen login successful');
    const citizenToken = citizenLoginData.data.token;

    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@civicguide.gov.in', password: 'Password@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.ok && adminLoginData.data.user.role === 'admin', 'Administrator login successful');
    const adminToken = adminLoginData.data.token;

    // 9. Applications Tracker & Document Checklist Tracking
    console.log('\n[Test 9] Application Tracker & Document Checklist Progression');
    const newAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        service_id: 'srv-pan-card',
        application_reference_number: 'PAN-TEST-9921',
        status: 'SUBMITTED',
        next_action: 'Download e-PAN PDF in 10 minutes'
      })
    });
    const newAppData = await newAppRes.json();
    assert(newAppRes.ok && newAppData.data.id, 'Created new application in tracker');
    const appId = newAppData.data.id;

    // Update document status
    if (newAppData.data.documents && newAppData.data.documents.length > 0) {
      const docItem = newAppData.data.documents[0];
      const docUpdateRes = await fetch(`${BASE_URL}/api/applications/documents/${docItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${citizenToken}`
        },
        body: JSON.stringify({ status: 'READY', notes: 'Aadhaar OTP verified' })
      });
      const docUpdateData = await docUpdateRes.json();
      assert(docUpdateData.data.status === 'READY', 'Updated document checklist item to READY');
    }

    // 10. Reminders System
    console.log('\n[Test 10] Reminders System');
    const remRes = await fetch(`${BASE_URL}/api/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        title: 'Renew Driving Licence Test Reminder',
        reminder_date: '2026-11-20',
        service_id: 'srv-driving-licence',
        notes: 'Take vehicle to Kondapur RTO track'
      })
    });
    const remData = await remRes.json();
    assert(remRes.ok && remData.data.id, 'Created citizen reminder');

    // 11. Admin Service Management & Source Verification
    console.log('\n[Test 11] Admin Verification Audit');
    const verifyActionRes = await fetch(`${BASE_URL}/api/admin/services/srv-passport/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        findings: 'Automated test suite audit of official Passport Rules 2026.',
        source_url: 'https://portal2.passportindia.gov.in'
      })
    });
    const verifyActionData = await verifyActionRes.json();
    assert(verifyActionRes.ok && verifyActionData.data.status === 'VERIFIED', 'Admin recorded official verification action');

    const historyRes = await fetch(`${BASE_URL}/api/admin/verification-history`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const historyData = await historyRes.json();
    assert(historyData.count >= 1, `Verification audit history contains ${historyData.count} records`);

    console.log('\n=============================================================');
    console.log(`🏁  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error executing test suite:', err);
    process.exit(1);
  }
}

runTestSuite();
