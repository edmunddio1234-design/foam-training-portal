import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Copy, ExternalLink, MapPin, Calendar, Users, Check } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  description?: string;
}

interface QRCheckInProps {
  modules: Module[];
}

// Generate QR Code URL using a free API
const getQRCodeUrl = (data: string, size: number = 300) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

export const QRCheckIn: React.FC<QRCheckInProps> = ({ modules }) => {
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  
  // Auto-detect today's module based on schedule (Tuesdays, rotating through 14 modules)
  useEffect(() => {
    const today = new Date();
    const startDate = new Date('2025-01-07'); // First Tuesday of 2025
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);
    const calculatedModule = (weeksDiff % 14) + 1;
    
    // Only auto-set if it's Tuesday
    if (today.getDay() === 2) {
      setSelectedModule(calculatedModule);
    }
  }, []);

  const checkInUrl = `https://foamportal.org/assessment?module=${selectedModule}`;
  const currentModule = modules.find(m => m.id === selectedModule) || modules[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">QR Code Check-In</h1>
          <p className="text-slate-500">Display this QR code for fathers to scan and check in</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - QR Code */}
        <div className="space-y-6">
          {/* Today's Class Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Today's Class</p>
                <p className="font-bold text-lg">{currentModule?.title || 'Select a module'}</p>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex flex-col items-center">
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-inner">
                <img 
                  src={getQRCodeUrl(checkInUrl, 250)} 
                  alt="Check-in QR Code"
                  className="w-64 h-64"
                />
              </div>
              
              <p className="text-slate-500 mt-4 text-center">Scan with phone camera to check in</p>
              
              {/* Module Selector */}
              <div className="w-full mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Class Module
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      Module {module.id}: {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Display */}
              <div className="w-full mt-4">
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
                className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink size={16} />
                Open check-in page in new tab
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
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

          {/* Class Schedule */}
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
                <span className="text-slate-400">Current Module</span>
                <span className="font-medium">Module {selectedModule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Classes</span>
                <span className="font-medium">14 Modules</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">F11</kbd> for full screen mode when displaying the QR code on a TV or large monitor.
        </p>
      </div>
    </div>
  );
};

export default QRCheckIn;
