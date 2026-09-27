from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.database import db
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    existing = db.find_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    pwd_hash = get_password_hash(payload.password)
    user = db.create_user({
        "email": payload.email,
        "password_hash": pwd_hash,
        "full_name": payload.full_name,
        "role": payload.role or "citizen",
        "country": payload.country or "India",
        "state": payload.state or "Telangana",
        "district": payload.district or "Hyderabad",
        "preferred_language": payload.preferred_language or "en"
    })

    token = create_access_token({
        "id": user["id"],
        "email": user["email"],
        "role": user["role"]
    })

    user_data = dict(user)
    user_data.pop("password_hash", None)

    return {
        "success": True,
        "message": "Account registered successfully",
        "data": {
            "token": token,
            "user": user_data
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = db.find_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token({
        "id": user["id"],
        "email": user["email"],
        "role": user["role"]
    })

    user_data = dict(user)
    user_data.pop("password_hash", None)

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": user_data
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = dict(current_user)
    user_data.pop("password_hash", None)
    return {
        "success": True,
        "data": user_data
    }
