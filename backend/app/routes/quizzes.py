from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from ..schemas.mcq import MCQ as MCQSchema, QuizAttemptCreate, QuizResult
from ..utils.pdf_exporter import generate_quiz_pdf
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models.models import MCQ, User, QuizAttempt
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[MCQSchema])
async def get_all_mcqs(unit: str = None, topic: str = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.sql.expression import func
    stmt = select(MCQ)
    if unit:
        stmt = stmt.filter(MCQ.unit == unit)
    if topic and topic != 'Full Unit':
        stmt = stmt.filter(MCQ.topic == topic)
    
    # Randomize and limit
    stmt = stmt.order_by(func.random()).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/submit", response_model=QuizResult)
async def submit_quiz(attempt_data: QuizAttemptCreate, db: AsyncSession = Depends(get_db)):
    submissions = attempt_data.submissions
    total = len(submissions)
    correct = 0
    total_time = 0
    topic_scores = {}
    details = []
    
    for sub in submissions:
        result = await db.execute(select(MCQ).filter(MCQ.id == int(sub.mcq_id)))
        mcq = result.scalars().first()
        is_correct = False
        if mcq:
            topic = mcq.topic
            if topic not in topic_scores:
                topic_scores[topic] = {"total": 0, "correct": 0}
            topic_scores[topic]["total"] += 1
            
            if mcq.correct_option_id == sub.selected_option_id:
                correct += 1
                is_correct = True
                topic_scores[topic]["correct"] += 1
                
        total_time += sub.time_taken
        details.append({
            "question_id": sub.mcq_id,
            "selected_option_id": sub.selected_option_id,
            "is_correct": is_correct
        })
        
    accuracy = (correct / total) * 100 if total > 0 else 0
    avg_time = total_time / total if total > 0 else 0
    
    # Store full attempt in database
    new_attempt = QuizAttempt(
        user_id=attempt_data.user_id,
        topic=attempt_data.topic,
        score=correct,
        total_questions=total,
        time_taken_seconds=int(total_time),
        mode=attempt_data.mode,
        details=details
    )
    db.add(new_attempt)
    await db.commit()
    await db.refresh(new_attempt)
    
    return {
        "total_questions": total,
        "correct_answers": correct,
        "accuracy": accuracy,
        "average_time": avg_time,
        "topic_performance": topic_scores,
        "attempt_id": new_attempt.id
    }

@router.get("/history/{user_id}")
async def get_quiz_history(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(QuizAttempt)
        .filter(QuizAttempt.user_id == user_id)
        .order_by(QuizAttempt.created_at.desc())
    )
    attempts = result.scalars().all()
    return attempts
    
@router.get("/export/{attempt_id}")
async def export_quiz_pdf(attempt_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuizAttempt).filter(QuizAttempt.id == attempt_id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    mcq_ids = [int(d['question_id']) for d in attempt.details]
    result_mcqs = await db.execute(select(MCQ).filter(MCQ.id.in_(mcq_ids)))
    mcqs = result_mcqs.scalars().all()
    
    pdf_buffer = generate_quiz_pdf(attempt, mcqs)
    
    headers = {
        'Content-Disposition': f'attachment; filename="ManageMind_Quiz_Report_{attempt_id}.pdf"'
    }
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
