import React, { useState, useMemo } from 'react';
import { Father } from '../../types';
import { Calendar, Search, Clock, ShieldCheck, UserCheck, Star, UserPlus, X, User, Phone, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { fatherhoodApi } from '../../services/fatherhoodApi';

interface CheckInProps {
  fathers: Father[];
  modules: { id: number; title: string; description?: string }[];
  onCheckIn: (fatherId: string, moduleId: number, date?: string) => Promise<{ success: boolean; message?: string; alreadyCompleted?: boolean; data?: Father }>;
  onRefresh: () => void;
}

// ============================================================
// CORRECT FOAM FATHERHOOD CURRICULUM - 14 Classes
// Updated to match official FOAM curriculum
// ============================================================
const TRACKER_MODULES = [
  { id: 1, title: "Conflict Resolution/Anger Management", category: "Personal Development" },
  { id: 2, title: "Becoming Self-Sufficient", category: "Life Skills" },
  { id: 3, title: "Building Your Child's Self-Esteem", category: "Parenting" },
  { id: 4, title: "Co-Parenting/Single Fatherhood", category: "Parenting" },
  { id: 5, title: "Male/Female Relationship", category: "Relationships" },
  { id: 6, title: "Manhood", category: "Identity" },
  { id: 7, title: "Values", category: "Personal Development" },
  { id: 8, title: "Communication/Active Listening", category: "Relationships" },
  { id: 9, title: "Dealing with Stress", category: "Personal Development" },
  { id: 10, title: "Coping with Fatherhood Discrimination", category: "Identity" },
  { id: 11, title: "Fatherhood Today", category: "Identity" },
  { id: 12, title: "Understanding Children's Needs", category: "Parenting" },
  { id: 13, title: "A Father's Influence on His Child", category: "Parenting" },
  { id: 14, title: "Relationships", category: "Relationships" }
];

// Generate all Tuesdays for 2026 with correct module sequence
// January 13, 2026 = Module 9 (Dealing with Stress), then cycles through 14 modules
const generate2026Tuesdays = (): { date: string; module: number; title: string }[] => {
  const tuesdays: { date: string; module: number; title: string }[] = [];
  const startDate = new Date('2026-01-13T12:00:00'); // First class Tuesday of 2026 cycle
  const endDate = new Date('2026-12-31T12:00:00');
  
  // Starting module index: January 13, 2026 = Module 9 (index 8 in 0-based array)
  const startingModuleIndex = 8; // Module 9 = "Dealing with Stress"
  
  let current = new Date(startDate);
  let weekCount = 0;
  
  while (current <= endDate) {
    // Calculate which module based on starting point and weeks elapsed
    const moduleIndex = (startingModuleIndex + weekCount) % 14;
    const moduleNum = moduleIndex + 1; // Convert to 1-based module number
    const moduleTitle = TRACKER_MODULES[moduleIndex].title;
    
    // Format as YYYY-MM-DD
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    
    tuesdays.push({
      date: `${year}-${month}-${day}`,
      module: moduleNum,
      title: moduleTitle
    });
    
    // Move to next Tuesday
    current.setDate(current.getDate() + 7);
    weekCount++;
  }
  
  return tuesdays;
};

// Special classes (non-curriculum) - these won't count toward graduation
const SPECIAL_CLASSES = [
  { id: 101, title: "Orientation / Welcome Session" },
  { id: 102, title: "Guest Speaker Event" },
  { id: 103, title: "Community Resource Fair" },
  { id: 104, title: "Father-Child Activity Day" },
  { id: 105, title: "Graduation Ceremony" },
  { id: 106, title: "Alumni Meeting" },
  { id: 107, title: "Holiday Celebration" },
  { id: 108, title: "Workshop: Resume Building" },
  { id: 109, title: "Workshop: Financial Planning" },
  { id: 110, title: "Support Group Session" },
  { id: 111, title: "Other Special Event" }
];

// Get today's date in YYYY-MM-DD format
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Find the closest Tuesday to today (for default selection)
const findClosestTuesday = (tuesdays: { date: string; module: number; title: string }[]): string => {
  const today = getTodayString();
  
  // If today is in the list, return it
  const todayEntry = tuesdays.find(t => t.date === today);
  if (todayEntry) {
    return today;
  }
  
  // Find the next upcoming Tuesday
  const todayDate = new Date(today);
  for (const tuesday of tuesdays) {
    if (new Date(tuesday.date) >= todayDate) {
      return tuesday.date;
    }
  }
  
  // If no future Tuesday, return the last one
  return tuesdays[tuesdays.length - 1]?.date || tuesdays[0]?.date;
};

export const CheckIn: React.FC<CheckInProps> = ({ fathers, modules, onCheckIn, onRefresh }) => {
  // Generate 2026 Tuesdays with correct module sequence
  const PROGRAM_DATES_2026 = useMemo(() => generate2026Tuesdays(), []);
  
  // Set default date to closest Tuesday
  const defaultDate = useMemo(() => findClosestTuesday(PROGRAM_DATES_2026), [PROGRAM_DATES_2026]);
  
  // Get the module for the default date
  const defaultModuleEntry = PROGRAM_DATES_2026.find(t => t.date === defaultDate);
  const defaultModuleId = defaultModuleEntry?.module || 9;
  
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(defaultModuleId);
  const [isSpecialClass, setIsSpecialClass] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Father Modal State
  const [showNewFatherModal, setShowNewFatherModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Future threshold - sessions more than 7 days from now
  const isFutureSession = new Date(selectedDate) > new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

  // When date changes, auto-select the correct module for that date
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (!isSpecialClass) {
      const dateEntry = PROGRAM_DATES_2026.find(t => t.date === newDate);
      if (dateEntry) {
        setSelectedModuleId(dateEntry.module);
      }
    }
  };

  const handleToggleCheckIn = async (father: Father) => {
    setLoadingMap(prev => ({ ...prev, [father.id]: true }));
    try {
        await onCheckIn(father.id, selectedModuleId, selectedDate);
        // Refresh data after check-in
        onRefresh();
    } finally {
        setLoadingMap(prev => ({ ...prev, [father.id]: false }));
    }
  };

  // Handle class type change
  const handleClassTypeChange = (isSpecial: boolean) => {
    setIsSpecialClass(isSpecial);
    if (isSpecial) {
      setSelectedModuleId(SPECIAL_CLASSES[0].id);
    } else {
      // Set to the module for the current selected date
      const dateEntry = PROGRAM_DATES_2026.find(t => t.date === selectedDate);
      if (dateEntry) {
        setSelectedModuleId(dateEntry.module);
      } else {
        setSelectedModuleId(9); // Default to Module 9
      }
    }
  };

  // Handle new father registration
  const handleRegisterNewFather = async () => {
    if (!newFirstName.trim() || !newLastName.trim()) {
      setRegisterError('First name and last name are required.');
      return;
    }
    
    setRegistering(true);
    setRegisterError(null);
    
    try {
      const newFather = await fatherhoodApi.addFather({
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined
      });
      
      if (newFather) {
        setRegisterSuccess(true);
        // Refresh the fathers list
        onRefresh();
        // Reset form after short delay
        setTimeout(() => {
          setShowNewFatherModal(false);
          setNewFirstName('');
          setNewLastName('');
          setNewPhone('');
          setNewEmail('');
          setRegisterSuccess(false);
        }, 1500);
      } else {
        setRegisterError('Registration failed. Please try again.');
      }
    } catch (err) {
      setRegisterError('Registration failed. Please check your connection and try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Reset modal state when closing
  const closeModal = () => {
    setShowNewFatherModal(false);
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('');
    setNewEmail('');
    setRegisterError(null);
    setRegisterSuccess(false);
  };

  const filteredFathers = fathers.filter(f => 
    `${f.firstName} ${f.lastName} ${f.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.lastName.localeCompare(b.lastName));

  // Get current module/class info for display - USE LOCAL TRACKER_MODULES, not API modules
  const currentClass = isSpecialClass 
    ? SPECIAL_CLASSES.find(c => c.id === selectedModuleId)
    : TRACKER_MODULES.find(m => m.id === selectedModuleId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* New Father Modal */}
      {showNewFatherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add New Father</h2>
                    <p className="text-emerald-100 text-sm">Register a new participant</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {registerSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Father Registered!</h3>
                  <p className="text-slate-500">They've been added to the roster.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone <span className="text-slate-400 text-xs font-normal">(Recommended)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="(225) 555-1234"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {registerError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {registerError}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegisterNewFather}
                      disabled={registering || !newFirstName.trim() || !newLastName.trim()}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        registering || !newFirstName.trim() || !newLastName.trim()
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {registering ? (
                        <>
                          <RefreshCw className="animate-spin" size={18} />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Add Father
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Program Check-In</span>
                <h2 className="text-3xl font-black">Attendance Command</h2>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Add New Father Button */}
                <button
                  onClick={() => setShowNewFatherModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Add New Father</span>
                  <span className="sm:hidden">New</span>
                </button>
                
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder="Search roster..."
                        className="w-full bg-white/10 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Class Type Toggle */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Class Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => handleClassTypeChange(false)}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${
                !isSpecialClass 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Calendar size={18} />
              Curriculum Class (1-14)
            </button>
            <button
              onClick={() => handleClassTypeChange(true)}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${
                isSpecialClass 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Star size={18} />
              Special Event / Other
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-50">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Session Date (2026)</label>
                <select value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-slate-700 outline-none focus:border-blue-500 transition-all">
                    {PROGRAM_DATES_2026.map(({ date, title }) => {
                        const isToday = date === getTodayString();
                        return (
                            <option key={date} value={date}>
                                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                {isToday ? ' (Today)' : ''} - {title}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {isSpecialClass ? <Star size={12}/> : <Clock size={12}/>} 
                  {isSpecialClass ? 'Special Event / Other' : 'Curriculum Module'}
                </label>
                <select 
                  value={selectedModuleId} 
                  onChange={(e) => setSelectedModuleId(Number(e.target.value))} 
                  className={`w-full p-4 rounded-2xl border-2 font-black text-slate-700 outline-none transition-all ${
                    isSpecialClass 
                      ? 'border-purple-100 bg-purple-50 focus:border-purple-500' 
                      : 'border-slate-50 bg-slate-50 focus:border-blue-500'
                  }`}
                >
                    {isSpecialClass 
                      ? SPECIAL_CLASSES.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.title}</option>
                        ))
                      : TRACKER_MODULES.map(m => (
                          <option key={m.id} value={m.id}>Module {m.id}: {m.title}</option>
                        ))
                    }
                </select>
            </div>
        </div>

        {/* Special Class Notice */}
        {isSpecialClass && (
            <div className="bg-purple-600 p-4 flex items-center justify-center gap-4 text-white">
                <Star size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Special Event / Other: Attendance will NOT count toward 14-class graduation requirement</span>
            </div>
        )}

        {isFutureSession && !isSpecialClass && (
            <div className="bg-emerald-600 p-4 flex items-center justify-center gap-4 text-white">
                <ShieldCheck size={20} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Future Projection Active: Mark Attendance for Forward Planning</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl divide-y divide-slate-50 overflow-hidden">
              {filteredFathers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-bold">
                    {searchTerm ? `No fathers found matching "${searchTerm}"` : 'No fathers in the roster yet.'}
                  </p>
                  <button
                    onClick={() => setShowNewFatherModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all"
                  >
                    <UserPlus size={18} />
                    Add First Father
                  </button>
                </div>
              ) : (
                filteredFathers.map(father => {
                    // For special classes, check if they've attended this special event
                    // For curriculum, check completedModules as before
                    const isPresent = isSpecialClass 
                      ? false // Special classes don't track in completedModules
                      : father.completedModules.includes(selectedModuleId);
                    const isLoading = loadingMap[father.id];
                    return (
                        <div key={father.id} className={`p-6 flex items-center justify-between transition-all ${isPresent ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${isPresent ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>#{father.id}</div>
                                <div>
                                    <p className={`text-lg font-black ${isPresent ? 'text-blue-600' : 'text-slate-800'}`}>{father.lastName}, {father.firstName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{father.phone || 'No phone'}</p>
                                </div>
                            </div>
                            <button 
                              onClick={() => handleToggleCheckIn(father)} 
                              disabled={isLoading} 
                              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                isPresent 
                                  ? 'bg-emerald-500 text-white' 
                                  : isSpecialClass
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-slate-800 text-white hover:bg-black'
                              } ${isLoading ? 'opacity-50' : ''}`}
                            >
                                {isLoading ? 'Syncing...' : isPresent ? 'Confirmed Present' : 'Mark Present'}
                            </button>
                        </div>
                    );
                })
              )}
          </div>
      </div>

      {/* Info Box */}
      <div className={`rounded-2xl p-4 flex items-center gap-4 ${isSpecialClass ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSpecialClass ? 'bg-purple-100' : 'bg-blue-100'}`}>
          {isSpecialClass ? <Star size={20} className="text-purple-600" /> : <Calendar size={20} className="text-blue-600" />}
        </div>
        <div>
          <p className={`font-bold ${isSpecialClass ? 'text-purple-800' : 'text-blue-800'}`}>
            {isSpecialClass ? 'Special Event / Other Mode' : '2026 Curriculum Schedule'}
          </p>
          <p className={`text-sm ${isSpecialClass ? 'text-purple-600' : 'text-blue-600'}`}>
            {isSpecialClass 
              ? 'Special events and "Other" classes are tracked separately and do not count toward the 14-class graduation requirement.'
              : 'Classes start with "Dealing with Stress" on Jan 13, 2026 and rotate through all 14 modules.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
