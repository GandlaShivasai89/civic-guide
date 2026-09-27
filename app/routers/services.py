from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.database import db

router = APIRouter(prefix="/api/services", tags=["Government Services"])

@router.get("/search")
async def search_services(
    q: str = Query("", description="Search query string"),
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None)
):
    results = db.search_services(query=q, category=category, state=state)
    return {
        "success": True,
        "count": len(results),
        "data": results
    }

@router.get("/departments")
async def get_departments():
    depts = db.get_departments()
    return {
        "success": True,
        "count": len(depts),
        "data": depts
    }

@router.get("/categories")
async def get_categories():
    services = db.get_all_services()
    cats = sorted(list(set(s.get("category") for s in services if s.get("category"))))
    return {
        "success": True,
        "count": len(cats),
        "data": cats
    }

@router.get("")
@router.get("/")
async def get_services(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    audience: Optional[str] = Query(None),
    mode: Optional[str] = Query(None)
):
    services = db.get_all_services(category=category, state=state, audience=audience, mode=mode)
    return {
        "success": True,
        "count": len(services),
        "data": services
    }

@router.get("/{service_id}")
async def get_service_by_id(service_id: str):
    srv = db.get_service_by_id(service_id)
    if not srv:
        raise HTTPException(status_code=404, detail="Government service not found")
    return {
        "success": True,
        "data": srv
    }

@router.get("/{service_id}/documents")
async def get_service_documents(service_id: str):
    srv = db.get_service_by_id(service_id)
    if not srv:
        raise HTTPException(status_code=404, detail="Government service not found")
    return {
        "success": True,
        "service_id": service_id,
        "count": len(srv.get("documents", [])),
        "data": srv.get("documents", [])
    }

@router.get("/{service_id}/steps")
async def get_service_steps(service_id: str):
    srv = db.get_service_by_id(service_id)
    if not srv:
        raise HTTPException(status_code=404, detail="Government service not found")
    return {
        "success": True,
        "service_id": service_id,
        "count": len(srv.get("steps", [])),
        "data": srv.get("steps", [])
    }

@router.get("/{service_id}/sources")
async def get_service_sources(service_id: str):
    srv = db.get_service_by_id(service_id)
    if not srv:
        raise HTTPException(status_code=404, detail="Government service not found")
    return {
        "success": True,
        "service_id": service_id,
        "count": len(srv.get("sources", [])),
        "data": srv.get("sources", [])
    }
