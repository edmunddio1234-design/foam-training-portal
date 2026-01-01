
import React, { useState } from 'react';

interface TrainingLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

const TrainingLoginPage: React.FC<TrainingLoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F2C5C] p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <button 
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to Hub
          </button>
          
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6">
            <i className="fas fa-graduation-cap text-3xl"></i>
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academy Login</h2>
          <p className="text-slate-500 font-medium">Secondary Authentication Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academy Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700"
              placeholder="trainee@foam.org"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Training Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700"
              placeholder="••••••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <span>Enter Academy</span>
                <i className="fas fa-key"></i>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
          <i className="fas fa-shield-check text-indigo-400"></i>
          <span>Secure Training Environment</span>
        </div>
      </div>
    </div>
  );
};

export default TrainingLoginPage;
