import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.routers import auth, services, ai, applications, reminders, admin

app = FastAPI(
    title="CivicGuide AI – Government Process Assistant",
    description="Full-stack Python AI assistant helping citizens navigate government processes, document checklists, and eligibility rules.",
    version="1.0.0"
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    if not request.url.path.startswith("/api/health") and not request.url.path.startswith("/static"):
        print(f"[{request.method}] {request.url.path} - {response.status_code}")
    return response

# Register API Routers
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(ai.router)
app.include_router(applications.router)
app.include_router(reminders.router)
app.include_router(admin.router)

# Health check
@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "CivicGuide AI (Python Full Stack)",
        "framework": "FastAPI + Uvicorn",
        "frontend": "HTML5, CSS3, Modern JavaScript",
        "engine": "RAG Verification Engine",
        "version": "1.0.0"
    }

# Static file serving & SPA fallback
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        return JSONResponse(status_code=404, content={"success": False, "message": "API endpoint not found"})

    # Check for direct file match inside static/
    target_file = STATIC_DIR / full_path
    if full_path and target_file.is_file():
        return FileResponse(str(target_file))

    # Catch-all returns index.html
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))

    return JSONResponse(status_code=200, content={"message": "CivicGuide AI Python Full Stack Server is active."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
