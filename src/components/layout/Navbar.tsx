import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-ocean"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate(1)} 
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-ocean"
                title="Go forward"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-ocean p-2 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-ocean">Traveloop</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:text-ocean transition-colors">Dashboard</Link>
                <Link to="/admin" className="text-sm font-medium hover:text-ocean transition-colors text-slate-400">Admin</Link>
                <Link to="/trips/new" className="text-sm bg-ocean text-white px-4 py-2 rounded-full hover:bg-ocean/90 transition-all shadow-sm">Start Planning</Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:ring-2 hover:ring-ocean transition-all">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt="profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="h-4 w-4 text-slate-500" />
                    )}
                  </Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium hover:text-ocean transition-colors">Sign In</Link>
                <Link to="/auth" className="text-sm bg-ocean text-white px-4 py-2 rounded-full hover:bg-ocean/90 transition-all shadow-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-ocean p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium hover:text-ocean">Dashboard</Link>
                <Link to="/trips/new" className="block px-3 py-2 text-base font-medium hover:text-ocean">New Trip</Link>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-base font-medium text-red-500">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" className="block px-3 py-2 text-base font-medium hover:text-ocean">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
