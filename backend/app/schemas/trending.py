from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PollOption(BaseModel):
    id: str
    text: str
    votes: int = 0

class TrendingTopic(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    author: str = "Admin"
    article_content: str = ""
    real_world_example: str = ""
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approval_votes: int = 0
    correction_votes: int = 0
    is_live: bool = False
    mcqs: List[dict] = []  # Embedded MCQs for the topic
    poll: Optional[dict] = None  # Related poll
    
    class Config:
        from_attributes = True
