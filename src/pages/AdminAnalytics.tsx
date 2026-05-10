import React, { useEffect, useState } from 'react';
import { tripApi } from '../services/api';
import { motion } from 'motion/react';
import { Users, Plane, DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalBudget: 0,
    tripsPerMonth: [
      { name: 'Jan', count: 4 },
      { name: 'Feb', count: 7 },
      { name: 'Mar', count: 5 },
      { name: 'Apr', count: 12 },
      { name: 'May', count: 18 },
    ]
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await tripApi.getStats();
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers,
          totalTrips: data.totalTrips,
          totalBudget: data.totalTrips * 1250 // Hypothetical average
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl mb-2 font-display">System Analytics</h1>
        <p className="text-slate-500">Real-time performance metrics for Traveloop platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: <Users />, color: 'bg-blue-500' },
          { label: 'Active Trips', value: stats.totalTrips, icon: <Plane />, color: 'bg-green-500' },
          { label: 'Global Volume', value: `$${stats.totalBudget.toLocaleString()}`, icon: <DollarSign />, color: 'bg-sunset' },
          { label: 'Growth rate', value: '+14%', icon: <TrendingUp />, color: 'bg-purple-500' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6", item.color)}>
              {React.cloneElement(item.icon as React.ReactElement, { className: 'h-6 w-6' })}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-4xl font-display font-bold text-slate-900">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-2xl mb-8 font-display flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-ocean" /> Trip Creation Trends
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tripsPerMonth}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {stats.tripsPerMonth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#0077b6' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <PieChart className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl mb-2 font-display">Popular Destinations</h3>
            <p className="text-slate-400 max-w-xs mb-8">Top cities by frequency in user itineraries this month.</p>
            <div className="space-y-4 w-full">
               {[
                 { name: 'Paris', count: 42, pct: 85 },
                 { name: 'Tokyo', count: 38, pct: 70 },
                 { name: 'Lisbon', count: 29, pct: 55 },
                 { name: 'New York', count: 21, pct: 40 },
               ].map((city, i) => (
                 <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold">
                       <span>{city.name}</span>
                       <span className="text-ocean">{city.count} trips</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${city.pct}%` }}
                         className="h-full bg-ocean rounded-full" 
                       />
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
}
