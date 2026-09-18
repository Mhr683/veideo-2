import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    notify,
  } = useStudio();

  const [email, setEmail] = useState('director@visionforge.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Director Alex');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'login') {
      login(email, password);
    } else if (authModalMode === 'signup') {
      signup(name, email, password);
    } else if (authModalMode === 'forgot') {
      notify(`Reset link & verification code sent to ${email}`, 'info');
      setAuthModalMode('reset');
    } else if (authModalMode === 'reset') {
      notify('Password successfully reset. Please sign in.', 'success');
      setAuthModalMode('login');
    }
  };

  const handleGoogleOAuth = () => {
    login('creator@google.com', 'oauth');
    notify('Successfully authenticated via Google OAuth', 'success');
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-extrabold text-sm mb-3 shadow-lg shadow-orange-950/40">
            VF
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {authModalMode === 'login' && 'Sign in to VisionForge AI'}
            {authModalMode === 'signup' && 'Create your Studio Account'}
            {authModalMode === 'forgot' && 'Reset Password'}
            {authModalMode === 'reset' && 'Enter Reset Code'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {authModalMode === 'login' && 'Direct cinematic AI image, video, and storyboard production.'}
            {authModalMode === 'signup' && 'Start with 250 free creation credits on registration.'}
            {authModalMode === 'forgot' && 'Enter your email to receive recovery instructions.'}
            {authModalMode === 'reset' && 'Set a new secure studio password.'}
          </p>
        </div>

        {/* Google OAuth Quick Button */}
        {(authModalMode === 'login' || authModalMode === 'signup') && (
          <div className="space-y-3 mb-5">
            <button
              onClick={handleGoogleOAuth}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-[#171a25] hover:bg-[#1f2334] border border-[#2a2f44] text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#232737] w-full" />
              <span className="bg-[#10121a] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                or email
              </span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authModalMode === 'signup' && (
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Christopher Nolan"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl pl-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@studio.com"
                className="w-full bg-[#161824] border border-[#262b3c] rounded-xl pl-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {(authModalMode === 'login' || authModalMode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-zinc-400">Password</label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('forgot')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl pl-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          {authModalMode === 'reset' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 text-center font-mono tracking-widest text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>
              {authModalMode === 'login' && 'Sign In to Workspace'}
              {authModalMode === 'signup' && 'Create Account & Claim Credits'}
              {authModalMode === 'forgot' && 'Send Recovery Instructions'}
              {authModalMode === 'reset' && 'Update Password'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer switcher */}
        <div className="mt-5 pt-4 border-t border-[#1e2230] text-center text-xs text-zinc-400">
          {authModalMode === 'login' ? (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign up free
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
