import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, MapPin, Users, RefreshCw, Clock, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { fatherhoodApi, Module } from '../../services/fatherhoodApi';

interface QRCheckInProps {
  modules: Module[];
}

export const QRCheckIn: React.FC<QRCheckInProps> = ({ modules }) => {
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [todayInfo, setTodayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<string[]>([]);

  // Generate the check-in URL
  const checkInUrl = `${window.location.origin}/checkin?module=${selectedModule}`;
  
  // QR Code using Google Charts API (free, no library needed)
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=${encodeURIComponent(checkInUrl)}&choe=UTF-8`;

  useEffect(() => {
    loadTodayInfo();
  }, []);

  const loadTodayInfo = async () => {
    setLoading(true);
    try {
      const info = await fatherhoodApi.getTodaysClass();
      setTodayInfo(info);
      if (info.todaysClass) {
        setSelectedModule(info.todaysClass.moduleId);
      } else if (info.nextClass) {
        setSelectedModule(info.nextClass.moduleId);
      }
    } catch (err) {
      console.error('Error loading today info:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const currentModule = modules.find(m => m.id === selectedModule);
  const today = new Date();
  const isClassDay = today.getDay() === 2; // Tuesday

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">QR Code Check-In</h1>
          <p className="text-slate-500">Display this QR code for fathers to scan and check in</p>
        </div>
        <button
          onClick={loadTodayInfo}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Class Info Banner */}
          <div className={`rounded-xl p-4 mb-6 ${isClassDay ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isClassDay ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isClassDay ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {isClassDay ? "Today's Class" : 'Next Class'}
                </p>
                <p className={`font-bold ${isClassDay ? 'text-emerald-800' : 'text-blue-800'}`}>
                  {currentModule?.title || 'Select a module'}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-slate-100">
              <img 
                src={qrCodeUrl} 
                alt="Check-in QR Code"
                className="w-64 h-64"
              />
            </div>
            
            <p className="text-slate-500 text-sm mt-4 text-center">
              Scan with phone camera to check in
            </p>

            {/* Module Selector */}
            <div className="mt-6 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Class Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {modules.map(module => (
                  <option key={module.id} value={module.id}>
                    Module {module.id}: {module.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Copy Link Button */}
            <div className="mt-4 w-full">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checkInUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
                <button
                  onClick={copyLink}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Open in New Tab */}
            <a
              href={checkInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink size={16} />
              Open check-in page in new tab
            </a>
          </div>
        </div>

        {/* Instructions & Info Panel */}
        <div className="space-y-6">
          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Class Location</h3>
                <p className="text-sm text-slate-500">FYSC Building</p>
              </div>
            </div>
            <p className="text-slate-600">
              11120 Government Street<br />
              Baton Rouge, Louisiana 70802
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              How Fathers Check In
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span className="text-slate-600">Father opens camera app on phone</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span className="text-slate-600">Points camera at QR code</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span className="text-slate-600">Taps the link that appears</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <span className="text-slate-600">Searches for their name or enters phone number</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                <span className="text-slate-600">Confirms identity and gets checked in!</span>
              </li>
            </ol>
          </div>

          {/* Today's Stats */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Class Schedule
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Day</span>
                <span className="font-medium">Every Tuesday</span>
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

      {/* Full Screen Mode Hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm">
          <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-amber-100 rounded text-xs">F11</kbd> for full screen mode when displaying the QR code on a TV or large monitor.
        </p>
      </div>
    </div>
  );
};

export default QRCheckIn;
