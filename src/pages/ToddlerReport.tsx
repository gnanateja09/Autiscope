import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Baby, FileText } from 'lucide-react';
import RadarChart from '../components/RadarChart';
import Logout from '../components/Logout';
import { useAuth } from '../hooks/useAuth';
import { supabase, ToddlerScreening } from '../lib/supabase';

const ToddlerReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const screeningId = searchParams.get('screening_id');
  const [reportData, setReportData] = useState<ToddlerScreening | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!screeningId || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('toddler_screenings')
          .select('*')
          .eq('id', screeningId)
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setReportData(data);
        } else {
          console.error('Error fetching report:', error);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [screeningId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Report not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 medical-gradient-light">
        <div className="absolute inset-0 geometric-bg"></div>
        <div className="absolute top-16 right-16 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-24 left-24 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/2 w-36 h-36 bg-white/5 rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 shadow-lg backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 hover:text-red-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Selection</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5" />
              <span className="font-semibold">Toddler Report</span>
            </div>
          </div>
          <Logout className="text-red-200 hover:text-white" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 relative">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-white/20">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Toddler Screening Report</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">User ID:</span>
                <span className="text-gray-600">{reportData.id?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">Screening Code:</span>
                <span className="font-mono text-lg font-bold text-red-600">{reportData.screening_code}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-600">{reportData.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">Age:</span>
                <span className="text-gray-600">{reportData.age_months} months</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">Autism Type:</span>
                <span className="text-red-600 font-semibold">
                  {reportData.prediction === 'YES' ? 'Autism traits detected' : 'No significant traits'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-semibold text-gray-700">Autism Level:</span>
                <span className="text-red-600 font-semibold">
                  {reportData.classification_result || 'Not classified'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trait Profile</h3>
              {reportData.chart_data ? (
                <RadarChart data={reportData.chart_data} />
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No chart data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Screening Responses</h2>
          
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Initial Screening Questions</h3>
            {[
              { key: 'A1', text: 'Does your child look at you when you call his/her name?' },
              { key: 'A2', text: 'How easy is it for you to get eye contact with your child?' },
              { key: 'A3', text: 'Does your child point to indicate that s/he wants something?' },
              { key: 'A4', text: 'Does your child point to share interest with you?' },
              { key: 'A5', text: 'Does your child pretend (e.g., care for dolls, talk on phone)?' },
              { key: 'A6', text: 'Does your child follow where you\'re looking?' },
              { key: 'A7', text: 'If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them?' },
              { key: 'A8', text: 'Would you describe your child\'s first words as normal?' },
              { key: 'A9', text: 'Does your child use simple gestures (e.g., wave goodbye)?' },
              { key: 'A10', text: 'Does your child stare at nothing with no apparent purpose?' }
            ].map((question) => (
              <div key={question.key} className="border border-red-100 rounded-xl p-4 hover:bg-red-50/50 transition-colors duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-red-600 text-sm">{question.key}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reportData.responses[question.key] === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {reportData.responses[question.key] === 'yes' ? 'Yes' : 'No'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{question.text}</p>
              </div>
            ))}
          </div>

          {reportData.classification_responses && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Classification Assessment Questions</h3>
              {[
                { key: 'Q1', text: 'Does the child need extensive support with daily activities?' },
                { key: 'Q2', text: 'Does the child have significant communication challenges?' },
                { key: 'Q3', text: 'Does the child display intense repetitive behaviors?' },
                { key: 'Q4', text: 'Does the child have extreme sensory reactions?' },
                { key: 'Q5', text: 'Does the child require constant supervision?' }
              ].map((question) => (
                <div key={question.key} className="border border-red-100 rounded-xl p-4 hover:bg-red-50/50 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-red-600 text-sm">{question.key}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reportData.classification_responses![question.key] === 'yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {reportData.classification_responses![question.key] === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{question.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Treatment Information Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Treatment Information & Recommendations</h2>
          
          <div className="space-y-6">
            <div className="bg-red-50/50 rounded-xl p-6 border border-red-100">
              <h3 className="text-xl font-semibold text-red-800 mb-4">💡 Evidence-Based Treatment Options</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Applied Behavior Analysis (ABA)</h4>
                  <p className="text-gray-600 text-sm">Evidence-based therapy focusing on improving specific behaviors and skills through structured learning.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Educational Interventions</h4>
                  <p className="text-gray-600 text-sm">Specialized educational programs and accommodations to support learning and development.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Speech and Language Therapy</h4>
                  <p className="text-gray-600 text-sm">Helps improve communication skills, including verbal and non-verbal communication.</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Occupational Therapy</h4>
                  <p className="text-gray-600 text-sm">Focuses on developing daily living skills, fine motor skills, and sensory processing abilities.</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Social Skills Training</h4>
                  <p className="text-gray-600 text-sm">Structured programs to help develop social interaction skills and understanding social cues.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-800 mb-4">⚠️ Important Medical Disclaimer</h3>
              <p className="text-amber-700 leading-relaxed">
                This screening tool is for informational purposes only and is not intended as a medical diagnosis. 
                Please consult with qualified healthcare professionals for proper evaluation and diagnosis. 
                A formal diagnosis of autism spectrum disorder requires comprehensive evaluation by qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ToddlerReport;