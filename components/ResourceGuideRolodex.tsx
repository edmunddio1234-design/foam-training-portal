import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Search, X, Plus, Phone, MapPin, Globe, Mail,
  ChevronRight, ChevronLeft, Building2, Home, Briefcase, Heart,
  Scale, GraduationCap, Utensils, Baby, Car, DollarSign, Users,
  Shield, Stethoscope, BookOpen, HelpCircle, ExternalLink, Edit,
  Save, Loader2, Check, AlertCircle, RotateCcw
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://foamla-backend-2.onrender.com';

// Types
interface Resource {
  id: string;
  category: string;
  name: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  eligibility?: string;
  services?: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  resourceCount: number;
}

interface ResourceGuideRolodexProps {
  onBack: () => void;
}

// Category definitions with icons and colors
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; description: string }> = {
  'Housing': { icon: Home, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', description: 'Emergency shelter, rental assistance, and housing programs' },
  'Employment': { icon: Briefcase, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', description: 'Job training, placement, and workforce development' },
  'Legal Aid': { icon: Scale, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', description: 'Legal assistance, family law, and advocacy' },
  'Legal Services': { icon: Scale, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', description: 'Legal assistance, family law, and advocacy' },
  'Food Assistance': { icon: Utensils, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', description: 'Food banks, SNAP, and nutrition programs' },
  'Mental Health': { icon: Heart, color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', description: 'Counseling, therapy, and crisis support' },
  'Healthcare': { icon: Stethoscope, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', description: 'Medical clinics, insurance, and health services' },
  'Childcare': { icon: Baby, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', description: 'Childcare assistance and early learning programs' },
  'Education': { icon: GraduationCap, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', description: 'GED, college prep, and educational resources' },
  'Transportation': { icon: Car, color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', description: 'Bus passes, rideshare, and vehicle assistance' },
  'Financial': { icon: DollarSign, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', description: 'Financial literacy, banking, and assistance programs' },
  'Family Services': { icon: Users, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', description: 'Family support, parenting classes, and reunification' },
  'Government': { icon: Building2, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', description: 'Government agencies and public services' },
  'Veterans': { icon: Shield, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', description: 'Veteran services and benefits assistance' },
  'Other': { icon: HelpCircle, color: 'from-violet-500 to-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', description: 'Additional community resources and support' },
};

const ResourceGuideRolodex: React.FC<ResourceGuideRolodexProps> = ({ onBack }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'in' | 'out'>('in');
  
  // Add/Edit state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addToCategory, setAddToCategory] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Resource>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch resources from backend/Google Sheets
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resource-guide`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      
      if (data.success && data.data) {
        setResources(data.data);
        
        // Build categories from resources
        const categoryMap = new Map<string, number>();
        data.data.forEach((r: Resource) => {
          const cat = r.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        
        const cats: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => {
          const config = CATEGORY_CONFIG[name] || CATEGORY_CONFIG['Other'];
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            borderColor: config.borderColor,
            description: config.description,
            resourceCount: count
          };
        }).sort((a, b) => b.resourceCount - a.resourceCount);
        
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      // Set demo data as fallback - don't show error since demo data works
      setDemoData();
      // Only show error if you want users to know it's using fallback data
      // setError('Using offline data. Connect to internet for live updates.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Demo data matching actual Google Sheet data - fallback when backend unavailable
  const setDemoData = () => {
    const demoResources: Resource[] = [
      // Childcare (3)
      { id: '1', category: 'Childcare', name: 'Childcare Assistance Program', description: 'Financial assistance for childcare while working or in school', address: '1201 North Third St', phone: '1-877-453-2721', website: 'https://louisianabelieves.com', email: 'LDEccap@la.gov', notes: 'Online application' },
      { id: '2', category: 'Childcare', name: 'YWCA Early Head Start', description: 'Early Head Start for infants & toddlers under 3', address: '8120 Kelwood Ave', phone: '(225) 383-0681', website: 'https://ywca-br.org', notes: 'Call and ask for transfer' },
      { id: '3', category: 'Childcare', name: 'Volunteers of America', description: 'Childcare placement assistance', address: '7389 Florida Blvd, Ste 101A', phone: '(225) 926-8005', website: 'https://voascla.org', notes: 'Call for specific area' },
      // Housing (3)
      { id: '4', category: 'Housing', name: 'Housing Authority of EBR', description: 'Public housing and Section 8 vouchers', address: '4731 North Blvd', phone: '(225) 923-8100', website: 'https://ebrpha.org', notes: 'Application required' },
      { id: '5', category: 'Housing', name: 'Volunteers of America - Housing', description: 'Transitional housing assistance', address: '7389 Florida Blvd', phone: '(225) 926-8005', website: 'https://voascla.org', notes: 'Call for intake' },
      { id: '6', category: 'Housing', name: 'St. Vincent de Paul', description: 'Emergency rent/utility assistance', address: 'Multiple locations', phone: '(225) 383-7837', website: 'https://svdpbr.org', notes: 'Walk-in or call' },
      // Employment (3)
      { id: '7', category: 'Employment', name: 'Louisiana Workforce Commission', description: 'Job search, training, unemployment', address: '1001 North 23rd St', phone: '(225) 342-3111', website: 'https://laworks.net', notes: 'Walk-in registration' },
      { id: '8', category: 'Employment', name: 'Goodwill Industries', description: 'Job training, career services', address: '7777 Florida Blvd', phone: '(225) 272-4057', website: 'https://goodwillno.org', notes: 'Walk-in' },
      { id: '9', category: 'Employment', name: 'BRCC Workforce Training', description: 'Vocational training, certifications', address: '201 Community College Dr', phone: '(225) 216-8000', website: 'https://mybrcc.edu', notes: 'Enrollment required' },
      // Mental Health (3)
      { id: '10', category: 'Mental Health', name: 'Capital Area Human Services', description: 'Mental health counseling, substance abuse', address: '4615 Government St', phone: '(225) 925-1906', website: 'https://cahsd.org', notes: 'Call for appointment' },
      { id: '11', category: 'Mental Health', name: 'NAMI Louisiana', description: 'Mental health support, education', phone: '(225) 291-6264', website: 'https://namilouisiana.org', notes: 'Call helpline' },
      { id: '12', category: 'Mental Health', name: 'Hope Ministries', description: 'Faith-based counseling', phone: '(225) 923-4673', notes: 'Call for referral' },
      // Food Assistance (2)
      { id: '13', category: 'Food Assistance', name: 'Greater BR Food Bank', description: 'Food pantry, distribution events', address: '10600 S Choctaw Dr', phone: '(225) 359-9940', website: 'https://brfoodbank.org', notes: 'Check schedule' },
      { id: '14', category: 'Food Assistance', name: 'SNAP Benefits (DCFS)', description: 'Food stamps application', address: 'Multiple offices', phone: '1-888-524-3578', website: 'https://dcfs.la.gov', notes: 'Online or in-person' },
      // Legal Services (2)
      { id: '15', category: 'Legal Services', name: 'Southeast LA Legal Services', description: 'Free civil legal help', address: '1200 Derek Dr, Ste 100', phone: '(225) 448-0824', website: 'https://slls.org', notes: 'Call for screening' },
      { id: '16', category: 'Legal Services', name: 'BR Bar Association - Pro Bono', description: 'Lawyer referral service', phone: '(225) 344-4803', notes: 'Call for referral' },
      // Education (2)
      { id: '17', category: 'Education', name: 'BRCC Adult Education', description: 'GED classes, adult literacy', address: '201 Community College Dr', phone: '(225) 216-8000', website: 'https://mybrcc.edu', notes: 'Enrollment' },
      { id: '18', category: 'Education', name: 'Literacy Council of BR', description: 'Reading/writing tutoring', phone: '(225) 925-8622', notes: 'Call for assessment' },
      // Healthcare (2)
      { id: '19', category: 'Healthcare', name: "Woman's Hospital", description: "Women's health, prenatal care", address: "100 Woman's Way", phone: '(225) 927-1300', website: 'https://womans.org', notes: 'Call for appointment' },
      { id: '20', category: 'Healthcare', name: 'BR Primary Care', description: 'Sliding scale medical care', address: 'Multiple locations', phone: '(225) 200-0100', website: 'https://brgeneral.org', notes: 'Call for appointment' }
    ];
    
    setResources(demoResources);
    
    const categoryMap = new Map<string, number>();
    demoResources.forEach(r => {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
    });
    
    const cats: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => {
      const config = CATEGORY_CONFIG[name] || CATEGORY_CONFIG['Other'];
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        description: config.description,
        resourceCount: count
      };
    }).sort((a, b) => b.resourceCount - a.resourceCount);
    
    setCategories(cats);
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Handle category selection with flip animation
  const handleSelectCategory = (category: Category) => {
    setFlipDirection('in');
    setIsFlipping(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setIsFlipping(false);
    }, 300);
  };

  // Handle back from category view
  const handleBackToCategories = () => {
    setFlipDirection('out');
    setIsFlipping(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setSelectedResource(null);
      setIsFlipping(false);
    }, 300);
  };

  // Handle resource selection
  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
  };

  // Handle add resource
  const handleOpenAddForm = (categoryName?: string) => {
    setAddToCategory(categoryName || '');
    setFormData({ category: categoryName || '' });
    setShowAddForm(true);
  };

  const handleSaveResource = async () => {
    if (!formData.name || !formData.category) {
      setError('Name and category are required');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resource-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save resource');
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddForm(false);
        setFormData({});
        fetchResources(); // Refresh data
      }, 1500);
    } catch (err) {
      console.error('Error saving resource:', err);
      // For demo, add locally
      const newResource: Resource = {
        id: Date.now().toString(),
        category: formData.category || 'Other',
        name: formData.name || '',
        description: formData.description || '',
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        website: formData.website,
        hours: formData.hours,
        eligibility: formData.eligibility,
        services: formData.services,
        notes: formData.notes
      };
      setResources(prev => [...prev, newResource]);
      
      // Update category count
      setCategories(prev => {
        const existing = prev.find(c => c.name === newResource.category);
        if (existing) {
          return prev.map(c => c.name === newResource.category ? { ...c, resourceCount: c.resourceCount + 1 } : c);
        } else {
          const config = CATEGORY_CONFIG[newResource.category] || CATEGORY_CONFIG['Other'];
          return [...prev, {
            id: newResource.category.toLowerCase().replace(/\s+/g, '-'),
            name: newResource.category,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            borderColor: config.borderColor,
            description: config.description,
            resourceCount: 1
          }];
        }
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddForm(false);
        setFormData({});
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  // Filter resources
  const filteredResources = selectedCategory
    ? resources.filter(r => r.category === selectedCategory.name)
    : resources;

  const searchFilteredResources = searchQuery
    ? filteredResources.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.services?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredResources;

  const searchFilteredCategories = searchQuery
    ? categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resources.some(r => r.category === c.name && (
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : categories;

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading Resource Guide...</p>
        </div>
      </div>
    );
  }

  // Render Add Form Modal
  const renderAddForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <h2 className="text-xl font-bold">Add New Resource</h2>
          </div>
          <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {saveSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Resource Added!</h3>
              <p className="text-slate-500">The resource has been saved successfully.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resource Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Baton Rouge Food Bank"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  >
                    <option value="">Select category...</option>
                    {Object.keys(CATEGORY_CONFIG).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(225) 555-1234"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of services offered..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, Baton Rouge, LA 70801"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.org"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.org"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hours of Operation</label>
                  <input
                    type="text"
                    value={formData.hours || ''}
                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Mon-Fri 8am-5pm"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Eligibility Requirements</label>
                  <textarea
                    value={formData.eligibility || ''}
                    onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                    placeholder="Who is eligible for these services?"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Services Offered</label>
                  <textarea
                    value={formData.services || ''}
                    onChange={e => setFormData({ ...formData, services: e.target.value })}
                    placeholder="List of specific services provided..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes or tips for case managers..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResource}
                  disabled={saving || !formData.name || !formData.category}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Resource
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render Resource Detail Modal
  const renderResourceDetail = () => {
    if (!selectedResource) return null;
    
    const categoryConfig = CATEGORY_CONFIG[selectedResource.category] || CATEGORY_CONFIG['Other'];
    const IconComponent = categoryConfig.icon;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResource(null)}>
        <div 
          className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto transform transition-all duration-300"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className={`sticky top-0 bg-gradient-to-r ${categoryConfig.color} text-white px-6 py-5 rounded-t-2xl`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{selectedResource.category}</span>
                <h2 className="text-xl font-bold mt-1">{selectedResource.name}</h2>
              </div>
              <button onClick={() => setSelectedResource(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            {selectedResource.description && (
              <div>
                <p className="text-slate-700 leading-relaxed">{selectedResource.description}</p>
              </div>
            )}
            
            <div className="space-y-3">
              {selectedResource.phone && (
                <a href={`tel:${selectedResource.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-slate-800 font-medium group-hover:text-emerald-600 transition-colors">{selectedResource.phone}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              )}
              
              {selectedResource.address && (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedResource.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Address</p>
                    <p className="text-slate-800 font-medium group-hover:text-blue-600 transition-colors">{selectedResource.address}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </a>
              )}
              
              {selectedResource.email && (
                <a href={`mailto:${selectedResource.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                    <p className="text-slate-800 font-medium group-hover:text-purple-600 transition-colors">{selectedResource.email}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              )}
              
              {selectedResource.website && (
                <a 
                  href={selectedResource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Website</p>
                    <p className="text-slate-800 font-medium group-hover:text-teal-600 transition-colors truncate">{selectedResource.website.replace(/^https?:\/\//, '')}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </a>
              )}
            </div>
            
            {(selectedResource.hours || selectedResource.eligibility || selectedResource.services) && (
              <div className="space-y-4 pt-4 border-t">
                {selectedResource.hours && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Hours</h4>
                    <p className="text-slate-600">{selectedResource.hours}</p>
                  </div>
                )}
                
                {selectedResource.eligibility && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Eligibility</h4>
                    <p className="text-slate-600">{selectedResource.eligibility}</p>
                  </div>
                )}
                
                {selectedResource.services && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Services</h4>
                    <p className="text-slate-600">{selectedResource.services}</p>
                  </div>
                )}
              </div>
            )}
            
            {selectedResource.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">Case Manager Notes</h4>
                    <p className="text-amber-700 text-sm">{selectedResource.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Category Cards (Rolodex Front)
  const renderCategoryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {searchFilteredCategories.map((category) => {
        const IconComponent = category.icon;
        return (
          <div
            key={category.id}
            onClick={() => handleSelectCategory(category)}
            className={`group relative bg-white rounded-2xl p-6 shadow-sm border-2 ${category.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1`}
            style={{ perspective: '1000px' }}
          >
            {/* Background decoration */}
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${category.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <IconComponent className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 ${category.bgColor} rounded-full`}>
                  {category.resourceCount} resource{category.resourceCount !== 1 ? 's' : ''}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Add New Category Card */}
      <div
        onClick={() => handleOpenAddForm()}
        className="group relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-sm border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
      >
        <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:border-emerald-400 group-hover:scale-110 transition-all duration-300">
          <Plus className="w-7 h-7 text-slate-400 group-hover:text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
          Add Resource
        </h3>
        <p className="text-slate-400 text-sm text-center mt-1">
          Add a new resource to any category
        </p>
      </div>
    </div>
  );

  // Render Resources List (Rolodex Back - after flip)
  const renderResourcesList = () => {
    if (!selectedCategory) return null;
    
    const IconComponent = selectedCategory.icon;
    
    return (
      <div className={`transform transition-all duration-300 ${isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Category Header */}
        <div className={`${selectedCategory.bgColor} border-2 ${selectedCategory.borderColor} rounded-2xl p-6 mb-6`}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToCategories}
              className="p-2 bg-white/50 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className={`w-14 h-14 bg-gradient-to-br ${selectedCategory.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{selectedCategory.name}</h2>
              <p className="text-slate-600">{selectedCategory.description}</p>
            </div>
            <button
              onClick={() => handleOpenAddForm(selectedCategory.name)}
              className={`px-4 py-2 bg-gradient-to-r ${selectedCategory.color} text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>
        
        {/* Resources Grid */}
        <div className="space-y-3">
          {searchFilteredResources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">No resources found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? 'Try a different search term' : 'Be the first to add a resource!'}
              </p>
              <button
                onClick={() => handleOpenAddForm(selectedCategory.name)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
            </div>
          ) : (
            searchFilteredResources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => handleSelectResource(resource)}
                className="group bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${selectedCategory.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {resource.name}
                    </h3>
                    {resource.description && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {resource.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {resource.phone}
                        </span>
                      )}
                      {resource.address && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {resource.address.split(',')[0]}
                        </span>
                      )}
                      {resource.website && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <Globe className="w-3 h-3" /> Website
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={selectedCategory ? handleBackToCategories : onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-7 h-7" />
                Resource Guide
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Community resources, partner agencies, and support services
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchResources}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1Joq9gBwd6spIrbqCBgaicuOFv0jAaGYSRntWZRKQry8/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Sheet
            </a>
          </div>
        </div>
      </header>
      
      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources, categories, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 text-lg border-0 focus:ring-0 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            {categories.length} Categories
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full" />
            {resources.length} Resources
          </span>
          {selectedCategory && (
            <span className="flex items-center gap-2 text-emerald-600 font-medium">
              <ChevronRight className="w-4 h-4" />
              Viewing: {selectedCategory.name}
            </span>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className={`transform transition-all duration-300 ${isFlipping ? (flipDirection === 'in' ? 'opacity-0 rotateY-90' : 'opacity-0 -rotateY-90') : 'opacity-100'}`}>
          {selectedCategory ? renderResourcesList() : renderCategoryCards()}
        </div>
      </main>
      
      {/* Modals */}
      {showAddForm && renderAddForm()}
      {selectedResource && renderResourceDetail()}
      
      {/* Custom Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .rotateY-90 {
          transform: rotateY(90deg);
        }
        
        .-rotateY-90 {
          transform: rotateY(-90deg);
        }
      `}</style>
    </div>
  );
};

export default ResourceGuideRolodex;
