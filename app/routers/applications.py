from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import db
from app.auth import optional_current_user
from app.models.schemas import UserApplicationCreate, UserApplicationUpdate, ApplicationDocStatusUpdate

router = APIRouter(prefix="/api/applications", tags=["Applications & Checklists"])

class ToggleSavedRequest(BaseModel):
    serviceId: str

@router.get("")
@router.get("/")
async def get_user_applications(current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    apps = db.get_user_applications(user_id)
    return {
        "success": True,
        "count": len(apps),
        "data": apps
    }

@router.post("")
@router.post("/")
async def create_user_application(
    payload: UserApplicationCreate,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    
    # lookup service title if not provided
    service_title = payload.service_title
    if not service_title:
        srv = db.get_service_by_id(payload.service_id)
        if srv:
            service_title = srv.get("title")

    app_data = payload.dict()
    app_data["user_id"] = user_id
    app_data["service_title"] = service_title or "Government Service"

    created = db.create_application(app_data)
    return {
        "success": True,
        "message": "Application added to tracking dashboard",
        "data": created
    }

@router.patch("/{app_id}")
async def update_user_application(
    app_id: str,
    payload: UserApplicationUpdate,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    updated = db.update_application(app_id, user_id, payload.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Tracked application not found")
    return {
        "success": True,
        "message": "Application record updated successfully",
        "data": updated
    }

@router.delete("/{app_id}")
async def delete_user_application(
    app_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    deleted = db.delete_application(app_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tracked application not found")
    return {
        "success": True,
        "message": "Application removed from tracker"
    }

@router.patch("/documents/{doc_id}")
async def update_document_status(
    doc_id: str,
    payload: ApplicationDocStatusUpdate,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    updated = db.update_application_doc_status(doc_id, payload.status, payload.notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Application document item not found")
    return {
        "success": True,
        "message": "Document readiness updated",
        "data": updated
    }

@router.get("/saved")
async def get_saved_services(current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    saved = db.get_saved_services(user_id)
    return {
        "success": True,
        "count": len(saved),
        "data": saved
    }

@router.post("/saved/toggle")
async def toggle_saved_service(
    payload: ToggleSavedRequest,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    is_saved = db.toggle_saved_service(user_id, payload.serviceId)
    return {
        "success": True,
        "isSaved": is_saved,
        "message": "Saved to bookmarks" if is_saved else "Removed from bookmarks"
    }
