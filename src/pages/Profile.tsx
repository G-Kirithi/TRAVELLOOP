import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { User, MapPin, Settings, Shield, Bell } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="h-48 bg-ocean relative">
          <div className="absolute -bottom-12 left-12">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
               <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                 {user?.photo_url ? (
                   <img src={user.photo_url} alt="profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="h-10 w-10 text-slate-300" />
                 )}
               </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-12 px-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-display mb-1">{user?.display_name || 'Traveler'}</h1>
              <p className="text-slate-400 font-light italic">{user?.email}</p>
            </div>
            <button className="bg-sand text-ocean px-6 py-3 rounded-2xl font-bold hover:bg-ocean hover:text-white transition-all border border-ocean/10">
              Edit Profile
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="text-xl font-display flex items-center gap-2">
                 <Settings className="h-5 w-5 text-ocean" /> Preferences
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'Language', value: 'English (US)' },
                    { label: 'Currency', value: 'USD ($)' },
                    { label: 'Timezone', value: 'UTC+0 (GMT)' },
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <span className="text-sm text-slate-500 font-medium">{p.label}</span>
                      <span className="text-sm font-bold text-slate-800">{p.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-display flex items-center gap-2">
                 <Shield className="h-5 w-5 text-ocean" /> Security
               </h3>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Bell className="h-4 w-4 text-slate-400" />
                       <span className="text-sm font-medium">Email Notifications</span>
                    </div>
                    <div className="w-10 h-5 bg-ocean rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <button className="w-full p-4 border border-red-100 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-50 transition-all text-left">
                    Delete Account Permanently
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
