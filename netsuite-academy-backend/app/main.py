from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, admin, courses, modules, quizzes
from app.routers import certificates


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="NetSuite Academy API",
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTERS
# =========================

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(courses.router)
app.include_router(modules.router)
app.include_router(quizzes.router)
app.include_router(certificates.router)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "NetSuite Academy is running!"
    }