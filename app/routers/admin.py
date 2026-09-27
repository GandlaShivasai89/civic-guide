from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import db
from app.auth import require_admin
from app.ai.verifier import SourceVerifier
from app.models.schemas import ServiceCreate, ServiceUpdate, VerificationAction

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"], dependencies=[Depends(require_admin)])

@router.get("/stats")
async def get_admin_stats(current_user: Dict[str, Any] = Depends(require_admin)):
    all_services = db.get_all_services()
    verified = len([s for s in all_services if s.get("verification_status") == "VERIFIED"])
    pending = len([s for s in all_services if s.get("verification_status") == "NEEDS_VERIFICATION"])
    conflicting = len([s for s in all_services if s.get("verification_status") == "CONFLICTING"])
    total_verifications = len(db.get_verification_history())

    return {
        "success": True,
        "data": {
            "totalServices": len(all_services),
            "verifiedServices": verified,
            "pendingReview": pending,
            "conflictingSources": conflicting,
            "totalAuditRecords": total_verifications
        }
    }

@router.post("/services", status_code=201)
async def create_service(
    payload: ServiceCreate,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    srv_data = payload.dict()
    if srv_data.get("official_url"):
        url_val = SourceVerifier.verify_url(srv_data["official_url"])
        if not url_val.get("is_official"):
            srv_data["verification_status"] = "NEEDS_VERIFICATION"

    created = db.create_service(srv_data)
    return {
        "success": True,
        "message": "Government service created",
        "data": created
    }

@router.patch("/services/{service_id}")
async def update_service(
    service_id: str,
    payload: ServiceUpdate,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    updated = db.update_service(service_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Government service not found")
    return {
        "success": True,
        "message": "Service updated successfully",
        "data": updated
    }

@router.post("/services/{service_id}/verify")
async def verify_service_action(
    service_id: str,
    payload: VerificationAction,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    admin_id = current_user.get("id", "usr-admin-1")
    record = db.verify_service(
        service_id=service_id,
        verified_by=admin_id,
        status=payload.status,
        findings=payload.findings or "Official review completed by administrator.",
        source_url=payload.source_url or "https://services.india.gov.in"
    )
    return {
        "success": True,
        "message": "Verification status recorded",
        "data": record
    }

@router.get("/verification-history")
async def get_verification_history(
    serviceId: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    records = db.get_verification_history(service_id=serviceId)
    return {
        "success": True,
        "count": len(records),
        "data": records
    }
