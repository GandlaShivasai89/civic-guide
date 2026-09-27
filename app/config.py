import os

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        PORT: int = int(os.getenv("PORT", 5000))
        HOST: str = os.getenv("HOST", "0.0.0.0")
        ENVIRONMENT: str = os.getenv("NODE_ENV", "production")
        JWT_SECRET: str = os.getenv("JWT_SECRET", "civicguide_super_secure_jwt_secret_key_2026")
        JWT_ALGORITHM: str = "HS256"
        JWT_EXPIRATION_DAYS: int = 7
        DATABASE_URL: str | None = os.getenv("DATABASE_URL", None)
        GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)

        class Config:
            env_file = ".env"
            extra = "ignore"

except ImportError:
    class Settings:
        PORT: int = int(os.getenv("PORT", 5000))
        HOST: str = os.getenv("HOST", "0.0.0.0")
        ENVIRONMENT: str = os.getenv("NODE_ENV", "production")
        JWT_SECRET: str = os.getenv("JWT_SECRET", "civicguide_super_secure_jwt_secret_key_2026")
        JWT_ALGORITHM: str = "HS256"
        JWT_EXPIRATION_DAYS: int = 7
        DATABASE_URL: str | None = os.getenv("DATABASE_URL", None)
        GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)

settings = Settings()
