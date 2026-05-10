from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import City, Activity
from app.schemas.schemas import CityResponse, ActivityResponse

router = APIRouter()

@router.get("/cities", response_model=List[CityResponse])
def get_cities(db: Session = Depends(get_db)):
    """Fetch all available cities (Destinations)"""
    return db.query(City).all()

@router.get("/cities/{city_id}", response_model=CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city

@router.get("/cities/{city_id}/activities", response_model=List[ActivityResponse])
def get_city_activities(city_id: int, db: Session = Depends(get_db)):
    """Fetch all activities for a specific city"""
    activities = db.query(Activity).filter(Activity.city_id == city_id).all()
    return activities

@router.get("/activities/search", response_model=List[ActivityResponse])
def search_activities(query: str, db: Session = Depends(get_db)):
    """Search activities by title or category"""
    activities = db.query(Activity).filter(
        Activity.title.ilike(f"%{query}%") | 
        Activity.category.ilike(f"%{query}%")
    ).all()
    return activities
