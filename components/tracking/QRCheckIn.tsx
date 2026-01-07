import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, RefreshCw, Copy, ExternalLink, MapPin, Calendar, Users, Check, Printer, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  description?: string;
}

interface ScheduleItem {
  date: string;
  displayDate: string;
  module: number;
}

interface QRCheckInProps {
  modules: Module[];
}

// Generate QR Code URL using a free API
const getQRCodeUrl = (data: string, size: number = 300) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

// Generate all Tuesdays for 2026
const generate2026Tuesdays = (): ScheduleItem[] => {
  const tuesdays: ScheduleItem[] = [];
  const startDate = new Date('2026-01-06'); // First Tuesday of 2026
  const endDate = new Date('2026-12-31');
  
  let current = new Date(startDate);
  let weekCount = 0;
  
  while (current <= endDate) {
    const moduleNum = (weekCount % 14) + 1;
    const month = current.toLocaleString('en-US', { month: 'short' });
    const day = current.getDate();
    
    tuesdays.push({
      date: current.toISOString().split('T')[0],
      displayDate: `${month} ${day}, 2026`,
      module: moduleNum
    });
    
    // Move to next Tuesday
    current.setDate(current.getDate() + 7);
    weekCount++;
  }
  
  return tuesdays;
};

// Special classes (non-curriculum)
const SPECIAL_CLASSES = [
  { id: 101, title: "Orientation / Welcome Session", description: "Introduction to FOAM program" },
  { id: 102, title: "Guest Speaker Event", description: "Special guest presentation" },
  { id: 103, title: "Community Resource Fair", description: "Connect with local resources" },
  { id: 104, title: "Father-Child Activity Day", description: "Bonding activity with children" },
  { id: 105, title: "Graduation Ceremony", description: "Celebrating program completion" },
  { id: 106, title: "Alumni Meeting", description: "Reconnect with FOAM alumni" },
  { id: 107, title: "Holiday Celebration", description: "Seasonal celebration event" },
  { id: 108, title: "Workshop: Resume Building", description: "Career development workshop" },
  { id: 109, title: "Workshop: Financial Planning", description: "Financial literacy workshop" },
  { id: 110, title: "Support Group Session", description: "Open discussion and support" },
  { id: 111, title: "Other Special Event", description: "Custom event" }
];

export const QRCheckIn: React.FC<QRCheckInProps> = ({ modules }) => {
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [isSpecialClass, setIsSpecialClass] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Generate 2026 schedule
  const schedule2026 = useMemo(() => generate2026Tuesdays(), []);
  
  // Get months for filter
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Filter schedule by month
  const filteredSchedule = useMemo(() => {
    if (selectedMonth === 'all') return schedule2026;
    return schedule2026.filter(item => item.date.split('-')[1] === selectedMonth);
  }, [schedule2026, selectedMonth]);
  
  // Auto-detect today's module based on schedule (Tuesdays, rotating through 14 modules)
  useEffect(() => {
    const today = new Date();
    const startDate = new Date('2026-01-06'); // First Tuesday of 2026
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);
    const calculatedModule = (weeksDiff % 14) + 1;
    
    // Only auto-set if it's Tuesday and we're in 2026 or later
    if (today.getDay() === 2 && today.getFullYear() >= 2026) {
      setSelectedModule(calculatedModule);
      setIsSpecialClass(false);
    }
  }, []);

  // Get the current module/class info
  const currentClass = isSpecialClass 
    ? SPECIAL_CLASSES.find(c => c.id === selectedModule) 
    : modules.find(m => m.id === selectedModule) || modules[0];
  
  // Build check-in URL
  const checkInUrl = isSpecialClass
    ? `https://foamportal.org/assessment?special=${selectedModule}`
    : `https://foamportal.org/assessment?module=${selectedModule}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  // Handle switching between curriculum and special classes
  const handleClassTypeChange = (isSpecial: boolean) => {
    setIsSpecialClass(isSpecial);
    if (isSpecial) {
      setSelectedModule(SPECIAL_CLASSES[0].id);
    } else {
      setSelectedModule(1);
    }
  };

  // Find today's date in schedule
  const today = new Date().toISOString().split('T')[0];
  const todayInSchedule = schedule2026.find(item => item.date === today);

  return (
    <div className="space-y-6">
      {/* Print Styles - Hidden on screen, shown when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 50%; 
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">QR Code Check-In</h1>
          <p className="text-slate-500">Display this QR code for fathers to scan and check in</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
          >
            <Printer size={18} />
            Print QR Code
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - QR Code */}
        <div className="space-y-6">
          {/* Today's Class Banner */}
          <div className={`rounded-xl p-4 text-white no-print ${isSpecialClass ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {isSpecialClass ? <Star size={24} /> : <Calendar size={24} />}
              </div>
              <div>
                <p className={`text-sm ${isSpecialClass ? 'text-purple-100' : 'text-emerald-100'}`}>
                  {isSpecialClass ? 'Special Event' : "Today's Class"}
                </p>
                <p className="font-bold text-lg">{currentClass?.title || 'Select a class'}</p>
              </div>
            </div>
          </div>

          {/* Class Type Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 no-print">
            <label className="block text-sm font-medium text-slate-700 mb-3">Class Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleClassTypeChange(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  !isSpecialClass 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar size={18} />
                Curriculum (1-14)
              </button>
              <button
                onClick={() => handleClassTypeChange(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isSpecialClass 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Star size={18} />
                Special Event
              </button>
            </div>
          </div>

          {/* QR Code Display - This is the print area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print-area">
            <div className="flex flex-col items-center">
              {/* Print Header - Only shows when printing */}
              <div className="hidden print:block mb-4">
                <h2 className="text-2xl font-bold text-slate-800">FOAM Fatherhood Class Check-In</h2>
                <p className="text-slate-600">
                  {isSpecialClass 
                    ? currentClass?.title
                    : `Module ${selectedModule}: ${currentClass?.title}`
                  }
                </p>
              </div>
              
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-inner">
                <img 
                  src={getQRCodeUrl(checkInUrl, 250)} 
                  alt="Check-in QR Code"
                  className="w-64 h-64"
                />
              </div>
              
              <p className="text-slate-500 mt-4 text-center">Scan with phone camera to check in</p>
              
              {/* Print Footer - Only shows when printing */}
              <div className="hidden print:block mt-4 text-sm text-slate-500">
                <p>Fathers On A Mission • Every Tuesday at 6:30 PM</p>
                <p>FYSC Building • 11120 Government Street, Baton Rouge, LA</p>
              </div>
              
              {/* Class Selector */}
              <div className="w-full mt-6 no-print">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isSpecialClass ? 'Select Special Event' : 'Select Class Module'}
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {isSpecialClass 
                    ? SPECIAL_CLASSES.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.title}
                        </option>
                      ))
                    : modules.map(module => (
                        <option key={module.id} value={module.id}>
                          Module {module.id}: {module.title}
                        </option>
                      ))
                  }
                </select>
              </div>

              {/* URL Display */}
              <div className="w-full mt-4 no-print">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={checkInUrl}
                    className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Open Link Button */}
              <a
                href={checkInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 text-sm no-print"
              >
                <ExternalLink size={16} />
                Open check-in page in new tab
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6 no-print">
          {/* 2026 Tuesday Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800">2026 Tuesday Schedule</h3>
              </div>
              <button 
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showFullSchedule ? 'Less' : 'All'}
                {showFullSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            {/* Month Filter - Show when expanded */}
            {showFullSchedule && (
              <div className="mb-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            <p className="text-sm text-slate-500 mb-3">
              Classes rotate through 14 modules
              {todayInSchedule && (
                <span className="block mt-1 text-emerald-600 font-medium">
                  Today: Module {todayInSchedule.module}
                </span>
              )}
            </p>
            
            <div className={`space-y-1 overflow-y-auto ${showFullSchedule ? 'max-h-64' : 'max-h-48'}`}>
              {(showFullSchedule ? filteredSchedule : schedule2026.slice(0, 12)).map((item, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all text-sm ${
                    item.module === selectedModule && !isSpecialClass
                      ? 'bg-blue-50 border border-blue-200' 
                      : item.date === today
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setIsSpecialClass(false);
                    setSelectedModule(item.module);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {item.date === today && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    )}
                    <span className="text-slate-600">{item.displayDate}</span>
                  </div>
                  <span className={`font-medium ${
                    item.module === selectedModule && !isSpecialClass
                      ? 'text-blue-600' 
                      : item.date === today
                        ? 'text-emerald-600'
                        : 'text-slate-800'
                  }`}>
                    Module {item.module}
                  </span>
                </div>
              ))}
            </div>
            
            {!showFullSchedule && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                Click "All" for full year schedule
              </p>
            )}
          </div>

          {/* Special Classes Info */}
          {isSpecialClass && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-purple-800">Special Event Selected</p>
                  <p className="text-sm text-purple-600 mt-1">
                    Special events don't count toward the 14-class graduation requirement. Use for orientations, workshops, or celebrations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Class Location */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Class Location</h3>
                <p className="text-slate-500">FYSC Building</p>
                <p className="text-slate-600 mt-2">11120 Government Street</p>
                <p className="text-slate-600">Baton Rouge, Louisiana 70802</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="text-emerald-600" size={20} />
              </div>
              <h3 className="font-bold text-slate-800">How Fathers Check In</h3>
            </div>
            
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span className="text-slate-600">Father opens camera app on phone</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span className="text-slate-600">Points camera at QR code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span className="text-slate-600">Taps the link that appears</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <span className="text-slate-600">Searches for their name or enters phone number</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                <span className="text-slate-600">Confirms identity and gets checked in!</span>
              </li>
            </ol>
          </div>

          {/* Class Schedule Info */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={20} />
              <h3 className="font-bold">Class Schedule</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Day</span>
                <span className="font-medium">Every Tuesday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time</span>
                <span className="font-medium">6:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Selection</span>
                <span className="font-medium">
                  {isSpecialClass ? 'Special Event' : `Module ${selectedModule}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Curriculum</span>
                <span className="font-medium">14 Modules</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 no-print">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">F11</kbd> for full screen mode when displaying the QR code on a TV or large monitor.
        </p>
      </div>
    </div>
  );
};

export default QRCheckIn;
