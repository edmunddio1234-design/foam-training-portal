import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{title: string, detail: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check if email ends with @foamla.org
    if (!email.toLowerCase().endsWith('@foamla.org')) {
      setError({ 
        title: "Access Denied", 
        detail: "Only @foamla.org email addresses are authorized to access this portal. Please contact your administrator if you need access." 
      });
      return;
    }

    // Check if password is provided
    if (!password) {
      setError({ 
        title: "Password Required", 
        detail: "Please enter your password to continue." 
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full md:w-1/2 bg-[#0F2C5C] p-12 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><i className="fas fa-fingerprint text-[20rem]"></i></div>
            <div className="relative z-10">
                 <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8"><span className="text-[#0F2C5C] font-black text-4xl italic tracking-tighter">F</span></div>
                 <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 leading-tight">Fathers On A Mission Portal Access</h1>
                 <p className="text-indigo-200 font-medium text-lg tracking-wide uppercase">Mission Security Protocol</p>
            </div>
            <div className="relative z-10 space-y-6 mt-12 md:mt-0">
                <div className="bg-indigo-900/30 backdrop-blur-md p-6 rounded-2xl border border-indigo-400/20"><p className="text-lg font-light leading-relaxed italic text-indigo-100">"Enhancing Fathers and Father Figures which will ultimately strengthen families."</p></div>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300"><div className="w-12 h-0.5 bg-indigo-400"></div><span>Secure portal gateway</span></div>
            </div>
        </div>
        <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white relative">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Staff Login</h2>
              <p className="text-slate-500 font-medium">Enter your @foamla.org credentials to continue.</p>
            </div>
            
            {error && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="p-4 bg-rose-600 rounded-t-2xl flex items-center gap-3">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                  <span className="text-white text-xs font-black uppercase tracking-widest">{error.title}</span>
                </div>
                <div className="p-4 bg-rose-50 border-x border-b border-rose-100 rounded-b-2xl">
                  <p className="text-rose-800 text-xs font-bold leading-relaxed">{error.detail}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <i className="fas fa-id-badge absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F2C5C] transition-colors"></i>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#0F2C5C] focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" 
                      placeholder="you@foamla.org" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F2C5C] transition-colors"></i>
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#0F2C5C] focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" 
                      placeholder="Enter your password" 
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full py-4 bg-[#0F2C5C] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#1A4D2E] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <i className="fas fa-circle-notch fa-spin"></i>
                    ) : (
                      <>
                        <span className="text-sm">Sign In</span>
                        <i className="fas fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-xs">
                <i className="fas fa-shield-alt mr-2"></i>
                Authorized FOAM staff only
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
