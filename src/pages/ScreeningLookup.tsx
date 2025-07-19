import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle, FileText, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { isValidScreeningCode, formatScreeningCode } from '../utils/generateScreeningCode';

interface ScreeningResult {
  id: string;
  screening_code: string;
  type: 'adult' | 'toddler';
  name: string;
  age?: number;
  age_months?: number;
  prediction: string;
  classification_result?: string;
  created_at: string;
}

const ScreeningLookup: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScreeningResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchCode.trim()) {
      setError('Please enter a screening code');
      return;
    }

    const formattedCode = formatScreeningCode(searchCode.trim());
    
    if (!isValidScreeningCode(formattedCode)) {
      setError('Invalid screening code format. Please enter a 6-character code.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Search in both adult and toddler screenings
      const [adultResult, toddlerResult] = await Promise.all([
        supabase
          .from('adult_screenings')
          .select('id, screening_code, name, age, prediction, classification_result, created_at, user_id')
          .eq('screening_code', formattedCode)
          .eq('user_id', user?.id)
          .single(),
        supabase
          .from('toddler_screenings')
          .select('id, screening_code, name, age_months, prediction, classification_result, created_at, user_id')
          .eq('screening_code', formattedCode)
          .eq('user_id', user?.id)
          .single()
      ]);

      let foundResult: ScreeningResult | null = null;

      if (adultResult.data && !adultResult.error) {
        foundResult = { ...adultResult.data, type: 'adult' as const };
      } else if (toddlerResult.data && !toddlerResult.error) {
        foundResult = { ...toddlerResult.data, type: 'toddler' as const };
      }

      if (foundResult) {
        setResult(foundResult);
      } else {
        setError('No screening found with this code, or you do not have permission to view it.');
      }
    } catch (error) {
      console.error('Error searching for screening:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 mesh-gradient">
        <div className="absolute inset-0 geometric-bg"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 hover:text-purple-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span className="font-semibold">Screening Lookup</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-6 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
                Find Your Screening
              </h1>
              <p className="text-gray-600 text-lg">
                Enter your 6-digit screening code to view results
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Screening Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code (e.g., ABC123)"
                    maxLength={6}
                    className="w-full px-4 py-4 text-center text-lg font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:shadow-md bg-white/80"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Find Screening</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Search Result */}
          {result && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 font-poppins">
                  Screening Found
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPredictionColor(result.prediction)}`}>
                  {result.prediction === 'YES' ? 'Traits Detected' : 'No Significant Traits'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-semibold text-gray-700">Screening Code:</span>
                    <span className="font-mono text-lg font-bold text-purple-600">{result.screening_code}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-semibold text-gray-700">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      result.type === 'adult' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.type === 'adult' ? 'Adult' : 'Toddler'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-semibold text-gray-700">Name:</span>
                    <span className="text-gray-600">{result.name}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-semibold text-gray-700">Age:</span>
                    <span className="text-gray-600">
                      {result.type === 'adult' 
                        ? `${result.age} years` 
                        : `${result.age_months} months`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-semibold text-gray-700">Date:</span>
                    <span className="text-gray-600">{formatDate(result.created_at)}</span>
                  </div>
                  {result.classification_result && (
                    <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="font-semibold text-gray-700">Classification:</span>
                      <span className="text-purple-600 font-semibold">{result.classification_result}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  to={`/report/${result.type}?screening_id=${result.id}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-5 h-5" />
                  <span>View Full Report</span>
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-blue-700 text-sm leading-relaxed mb-3">
                  Your screening code is a unique 6-character identifier (letters and numbers) that was provided 
                  when you completed your assessment. You can only access screenings that belong to your account.
                </p>
                <Link
                  to="/dashboard"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                >
                  View all your screenings in the dashboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningLookup;