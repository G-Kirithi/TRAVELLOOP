import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Mail, Lock, User, ArrowRight, ChevronLeft, Loader2, MapPin } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export default function Auth() {
  const navigate = useNavigate();
  const { login: setAuthData } = useAuth();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [homeCity, setHomeCity] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'REGISTER') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const { data } = await authApi.register({
          email,
          password,
          displayName,
          username,
          homeCity
        });
        setAuthData(data.token, data.user);
        navigate('/dashboard');
      } else if (mode === 'LOGIN') {
        const { data } = await authApi.login({ email, password });
        setAuthData(data.token, data.user);
        navigate('/dashboard');
      } else if (mode === 'FORGOT_PASSWORD') {
        const { data } = await authApi.forgotPassword(email);
        setMessage(data.message);
        setMode('RESET_PASSWORD'); // Directly change mode for web-based reset
      } else if (mode === 'RESET_PASSWORD') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { data } = await authApi.resetPassword({ email, password });
        setMessage(data.message);
        setMode('LOGIN');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError(mode === 'LOGIN' ? 'Invalid email or password. Please try again.' : 'Session expired or unauthorized. Please sign in.');
      } else {
        setError(err.response?.data?.error || err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-white/40"
      >
        <div className="bg-ocean w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Plane className="h-8 w-8 text-white" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display mb-2">
            {mode === 'LOGIN' && 'Welcome Back'}
            {mode === 'REGISTER' && 'Join Traveloop'}
            {mode === 'FORGOT_PASSWORD' && 'Identify Yourself'}
            {mode === 'RESET_PASSWORD' && 'Set New Password'}
          </h1>
          <p className="text-slate-500 text-sm font-light leading-relaxed">
            {mode === 'LOGIN' && 'Sign in to your account to continue your journey.'}
            {mode === 'REGISTER' && 'Create an account to start planning your dream trips.'}
            {mode === 'FORGOT_PASSWORD' && 'Enter your email to verify your identity.'}
            {mode === 'RESET_PASSWORD' && 'Your account was found! Please choose a strong new password.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-3"
          >
            <div className="bg-red-100 p-1 rounded-full text-[8px]">⚠️</div>
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium border border-green-100"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'REGISTER' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">@</span>
                  <input 
                    type="text"
                    required
                    placeholder="Username"
                    className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="Home City"
                    className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all"
                    value={homeCity}
                    onChange={e => setHomeCity(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="email"
              required
              disabled={mode === 'RESET_PASSWORD'}
              placeholder="Email Address"
              className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all disabled:opacity-50"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {(mode !== 'FORGOT_PASSWORD') && (
            <>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  placeholder={mode === 'RESET_PASSWORD' ? "New Password" : "Password"}
                  className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {(mode === 'REGISTER' || mode === 'RESET_PASSWORD') && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Confirm Password"
                    className="w-full bg-white/50 border border-slate-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-ocean outline-none transition-all"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {mode === 'LOGIN' && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setMode('FORGOT_PASSWORD')}
                className="text-xs text-ocean font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ocean text-white p-4 rounded-2xl font-bold hover:bg-ocean/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {mode === 'LOGIN' && 'Sign In'}
                {mode === 'REGISTER' && 'Create Account'}
                {mode === 'FORGOT_PASSWORD' && 'Verify Account'}
                {mode === 'RESET_PASSWORD' && 'Update Password'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-300">
               <span className="bg-white px-4">TRAVELOOP</span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm font-medium">
          {mode === 'LOGIN' ? (
            <p className="text-slate-500">
              Don't have an account?{' '}
              <button onClick={() => setMode('REGISTER')} className="text-ocean font-bold underline">Sign Up</button>
            </p>
          ) : mode === 'REGISTER' ? (
            <p className="text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setMode('LOGIN')} className="text-ocean font-bold underline">Sign In</button>
            </p>
          ) : (
            <button 
              onClick={() => setMode('LOGIN')}
              className="text-slate-500 flex items-center gap-1 mx-auto hover:text-ocean transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Login
            </button>
          )}
        </div>

        <p className="mt-10 text-[10px] text-slate-400 font-light text-center">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
