import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripApi } from '../services/api';
import { Trip } from '../types';
import { motion } from 'motion/react';
import { Plus, Calendar, MapPin, Search, Plane, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const { data } = await tripApi.list();
      setTrips(data);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Delete this trip?")) return;

    try {
      await tripApi.delete(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl mb-2">Hello, {user?.display_name?.split(' ')[0]}!</h1>
          <p className="text-slate-500 font-light italic">Where are you looping to next?</p>
        </div>
        <Link 
          to="/trips/new" 
          className="flex items-center gap-2 bg-ocean text-white px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Create New Trip
        </Link>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
           ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="card-travel overflow-hidden group relative"
            >
              <button 
                onClick={(e) => handleDeleteTrip(e, trip.id)}
                className="absolute top-4 right-4 bg-white/40 backdrop-blur-md p-2 rounded-xl text-white hover:bg-red-500 transition-all z-20 shadow-sm"
                title="Delete Trip"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <Link to={`/trips/${trip.id}`}>
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={trip.cover_photo || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800"} 
                    alt={trip.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                      {trip.is_public ? 'Public' : 'Private'}
                    </span>
                    <h3 className="text-xl font-bold">{trip.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {(() => {
                           if (!trip.start_date || !trip.end_date) return 'TBD';
                           const start = new Date(trip.start_date + 'T12:00:00');
                           const end = new Date(trip.end_date + 'T12:00:00');
                           if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid dates';
                           return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
                        })()}
                      </span>
                    </div>
                    <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {(() => {
                        if (!trip.start_date || !trip.end_date) return 0;
                        const start = new Date(trip.start_date + 'T12:00:00');
                        const end = new Date(trip.end_date + 'T12:00:00');
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
                        return differenceInDays(end, start) + 1;
                      })()} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <p className="text-slate-600 line-clamp-1 flex-1 pr-4">{trip.description}</p>
                     <ArrowRight className="h-5 w-5 text-ocean transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
           <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border">
             <Plane className="h-10 w-10 text-slate-300" />
           </div>
           <h2 className="text-2xl mb-2 italic">Your adventure starts with a single click.</h2>
           <p className="text-slate-400 mb-8 max-w-sm mx-auto">Create your first trip itinerary and start loops around the world today.</p>
           <Link to="/trips/new" className="text-ocean font-bold flex items-center justify-center gap-2 hover:gap-3 transition-all">
             Initialize your first loop <ArrowRight className="h-5 w-5" />
           </Link>
        </div>
      )}
    </div>
  );
}
