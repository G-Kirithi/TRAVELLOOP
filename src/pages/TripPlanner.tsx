import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi, default as api } from '../services/api';
import { Trip, TripStop, Activity, PackingItem, TripNote, Expense } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Calendar, Plus, Trash2, Clock, 
  DollarSign, Briefcase, FileText, ChevronRight, Globe,
  TrendingDown, TrendingUp, Filter, Share2, Tag, X, Settings, Upload, Loader2, Camera
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '../lib/utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { suggestActivities, getCityInsights } from '../services/geminiService';

type Tab = 'itinerary' | 'budget' | 'packing' | 'notes';

export default function TripPlanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Packing & Notes state
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>(['Flights', 'Housing', 'Food', 'Fun', 'Transport', 'Shopping']);
  const [newItemName, setNewItemName] = useState('');
  const [newNote, setNewNote] = useState('');
  const [cityInsights, setCityInsights] = useState<Record<string, any>>({});

  // Modals
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [newStop, setNewStop] = useState({ city_name: '', arrival_date: '', departure_date: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd') });
  const [newCategory, setNewCategory] = useState('');
  const [editFormData, setEditFormData] = useState({ name: '', description: '', cover_photo: '', is_public: false });

  const handleDeleteTrip = async () => {
    if (!id || !trip) return;
    if (!window.confirm("Are you absolutely sure you want to delete this entire loop? This action cannot be undone.")) return;
    
    try {
      setLoading(true);
      await tripApi.delete(id);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert("Failed to delete trip.");
      setLoading(false);
    }
  };

  const getDuration = () => {
    if (!trip?.start_date || !trip?.end_date || trip.start_date === '' || trip.end_date === '') return 0;
    const start = new Date(trip.start_date + 'T12:00:00');
    const end = new Date(trip.end_date + 'T12:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return differenceInDays(end, start) + 1;
  };

  const handleEditTrip = async () => {
    if (!id || !trip) return;
    try {
      const { data } = await tripApi.update(id, editFormData);
      setTrip(data);
      setShowEditTrip(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simplified for now
    alert("Media uploads are coming soon in the PostgreSQL version!");
    setEditFormData(prev => ({ ...prev, cover_photo: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" }));
  };

  const handleAiBoost = async (stopId: string, cityName: string) => {
    try {
      const suggestions = await suggestActivities(cityName, trip?.description);
      const insights = await getCityInsights(cityName);
      if (insights) {
        setCityInsights(prev => ({ ...prev, [cityName]: insights }));
      }
      if (suggestions && suggestions.length > 0) {
        for (const sug of suggestions) {
          const activityData = {
            name: sug.name,
            category: sug.category,
            cost: sug.estimatedCost || 0,
            notes: sug.description
          };
          await tripApi.addActivity(stopId, activityData);
        }
        // Refresh trip data to get new activities
        const { data } = await tripApi.get(id!);
        setActivities(data.stops.flatMap((s: any) => s.activities));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id) return;
    async function fetchTripData() {
      try {
        const { data } = await tripApi.get(id as string);
        setTrip(data);
        setEditFormData({
          name: data.name,
          description: data.description || '',
          cover_photo: data.cover_photo || '',
          is_public: data.is_public
        });
        setStops(data.stops || []);
        setActivities((data.stops || []).flatMap((s: any) => s.activities || []));
        setPackingItems(data.packing_items || []);
        setNotes(data.notes || []);
        setExpenses(data.expenses || []);

        if (data.custom_categories) {
          setCustomCategories(prev => Array.from(new Set([...prev, ...data.custom_categories])));
        }

      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchTripData();
  }, [id, navigate]);

  const handleAddStop = async () => {
    if (!id || !trip) return;
    try {
      const stopData = {
        ...newStop,
        order_index: stops.length,
        country_code: 'US'
      };
      const { data } = await tripApi.addStop(id, stopData);
      
      // Refresh entire trip to get synced dates
      const { data: updatedTrip } = await tripApi.get(id);
      setTrip(updatedTrip);
      setStops(updatedTrip.stops || []);
      
      setShowAddStop(false);
      setNewStop({ city_name: '', arrival_date: '', departure_date: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPackingItem = async () => {
    if (!newItemName || !id) return;
    const item = { name: newItemName, category: 'Essentials' };
    const { data } = await tripApi.addPackingItem(id, item);
    setPackingItems([...packingItems, data]);
    setNewItemName('');
  };

  const handleAddNote = async () => {
    if (!newNote || !id) return;
    const note = { content: newNote };
    const { data } = await tripApi.addNote(id, note);
    setNotes([data, ...notes]);
    setNewNote('');
  };

  const handleAddExpense = async () => {
    if (!id || !newExpense.description || !newExpense.amount) return;
    try {
      const expenseData = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date
      };
      const { data } = await tripApi.addExpense(id, expenseData);
      setExpenses([data, ...expenses]);
      setShowAddExpense(false);
      setNewExpense({ description: '', amount: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory || !id || !trip) return;
    try {
      const updatedCategories = Array.from(new Set([...customCategories, newCategory]));
      setCustomCategories(updatedCategories);
      
      // Update trip to persist custom categories
      await tripApi.update(id, { custom_categories: updatedCategories });
      
      setNewCategory('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!id) return;
    try {
      // For simplicity, I'll just remove it from state if I don't have a DELETE expense route yet
      // But I should probably add one to server.ts
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (err) {
      console.error(err);
    }
  };

  const totalPlanned = activities.reduce((acc, act) => acc + act.cost, 0);
  const totalActual = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const amount = Number(exp.amount);
    acc[exp.category] = (acc[exp.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-ocean border-t-transparent rounded-full animate-spin" /></div>;
  if (!trip) return null;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="h-[40vh] relative overflow-hidden flex items-end">
        <img 
          src={trip.cover_photo || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"} 
          className="w-full h-full object-cover absolute inset-0 z-0 brightness-50"
          alt={trip.name}
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-12 text-white">
          <div className="flex items-center gap-3 mb-4">
              <span className="bg-ocean px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                {trip.is_public ? 'Public Loop' : 'Private Loop'}
              </span>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/trips/shared/${trip.id}`;
                  navigator.clipboard.writeText(url);
                  alert("Shareable link copied to clipboard!");
                }}
                className="glass p-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold"
              >
                <Share2 className="h-4 w-4" />
                Copy Loop Link
              </button>
              <button 
                onClick={() => setShowEditTrip(true)}
                className="glass p-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button 
                onClick={handleDeleteTrip}
                className="glass p-2 rounded-full hover:bg-red-500/80 transition-all flex items-center gap-2 text-xs font-bold text-white shadow-lg"
              >
                <Trash2 className="h-4 w-4" />
                Delete Loop
              </button>
           </div>
           <h1 className="text-5xl md:text-7xl mb-4 font-display leading-tight">{trip.name}</h1>
           <div className="flex items-center gap-6 text-white/80 font-light overflow-x-auto whitespace-nowrap scrollbar-hide">
               <div className="flex items-center gap-2">
                 <Calendar className="h-5 w-5" />
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
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{stops.length} Stops</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>${totalPlanned.toLocaleString()} Planned</span>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
            {(['itinerary', 'budget', 'packing', 'notes'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 capitalize whitespace-nowrap",
                  activeTab === tab ? "border-ocean text-ocean" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'itinerary' && <MapPin className="h-4 w-4" />}
                {tab === 'budget' && <DollarSign className="h-4 w-4" />}
                {tab === 'packing' && <Briefcase className="h-4 w-4" />}
                {tab === 'notes' && <FileText className="h-4 w-4" />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid lg:grid-cols-3 gap-12"
            >
              <div className="lg:col-span-2 space-y-12">
                {stops.length > 0 ? (
                  <div className="relative pl-8 border-l-2 border-dashed border-slate-200 space-y-16">
                    {stops.map((stop, i) => (
                      <div key={stop.id} className="relative group">
                        <div className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-ocean flex items-center justify-center font-bold text-ocean text-sm shadow-sm group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <div className="flex justify-between items-start mb-6">
                           <div>
                             <h3 className="text-3xl mb-1">{stop.city_name}</h3>
                             <p className="text-slate-400 font-light flex items-center gap-2">
                               <Clock className="h-4 w-4" />
                               {(() => {
                                 if (!stop.arrival_date || !stop.departure_date) return 'TBD';
                                 const start = new Date(stop.arrival_date + 'T12:00:00');
                                 const end = new Date(stop.departure_date + 'T12:00:00');
                                 if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid dates';
                                 return `${format(start, 'MMM d')} - ${format(end, 'MMM d')} (${differenceInDays(end, start) + 1} days)`;
                               })()}
                             </p>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleAiBoost(stop.id, stop.city_name)}
                               className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-ocean text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
                             >
                               AI Boost
                             </button>
                             <button 
                               onClick={async () => {
                                 if (window.confirm("Remove this stop?")) {
                                   try {
                                     await api.delete(`/stops/${stop.id}`);
                                     // Refresh entire trip to get synced dates
                                     const { data: updatedTrip } = await tripApi.get(id!);
                                     setTrip(updatedTrip);
                                     setStops(updatedTrip.stops || []);
                                     setActivities(updatedTrip.stops?.flatMap((s: any) => s.activities || []) || []);
                                   } catch (err) {
                                     console.error(err);
                                   }
                                 }
                               }}
                               className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-xl border border-slate-100"
                               title="Delete Stop"
                             >
                               <Trash2 className="h-4 w-4" />
                               <span className="text-xs font-bold uppercase tracking-wider">Delete</span>
                             </button>
                           </div>
                        </div>

                        {/* Activities for this stop */}
                        <div className="space-y-4">
                           {activities.filter(a => a.stop_id === stop.id).map(activity => (
                             <div key={activity.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white transition-all hover:shadow-sm group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-ocean">
                                   <Calendar className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                   <h4 className="font-semibold text-slate-800">{activity.name}</h4>
                                   <p className="text-sm text-slate-400 font-light italic">{activity.category}</p>
                                </div>
                                 <div className="text-right flex items-center gap-4">
                                   <div>
                                     <p className="font-bold text-ocean">${activity.cost}</p>
                                     <p className="text-xs text-slate-400">{activity.time || 'All Day'}</p>
                                   </div>
                                   <button 
                                     onClick={async (e) => {
                                       e.stopPropagation();
                                       if (window.confirm("Remove activity?")) {
                                         try {
                                           await api.delete(`/activities/${activity.id}`);
                                           setActivities(activities.filter(a => a.id !== activity.id));
                                         } catch (err) {
                                           console.error(err);
                                         }
                                       }
                                     }}
                                     className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                                     title="Delete Activity"
                                   >
                                      <Trash2 className="h-4 w-4" />
                                   </button>
                                </div>
                             </div>
                           ))}
                           <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-ocean hover:text-ocean transition-all font-medium">
                              <Plus className="h-5 w-5" />
                              Add Activity in {stop.city_name}
                           </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowAddStop(true)}
                      className="absolute -left-[41px] -bottom-4 w-8 h-8 rounded-full bg-ocean text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl mb-2 italic">A map with no pins?</h2>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">Start your loop by adding your first destination city.</p>
                    <button 
                      onClick={() => setShowAddStop(true)}
                      className="bg-ocean text-white p-4 px-8 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-ocean/90 transition-all"
                    >
                      <Plus className="h-5 w-5" /> Add First Stop
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Calendar/Map Placeholder */}
              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl mb-6 font-display">Itinerary Overview</h3>
                    <div className="p-4 bg-ocean rounded-2xl text-white mb-6">
                      <p className="text-sm text-white/70 mb-1">Total Duration</p>
                      <p className="text-3xl font-bold font-display">{getDuration()} Days</p>
                    </div>
                    <div className="space-y-4">
                      {stops.map((stop, i) => (
                        <div key={stop.id} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">{i+1}</div>
                          <span className="text-slate-700 font-medium">{stop.city_name}</span>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Mini Calendar */}
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    {trip && (
                      <FullCalendar
                        key={`${trip.id}-${trip.start_date}`}
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        initialDate={trip.start_date && trip.start_date !== '' ? trip.start_date : undefined}
                        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
                        height="auto"
                        events={stops.map(s => {
                          if (!s.arrival_date) return null;
                          return { 
                            title: s.city_name, 
                            start: s.arrival_date, 
                            end: s.departure_date ? format(addDays(new Date(s.departure_date + 'T12:00:00'), 1), 'yyyy-MM-dd') : s.departure_date, 
                            color: '#0077b6' 
                          };
                        }).filter(Boolean) as any}
                      />
                    )}
                 </div>

                 {/* City Insights Sidebar */}
                 {Object.keys(cityInsights).length > 0 && (
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                     <h3 className="text-xl mb-6 font-display flex items-center gap-2">
                       <Globe className="h-5 w-5 text-ocean" /> Destination Intelligence
                     </h3>
                     <div className="space-y-6">
                        {Object.entries(cityInsights).map(([city, data]) => (
                          <div key={city} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <h4 className="font-bold text-ocean mb-3">{city}</h4>
                             <div className="grid grid-cols-2 gap-3 text-xs">
                               <div className="bg-white p-2 rounded-lg">
                                  <p className="text-slate-400 mb-1">Vibe</p>
                                  <p className="font-bold text-slate-800">{(data as any).topVibe}</p>
                               </div>
                               <div className="bg-white p-2 rounded-lg">
                                  <p className="text-slate-400 mb-1">Cost</p>
                                  <p className="font-bold text-sunset">{(data as any).costLevel}</p>
                               </div>
                               <div className="bg-white p-2 rounded-lg">
                                  <p className="text-slate-400 mb-1">Best Season</p>
                                  <p className="font-bold text-slate-800">{(data as any).bestSeason}</p>
                               </div>
                               <div className="bg-white p-2 rounded-lg">
                                  <p className="text-slate-400 mb-1">Safety</p>
                                  <p className="font-bold text-green-600">{(data as any).safetyIndex}/10</p>
                               </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}
              </div>
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-8">
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl">Expense Tracker</h2>
                      <button 
                        onClick={() => setShowAddExpense(true)}
                        className="bg-ocean text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-ocean/90 transition-all shadow-lg"
                      >
                        <Plus className="h-5 w-5" /> Add Expense
                      </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                       <div className="p-6 bg-slate-50 rounded-3xl">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Planned</p>
                          <p className="text-3xl font-display font-bold text-slate-400">${totalPlanned}</p>
                       </div>
                       <div className="p-6 bg-ocean/10 rounded-3xl">
                          <p className="text-xs text-ocean uppercase font-bold tracking-widest mb-2">Actual Spent</p>
                          <p className="text-3xl font-display font-bold text-ocean">${totalActual}</p>
                       </div>
                       <div className="p-6 bg-green-50 rounded-3xl">
                          <p className="text-xs text-green-600/60 uppercase font-bold tracking-widest mb-2">Remaining</p>
                          <p className="text-3xl font-display font-bold text-green-600">${Math.max(0, totalPlanned - totalActual)}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Stops</p>
                          <p className="text-3xl font-display font-bold text-slate-800">{stops.length}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xl font-display flex items-center gap-2">
                         <Filter className="h-5 w-5" /> Recent Transactions
                       </h3>
                       {expenses.length > 0 ? (
                         <div className="overflow-hidden border border-slate-50 rounded-3xl">
                           {expenses.map((exp) => (
                             <div key={exp.id} className="flex justify-between items-center py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all px-6">
                                <div className="flex items-center gap-4">
                                  <div className="bg-white p-3 rounded-xl shadow-sm text-ocean border border-slate-100">
                                     <Tag className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-800 block">{exp.description}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">{exp.category}</span>
                                      <span className="text-xs text-slate-400">
                                        {(() => {
                                          const d = new Date(exp.date + 'T12:00:00');
                                          return isNaN(d.getTime()) ? 'TBD' : format(d, 'MMM d');
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="font-bold text-ocean text-lg">${exp.amount}</span>
                                  <button 
                                    onClick={() => handleDeleteExpense(exp.id)}
                                    className="text-slate-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                                    title="Delete Expense"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <DollarSign className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-light">No expenses logged. Tap 'Add Expense' to track your spending.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl mb-6 font-display">Budget Breakdown</h3>
                    <div className="space-y-6">
                       {customCategories.map(cat => {
                         const spent = expensesByCategory[cat] || 0;
                         const percentage = totalActual > 0 ? (spent / totalActual) * 100 : 0;
                         return (
                           <div key={cat}>
                             <div className="flex justify-between mb-2 text-sm font-medium">
                                <span className={cn("text-slate-500", spent > 0 ? "text-slate-800 font-bold" : "")}>{cat}</span>
                                <span className="text-slate-900 font-bold">${spent}</span>
                             </div>
                             <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-ocean rounded-full" 
                                />
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl mb-6 font-display">Manage Categories</h3>
                    <div className="flex gap-2 mb-4">
                       <input 
                         type="text" 
                         placeholder="New Category" 
                         className="flex-1 bg-slate-50 px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ocean"
                         value={newCategory}
                         onChange={e => setNewCategory(e.target.value)}
                       />
                       <button 
                         onClick={handleAddCategory}
                         className="bg-slate-800 text-white p-2 rounded-xl"
                       >
                         <Plus className="h-4 w-4" />
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {customCategories.map(cat => (
                         <span key={cat} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-full border border-slate-100">
                           {cat}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'packing' && (
            <motion.div
              key="packing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h2 className="text-3xl mb-8 font-display">Packing Checklist</h2>
                <div className="flex gap-4 mb-8">
                   <input 
                     type="text" 
                     placeholder="What else do you need?" 
                     className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-ocean"
                     value={newItemName}
                     onChange={e => setNewItemName(e.target.value)}
                   />
                   <button onClick={handleAddPackingItem} className="bg-ocean text-white p-4 rounded-2xl transition-transform hover:scale-105">
                     <Plus className="h-6 w-6" />
                   </button>
                </div>
                <div className="space-y-4">
                   {packingItems.map(item => (
                     <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all rounded-2xl group">
                        <button className={cn("w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center", item.is_packed ? "bg-ocean border-ocean text-white" : "border-slate-300 text-transparent")}>
                           ✓
                        </button>
                        <span className={cn("flex-1 text-lg font-light", item.is_packed && "line-through text-slate-300")}>{item.name}</span>
                        <button 
                          onClick={async () => {
                            if (window.confirm("Remove item?")) {
                              try {
                                await api.delete(`/packing/${item.id}`);
                                setPackingItems(packingItems.filter(i => i.id !== item.id));
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                          title="Delete Item"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h2 className="text-3xl mb-6 font-display">Trip Journal</h2>
                <textarea 
                  rows={4}
                  placeholder="Today was incredible because..."
                  className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none focus:ring-2 focus:ring-ocean transition-all resize-none mb-4"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
                <button onClick={handleAddNote} className="bg-ocean text-white px-8 py-4 rounded-xl font-bold hover:bg-ocean/90 transition-all">
                  Capture Moment
                </button>
              </div>

              <div className="space-y-6">
                {notes.map(note => (
                  <div key={note.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                    <p className="text-xs text-slate-400 mb-4">
                      {(() => {
                        const date = new Date(note.created_at);
                        if (isNaN(date.getTime())) return 'Unknown date';
                        return format(date, 'MMMM d, yyyy - HH:mm');
                      })()}
                    </p>
                    <p className="text-slate-700 leading-relaxed font-light">{note.content}</p>
                    <button 
                      onClick={async () => {
                        if (window.confirm("Delete note?")) {
                          try {
                            await api.delete(`/notes/${note.id}`);
                            setNotes(notes.filter(n => n.id !== note.id));
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                      title="Delete Note"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowAddStop(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-3xl mb-8 font-display">Add a Destination</h2>
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-semibold mb-2">City Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paris"
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean transition-all outline-none"
                    value={newStop.city_name}
                    onChange={e => setNewStop({ ...newStop, city_name: e.target.value })}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Arrival</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean outline-none"
                      value={newStop.arrival_date}
                      onChange={e => setNewStop({ ...newStop, arrival_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Departure</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean outline-none"
                      value={newStop.departure_date}
                      onChange={e => setNewStop({ ...newStop, departure_date: e.target.value })}
                    />
                  </div>
               </div>
               <button 
                 onClick={handleAddStop}
                 className="w-full bg-ocean text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-ocean/90 transition-all shadow-lg"
               >
                 Add Stop to Loop <ChevronRight className="h-5 w-5" />
               </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowAddExpense(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display">Log Expense</h2>
              <button 
                onClick={() => setShowAddExpense(false)}
                className="text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dinner at Le Meurice"
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean transition-all outline-none"
                    value={newExpense.description}
                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full bg-slate-50 p-4 pl-10 rounded-2xl border-none focus:ring-2 focus:ring-ocean outline-none"
                        value={newExpense.amount}
                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean outline-none"
                      value={newExpense.date}
                      onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {customCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewExpense({ ...newExpense, category: cat })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                          newExpense.category === cat 
                            ? "bg-ocean text-white border-ocean" 
                            : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
               <button 
                 onClick={handleAddExpense}
                 className="w-full bg-ocean text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-ocean/90 transition-all shadow-lg"
               >
                 Save Transaction <ChevronRight className="h-5 w-5" />
               </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Edit Trip Modal */}
      {showEditTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowEditTrip(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display">Loop Settings</h2>
              <button 
                onClick={() => setShowEditTrip(false)}
                className="text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-semibold mb-2">Trip Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean transition-all outline-none"
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-ocean transition-all outline-none resize-none"
                    value={editFormData.description}
                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold mb-2">Cover Photo</label>
                  <div className="relative group">
                    {editFormData.cover_photo ? (
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100 mb-2">
                        <img src={editFormData.cover_photo} alt="Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, cover_photo: '' })}
                          className="absolute top-2 right-2 bg-ink/70 text-white p-1.5 rounded-full hover:bg-ink transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-40 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 group-hover:border-ocean/20 transition-colors">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 text-ocean animate-spin" />
                            <p className="text-xs text-slate-500 font-medium">Uploading...</p>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-ocean">
                              <Upload className="h-5 w-5" />
                            </div>
                            <span className="text-xs text-slate-500">Pick a new cover photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                  <Globe className="h-6 w-6 text-ocean" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Public Itinerary</p>
                    <p className="text-xs text-slate-500">Make this loop visible to others.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, is_public: !editFormData.is_public })}
                    className={`w-12 h-6 rounded-full transition-all flex items-center p-0.5 ${editFormData.is_public ? 'bg-ocean' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-all ${editFormData.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
               <button 
                 onClick={handleEditTrip}
                 className="w-full bg-ocean text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-ocean/90 transition-all shadow-lg"
               >
                 Save Changes
               </button>

               <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleDeleteTrip}
                    className="w-full p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Trip Permanently
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
