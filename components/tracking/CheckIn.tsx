import React, { useState, useMemo } from 'react';
import { Father } from '../../types';
import { TRACKER_MODULES } from '../../constants';
import { Calendar, Search, Clock, ShieldCheck, UserCheck, Star } from 'lucide-react';

interface CheckInProps {
  fathers: Father[];
  onCheckIn: (fatherId: string, moduleId: number, date: string) => Promise<void>;
}

// Generate all Tuesdays for 2026
const generate2026Tuesdays = (): string[] => {
  const tuesdays: string[] = [];
  const startDate = new Date('2026-01-06'); // First Tuesday of 2026
  const endDate = new Date('2026-12-31');
  
  let current = new Date(startDate);
  
  while (current <= endDate) {
    // Format as YYYY-MM-DD
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    tuesdays.push(`${year}-${month}-${day}`);
    
    // Move to next Tuesday
    current.setDate(current.getDate() + 7);
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
const findClosestTuesday = (tuesdays: string[]): string => {
  const today = getTodayString();
  
  // If today is in the list, return it
  if (tuesdays.includes(today)) {
    return today;
  }
  
  // Find the next upcoming Tuesday
  const todayDate = new Date(today);
  for (const tuesday of tuesdays) {
    if (new Date(tuesday) >= todayDate) {
      return tuesday;
    }
  }
  
  // If no future Tuesday, return the last one
  return tuesdays[tuesdays.length - 1] || tuesdays[0];
};

export const CheckIn: React.FC<CheckInProps> = ({ fathers, onCheckIn }) => {
  // Generate 2026 Tuesdays
  const PROGRAM_DATES_2026 = useMemo(() => generate2026Tuesdays(), []);
  
  // Set default date to closest Tuesday
  const defaultDate = useMemo(() => findClosestTuesday(PROGRAM_DATES_2026), [PROGRAM_DATES_2026]);
  
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [isSpecialClass, setIsSpecialClass] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Future threshold - sessions more than 7 days from now
  const isFutureSession = new Date(selectedDate) > new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

  const handleToggleCheckIn = async (father: Father) => {
    setLoadingMap(prev => ({ ...prev, [father.id]: true }));
    try {
        await onCheckIn(father.id, selectedModuleId, selectedDate);
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
      setSelectedModuleId(1);
    }
  };

  const filteredFathers = fathers.filter(f => 
    `${f.firstName} ${f.lastName} ${f.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.lastName.localeCompare(b.lastName));

  // Get current module/class info for display
  const currentClass = isSpecialClass 
    ? SPECIAL_CLASSES.find(c => c.id === selectedModuleId)
    : TRACKER_MODULES.find(m => m.id === selectedModuleId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Program Check-In</span>
                <h2 className="text-3xl font-black">Attendance Command</h2>
            </div>
            <div className="relative w-full md:w-80">
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
              Special Event
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-50">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Session Date (2026)</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-slate-700 outline-none focus:border-blue-500 transition-all">
                    {PROGRAM_DATES_2026.map(date => {
                        const isToday = date === getTodayString();
                        return (
                            <option key={date} value={date}>
                                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                {isToday ? ' (Today)' : ''}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {isSpecialClass ? <Star size={12}/> : <Clock size={12}/>} 
                  {isSpecialClass ? 'Special Event' : 'Curriculum Module'}
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
                <span className="text-xs font-black uppercase tracking-widest">Special Event: Attendance will NOT count toward 14-class graduation requirement</span>
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
                  <p className="text-slate-400 font-bold">No fathers found matching "{searchTerm}"</p>
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
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{father.phone}</p>
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
            {isSpecialClass ? 'Special Event Mode' : '2026 Curriculum Schedule'}
          </p>
          <p className={`text-sm ${isSpecialClass ? 'text-purple-600' : 'text-blue-600'}`}>
            {isSpecialClass 
              ? 'Special events are tracked separately and do not count toward the 14-class graduation requirement.'
              : 'All 52 Tuesdays of 2026 are available. Classes rotate through the 14-module curriculum.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
