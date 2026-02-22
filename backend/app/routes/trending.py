from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.trending import TrendingTopic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models.models import TrendingTopic as TrendingTopicModel
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[TrendingTopic])
async def get_trending_topics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TrendingTopicModel))
    return result.scalars().all()

@router.post("/suggest", response_model=TrendingTopic)
async def suggest_topic(topic: TrendingTopic, db: AsyncSession = Depends(get_db)):
    topic_dict = topic.dict(by_alias=True, exclude={"id"})
    topic_dict["created_at"] = datetime.utcnow()
    topic_dict["approval_votes"] = 0
    topic_dict["is_live"] = False
    topic_dict["tags"] = topic_dict.get("tags", [])
    topic_dict["mcqs"] = topic_dict.get("mcqs", [])
    
    new_topic = TrendingTopicModel(**topic_dict)
    
    db.add(new_topic)
    await db.commit()
    await db.refresh(new_topic)
    return new_topic

@router.post("/{topic_id}/vote")
async def vote_topic(topic_id: int, vote_type: str, db: AsyncSession = Depends(get_db)):
    # vote_type: "approval" or "correction"
    result = await db.execute(select(TrendingTopicModel).filter(TrendingTopicModel.id == topic_id))
    topic = result.scalars().first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    if vote_type == "approval":
        topic.approval_votes += 1
    else:
        topic.correction_votes += 1
    
    # Check if needs auto-approval (e.g., > 60% which we'll simulate for now)
    if vote_type == "approval" and topic.approval_votes > 5: # Threshold example
        topic.is_live = True
        
    await db.commit()
    return {"message": "Vote recorded"}
