from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth import optional_current_user
from app.models.schemas import ReminderCreate, ReminderUpdate

router = APIRouter(prefix="/api/reminders", tags=["Civic Reminders"])

@router.get("")
@router.get("/")
async def get_reminders(current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    reminders = db.get_reminders(user_id)
    return {
        "success": True,
        "count": len(reminders),
        "data": reminders
    }

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_reminder(
    payload: ReminderCreate,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    created = db.create_reminder({
        "user_id": user_id,
        "service_id": payload.service_id,
        "service_title": payload.service_title or "Government Process",
        "title": payload.title,
        "reminder_date": payload.reminder_date,
        "notes": payload.notes or ""
    })
    return {
        "success": True,
        "message": "Reminder created",
        "data": created
    }

@router.patch("/{reminder_id}")
async def toggle_reminder(
    reminder_id: str,
    payload: ReminderUpdate,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    updated = db.update_reminder(reminder_id, user_id, payload.is_completed)
    if not updated:
        raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
    return {
        "success": True,
        "data": updated
    }

@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(optional_current_user)
):
    user_id = current_user.get("id", "usr-citizen-1") if current_user else "usr-citizen-1"
    deleted = db.delete_reminder(reminder_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
    return {
        "success": True,
        "message": "Reminder deleted"
    }
