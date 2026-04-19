"""
Application configuration loaded from environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend root
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
MODEL_DIR: Path = Path(__file__).resolve().parent.parent / "models"
DATA_DIR: Path = Path(__file__).resolve().parent.parent / "data"
STATIC_DIR: Path = Path(__file__).resolve().parent.parent / "static"
