"""
CivicGuide AI - Comprehensive Python Full Stack Test Suite
Tests all REST API endpoints, AI RAG engine, Auth, Applications Tracker, Reminders, Admin, and Static Assets.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")

def test_services_catalog():
    resp = client.get("/api/services")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]) >= 10
    print(f"✅ Services catalog passed ({len(data['data'])} services)")

def test_services_search():
    resp = client.get("/api/services/search?q=passport")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert any("passport" in s["title"].lower() for s in data["data"])
    print("✅ Service search passed")

def test_services_filter_state():
    resp = client.get("/api/services?state=Telangana")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    print(f"✅ State filtering passed ({len(data['data'])} services)")

def test_service_sub_resources():
    resp = client.get("/api/services/srv-passport")
    assert resp.status_code == 200
    srv = resp.json()["data"]
    assert srv["id"] == "srv-passport"

    doc_resp = client.get("/api/services/srv-passport/documents")
    assert doc_resp.status_code == 200
    assert len(doc_resp.json()["data"]) > 0

    steps_resp = client.get("/api/services/srv-passport/steps")
    assert steps_resp.status_code == 200
    assert len(steps_resp.json()["data"]) > 0

    sources_resp = client.get("/api/services/srv-passport/sources")
    assert sources_resp.status_code == 200
    assert len(sources_resp.json()["data"]) > 0
    print("✅ Service sub-resources (docs, steps, sources) passed")

def test_ai_rag_multilingual():
    # English RAG query
    en_resp = client.post("/api/ai/ask", json={
        "query": "What documents are required for passport?",
        "serviceId": "srv-passport",
        "language": "en"
    })
    assert en_resp.status_code == 200
    en_data = en_resp.json()["data"]
    assert "passport" in en_data["answer"].lower()
    assert len(en_data["sources"]) > 0

    # Telugu RAG query
    te_resp = client.post("/api/ai/ask", json={
        "query": "పాస్‌పోర్ట్ కోసం ఏ డాక్యుమెంట్లు అవసరం?",
        "serviceId": "srv-passport",
        "language": "te"
    })
    assert te_resp.status_code == 200
    assert te_resp.json()["success"] is True

    # Hindi RAG query
    hi_resp = client.post("/api/ai/ask", json={
        "query": "पासपोर्ट के लिए कौन से दस्तावेज चाहिए?",
        "serviceId": "srv-passport",
        "language": "hi"
    })
    assert hi_resp.status_code == 200
    assert hi_resp.json()["success"] is True
    print("✅ AI RAG Engine passed (English, Telugu, Hindi)")

def test_ai_explain_and_guidance():
    exp_resp = client.post("/api/ai/explain", json={"term": "Non-ECR", "language": "en"})
    assert exp_resp.status_code == 200
    assert "emigration" in exp_resp.json()["explanation"].lower()

    guidance_resp = client.post("/api/ai/guidance", json={
        "country": "India",
        "state": "Telangana",
        "ageGroup": "ADULT_18_59",
        "occupation": "CITIZEN",
        "serviceId": "srv-driving-licence"
    })
    assert guidance_resp.status_code == 200
    assert len(guidance_resp.json()["personalizedChecklist"]) >= 5
    print("✅ AI Term explanation & Guidance Wizard passed")

def test_auth_and_protected_flows():
    # Citizen login
    login_resp = client.post("/api/auth/login", json={
        "email": "citizen@example.com",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # /api/auth/me
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["email"] == "citizen@example.com"

    # Create tracked application
    app_resp = client.post("/api/applications", json={
        "service_id": "srv-passport",
        "application_reference_number": "TEST-REF-9999",
        "status": "SUBMITTED"
    }, headers=headers)
    assert app_resp.status_code == 200
    app_id = app_resp.json()["data"]["id"]

    # Delete application
    del_resp = client.delete(f"/api/applications/{app_id}", headers=headers)
    assert del_resp.status_code == 200

    # Reminders
    rem_resp = client.post("/api/reminders", json={
        "title": "Renew Passport Test",
        "reminder_date": "2026-12-31"
    }, headers=headers)
    assert rem_resp.status_code == 201
    rem_id = rem_resp.json()["data"]["id"]

    rem_del = client.delete(f"/api/reminders/{rem_id}", headers=headers)
    assert rem_del.status_code == 200
    print("✅ Auth, Applications tracker, and Reminders passed")

def test_admin_flow():
    # Admin login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@civicguide.gov.in",
        "password": "Password@123"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Stats
    stats_resp = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_resp.status_code == 200
    assert stats_resp.json()["data"]["totalServices"] >= 10

    # Verify action
    verify_resp = client.post("/api/admin/services/srv-passport/verify", json={
        "status": "VERIFIED",
        "findings": "Automated verification against passportindia.gov.in gazette order",
        "source_url": "https://passportindia.gov.in"
    }, headers=admin_headers)
    assert verify_resp.status_code == 200
    print("✅ Admin console and verification audit passed")

def test_frontend_static_serving():
    # GET /
    index_resp = client.get("/")
    assert index_resp.status_code == 200
    assert "CivicGuide AI" in index_resp.text
    assert "root" in index_resp.text

    # GET /static/css/style.css
    css_resp = client.get("/static/css/style.css")
    assert css_resp.status_code == 200

    # GET /static/js/app.js
    js_resp = client.get("/static/js/app.js")
    assert js_resp.status_code == 200

    # GET React 18 & compiled graphics bundle
    react_resp = client.get("/static/js/vendor/react.min.js")
    assert react_resp.status_code == 200

    react_dom_resp = client.get("/static/js/vendor/react-dom.min.js")
    assert react_dom_resp.status_code == 200

    react_app_resp = client.get("/static/js/react_app.compiled.js")
    assert react_app_resp.status_code == 200
    assert "CivicApp" in react_app_resp.text
    print("✅ Pure HTML/CSS/JavaScript and React graphics assets serving passed")

if __name__ == "__main__":
    print("\n=======================================================")
    print("🏛️  Running CivicGuide AI Python Full Stack Tests")
    print("=======================================================")
    try:
        test_health()
        test_services_catalog()
        test_services_search()
        test_services_filter_state()
        test_service_sub_resources()
        test_ai_rag_multilingual()
        test_ai_explain_and_guidance()
        test_auth_and_protected_flows()
        test_admin_flow()
        test_frontend_static_serving()
        print("\n🎉 ALL TESTS PASSED! Python Full Stack is 100% verified.")
        print("=======================================================\n")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
