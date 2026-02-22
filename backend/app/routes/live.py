from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import random, string, json
from ..database import get_db
from ..models.models import LiveSession, LiveParticipant, User, MCQ
from ..utils.rate_limit import limiter
from ..utils.ai_generator import generate_mcqs_sync

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────

class SyllabusSelection(BaseModel):
    point: str
    count: int

class CreateAdvancedSession(BaseModel):
    host_id: int
    duration_minutes: int
    syllabus_selections: List[SyllabusSelection]

class AnswerSubmit(BaseModel):
    mcq_id: int
    selected_option_id: str

class ParticipantSubmit(BaseModel):
    user_id: int
    answers: List[AnswerSubmit]
    time_taken_seconds: int

# ── Helpers ───────────────────────────────────────────────────────────────

def generate_exam_id(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/create")
async def create_session(topic: str, duration_minutes: int, host_id: int, unit: str = None, db: AsyncSession = Depends(get_db)):
    """Basic host mode - uses existing MCQs filtered by unit and topic."""
    exam_id = generate_exam_id()
    result = await db.execute(select(LiveSession).filter(LiveSession.exam_id == exam_id))
    if result.scalars().first():
        exam_id = generate_exam_id()

    session = LiveSession(
        host_id=host_id,
        exam_id=exam_id,
        unit=unit,
        topic=topic,
        duration_minutes=duration_minutes
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {
        "id": session.id,
        "exam_id": session.exam_id,
        "unit": session.unit,
        "topic": session.topic,
        "duration_minutes": session.duration_minutes,
        "status": session.status,
        "has_ai_questions": False
    }


@router.post("/create-advanced")
async def create_advanced_session(payload: CreateAdvancedSession, db: AsyncSession = Depends(get_db)):
    """Teacher Advanced Mode - AI generates questions per syllabus point."""
    exam_id = generate_exam_id()
    result = await db.execute(select(LiveSession).filter(LiveSession.exam_id == exam_id))
    if result.scalars().first():
        exam_id = generate_exam_id()

    # Build the AI question pool
    all_ai_questions = []
    topic_label = ", ".join(s.point for s in payload.syllabus_selections)

    for sel in payload.syllabus_selections:
        qs = generate_mcqs_sync(sel.point, sel.count)
        # Give each an in-memory id (negative to distinguish from DB ids)
        for i, q in enumerate(qs):
            q["_ai_idx"] = len(all_ai_questions) + i
            q["topic"] = "AI"
        all_ai_questions.extend(qs)

    has_ai = len(all_ai_questions) > 0

    session = LiveSession(
        host_id=payload.host_id,
        exam_id=exam_id,
        topic=topic_label,
        duration_minutes=payload.duration_minutes,
        mcqs=all_ai_questions if has_ai else None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "id": session.id,
        "exam_id": session.exam_id,
        "topic": session.topic,
        "duration_minutes": session.duration_minutes,
        "status": session.status,
        "has_ai_questions": has_ai,
        "question_count": len(all_ai_questions)
    }


@router.get("/by-code/{exam_id}")
async def get_session_by_code(exam_id: str, db: AsyncSession = Depends(get_db)):
    """Lookup session by exam code (for student join flow)."""
    result = await db.execute(select(LiveSession).filter(LiveSession.exam_id == exam_id.upper()))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": session.id,
        "exam_id": session.exam_id,
        "topic": session.topic,
        "status": session.status,
        "duration_minutes": session.duration_minutes,
        "has_ai_questions": bool(session.mcqs)
    }


@router.post("/join/{exam_id}")
@limiter.limit("10/minute")
async def join_session(request: Request, exam_id: str, user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.exam_id == exam_id.upper()))
    session = result.scalars().first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status == "finished":
        raise HTTPException(status_code=400, detail="Session has already ended")

    # Allow joining waiting OR active sessions
    part_result = await db.execute(
        select(LiveParticipant)
        .filter(and_(LiveParticipant.session_id == session.id, LiveParticipant.user_id == user_id))
    )
    existing = part_result.scalars().first()
    if existing:
        return {"session_id": session.id, "message": "Already joined", "status": session.status}

    participant = LiveParticipant(session_id=session.id, user_id=user_id)
    db.add(participant)
    await db.commit()
    return {"session_id": session.id, "message": "Successfully joined", "status": session.status}


@router.get("/{session_id}/status")
async def get_session_status(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    part_result = await db.execute(select(LiveParticipant).filter(LiveParticipant.session_id == session.id))
    participants = part_result.scalars().all()

    return {
        "id": session.id,
        "status": session.status,
        "unit": session.unit,
        "topic": session.topic,
        "duration_minutes": session.duration_minutes,
        "started_at": session.started_at,
        "participants_count": len(participants),
        "has_ai_questions": bool(session.mcqs)
    }


@router.get("/{session_id}/questions")
async def get_session_questions(session_id: int, db: AsyncSession = Depends(get_db)):
    """Returns questions for an active session (AI-generated or from DB by topic)."""
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail="Session is not active yet")

    if session.mcqs:
        # Add temporary IDs for AI questions
        questions = []
        for i, q in enumerate(session.mcqs):
            questions.append({
                "id": f"ai_{session_id}_{i}",
                "topic": "AI",
                "question": q.get("question"),
                "options": q.get("options"),
                "correct_option_id": q.get("correct_option_id"),
                # Don't send explanation during quiz
            })
        return questions
    else:
        # Use filtered DB questions
        stmt = select(MCQ)
        if session.unit:
            stmt = stmt.filter(MCQ.unit == session.unit)
        if session.topic and session.topic != 'Full Unit':
            stmt = stmt.filter(MCQ.topic == session.topic)
            
        mcq_result = await db.execute(stmt)
        mcqs = mcq_result.scalars().all()
        return [
            {
                "id": m.id,
                "topic": m.topic,
                "question": m.question,
                "options": m.options,
                "correct_option_id": m.correct_option_id
                # No explanation here either
            }
            for m in mcqs
        ]


@router.post("/{session_id}/start")
async def start_session(session_id: int, host_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()

    if not session or session.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized to start this session")
    if session.status != "waiting":
        raise HTTPException(status_code=400, detail="Session already started or finished")

    session.status = "active"
    session.started_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Session started", "started_at": session.started_at}


@router.post("/{session_id}/end")
async def end_session(session_id: int, host_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()

    if not session or session.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if session.status == "finished":
        return {"message": "Already finished"}

    session.status = "finished"
    await db.commit()
    return {"message": "Session ended"}


@router.post("/{session_id}/submit")
async def submit_exam(session_id: int, payload: ParticipantSubmit, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()

    if not session or session.status != "active":
        raise HTTPException(status_code=400, detail="Session is not active")

    part_result = await db.execute(
        select(LiveParticipant)
        .filter(and_(LiveParticipant.session_id == session_id, LiveParticipant.user_id == payload.user_id))
    )
    participant = part_result.scalars().first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    if participant.submitted_at:
        raise HTTPException(status_code=400, detail="Already submitted")

    # Score calculation
    correct = 0
    answers_detail = []

    if session.mcqs:
        # AI questions: build lookup by index
        ai_questions = {f"ai_{session_id}_{i}": q for i, q in enumerate(session.mcqs)}
        for ans in payload.answers:
            q = ai_questions.get(str(ans.mcq_id))
            if q:
                is_correct = ans.selected_option_id == q.get("correct_option_id")
                if is_correct:
                    correct += 1
                answers_detail.append({
                    "mcq_id": str(ans.mcq_id),
                    "selected": ans.selected_option_id,
                    "is_correct": is_correct
                })
    else:
        # DB questions
        mcq_ids = [ans.mcq_id for ans in payload.answers if isinstance(ans.mcq_id, int)]
        if mcq_ids:
            mcq_result = await db.execute(select(MCQ).filter(MCQ.id.in_(mcq_ids)))
            mcq_map = {m.id: m for m in mcq_result.scalars().all()}
            for ans in payload.answers:
                mcq = mcq_map.get(ans.mcq_id)
                if mcq:
                    is_correct = ans.selected_option_id == mcq.correct_option_id
                    if is_correct:
                        correct += 1
                    answers_detail.append({
                        "mcq_id": ans.mcq_id,
                        "selected": ans.selected_option_id,
                        "is_correct": is_correct
                    })

    participant.score = correct
    participant.answers = answers_detail
    participant.time_taken_seconds = payload.time_taken_seconds
    participant.submitted_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Submitted", "score": correct, "total": len(answers_detail)}


@router.get("/{session_id}/leaderboard")
async def get_leaderboard(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveSession).filter(LiveSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    part_result = await db.execute(
        select(LiveParticipant, User.username, User.full_name)
        .join(User, LiveParticipant.user_id == User.id)
        .filter(LiveParticipant.session_id == session_id)
        .filter(LiveParticipant.submitted_at.is_not(None))
        .order_by(LiveParticipant.score.desc(), LiveParticipant.time_taken_seconds.asc())
    )

    leaderboard = []
    for rank, (participant, username, full_name) in enumerate(part_result.all(), start=1):
        leaderboard.append({
            "rank": rank,
            "user_id": participant.user_id,
            "username": username,
            "full_name": full_name or username,
            "score": participant.score or 0,
            "time_taken_seconds": participant.time_taken_seconds or 0,
            "submitted_at": participant.submitted_at
        })

    return {
        "session": {
            "exam_id": session.exam_id,
            "topic": session.topic,
            "status": session.status
        },
        "leaderboard": leaderboard
    }
