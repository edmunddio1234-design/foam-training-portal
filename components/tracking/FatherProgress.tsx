import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, Circle, Award, BookOpen, 
  ArrowRight, User, Phone, RefreshCw, ChevronDown,
  FileText, ClipboardList
} from 'lucide-react';

// API URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface Father {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  completedModules: number[];
  joinedDate: string;
  status: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
}

const MODULES: Module[] = [
  { id: 1, title: "Conflict Resolution/Anger Management", description: "Managing emotions and resolving conflicts" },
  { id: 2, title: "Becoming Self-Sufficient", description: "Building independence and self-reliance" },
  { id: 3, title: "Building Your Child's Self-Esteem", description: "Nurturing confidence in children" },
  { id: 4, title: "Co-Parenting/Single Fatherhood", description: "Navigating parenting relationships" },
  { id: 5, title: "Male/Female Relationship", description: "Building healthy partnerships" },
  { id: 6, title: "Manhood", description: "Understanding masculinity and leadership" },
  { id: 7, title: "Values", description: "Living by core principles" },
  { id: 8, title: "Communication/Active Listening", description: "Effective communication skills" },
  { id: 9, title: "Dealing with Stress", description: "Healthy coping strategies" },
  { id: 10, title: "Coping with Fatherhood Discrimination", description: "Addressing bias and advocacy" },
  { id: 11, title: "Fatherhood Today", description: "Modern fatherhood challenges" },
  { id: 12, title: "Understanding Children's Needs", description: "Child development insights" },
  { id: 13, title: "A Father's Influence on His Child", description: "Your lasting impact" },
  { id: 14, title: "Relationships", description: "Building strong connections" }
];

const FatherProgress: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Father[]>([]);
  const [selectedFather, setSelectedFather] = useState<Father | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState<'search' | 'progress'>('search');

  // Search for fathers
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers/search/${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Select a father and show progress
  const selectFather = (father: Father) => {
    setSelectedFather(father);
    setView('progress');
  };

  // Go back to search
  const goBack = () => {
    setView('search');
    setSelectedFather(null);
  };

  // Calculate progress percentage
  const getProgressPercent = (completed: number) => {
    return Math.round((completed / 14) * 100);
  };

  // Get status color
  const getStatusColor = (status: string, completed: number) => {
    if (completed === 14) return 'bg-emerald-500';
    if (completed >= 7) return 'bg-blue-500';
    if (completed > 0) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusText = (completed: number) => {
    if (completed === 14) return 'Graduated! 🎉';
    if (completed >= 7) return 'Active - Great Progress!';
    if (completed > 0) return 'In Progress';
    return 'Just Getting Started';
  };

  // SEARCH VIEW
  if (view === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold">Fatherhood Class Progress Portal</h1>
          <p className="text-blue-100 mt-1">Check your class progress & complete assessments</p>
        </div>

        {/* Search Section */}
        <div className="p-6 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Find Your Record</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name or phone number"
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSearching || !searchQuery.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSearching ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>

            {/* Search Results */}
            {hasSearched && (
              <div className="mt-6">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-slate-500 mb-3">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {searchResults.map((father) => (
                        <button
                          key={father.id}
                          onClick={() => selectFather(father)}
                          className="w-full p-4 bg-slate-50 hover:bg-blue-50 rounded-xl text-left transition-all border-2 border-transparent hover:border-blue-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {father.firstName} {father.lastName}
                            </p>
                            <p className="text-sm text-slate-500">
                              {father.completedModules.length} of 14 modules completed
                            </p>
                          </div>
                          <ArrowRight className="text-slate-400" size={20} />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Try searching with a different name or phone number
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-6 space-y-3">
            <a
              href="/assessment"
              className="block w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <ClipboardList size={20} />
                Complete Class Assessment
              </div>
            </a>
            
            <a
              href="https://foamportal.org"
              className="block w-full p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-center transition-all border border-white/20"
            >
              Go to Main Portal
            </a>
          </div>

          {/* Help Text */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Need help? Contact FOAM at (225) 590-1422
          </p>
        </div>
      </div>
    );
  }

  // PROGRESS VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <button 
          onClick={goBack}
          className="text-white/70 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Back to Search
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {selectedFather?.firstName.charAt(0)}{selectedFather?.lastName?.charAt(0) || ''}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {selectedFather?.firstName} {selectedFather?.lastName}
            </h1>
            <p className="text-blue-100">
              {getStatusText(selectedFather?.completedModules.length || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Content */}
      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Your Progress</h2>
            <span className="text-2xl font-black text-blue-600">
              {selectedFather?.completedModules.length || 0}/14
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
            <div 
              className={`h-4 rounded-full transition-all ${getStatusColor(selectedFather?.status || '', selectedFather?.completedModules.length || 0)}`}
              style={{ width: `${getProgressPercent(selectedFather?.completedModules.length || 0)}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-slate-500">
            {getProgressPercent(selectedFather?.completedModules.length || 0)}% Complete
          </p>

          {/* Graduation Message */}
          {selectedFather?.completedModules.length === 14 && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <Award className="mx-auto text-emerald-500 mb-2" size={32} />
              <p className="font-bold text-emerald-700">Congratulations!</p>
              <p className="text-sm text-emerald-600">You've completed all 14 modules!</p>
            </div>
          )}
        </div>

        {/* Module Checklist */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Module Checklist
          </h2>
          
          <div className="space-y-2">
            {MODULES.map((module) => {
              const isCompleted = selectedFather?.completedModules.includes(module.id) || false;
              return (
                <div 
                  key={module.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  ) : (
                    <Circle className="text-slate-300 shrink-0" size={24} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isCompleted ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {module.id}. {module.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="/assessment"
            className="block w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-center transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <ClipboardList size={20} />
              Complete Today's Assessment
            </div>
          </a>
          
          <button
            onClick={goBack}
            className="w-full p-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium text-center transition-all"
          >
            Search for Another Person
          </button>
        </div>

        {/* Class Info */}
        <div className="bg-slate-800 text-white rounded-2xl p-6">
          <h3 className="font-bold mb-3">Class Information</h3>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              <span className="text-slate-400">Schedule:</span> Every Tuesday at 6:30 PM
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Location:</span> FYSC Building
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Address:</span> 11120 Government Street, Baton Rouge, LA 70802
            </p>
          </div>
        </div>

        {/* Contact */}
        <p className="text-center text-slate-500 text-sm">
          Questions? Call FOAM at (225) 590-1422
        </p>
      </div>
    </div>
  );
};

export default FatherProgress;
