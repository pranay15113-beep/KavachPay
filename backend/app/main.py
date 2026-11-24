from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db, get_connection
from .seed_data import seed_database
from .routers import auth, payment, voice, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables & seed
    init_db()
    conn = get_connection()
    try:
        seed_database(conn)
    finally:
        conn.close()
    yield

app = FastAPI(
    title="KavachPay - Autonomous UPI & Deepfake Defense API",
    description="Cybersecurity & FinTech API protecting users against UPI payment scams and AI voice-clone impersonation before money leaves their account.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(payment.router)
app.include_router(voice.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "KavachPay Cyber Defense Engine",
        "version": "1.0.0",
        "protection_active": True
    }
