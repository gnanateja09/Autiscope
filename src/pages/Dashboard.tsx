import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Plus, Search, Filter, Eye, Clock, Hash, Download } from 'lucide-react';
import Logout from '../components/Logout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { generatePDFReport } from '../utils/reportGenerator';

interface ScreeningResult {
  id: string;
  screening_code: string;
  type: 'adult' | 'toddler';
  name: string;
  age?: number;
  age_months?: number;
  responses: Record<string, string>;
  classification_responses?: Record<string, string>;
  prediction: string;
  classification_result?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'adult' | 'toddler'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'code'>('date');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchScreenings();
  }, [user]);

  const fetchScreenings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch both adult and toddler screenings
      const [adultResults, toddlerResults] = await Promise.all([
        supabase
          .from('adult_screenings')
          .select('id, screening_code, name, age, responses, classification_responses, prediction, classification_result, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('toddler_screenings')
          .select('id, screening_code, name, age_months, responses, classification_responses, prediction, classification_result, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      const combinedResults: ScreeningResult[] = [
        ...(adultResults.data || []).map(item => ({ ...item, type: 'adult' as const })),
        ...(toddlerResults.data || []).map(item => ({ ...item, type: 'toddler' as const }))
      ];

      // Group by screening_code and keep only the most complete record (with classification_result if available)
      const groupedResults = new Map<string, ScreeningResult>();
      
      combinedResults.forEach(screening => {
        const existing = groupedResults.get(screening.screening_code);
        
        if (!existing) {
          groupedResults.set(screening.screening_code, screening);
        } else {
          // Keep the record with classification_result, or the newer one if both have it
          if (screening.classification_result && !existing.classification_result) {
            groupedResults.set(screening.screening_code, screening);
          } else if (screening.classification_result && existing.classification_result) {
            // If both have classification, keep the newer one
            if (new Date(screening.created_at) > new Date(existing.created_at)) {
              groupedResults.set(screening.screening_code, screening);
            }
          }
        }
      });
      
      const uniqueResults = Array.from(groupedResults.values());

      // Sort by date or code
      uniqueResults.sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
          return a.screening_code.localeCompare(b.screening_code);
        }
      });

      setScreenings(uniqueResults);
    } catch (error) {
      console.error('Error fetching screenings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScreenings = screenings.filter(screening => {
    const matchesSearch = 
      screening.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screening_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || screening.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getPredictionColor = (prediction: string) => {
    switch (prediction?.toLowerCase()) {
      case 'yes':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReport = async (screening: ScreeningResult) => {
    setDownloadingId(screening.id);
    try {
      await generatePDFReport(screening);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your screenings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 mesh-gradient">
        <div className="absolute inset-0 geometric-bg"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 shadow-lg backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-6 h-6" />
              <h1 className="text-xl font-bold font-poppins">My Screening Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass px-3 py-1 rounded-full text-sm">
                {user?.email?.substring(0, 20)}...
              </div>
              <Logout className="text-teal-200 hover:text-white" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/form/adult"
              className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">New Adult Screening</h3>
                  <p className="text-gray-600">Take a new autism screening assessment</p>
                </div>
              </div>
            </Link>

            <Link
              to="/form/toddler"
              className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
                  <Plus className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">New Toddler Screening</h3>
                  <p className="text-gray-600">Assess a toddler for autism traits</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or screening code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                >
                  <option value="all">All Types</option>
                  <option value="adult">Adult</option>
                  <option value="toddler">Toddler</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                >
                  <option value="date">Sort by Date</option>
                  <option value="code">Sort by Code</option>
                </select>
              </div>
            </div>
          </div>

          {/* Screenings List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 font-poppins">
                Your Screening History ({filteredScreenings.length})
              </h2>
            </div>

            {filteredScreenings.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No screenings found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by taking your first screening assessment'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Link
                    to="/form/adult"
                    className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Take First Screening</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredScreenings.map((screening) => (
                  <div key={screening.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm font-semibold text-gray-700">
                              {screening.screening_code}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            screening.type === 'adult' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {screening.type === 'adult' ? 'Adult' : 'Toddler'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPredictionColor(screening.prediction)}`}>
                            {screening.prediction === 'YES' ? 'Traits Detected' : 'No Significant Traits'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {screening.name}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(screening.created_at)}</span>
                          </div>
                          <span>
                            Age: {screening.type === 'adult' 
                              ? `${screening.age} years` 
                              : `${screening.age_months} months`
                            }
                          </span>
                          {screening.classification_result && (
                            <span className="text-teal-600 font-medium">
                              {screening.classification_result}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link
                        to={`/report/${screening.type}?screening_id=${screening.id}`}
                        className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 mr-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      
                      <button
                        onClick={() => handleDownloadReport(screening)}
                        disabled={downloadingId === screening.id}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloadingId === screening.id ? 'Generating...' : 'Download'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-8 bg-amber-50/90 backdrop-blur-sm border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Important Medical Disclaimer</h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  These screening results are for informational purposes only and are not intended as medical diagnoses. 
                  Please consult with qualified healthcare professionals for proper evaluation and diagnosis. 
                  All screening data is private and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;