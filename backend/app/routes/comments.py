from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models.models import Comment as CommentModel
from datetime import datetime

router = APIRouter()

class Comment(BaseModel):
    user_id: str
    username: str
    target_id: str # Trending Topic ID or Quiz ID
    content: str
    votes: int = 0
    replies: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True

class CommentResponse(Comment):
    id: int

@router.get("/{target_id}", response_model=List[CommentResponse])
async def get_comments(target_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CommentModel).filter(CommentModel.target_id == target_id))
    return result.scalars().all()

@router.post("/", response_model=CommentResponse)
async def add_comment(comment: Comment, db: AsyncSession = Depends(get_db)):
    comment_dict = comment.dict()
    new_comment = CommentModel(**comment_dict)
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    return new_comment

@router.post("/{comment_id}/vote")
async def vote_comment(comment_id: int, direction: int, db: AsyncSession = Depends(get_db)):
    # direction: 1 for upvote, -1 for downvote
    result = await db.execute(select(CommentModel).filter(CommentModel.id == comment_id))
    comment = result.scalars().first()
    if comment:
        comment.votes += direction
        await db.commit()
    return {"message": "Vote recorded"}
