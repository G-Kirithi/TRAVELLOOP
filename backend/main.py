from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Create database tables (For production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Traveloop API",
    description="Backend API for the Traveloop travel planning platform",
    version="1.0.0"
)

# Allow Flutter frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Traveloop API!"}

from app.routes import users, destinations, trips

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(destinations.router, prefix="/api", tags=["Destinations"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
