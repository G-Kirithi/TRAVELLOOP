from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Trip, TripStop, StopActivity
from app.schemas.schemas import TripCreate, TripResponse, TripStopResponse

router = APIRouter()

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, user_id: int, db: Session = Depends(get_db)):
    """Create a new trip for a user"""
    new_trip = Trip(**trip.model_dump(), user_id=user_id)
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/user/{user_id}", response_model=List[TripResponse])
def get_user_trips(user_id: int, db: Session = Depends(get_db)):
    """Get all trips for a specific user"""
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    return trips

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_details(trip_id: int, db: Session = Depends(get_db)):
    """Get full details of a specific trip, including stops and activities"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}

# --- Endpoints for Trip Stops & Activities ---

@router.post("/{trip_id}/stops")
def add_stop_to_trip(trip_id: int, city_id: int, stop_order: int, arrival_date: str, departure_date: str, db: Session = Depends(get_db)):
    new_stop = TripStop(
        trip_id=trip_id,
        city_id=city_id,
        stop_order=stop_order,
        arrival_date=arrival_date,
        departure_date=departure_date
    )
    db.add(new_stop)
    db.commit()
    db.refresh(new_stop)
    return new_stop

@router.post("/stops/{stop_id}/activities")
def add_activity_to_stop(stop_id: int, activity_id: int, db: Session = Depends(get_db)):
    new_stop_activity = StopActivity(
        trip_stop_id=stop_id,
        activity_id=activity_id
    )
    db.add(new_stop_activity)
    db.commit()
    db.refresh(new_stop_activity)
    return new_stop_activity
