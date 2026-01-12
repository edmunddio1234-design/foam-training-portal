import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, User, Phone, Mail, Award, ArrowRight, 
  RefreshCw, ChevronLeft, UserPlus, ClipboardCheck, BookOpen
} from 'lucide-react';
import { fatherhoodApi, Father } from '../../services/fatherhoodApi';

// FOAM Curriculum Modules (matching backend)
const CURRICULUM_MODULES = [
  { id: 1, title: "Conflict Resolution/Anger Management" },
  { id: 2, title: "Becoming Self-Sufficient" },
  { id: 3, title: "Building Your Child's Self-Esteem" },
  { id: 4, title: "Co-Parenting/Single Fatherhood" },
  { id: 5, title: "Male/Female Relationship" },
  { id: 6, title: "Manhood" },
  { id: 7, title: "Values" },
  { id: 8, title: "Communication/Active Listening" },
  { id: 9, title: "Dealing with Stress" },
  { id: 10, title: "Coping with Fatherhood Discrimination" },
  { id: 11, title: "Fatherhood Today" },
  { id: 12, title: "Understanding Children's Needs" },
  { id: 13, title: "A Father's Influence on His Child" },
  { id: 14, title: "Relationships" }
];

type CheckInStep = 'search' | 'register' | 'confirm' | 'success' | 'already';

const FatherCheckIn: React.FC = () => {
  // Get module from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const moduleIdFromUrl = parseInt(urlParams.get('module') || '1');
  const isSpecialEvent = urlParams.has('special');
  const specialEventId = parseInt(urlParams.get('special') || '0');

  const [step, setStep] = useState<CheckInStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Father[]>([]);
  const [selectedFather, setSelectedFather] = useState<Father | null>(null);
  const [currentModule, setCurrentModule] = useState<{ id: number; title: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New father registration fields
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    // Set current module based on URL
    if (isSpecialEvent) {
      setCurrentModule({ id: specialEventId, title: 'Special Event' });
    } else {
      const mod = CURRICULUM_MODULES.find(m => m.id === moduleIdFromUrl);
      setCurrentModule(mod || CURRICULUM_MODULES[0]);
    }
  }, [moduleIdFromUrl, isSpecialEvent, specialEventId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const results = await fatherhoodApi.searchFathers(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No fathers found. Try searching by first name, last name, or phone number, or tap "I\'m New" to register.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFather = (father: Father) => {
    setSelectedFather(father);
    setStep('confirm');
  };

  const handleCheckIn = async () => {
    if (!selectedFather || !currentModule) return;
    
    // Skip check-in for special events (they don't count toward graduation)
    if (isSpecialEvent) {
      setStep('success');
      return;
    }
    
    setCheckingIn(true);
    setError(null);
    try {
      const result = await fatherhoodApi.checkIn(selectedFather.id, currentModule.id);
      
      if (result.success) {
        if (result.alreadyCompleted) {
          setStep('already');
        } else {
          // Update selected father with new data
          if (result.data) {
            setSelectedFather(result.data);
          }
          setStep('success');
        }
      } else {
        setError(result.message || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      setError('Check-in failed. Please try again or ask for help.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRegisterNewFather = async () => {
    if (!newFirstName.trim() || !newLastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    
    setRegistering(true);
    setError(null);
    
    try {
      const newFather = await fatherhoodApi.addFather({
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined
      });
      
      if (newFather) {
        setSelectedFather(newFather);
        setStep('confirm');
      } else {
        setError('Registration failed. Please try again or ask staff for help.');
      }
    } catch (err) {
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setRegistering(false);
    }
  };

  const resetCheckIn = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFather(null);
    setError(null);
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('');
    setNewEmail('');
  };

  const goToAssessment = () => {
    // Navigate to assessment page with the module
    window.location.href = `/assessment?module=${currentModule?.id || 1}`;
  };

  const progressPercent = selectedFather 
    ? Math.round((selectedFather.completedModules.length / 14) * 100) 
    : 0;

  // STEP 1: Search for existing father
  if (step === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
        {/* Header */}
        <div className="p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Class Check-In</h1>
          {currentModule && (
            <div className="bg-white/10 rounded-xl px-4 py-2 inline-block">
              <p className="text-sm text-blue-100">Today's Class</p>
              <p className="font-semibold">
                {isSpecialEvent ? 'Special Event' : `Module ${currentModule.id}: ${currentModule.title}`}
              </p>
            </div>
          )}
        </div>

        {/* Search Form */}
        <div className="flex-1 bg-white rounded-t-3xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Find Your Name</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name or phone number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-4 pl-12 border-2 border-slate-200 rounded-xl text-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
            
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Find Me
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-slate-500 mb-3">
                {searchResults.length} result{searchResults.length > 1 ? 's' : ''} found. Tap your name:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map(father => (
                  <button
                    key={father.id}
                    onClick={() => handleSelectFather(father)}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">
                          {father.firstName} {father.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {father.phone || 'No phone'} • {father.completedModules.length}/14 classes
                        </p>
                      </div>
                      <ArrowRight className="text-slate-400" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* New Father Button */}
          <button
            onClick={() => setStep('register')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <UserPlus size={24} />
            I'm New - Register Now
          </button>

          {/* Help Text */}
          <div className="mt-6 text-center text-slate-500 text-sm">
            <p>Can't find your name and not new?</p>
            <p>Ask a staff member for help.</p>
          </div>
        </div>
      </div>
    );
  }

  // STEP: Register new father
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex flex-col">
        {/* Header */}
        <div className="p-6 text-white">
          <button 
            onClick={() => setStep('search')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold">Welcome to FOAM!</h1>
          <p className="text-emerald-100 mt-1">Let's get you registered</p>
        </div>

        {/* Registration Form */}
        <div className="flex-1 bg-white rounded-t-3xl p-6">
          <div className="space-y-4">
            {/* First Name - Required */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Last Name - Required */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Phone - Preferred */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number <span className="text-slate-400 text-xs">(Preferred)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(225) 555-1234"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">So we can follow up and support you</p>
            </div>

            {/* Email - Optional */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={handleRegisterNewFather}
            disabled={registering || !newFirstName.trim() || !newLastName.trim()}
            className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              registering || !newFirstName.trim() || !newLastName.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {registering ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Register & Continue
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-sm mt-4">
            By registering, you're joining the FOAM Fatherhood Program
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Confirm check-in
  if (step === 'confirm' && selectedFather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
        {/* Header */}
        <div className="p-6 text-white">
          <button 
            onClick={resetCheckIn}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-center">Confirm Check-In</h1>
        </div>

        {/* Confirmation Card */}
        <div className="flex-1 bg-white rounded-t-3xl p-6">
          {/* Father Info */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-blue-600">
              {selectedFather.firstName[0]}{selectedFather.lastName?.[0] || ''}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedFather.firstName} {selectedFather.lastName}
            </h2>
            <p className="text-slate-500">{selectedFather.phone || 'No phone on file'}</p>
            
            {/* Status Badge */}
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              selectedFather.status === 'Graduated' ? 'bg-emerald-100 text-emerald-700' :
              selectedFather.status === 'At Risk' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {selectedFather.status}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Your Progress</span>
              <span className="font-bold">{selectedFather.completedModules.length} / 14</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Class Info */}
          {currentModule && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-600 mb-1">Checking in to:</p>
              <p className="font-bold text-blue-800">
                {isSpecialEvent ? 'Special Event' : `Module ${currentModule.id}: ${currentModule.title}`}
              </p>
              {isSpecialEvent && (
                <p className="text-xs text-blue-600 mt-2">
                  Note: Special events don't count toward your 14-class graduation requirement.
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Confirm Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {checkingIn ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Yes, Check Me In!
                </>
              )}
            </button>
            
            <button
              onClick={resetCheckIn}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-4 rounded-xl transition-all"
            >
              Not Me - Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Success
  if (step === 'success' && selectedFather) {
    const newProgress = selectedFather.completedModules.length;
    const newProgressPercent = Math.round((newProgress / 14) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-emerald-500" size={56} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">You're Checked In!</h1>
        <p className="text-emerald-100 mb-6">
          Welcome to class, {selectedFather.firstName}!
        </p>

        {/* Updated Progress */}
        {!isSpecialEvent && (
          <div className="bg-white/20 rounded-2xl p-6 w-full max-w-sm mb-6">
            <p className="text-emerald-100 mb-2">Your Progress</p>
            <p className="text-4xl font-bold mb-3">{newProgress} / 14</p>
            <div className="h-4 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${newProgressPercent}%` }}
              />
            </div>
            <p className="text-sm text-emerald-100 mt-2">{newProgressPercent}% Complete</p>
          </div>
        )}

        {newProgress >= 14 && (
          <div className="bg-yellow-400 text-yellow-900 rounded-xl p-4 mb-6 flex items-center gap-3 w-full max-w-sm">
            <Award size={32} />
            <div className="text-left">
              <p className="font-bold">Congratulations!</p>
              <p className="text-sm">You've completed all 14 classes!</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={goToAssessment}
            className="w-full bg-white text-emerald-600 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Take Class Assessment
          </button>
          
          <button
            onClick={resetCheckIn}
            className="w-full bg-emerald-600 border-2 border-white text-white font-bold py-4 px-8 rounded-xl"
          >
            Done - Next Person
          </button>
        </div>

        <p className="text-emerald-200 text-sm mt-6">
          Questions? Ask a FOAM staff member
        </p>
      </div>
    );
  }

  // STEP: Already Checked In
  if (step === 'already' && selectedFather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-500 to-amber-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-amber-500" size={56} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Already Completed!</h1>
        <p className="text-amber-100 mb-6">
          {selectedFather.firstName}, you've already completed this module.
        </p>

        <div className="bg-white/20 rounded-2xl p-6 w-full max-w-sm mb-6">
          <p className="text-amber-100 mb-2">Your Progress</p>
          <p className="text-4xl font-bold">{selectedFather.completedModules.length} / 14</p>
          <p className="text-sm text-amber-100 mt-2">
            {selectedFather.completedModules.length >= 14 
              ? 'Congratulations! You\'ve graduated!' 
              : `${14 - selectedFather.completedModules.length} more classes to graduate`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={goToAssessment}
            className="w-full bg-white text-amber-600 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Take Class Assessment
          </button>
          
          <button
            onClick={resetCheckIn}
            className="w-full bg-amber-600 border-2 border-white text-white font-bold py-4 px-8 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Loading fallback
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <RefreshCw className="animate-spin text-blue-600" size={48} />
    </div>
  );
};

export default FatherCheckIn;
