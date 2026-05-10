import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripApi } from '../services/api';
import { Trip, TripStop, Activity } from '../types';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, DollarSign, Globe, Lock, Loader2 } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

export default function PublicTripView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClone = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setCloning(true);
    try {
      if (id === 'demo') {
        const { data } = await tripApi.create({
          name: `Copy of ${trip?.name}`,
          description: trip?.description || '',
          start_date: trip?.start_date,
          end_date: trip?.end_date,
          cover_photo: trip?.cover_photo || '',
          is_public: false
        });
        // For demo, we just create the trip, not all sub-entities for now to keep it simple
        // or we could implement a full demo-cloning logic.
        navigate(`/trips/${data.id}`);
        return;
      }

      const { data } = await tripApi.clone(id!);
      navigate(`/trips/${data.id}`);
    } catch (e) {
      console.error("Clone Error:", e);
      alert("Failed to clone trip. Please try again.");
    } finally {
      setCloning(false);
    }
  };

  useEffect(() => {
    async function fetchPublicTrip() {
      if (!id) return;
      
      // Handle Demo Mode
      if (id === 'demo') {
        const today = new Date();
        const demoTrip: Trip = {
          id: 'demo',
          user_id: 'demo-user',
          name: 'Classic European Summer',
          description: 'A perfect 14-day loop through the most iconic cities of Western Europe.',
          start_date: format(today, 'yyyy-MM-dd'),
          end_date: format(addDays(today, 14), 'yyyy-MM-dd'),
          cover_photo: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000',
          is_public: true,
          created_at: Date.now()
        };
        
        const demoStops: TripStop[] = [
          { id: 's1', trip_id: 'demo', city_name: 'Paris', country_code: 'FR', arrival_date: format(today, 'yyyy-MM-dd'), departure_date: format(addDays(today, 4), 'yyyy-MM-dd'), order_index: 0 },
          { id: 's2', trip_id: 'demo', city_name: 'Amsterdam', country_code: 'NL', arrival_date: format(addDays(today, 5), 'yyyy-MM-dd'), departure_date: format(addDays(today, 8), 'yyyy-MM-dd'), order_index: 1 },
          { id: 's3', trip_id: 'demo', city_name: 'Berlin', country_code: 'DE', arrival_date: format(addDays(today, 9), 'yyyy-MM-dd'), departure_date: format(addDays(today, 14), 'yyyy-MM-dd'), order_index: 2 },
        ];

        const demoActivities: Activity[] = [
          { id: 'a1', stop_id: 's1', name: 'Louvre Museum', category: 'Culture', cost: 17, notes: 'Focus on the Denon wing' },
          { id: 'a2', stop_id: 's1', name: 'Seine River Cruise', category: 'Fun', cost: 15, notes: 'Best at sunset' },
          { id: 'a3', stop_id: 's2', name: 'Canal Boat Tour', category: 'Fun', cost: 20, notes: 'Private boat recommended' },
          { id: 'a4', stop_id: 's2', name: 'Van Gogh Museum', category: 'Culture', cost: 19, notes: 'Book tickets 2 months out' },
          { id: 'a5', stop_id: 's3', name: 'Brandenburg Gate', category: 'Sightseeing', cost: 0, notes: 'Historic landmark' },
        ];

        setTrip(demoTrip);
        setStops(demoStops);
        setActivities(demoActivities);
        setLoading(false);
        return;
      }

      try {
        const { data } = await tripApi.getPublic(id);
        const tripData = {
          ...data,
          coverPhoto: data.cover_photo,
          isPublic: data.is_public,
          startDate: data.start_date,
          endDate: data.end_date,
        };
        setTrip(tripData);
        setStops(data.stops.map((s: any) => ({
          ...s,
          cityName: s.city_name,
          arrivalDate: s.arrival_date,
          departureDate: s.departure_date,
        })));
        setActivities(data.stops.flatMap((s: any) => s.activities.map((a: any) => ({
          ...a,
          stopId: s.id
        }))));
      } catch (err) {
        console.error(err);
        setError("Failed to load itinerary.");
      } finally {
        setLoading(false);
      }
    }
    fetchPublicTrip();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-ocean border-t-transparent rounded-full animate-spin" /></div>;
  
  if (error) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <Lock className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-3xl mb-2 font-display">{error}</h1>
      <p className="text-slate-500 mb-8 max-w-sm">This loop is either private or doesn't exist anymore.</p>
      <Link to="/" className="text-ocean font-bold underline">Back to Traveloop</Link>
    </div>
  );

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-sand pb-20">
      {/* Read-only Hero */}
      <div className="h-[50vh] relative flex items-end">
        <img 
          src={trip.coverPhoto || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"} 
          className="w-full h-full object-cover absolute inset-0 z-0 brightness-50"
          alt={trip.name}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 text-white w-full">
          <div className="flex items-center gap-2 mb-4">
             <Globe className="h-4 w-4 text-sunset" />
             <span className="text-xs font-bold uppercase tracking-widest text-sunset">Shared Itinerary</span>
          </div>
          <h1 className="text-5xl md:text-7xl mb-6 font-display">{trip.name}</h1>
          <div className="flex flex-wrap gap-6 text-white/80 font-light">
             <div className="flex items-center gap-2">
               <Calendar className="h-5 w-5" /> 
               {(() => {
                 if (!trip.startDate || !trip.endDate) return 'TBD';
                 const start = new Date(trip.startDate + 'T12:00:00');
                 const end = new Date(trip.endDate + 'T12:00:00');
                 if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid dates';
                 return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
               })()}
             </div>
             <div className="flex items-center gap-2">
               <Clock className="h-5 w-5" />
               {(() => {
                 if (!trip.startDate || !trip.endDate) return 0;
                 const start = new Date(trip.startDate + 'T12:00:00');
                 const end = new Date(trip.endDate + 'T12:00:00');
                 if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
                 return differenceInDays(end, start) + 1;
               })()} Days
             </div>
             <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /> {stops.length} Stops</div>
             <div className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> ${activities.reduce((a, b) => a + b.cost, 0)} Budget</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative pl-8 border-l-2 border-slate-200 space-y-16">
          {stops.map((stop, i) => (
            <motion.div 
              key={stop.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-ocean text-white flex items-center justify-center font-bold text-sm shadow-lg">
                {i + 1}
              </div>
              <div className="mb-8">
                <h3 className="text-4xl mb-2 font-display">{stop.cityName}</h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {(() => {
                    if (!stop.arrivalDate || !stop.departureDate) return 'TBD';
                    const start = new Date(stop.arrivalDate + 'T12:00:00');
                    const end = new Date(stop.departureDate + 'T12:00:00');
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid dates';
                    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')} (${differenceInDays(end, start) + 1} days)`;
                  })()}
                </p>
              </div>

              <div className="grid gap-4">
                {activities.filter(a => a.stopId === stop.id).map(act => (
                  <div key={act.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ocean">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{act.name}</h4>
                      <p className="text-sm text-slate-400 font-light">{act.category}</p>
                    </div>
                    <div className="text-right font-bold text-ocean">${act.cost}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-ocean rounded-[3rem] text-center text-white">
           <h2 className="text-3xl mb-4 font-display">Inspired by this loop?</h2>
           <p className="mb-8 text-white/80 font-light max-w-sm mx-auto">Join Traveloop to create your own customized itineraries and track your travel life.</p>
           <button 
             onClick={handleClone}
             disabled={cloning}
             className="bg-sunset text-ink px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform inline-flex items-center gap-2 disabled:opacity-50"
           >
             {cloning ? (
               <>
                 <Loader2 className="h-5 w-5 animate-spin" />
                 Cloning Itinerary...
               </>
             ) : (
               'Clone this Itinerary'
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
