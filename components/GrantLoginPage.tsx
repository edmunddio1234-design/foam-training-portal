import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface GrantLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

// Authorized users for Grant Management
const AUTHORIZED_USERS = [
  'sonny@foamla.org',
  'levar.robinson@foamla.org',
  'awesley@foamla.org'
];

const GRANT_PASSWORD = 'foam2024';

const GrantLoginPage: React.FC<GrantLoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is in authorized list
    if (!AUTHORIZED_USERS.includes(normalizedEmail)) {
      setError({
        title: 'Access Denied',
        detail: 'Your account is not authorized for Grant Management. Only designated administrators can access this portal. Contact your supervisor if you need access.'
      });
      setIsLoading(false);
      return;
    }

    // Check password
    if (password !== GRANT_PASSWORD) {
      setError({
        title: 'Invalid Credentials',
        detail: 'The password you entered is incorrect. Please try again.'
      });
      setIsLoading(false);
      return;
    }

    // Success
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Hub</span>
        </button>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Grant Management Access</h1>
            <p className="text-slate-400 text-sm">Restricted to authorized administrators only</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-300 font-bold text-sm">{error.title}</p>
                    <p className="text-red-200/70 text-xs mt-1">{error.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@foamla.org"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Access Grant Management
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-500 text-xs">
              <span className="text-blue-400">🔒</span> This portal contains sensitive financial data.
              <br />Unauthorized access attempts are logged.
            </p>
          </div>
        </div>

        {/* Authorized Users Hint (for admin reference) */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-xs">
            Authorized: Executive Director, Program Director, Finance Admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrantLoginPage;
