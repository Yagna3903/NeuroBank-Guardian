from fastapi import APIRouter, HTTPException
from services.agent_service import AgentService
from pydantic import BaseModel

class ExecuteActionRequest(BaseModel):
    user_id: str
    action: dict

router = APIRouter()

@router.get("/suggestions/{user_id}")
async def get_agent_suggestions(user_id: str):
    suggestions = await AgentService.get_suggestions(user_id)
    return suggestions

@router.post("/execute")
async def execute_agent_action(request: ExecuteActionRequest):
    result = await AgentService.execute_action(request.user_id, request.action)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result
