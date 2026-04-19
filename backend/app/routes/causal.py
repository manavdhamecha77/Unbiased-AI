"""
/api/causal — Serve pre-computed causal DAG image.
"""

from fastapi import APIRouter
from app.config import STATIC_DIR

router = APIRouter()


@router.get("/causal/dag")
async def get_causal_dag():
    """
    Return the URL of the pre-computed causal DAG visualization.
    The actual image is served via FastAPI's StaticFiles mount.
    """
    return {
        "dag_image_url": "/static/causal_dag.png",
        "description": (
            "Causal DAG showing the relationship between sensitive attributes "
            "(race, sex) and the income prediction outcome. Computed using DoWhy."
        ),
    }
