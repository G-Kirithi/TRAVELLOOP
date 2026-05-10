import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, CreditCard, ChevronRight, ArrowRight, Sun, Palmtree, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2021" 
            alt="Travel background" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-display mb-6 tracking-tighter">
              Planning trips <br /> <span className="text-sunset italic">made fluid.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Traveloop helps you craft multi-city itineraries, track budgets, and discover experiences without the chaos of spreadsheets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth" className="w-full sm:w-auto bg-sunset text-ink px-8 py-4 rounded-full text-lg font-semibold hover:bg-sunset/90 transition-all flex items-center justify-center gap-2 group shadow-xl">
                Start Planning Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/trips/shared/demo" className="w-full sm:w-auto glass text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all text-center flex items-center justify-center">
                Explore Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Icons */}
        <div className="absolute bottom-10 left-10 hidden lg:block">
           <motion.div 
             animate={{ y: [0, -10, 0] }} 
             transition={{ repeat: Infinity, duration: 4 }}
             className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border border-white/20"
           >
              <div className="w-10 h-10 bg-ocean rounded-xl flex items-center justify-center shadow-lg">
                <Sun className="text-white h-5 w-5" />
              </div>
              <div className="text-sm">
                <p className="text-white/60 font-medium">Summer in Lisbon</p>
                <p className="text-white font-bold">$1,200 Spent</p>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Everything you need <br /> to <span className="text-ocean">loop</span> your journey.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">One platform for your entire travel lifecycle - from the first idea to the final journal entry.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin />, title: "Multi-city Logic", desc: "Easily reorder stops and assign dates across dozens of destinations." },
              { icon: <CreditCard />, title: "Smart Budgeting", desc: "Track every expense and stay under budget with real-time analytics." },
              { icon: <Calendar />, title: "Timeline Vista", desc: "View your entire trip in a visual timeline or interactive calendar." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-ocean/10 rounded-2xl flex items-center justify-center text-ocean mb-6">
                  {React.cloneElement(feature.icon as React.ReactElement, { className: "h-7 w-7" })}
                </div>
                <h3 className="text-2xl mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ocean py-20 px-4">
        <div className="max-w-5xl mx-auto bg-sunset rounded-[3rem] p-12 text-center text-ink flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Palmtree className="w-64 h-64" />
          </div>
          <div className="absolute bottom-0 left-0 p-8 opacity-10">
            <Mountain className="w-64 h-64" />
          </div>
          
          <h2 className="text-4xl md:text-5xl mb-6 relative z-10">Ready for your next adventure?</h2>
          <p className="text-xl mb-10 text-ink/70 relative z-10 max-w-lg">Join 20k+ travelers planning their dream trips on Traveloop today.</p>
          <Link to="/auth" className="bg-ink text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform relative z-10 shadow-lg">
            Create My Trip
          </Link>
        </div>
      </section>
    </div>
  );
}
