import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { migrateAnonymousCanvas } from '../lib/canvasApi';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-cyan-400/20 blur-[80px] pointer-events-none"></div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-black/20 mx-4 transition-colors duration-300">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform hover:scale-105 transition-transform">
            <span className="text-2xl text-white">🥽</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
            Welcome to SketchSpace
          </h1>
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
                className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
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
                className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-6"
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
