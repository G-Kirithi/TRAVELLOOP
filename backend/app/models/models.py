from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    profile_photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trips = relationship("Trip", back_populates="owner")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    visibility = Column(String, default="private") # private, public
    cover_image = Column(String, nullable=True)
    total_budget = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    packing_items = relationship("PackingItem", back_populates="trip", cascade="all, delete-orphan")
    notes = relationship("TripNote", back_populates="trip", cascade="all, delete-orphan")

class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    country = Column(String, index=True)
    cost_index = Column(Integer, default=1) # 1 to 5
    popularity_score = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)

    stops = relationship("TripStop", back_populates="city")
    activities = relationship("Activity", back_populates="city")

class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    city_id = Column(Integer, ForeignKey("cities.id"))
    arrival_date = Column(DateTime)
    departure_date = Column(DateTime)
    stop_order = Column(Integer)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    stop_activities = relationship("StopActivity", back_populates="trip_stop", cascade="all, delete-orphan")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"))
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    category = Column(String) # e.g., food, nature, museum
    estimated_cost = Column(Float, default=0.0)
    duration = Column(Integer) # in minutes
    image_url = Column(String, nullable=True)

    city = relationship("City", back_populates="activities")
    stop_activities = relationship("StopActivity", back_populates="activity")

class StopActivity(Base):
    __tablename__ = "stop_activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_stop_id = Column(Integer, ForeignKey("trip_stops.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    scheduled_time = Column(DateTime, nullable=True)
    custom_notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('trip_stop_id', 'activity_id', name='uix_trip_stop_activity'),
    )

    trip_stop = relationship("TripStop", back_populates="stop_activities")
    activity = relationship("Activity", back_populates="stop_activities")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    category = Column(String)
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, nullable=True)

    trip = relationship("Trip", back_populates="expenses")

class PackingItem(Base):
    __tablename__ = "packing_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    item_name = Column(String)
    category = Column(String, nullable=True)
    is_packed = Column(Boolean, default=False)

    trip = relationship("Trip", back_populates="packing_items")

class TripNote(Base):
    __tablename__ = "trip_notes"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    trip_stop_id = Column(Integer, ForeignKey("trip_stops.id"), nullable=True)
    note_content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="notes")
