from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models.models import TrendingTopic, PollVote as PollVoteModel, User

router = APIRouter()

class PollVoteSchema(BaseModel):
    user_id: int
    option_id: str

@router.post("/{trending_id}/vote")
async def vote_trending_poll(trending_id: int, vote: PollVoteSchema, db: AsyncSession = Depends(get_db)):
    # Verify User
    result = await db.execute(select(User).filter(User.id == vote.user_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify Topic and Poll
    result = await db.execute(select(TrendingTopic).filter(TrendingTopic.id == trending_id))
    topic = result.scalars().first()
    if not topic or not topic.poll:
        raise HTTPException(status_code=404, detail="Topic or Poll not found")
        
    # Strictly prevent Double Voting
    # In this simplified model, poll_id corresponds to the trending_id
    vote_result = await db.execute(
        select(PollVoteModel)
        .filter(PollVoteModel.poll_id == trending_id)
        .filter(PollVoteModel.user_id == vote.user_id)
    )
    if vote_result.scalars().first():
        raise HTTPException(status_code=400, detail="User has already voted on this poll")
        
    # Validate Option
    poll_data = dict(topic.poll)
    valid_option = False
    if "options" in poll_data:
        for opt in poll_data["options"]:
            if opt["id"] == vote.option_id:
                valid_option = True
                opt["votes"] = opt.get("votes", 0) + 1
                break
                
    if not valid_option:
        raise HTTPException(status_code=400, detail="Invalid poll option")
        
    # Record Vote Object
    new_vote = PollVoteModel(poll_id=trending_id, user_id=vote.user_id, option_id=vote.option_id)
    db.add(new_vote)
    
    # Update Topic Poll JSON with new counts
    topic.poll = poll_data
    
    await db.commit()
    return {"message": "Vote recorded successfully", "updated_poll": poll_data}
