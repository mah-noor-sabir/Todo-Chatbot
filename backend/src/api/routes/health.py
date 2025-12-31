"""
Health check endpoint.
Used for monitoring and load balancer health checks.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns 200 OK if service is operational.

    Returns:
        dict: Status indicator

    Example Response:
        {"status": "ok"}
    """
    return {"status": "ok"}
