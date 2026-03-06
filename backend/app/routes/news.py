from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.news import News as NewsSchema
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models.models import News as NewsModel

router = APIRouter()

@router.get("/", response_model=List[NewsSchema])
async def get_news(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsModel).order_by(NewsModel.created_at.desc()))
    news_items = result.scalars().all()
    
    # If no news, return some mock tech news for demonstration
    if not news_items:
        mock_news = [
            {
                "id": 1,
                "title": "Quantum Computing Reaches New Milestone",
                "content": "Researchers have achieved a new level of coherence in superconducting qubits, bringing us closer to practical quantum advantage.",
                "category": "Technology",
                "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
                "created_at": "2024-03-20T10:00:00"
            },
            {
                "id": 2,
                "title": "AI in Sustainable Energy Management",
                "content": "New AI models are optimizing power grid distribution, reducing waste and integrating renewable sources more efficiently than ever.",
                "category": "Sustainability",
                "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
                "created_at": "2024-03-19T14:30:00"
            },
            {
                "id": 3,
                "title": "The Future of Edge Computing in 2024",
                "content": "As IoT devices become more sophisticated, processing data at the edge is becoming a critical requirement for low-latency applications.",
                "category": "Cloud",
                "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
                "created_at": "2024-03-18T09:00:00"
            }
        ]
        return mock_news
        
    return news_items
