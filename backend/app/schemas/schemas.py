from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    profile_photo: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- City Schemas ---
class CityBase(BaseModel):
    name: str
    country: str
    cost_index: int
    popularity_score: float
    image_url: Optional[str] = None

class CityResponse(CityBase):
    id: int

    class Config:
        from_attributes = True

# --- Activity Schemas ---
class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    estimated_cost: float
    duration: int
    image_url: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: int
    city_id: int

    class Config:
        from_attributes = True

# --- StopActivity Schemas ---
class StopActivityBase(BaseModel):
    activity_id: int
    scheduled_time: Optional[datetime] = None
    custom_notes: Optional[str] = None

class StopActivityResponse(StopActivityBase):
    id: int
    trip_stop_id: int
    activity: ActivityResponse

    class Config:
        from_attributes = True

# --- TripStop Schemas ---
class TripStopBase(BaseModel):
    city_id: int
    arrival_date: datetime
    departure_date: datetime
    stop_order: int

class TripStopResponse(TripStopBase):
    id: int
    trip_id: int
    city: CityResponse
    stop_activities: List[StopActivityResponse] = []

    class Config:
        from_attributes = True

# --- Trip Schemas ---
class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    visibility: str = "private"
    cover_image: Optional[str] = None
    total_budget: float = 0.0

class TripCreate(TripBase):
    pass

class TripResponse(TripBase):
    id: int
    user_id: int
    created_at: datetime
    stops: List[TripStopResponse] = []

    class Config:
        from_attributes = True
