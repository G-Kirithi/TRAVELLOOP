import sys
import os

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.models import City, Activity

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    # Check if data already exists
    if db.query(City).first():
        print("Database already seeded!")
        return

    print("Seeding dummy destinations and activities...")

    cities_data = [
        {
            "name": "Paris",
            "country": "France",
            "cost_index": 4,
            "popularity_score": 4.9,
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e907fa0a586?q=80&w=1000&auto=format&fit=crop",
            "activities": [
                {"title": "Eiffel Tower Tour", "category": "Sightseeing", "estimated_cost": 30.0, "duration": 120},
                {"title": "Louvre Museum", "category": "Museum", "estimated_cost": 20.0, "duration": 180},
                {"title": "Seine River Cruise", "category": "Sightseeing", "estimated_cost": 25.0, "duration": 60},
            ]
        },
        {
            "name": "Tokyo",
            "country": "Japan",
            "cost_index": 5,
            "popularity_score": 4.8,
            "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
            "activities": [
                {"title": "Shibuya Crossing", "category": "Sightseeing", "estimated_cost": 0.0, "duration": 60},
                {"title": "Tokyo Skytree", "category": "Sightseeing", "estimated_cost": 25.0, "duration": 90},
                {"title": "Sushi Making Class", "category": "Food", "estimated_cost": 80.0, "duration": 120},
            ]
        },
        {
            "name": "Bali",
            "country": "Indonesia",
            "cost_index": 2,
            "popularity_score": 4.7,
            "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
            "activities": [
                {"title": "Ubud Monkey Forest", "category": "Nature", "estimated_cost": 5.0, "duration": 120},
                {"title": "Mount Batur Sunrise Trek", "category": "Adventure", "estimated_cost": 40.0, "duration": 300},
                {"title": "Tanah Lot Temple", "category": "Culture", "estimated_cost": 3.0, "duration": 90},
            ]
        }
    ]

    for city_info in cities_data:
        activities = city_info.pop("activities")
        city = City(**city_info)
        db.add(city)
        db.commit()
        db.refresh(city)

        for act_info in activities:
            activity = Activity(**act_info, city_id=city.id)
            db.add(activity)
        
        db.commit()

    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
