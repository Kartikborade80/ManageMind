from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .utils.rate_limit import limiter
from .routes import auth, quizzes, trending, comments, polls, live

app = FastAPI(title="ManageMind API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://managemind-frontend.onrender.com",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["Quizzes"])
app.include_router(trending.router, prefix="/api/trending", tags=["Trending Topics"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(polls.router, prefix="/api/polls", tags=["Polls"])
app.include_router(live.router, prefix="/api/live", tags=["Live Sessions"])

@app.get("/")
async def root():
    return {"message": "Welcome to ManageMind API"}
