from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NewsBase(BaseModel):
    title: str
    content: str
    category: str = "Technology"
    image_url: Optional[str] = None
    source_url: Optional[str] = None

class NewsCreate(NewsBase):
    pass

class News(NewsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
