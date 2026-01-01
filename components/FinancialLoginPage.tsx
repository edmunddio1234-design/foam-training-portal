
import React, { useState } from 'react';

interface FinancialLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

const ALLOWED_EMAILS = [
  'sonny@foamla.org',
  'levar.robinson@foamla.org',
  'awesley@foamla.org'
];

const FinancialLoginPage: React.FC<FinancialLoginPageProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict Email Whitelist Check
    if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
      setError("Access Restricted: This email is not authorized for the Financial Tools portal. Please contact the administrator.");
      return;
    }

    setIsLoading(true);
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 p-20 opacity-5 text-white pointer-events-none">
        <i className="fas fa-file-invoice-dollar text-[25rem]"></i>
      </div>
      
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95 duration-500 relative z-10 border-t-8 border-[#1A4D2E]">
        <div className="text-center mb-10">
          <button 
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-[#1A4D2E] transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to Command Center
          </button>
          
          <div className="w-20 h-20 bg-[#1A4D2E] text-white rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6">
            <i className="fas fa-vault text-3xl"></i>
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Finance Portal</h2>
          <p className="text-slate-500 font-medium">{isSignUp ? 'Restricted Account Creation' : 'Secure Staff Login'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
            <i className="fas fa-shield-exclamation text-rose-500 mt-1"></i>
            <p className="text-xs text-rose-700 font-bold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#1A4D2E] focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-slate-700"
                placeholder="name@foamla.org"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#1A4D2E] focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-slate-700"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#1A4D2E] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-emerald-100"
          >
            {isLoading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <span>{isSignUp ? 'Create Authorized ID' : 'Authenticate Access'}</span>
                <i className="fas fa-fingerprint"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-[10px] font-black text-[#1A4D2E] uppercase tracking-widest hover:underline underline-offset-4"
          >
            {isSignUp ? 'Return to Login' : 'First Time Setup? Create Account'}
          </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
          <i className="fas fa-shield-check text-emerald-600"></i>
          <span>Encrypted Financial Environment</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialLoginPage;
