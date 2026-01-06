import React, { useState } from 'react';
import { 
  UserX, Phone, Mail, AlertTriangle, CheckCircle2, 
  MessageSquare, Clock, RefreshCw, X, User
} from 'lucide-react';
import { Father } from '../../types';

interface Module {
  id: number;
  title: string;
  description?: string;
}

interface LostManagementProps {
  fathers: Father[];
  modules: Module[];
  onUpdateFather: (father: Father) => void;
  onRefresh?: () => void;
}

export const LostManagement: React.FC<LostManagementProps> = ({ 
  fathers, 
  modules, 
  onUpdateFather,
  onRefresh 
}) => {
  const [selectedFather, setSelectedFather] = useState<Father | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState<'call' | 'text' | 'email'>('call');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sort by least modules completed
  const sortedFathers = [...fathers].sort((a, b) => 
    a.completedModules.length - b.completedModules.length
  );

  const handleInitiateReengagement = (father: Father) => {
    setSelectedFather(father);
    setShowContactModal(true);
    setNotes('');
    setSuccessMessage(null);
  };

  const handleSubmitOutreach = async () => {
    if (!selectedFather) return;
    
    setIsSubmitting(true);
    
    // Simulate API call - logs outreach attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Outreach logged:', {
      fatherId: selectedFather.id,
      fatherName: `${selectedFather.firstName} ${selectedFather.lastName}`,
      method: contactMethod,
      notes: notes,
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitting(false);
    setSuccessMessage(`Outreach to ${selectedFather.firstName} logged successfully!`);
    
    setTimeout(() => {
      setShowContactModal(false);
      setSelectedFather(null);
      setSuccessMessage(null);
    }, 2000);
  };

  const getUrgencyLevel = (completedCount: number) => {
    if (completedCount === 0) return { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' };
    if (completedCount === 1) return { label: 'High', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <UserX className="text-amber-600" size={28} />
            Lost to Follow-up
          </h1>
          <p className="text-slate-500 mt-1">Fathers who need outreach and re-engagement</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {fathers.filter(f => f.completedModules.length === 0).length}
              </p>
              <p className="text-sm text-red-600">No Classes Attended</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                {fathers.filter(f => f.completedModules.length === 1).length}
              </p>
              <p className="text-sm text-amber-600">Only 1 Class</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserX className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{fathers.length}</p>
              <p className="text-sm text-blue-600">Total At Risk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Father List */}
      {sortedFathers.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={48} />
          <h3 className="text-lg font-bold text-emerald-800">No At-Risk Fathers!</h3>
          <p className="text-emerald-600 mt-1">All fathers are making progress in the program.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Fathers Needing Outreach</h3>
            <p className="text-sm text-slate-500">Sorted by urgency (least progress first)</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {sortedFathers.map((father) => {
              const urgency = getUrgencyLevel(father.completedModules.length);
              return (
                <div key={father.id} className="p-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                        {father.firstName.charAt(0)}{father.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">
                            {father.firstName} {father.lastName}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            {father.completedModules.length} of 14 modules
                          </span>
                          {father.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {father.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleInitiateReengagement(father)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Initiate Re-engagement
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedFather && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-2xl text-white relative">
              <button 
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Re-engagement Outreach</h2>
                  <p className="text-amber-100">{selectedFather.firstName} {selectedFather.lastName}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {successMessage ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={48} />
                  <p className="text-lg font-bold text-emerald-700">{successMessage}</p>
                </div>
              ) : (
                <>
                  {/* Contact Info */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedFather.phone || 'No phone on file'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedFather.email || 'No email on file'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedFather.completedModules.length} modules completed</span>
                    </div>
                  </div>

                  {/* Contact Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Method
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'call', label: 'Call', icon: Phone },
                        { id: 'text', label: 'Text', icon: MessageSquare },
                        { id: 'email', label: 'Email', icon: Mail }
                      ].map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setContactMethod(method.id as 'call' | 'text' | 'email')}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              contactMethod === method.id
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <Icon size={16} />
                            <span className="text-sm font-medium">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this outreach attempt..."
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-24"
                    />
                  </div>

                  {/* Quick Actions */}
                  {selectedFather.phone && (
                    <div className="flex gap-2">
                      <a
                        href={`tel:${selectedFather.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-all"
                      >
                        <Phone size={16} />
                        Call Now
                      </a>
                      <a
                        href={`sms:${selectedFather.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all"
                      >
                        <MessageSquare size={16} />
                        Send Text
                      </a>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOutreach}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Logging Outreach...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Log Outreach Attempt
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostManagement;
