from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    quiz_history = Column(JSON, default=list)
    badges = Column(JSON, default=list)
    
    # Profile Expansion
    roll_number = Column(String, nullable=True)
    course = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    college_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

class MCQ(Base):
    __tablename__ = "mcqs"

    id = Column(Integer, primary_key=True, index=True)
    unit = Column(String, index=True, nullable=True)
    topic = Column(String, index=True, nullable=False)
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=False)  # List of Option dicts
    correct_option_id = Column(String, nullable=False)
    explanation = Column(String, nullable=False)

class TrendingTopic(Base):
    __tablename__ = "trending_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    author = Column(String, default="Admin")
    article_content = Column(String, nullable=True)
    real_world_example = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    approval_votes = Column(Integer, default=0)
    correction_votes = Column(Integer, default=0)
    is_live = Column(Boolean, default=False)
    mcqs = Column(JSON, default=list)
    poll = Column(JSON, nullable=True)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String, nullable=False)
    target_id = Column(Integer, index=True, nullable=False) # ID of the trending topic
    content = Column(String, nullable=False)
    votes = Column(Integer, default=0)
    replies = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String, index=True, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    time_taken_seconds = Column(Integer, nullable=False)
    mode = Column(String, nullable=False) # 'practice' or 'timed'
    details = Column(JSON, nullable=False) # List of dicts {question_id, selected_option_id, is_correct}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(String, unique=True, index=True, nullable=False) # e.g. 6-digit pin
    topic = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    status = Column(String, default="waiting") # 'waiting', 'active', 'finished'
    duration_minutes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    mcqs = Column(JSON, nullable=True)  # AI-generated questions for this session


class LiveParticipant(Base):
    __tablename__ = "live_participants"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    answers = Column(JSON, nullable=True)

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("trending_topics.id"), nullable=False)
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=False) # List of dicts {id: str, text: str}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PollVote(Base):
    __tablename__ = "poll_votes"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    option_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
