import sqlite3
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..database import get_db
from ..schemas import (
    VoiceScenarioRequest,
    VoiceAnalyzeResponse,
    FreezeToggleRequest,
    FreezeStatusResponse
)
from ..services.deepfake_analyzer import DeepfakeAnalyzerService
from ..audio_samples import SCENARIOS

router = APIRouter(prefix="/api/voice", tags=["AI Voice Clone Scam Analyzer"])

@router.get("/scenarios")
def list_scenarios():
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "caller": s["caller_claimed_identity"],
            "verdict": s["risk_verdict"],
            "deepfake_prob": s["deepfake_probability"],
            "urgency": s["urgency_score"],
            "preview": s["transcript"][:110] + "..."
        }
        for s in SCENARIOS.values()
    ]

@router.post("/analyze-scenario", response_model=VoiceAnalyzeResponse)
def analyze_scenario(request: VoiceScenarioRequest, conn: sqlite3.Connection = Depends(get_db)):
    if request.scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return DeepfakeAnalyzerService.analyze_scenario(conn, request.scenario_id)

@router.post("/analyze-upload", response_model=VoiceAnalyzeResponse)
async def analyze_upload(file: UploadFile = File(...), conn: sqlite3.Connection = Depends(get_db)):
    contents = await file.read()
    return DeepfakeAnalyzerService.analyze_uploaded_audio(conn, file.filename, contents)

@router.post("/toggle-freeze", response_model=FreezeStatusResponse)
def toggle_freeze(request: FreezeToggleRequest, conn: sqlite3.Connection = Depends(get_db)):
    result = DeepfakeAnalyzerService.set_freeze_status(
        conn=conn,
        action=request.action,
        duration_minutes=request.freeze_duration_minutes,
        reason=request.reason
    )
    return FreezeStatusResponse(**result)

@router.get("/freeze-status", response_model=FreezeStatusResponse)
def get_freeze_status(conn: sqlite3.Connection = Depends(get_db)):
    result = DeepfakeAnalyzerService.get_freeze_status(conn)
    return FreezeStatusResponse(**result)
