# Traveloop - Production-Style Travel Planning Platform

## 1. Project Overview
Traveloop is a comprehensive travel planning ecosystem designed to simplify multi-city itinerary creation, budget tracking, and activity discovery. It bridges the gap between raw maps and complex spreadsheets, providing a seamless, visual planning experience.

## 2. System Architecture
The application follows a modern full-stack architecture:
- **Frontend**: A highly interactive Single Page Application (SPA) built with React 18, leveraging Tailwind CSS for styling and Framer Motion for responsive, travel-themed animations.
- **Backend**: A robust RESTful API built with Express (Node.js) for the functional implementation, while documented for a Python/FastAPI production transition.
- **Database**: 
  - **Relational**: PostgreSQL (Documented Schema) for strict data integrity.
  - **Implementation**: Firebase Firestore (Functional Demo) for real-time synchronization and rapid prototyping.
- **Storage**: Cloudinary/Firebase Storage for trip cover photos and profile images.
- **AI Engine**: Gemini 3 Flash for intelligent activity suggestions and city cost analysis.

## 3. Database Design (PostgreSQL)

### ER Diagram Logic
- **Users (1:N) Trips**: A user creates multiple trips.
- **Trips (1:N) TripStops**: A trip consists of multiple geographical stops (cities).
- **Cities (1:N) Activities**: Destinations host various activities.
- **TripStops (1:N) StopActivities**: Users choose specific activities for each stop.
- **Trips (1:N) Budgets/Expenses**: Financial tracking linked to the overall trip.
- **Trips (1:N) Notes/PackingItems**: Supplemental planning data.

### CREATE TABLE Statements (SQL)
```sql
-- Core User Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    profile_pic_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    cover_photo_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip Stops (Multi-city destinations)
CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    country_code CHAR(2),
    arrival_date DATE,
    departure_date DATE,
    order_index INT NOT NULL,
    UNIQUE(trip_id, order_index)
);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    estimated_cost DECIMAL(10,2),
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6)
);

-- Stop Activities (User-assigned activities per stop)
CREATE TABLE stop_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    activity_time TIME,
    notes TEXT
);

-- Budget & Expenses
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    total_budget DECIMAL(12,2) DEFAULT 0.00,
    category VARCHAR(50) -- 'Accommodation', 'Food', 'Transport', etc
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE
);
```

## 4. API Documentation (RESTful)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/auth/signup` | POST | No | Create new user account |
| `/auth/login` | POST | No | Authenticate and get JWT |
| `/trips` | GET | Yes | List user's trips |
| `/trips/:id` | GET | Yes | Get full trip details + itinerary |
| `/trips` | POST | Yes | Create a new trip |
| `/trip-stops` | POST | Yes | Add city stop to itinerary |
| `/activities/search` | GET | Yes | Search cities/activities via Gemini AI |
| `/budget-summary/:tripId` | GET | Yes | Get cost breakdown and analytics |

## 5. Frontend Component Hierarchy
- `App`
  - `AuthProvider` (Context)
  - `Navbar`
  - `Routes`
    - `LandingPage` (Guest Hero)
    - `Dashboard`
      - `TripCard`
      - `BudgetWidget`
    - `TripPlanner`
      - `ItineraryTimeline`
      - `CitySearch`
      - `ActivityPicker`
      - `DragAndDropList`
    - `TripView`
      - `CalendarView`
      - `MapVisualization`
    - `BudgetTracker`
      - `SpendingChart` (Recharts)

## 6. Deployment Guide
1. **Frontend**: Build using `npm run build` and deploy to Vercel/Netlify.
2. **Backend**: Containerize with Docker and deploy to Cloud Run or Heroku.
3. **Database**: Use a managed PostgreSQL service (e.g., Supabase, RDS).
4. **Secrets**: Configure `GEMINI_API_KEY`, `JWT_SECRET`, and `DATABASE_URL` in environment variables.

## 7. Future Enhancements
- **Collaborative Editing**: Real-time multi-user editing via WebSockets.
- **Offline Access**: PWA support with local storage caching.
- **Flight Integration**: Real-time flight search and booking alerts.
- **AR View**: View historical city highlights via AR in the mobile app.
