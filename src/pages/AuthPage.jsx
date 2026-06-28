import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { migrateAnonymousCanvas } from '../lib/canvasApi';
import { useAuth } from '../lib/AuthContext';
import logoLight from '../assets/SketchSpace Light Mode.svg';
import logoDark from '../assets/SketchSpace Dark Mode.svg';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        if (data?.session) {
          const params = new URLSearchParams(window.location.search);
          const migrateId = params.get('migrate');
          if (migrateId) {
            try {
              await migrateAnonymousCanvas(migrateId, data.session.user.id);
              navigate(`/canvas/${migrateId}`);
              return;
            } catch (err) {
              console.error("Migration failed on login", err);
            }
          }
          navigate('/dashboard'); // Go to dashboard on successful login
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists.');
        } else {
          // If auto-login happened (e.g., email confirmation disabled)
          if (data?.session) {
            const params = new URLSearchParams(window.location.search);
            const migrateId = params.get('migrate');
            if (migrateId) {
              try {
                await migrateAnonymousCanvas(migrateId, data.session.user.id);
                navigate(`/canvas/${migrateId}`);
                return;
              } catch (err) {
                console.error("Migration failed on signup", err);
              }
            }
            navigate('/dashboard');
            return;
          }

          setSuccess('Account created! Please check your email to verify your account.');
          
          // Save pending migration for later (if email confirmation is on)
          const params = new URLSearchParams(window.location.search);
          const migrateId = params.get('migrate');
          if (migrateId) {
            localStorage.setItem('pendingMigration', migrateId);
          }

          // Auto switch to login mode after successful signup
          setTimeout(() => setIsLogin(true), 3000);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300 rounded-[30px]">
      
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-[100] flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all hover:-translate-x-0.5"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      ></div>
      
      {/* Decorative Background Elements */}
      <div className="hidden lg:flex absolute left-[15%] top-[20%] w-24 h-24 bg-purple-300 dark:bg-purple-500 rounded-md transform -rotate-12 shadow-md items-center justify-center border border-purple-200 dark:border-purple-400 pointer-events-none">
        <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-xl"></div>
      </div>
      
      <div className="hidden lg:flex absolute right-[15%] bottom-[25%] w-28 h-28 border-2 border-blue-500 flex items-center justify-center z-0 pointer-events-none transform rotate-6">
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="w-24 h-24 bg-yellow-400 rounded-full"></div>
      </div>


      {/* Green Bounding Box (Rectangle) */}
      <div className="hidden lg:flex absolute right-[10%] top-[25%] w-32 h-20 border-2 border-blue-500 flex items-center justify-center z-0 pointer-events-none transform rotate-12">
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
        <div className="w-full h-full bg-green-400 opacity-80"></div>
      </div>



      {/* Handwriting */}
      <div className="hidden lg:block absolute right-[20%] bottom-[15%] z-0 pointer-events-none transform -rotate-6">
        <p className="font-mono text-xl font-bold text-gray-400 dark:text-gray-600">x² + y² = r²</p>
      </div>

      {/* Doodle: Heart with lines */}
      <div className="hidden lg:block absolute right-[80%] top-[60%] z-0 pointer-events-none transform rotate-12 opacity-80">
        <svg width="70" height="60" viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 35 25 C 35 25 30 10 15 15 C 0 20 15 45 35 55 C 55 45 70 20 55 15 C 40 10 35 25 35 25 Z" stroke="currentColor" className="text-blue-900 dark:text-blue-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 5 30 L 10 30 M 60 30 L 65 30 M 15 10 L 10 5 M 55 10 L 60 5" stroke="currentColor" className="text-blue-900 dark:text-blue-400" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Doodle: Sparkles */}
      <div className="hidden lg:block absolute left-[30%] bottom-[10%] z-0 pointer-events-none opacity-80">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 25 5 Q 25 25 5 25 Q 25 25 25 45 Q 25 25 45 25 Q 25 25 25 5 Z" stroke="currentColor" className="text-blue-900 dark:text-blue-400" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 40 10 Q 40 15 35 15 Q 40 15 40 20 Q 40 15 45 15 Q 40 15 40 10 Z" stroke="currentColor" className="text-blue-900 dark:text-blue-400" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </div>



      {/* Doodle: Multi-Loop Curve */}
      <div className="hidden lg:block absolute right-[22%] bottom-[85%] z-0 pointer-events-none opacity-80 transform rotate-6">
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 5 30 C 20 -10, 40 70, 45 30 C 50 -10, 70 70, 75 30 C 80 -10, 100 70, 95 30" stroke="currentColor" className="text-blue-900 dark:text-blue-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-xl mx-4 transition-colors duration-300">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6">
            <img src={logoLight} alt="Sketchspace Logo" className="h-12 dark:hidden block" />
            <img src={logoDark} alt="Sketchspace Logo" className="h-12 hidden dark:block" />
          </div>
          <div className="relative w-full flex justify-center mb-2">
            <h1 className="text-3xl font-black tracking-tight leading-tight relative whitespace-nowrap z-10">
              <span 
                className="absolute inset-0 text-transparent [-webkit-text-stroke:8px_white] dark:[-webkit-text-stroke:8px_#1f2937] z-[-1] drop-shadow-[0_6px_6px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]"
                aria-hidden="true"
              >
                {isLogin ? 'Welcome back' : 'Create account'}
              </span>
              <span className="text-gray-900 dark:text-white relative z-10">{isLogin ? 'Welcome back' : 'Create account'}</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors duration-300">
            {isLogin ? 'Sign in to access your saved canvases' : 'Create an account to save your work permanently'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-tight">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="text-green-500 dark:text-green-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-green-600 dark:text-green-400 font-medium leading-tight">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-medium shadow-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-medium shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-2 py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_0_4px_white,0_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_4px_#1f2937,0_4px_10px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none mt-8"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
