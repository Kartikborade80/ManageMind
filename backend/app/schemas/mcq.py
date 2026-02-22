from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MCQOption(BaseModel):
    id: str
    text: str

class MCQ(BaseModel):
    id: Optional[int] = None
    topic: str  # 5.5 or 5.6
    question: str
    options: List[MCQOption]
    correct_option_id: str
    explanation: str
    
    class Config:
        from_attributes = True

class MCQSubmission(BaseModel):
    mcq_id: int
    selected_option_id: str
    time_taken: float

class QuizAttemptCreate(BaseModel):
    user_id: int
    topic: str
    mode: str = "practice"
    submissions: List[MCQSubmission]

class QuizResult(BaseModel):
    total_questions: int
    correct_answers: int
    accuracy: float
    average_time: float
    topic_performance: Dict[str, Any]  # e.g., {"5.5": {"total": 5, "correct": 4}}
    attempt_id: Optional[int] = None
