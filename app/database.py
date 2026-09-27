import datetime
import uuid
from typing import List, Dict, Any, Optional
from app.seed_data import (
    INITIAL_DEPARTMENTS, INITIAL_USERS, INITIAL_SERVICES,
    INITIAL_DOCUMENTS, INITIAL_STEPS, INITIAL_SOURCES,
    INITIAL_FAQS, INITIAL_VERIFICATIONS, INITIAL_USER_APPLICATIONS,
    INITIAL_APPLICATION_DOCUMENTS, INITIAL_REMINDERS
)

class Database:
    def __init__(self):
        self.users: List[Dict[str, Any]] = [dict(u) for u in INITIAL_USERS]
        self.departments: List[Dict[str, Any]] = [dict(d) for d in INITIAL_DEPARTMENTS]
        self.services: List[Dict[str, Any]] = [dict(s) for s in INITIAL_SERVICES]
        self.documents: List[Dict[str, Any]] = [dict(d) for d in INITIAL_DOCUMENTS]
        self.steps: List[Dict[str, Any]] = [dict(s) for s in INITIAL_STEPS]
        self.sources: List[Dict[str, Any]] = [dict(s) for s in INITIAL_SOURCES]
        self.faqs: List[Dict[str, Any]] = [dict(f) for f in INITIAL_FAQS]
        self.verifications: List[Dict[str, Any]] = [dict(v) for v in INITIAL_VERIFICATIONS]
        self.user_applications: List[Dict[str, Any]] = [dict(a) for a in INITIAL_USER_APPLICATIONS]
        self.application_docs: List[Dict[str, Any]] = [dict(d) for d in INITIAL_APPLICATION_DOCUMENTS]
        self.reminders: List[Dict[str, Any]] = [dict(r) for r in INITIAL_REMINDERS]
        self.saved_services: List[Dict[str, Any]] = [
            {"id": "save-1", "user_id": "usr-citizen-1", "service_id": "srv-passport", "created_at": datetime.datetime.now().isoformat()},
            {"id": "save-2", "user_id": "usr-citizen-1", "service_id": "srv-driving-licence", "created_at": datetime.datetime.now().isoformat()}
        ]

    def _enrich_service(self, service: Dict[str, Any]) -> Dict[str, Any]:
        s = dict(service)
        dept = next((d for d in self.departments if d["id"] == s.get("department_id")), None)
        docs = sorted([d for d in self.documents if d["service_id"] == s["id"]], key=lambda x: x.get("display_order", 1))
        steps = sorted([step for step in self.steps if step["service_id"] == s["id"]], key=lambda x: x.get("step_number", 1))
        sources = [src for src in self.sources if src["service_id"] == s["id"]]
        faqs = sorted([f for f in self.faqs if f["service_id"] == s["id"]], key=lambda x: x.get("display_order", 1))
        verifications = [v for v in self.verifications if v["service_id"] == s["id"]]

        s["department"] = dept
        s["documents"] = docs
        s["steps"] = steps
        s["sources"] = sources
        s["faqs"] = faqs
        s["verification_records"] = verifications
        return s

    def get_all_services(self, category: Optional[str] = None, state: Optional[str] = None,
                         audience: Optional[str] = None, mode: Optional[str] = None) -> List[Dict[str, Any]]:
        results = [self._enrich_service(s) for s in self.services]
        if category and category.upper() != "ALL":
            results = [s for s in results if s.get("category", "").lower() == category.lower()]
        if state and state.upper() != "ALL" and state != "All-India":
            results = [s for s in results if s.get("state") == "All-India" or s.get("state", "").lower() == state.lower()]
        if audience and audience.upper() != "ALL":
            results = [s for s in results if s.get("target_audience") in ("ALL", audience)]
        if mode and mode.upper() != "ALL":
            results = [s for s in results if s.get("application_mode") == mode]
        return results

    def get_service_by_id(self, service_id: str) -> Optional[Dict[str, Any]]:
        s = next((item for item in self.services if item["id"] == service_id or item.get("service_code") == service_id), None)
        return self._enrich_service(s) if s else None

    def search_services(self, query: str, category: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
        services = self.get_all_services(category=category, state=state)
        q = query.lower().strip()
        if not q:
            return services

        scored = []
        for s in services:
            score = 0
            title_l = s["title"].lower()
            desc_l = s.get("description", "").lower()
            code_l = s.get("service_code", "").lower()
            state_l = s.get("state", "").lower()

            if title_l == q:
                score += 100
            elif title_l.startswith(q):
                score += 50
            elif q in title_l:
                score += 30
            if q in code_l:
                score += 40
            if q in desc_l:
                score += 15
            if q in state_l:
                score += 15

            for word in q.split():
                if word in title_l:
                    score += 10
                if word in desc_l:
                    score += 3

            if score > 0:
                scored.append((score, s))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored]

    def create_service(self, data: Dict[str, Any]) -> Dict[str, Any]:
        srv_id = f"srv-{int(datetime.datetime.now().timestamp() * 1000)}"
        new_srv = {
            "id": srv_id,
            "service_code": data.get("service_code") or f"SRV-{int(datetime.datetime.now().timestamp())}",
            "title": data.get("title", "Untitled Service"),
            "category": data.get("category", "Identity & Citizenship"),
            "country": data.get("country", "India"),
            "state": data.get("state", "All-India"),
            "department_id": data.get("department_id", "dept-mea"),
            "description": data.get("description", ""),
            "short_summary": data.get("short_summary") or data.get("description", ""),
            "eligibility_criteria": data.get("eligibility_criteria", "Indian citizen meeting statutory rules"),
            "official_url": data.get("official_url", ""),
            "fee_structure": data.get("fee_structure", "Statutory Fee: Check Official Portal"),
            "processing_time": data.get("processing_time", "15-30 working days"),
            "application_mode": data.get("application_mode", "ONLINE"),
            "target_audience": data.get("target_audience", "CITIZEN"),
            "last_verified": datetime.date.today().isoformat(),
            "source_type": "GOVERNMENT_PORTAL",
            "verification_status": data.get("verification_status", "NEEDS_VERIFICATION"),
            "is_active": True,
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        self.services.insert(0, new_srv)
        return self._enrich_service(new_srv)

    def update_service(self, service_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for idx, s in enumerate(self.services):
            if s["id"] == service_id:
                clean_updates = {k: v for k, v in updates.items() if v is not None}
                self.services[idx].update(clean_updates)
                self.services[idx]["updated_at"] = datetime.datetime.now().isoformat()
                return self._enrich_service(self.services[idx])
        return None

    def verify_service(self, service_id: str, verified_by: str, status: str,
                       findings: str, source_url: str) -> Dict[str, Any]:
        prev_status = "NEEDS_VERIFICATION"
        for s in self.services:
            if s["id"] == service_id:
                prev_status = s.get("verification_status", "NEEDS_VERIFICATION")
                s["verification_status"] = status
                s["last_verified"] = datetime.date.today().isoformat()
                break

        rec = {
            "id": f"vr-{int(datetime.datetime.now().timestamp() * 1000)}",
            "service_id": service_id,
            "verified_by_user_id": verified_by,
            "status": status,
            "previous_status": prev_status,
            "findings": findings,
            "verified_at": datetime.datetime.now().isoformat(),
            "source_url_checked": source_url
        }
        self.verifications.insert(0, rec)
        return rec

    def get_verification_history(self, service_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if service_id:
            return [v for v in self.verifications if v["service_id"] == service_id]
        return self.verifications

    # --- Users ---
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return next((u for u in self.users if u["email"].lower() == email.lower()), None)

    def find_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return next((u for u in self.users if u["id"] == user_id), None)

    def create_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = f"usr-{int(datetime.datetime.now().timestamp() * 1000)}"
        new_user = {
            "id": user_id,
            "email": data["email"],
            "password_hash": data["password_hash"],
            "full_name": data.get("full_name", "Citizen"),
            "role": data.get("role", "citizen"),
            "country": data.get("country", "India"),
            "state": data.get("state", "Telangana"),
            "district": data.get("district", "Hyderabad"),
            "preferred_language": data.get("preferred_language", "en"),
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        self.users.append(new_user)
        return new_user

    # --- Applications Tracker ---
    def get_user_applications(self, user_id: str) -> List[Dict[str, Any]]:
        apps = [dict(a) for a in self.user_applications if a["user_id"] == user_id]
        for a in apps:
            a["documents"] = [d for d in self.application_docs if d["application_id"] == a["id"]]
        return apps

    def create_application(self, data: Dict[str, Any]) -> Dict[str, Any]:
        app_id = f"app-{int(datetime.datetime.now().timestamp() * 1000)}"
        new_app = {
            "id": app_id,
            "user_id": data["user_id"],
            "service_id": data["service_id"],
            "service_title": data.get("service_title", "Government Service"),
            "application_reference_number": data.get("application_reference_number", ""),
            "applied_on": data.get("applied_on") or datetime.date.today().isoformat(),
            "status": data.get("status", "DRAFT"),
            "next_action": data.get("next_action", "Prepare documentation"),
            "notes": data.get("notes", ""),
            "submission_portal_url": data.get("submission_portal_url", ""),
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        self.user_applications.insert(0, new_app)

        # populate service documents for checklist
        service_docs = [d for d in self.documents if d["service_id"] == new_app["service_id"]]
        for doc in service_docs:
            self.application_docs.append({
                "id": f"appdoc-{uuid.uuid4().hex[:8]}",
                "application_id": app_id,
                "document_id": doc["id"],
                "document_name": doc["document_name"],
                "status": "NOT_READY",
                "user_notes": ""
            })

        new_app["documents"] = [d for d in self.application_docs if d["application_id"] == app_id]
        return new_app

    def update_application(self, app_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for idx, a in enumerate(self.user_applications):
            if a["id"] == app_id and a["user_id"] == user_id:
                clean = {k: v for k, v in updates.items() if v is not None}
                self.user_applications[idx].update(clean)
                self.user_applications[idx]["updated_at"] = datetime.datetime.now().isoformat()
                res = dict(self.user_applications[idx])
                res["documents"] = [d for d in self.application_docs if d["application_id"] == app_id]
                return res
        return None

    def delete_application(self, app_id: str, user_id: str) -> bool:
        init_len = len(self.user_applications)
        self.user_applications = [a for a in self.user_applications if not (a["id"] == app_id and a["user_id"] == user_id)]
        self.application_docs = [d for d in self.application_docs if d["application_id"] != app_id]
        return len(self.user_applications) < init_len

    def update_application_doc_status(self, doc_id: str, status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        for idx, d in enumerate(self.application_docs):
            if d["id"] == doc_id:
                self.application_docs[idx]["status"] = status
                if notes is not None:
                    self.application_docs[idx]["user_notes"] = notes
                self.application_docs[idx]["updated_at"] = datetime.datetime.now().isoformat()
                return self.application_docs[idx]
        return None

    # --- Saved Services ---
    def get_saved_services(self, user_id: str) -> List[Dict[str, Any]]:
        saved_ids = [s["service_id"] for s in self.saved_services if s["user_id"] == user_id]
        return [self._enrich_service(s) for s in self.services if s["id"] in saved_ids]

    def toggle_saved_service(self, user_id: str, service_id: str) -> bool:
        for idx, s in enumerate(self.saved_services):
            if s["user_id"] == user_id and s["service_id"] == service_id:
                self.saved_services.pop(idx)
                return False
        self.saved_services.append({
            "id": f"save-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "service_id": service_id,
            "created_at": datetime.datetime.now().isoformat()
        })
        return True

    # --- Reminders ---
    def get_reminders(self, user_id: str) -> List[Dict[str, Any]]:
        return [dict(r) for r in self.reminders if r["user_id"] == user_id]

    def create_reminder(self, data: Dict[str, Any]) -> Dict[str, Any]:
        rem_id = f"rem-{int(datetime.datetime.now().timestamp() * 1000)}"
        new_rem = {
            "id": rem_id,
            "user_id": data["user_id"],
            "service_id": data.get("service_id"),
            "service_title": data.get("service_title", "Government Process"),
            "title": data["title"],
            "reminder_date": data["reminder_date"],
            "notes": data.get("notes", ""),
            "is_completed": False,
            "created_at": datetime.datetime.now().isoformat()
        }
        self.reminders.append(new_rem)
        return new_rem

    def update_reminder(self, rem_id: str, user_id: str, is_completed: bool) -> Optional[Dict[str, Any]]:
        for idx, r in enumerate(self.reminders):
            if r["id"] == rem_id and r["user_id"] == user_id:
                self.reminders[idx]["is_completed"] = is_completed
                return self.reminders[idx]
        return None

    def delete_reminder(self, rem_id: str, user_id: str) -> bool:
        init_len = len(self.reminders)
        self.reminders = [r for r in self.reminders if not (r["id"] == rem_id and r["user_id"] == user_id)]
        return len(self.reminders) < init_len

    def get_departments(self) -> List[Dict[str, Any]]:
        return self.departments

db = Database()
