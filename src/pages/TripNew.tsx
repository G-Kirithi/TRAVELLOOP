import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripApi } from '../services/api';
import { motion } from 'motion/react';
import { Plane, Calendar, Globe, ArrowRight, Camera, Upload, X, Loader2 } from 'lucide-react';

export default function TripNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_public: false,
    cover_photo: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simplified for now: just use a placeholder or handle in future
    alert("Media uploads are coming soon in the PostgreSQL version! Using a placeholder for now.");
    setFormData(prev => ({ ...prev, cover_photo: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data } = await tripApi.create(formData);
      navigate(`/trips/${data.id}`);
    } catch (err) {
      console.error("Error creating trip:", err);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="bg-ocean w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Plane className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl mb-4 font-display">New Adventure</h1>
        <p className="text-slate-500 font-light">Set the stage for your next incredible journey.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass rounded-[2rem] p-8 md:p-12 shadow-2xl border-white/40 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Trip Name</label>
          <input 
            required
            type="text"
            placeholder="e.g. European Summer 2026"
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-ocean transition-all outline-none"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Description (Optional)</label>
          <textarea 
            rows={3}
            placeholder="Tell us about the vibe..."
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-ocean transition-all outline-none resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Start Date
          </label>
          <input 
            required
            type="date"
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-ocean outline-none"
            value={formData.start_date}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> End Date
          </label>
          <input 
            required
            type="date"
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-ocean outline-none"
            value={formData.end_date}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        {/* Cover Photo Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
            <Camera className="h-4 w-4" /> Cover Photo
          </label>
          
          <div className="relative group">
            {formData.cover_photo ? (
              <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100 mb-2">
                <img src={formData.cover_photo} alt="Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, cover_photo: '' })}
                  className="absolute top-4 right-4 bg-ink/70 text-white p-2 rounded-full hover:bg-ink transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-48 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 group-hover:border-ocean/20 transition-colors">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-ocean animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Uploading to the clouds...</p>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-ocean">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-slate-500">Click to upload your cover photo</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PNG, JPG up to 5MB</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div className="md:col-span-2 flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <Globe className="h-6 w-6 text-ocean" />
           <div className="flex-1">
             <p className="font-semibold text-sm">Public Itinerary</p>
             <p className="text-xs text-slate-500">Allow others to see and copy your itinerary via a unique link.</p>
           </div>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
              className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${formData.is_public ? 'bg-ocean' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-all ${formData.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>

        <div className="md:col-span-2 pt-4">
           <button 
             disabled={loading}
             className="w-full bg-ocean text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-ocean/90 transition-all shadow-xl disabled:opacity-50"
           >
             {loading ? 'Initializing Loop...' : 'Generate Itinerary'}
             <ArrowRight className="h-5 w-5" />
           </button>
        </div>
      </motion.form>
    </div>
  );
}
