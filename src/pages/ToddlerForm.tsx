import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Baby, AlertCircle, CheckCircle } from 'lucide-react';
import TreatmentModal from '../components/TreatmentModal';
import RadarChart from '../components/RadarChart';
import Logout from '../components/Logout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { generateScreeningCode } from '../utils/generateScreeningCode';
import { predictToddlerAutism, checkMLServiceHealth } from '../utils/mlPrediction';

const ToddlerForm: React.FC = () => {
  const { user } = useAuth();
  const [screeningId, setScreeningId] = useState<string>('');
  const [screeningCode, setScreeningCode] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    age_months: '',
    A1: '',
    A2: '',
    A3: '',
    A4: '',
    A5: '',
    A6: '',
    A7: '',
    A8: '',
    A9: '',
    A10: ''
  });
  const [classificationData, setClassificationData] = useState({
    Q1: '',
    Q2: '',
    Q3: '',
    Q4: '',
    Q5: ''
  });
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [classification, setClassification] = useState<any>(null);
  const [showClassification, setShowClassification] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [mlServiceAvailable, setMlServiceAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const toddlerQuestions = [
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
  ];

  const classificationQuestions = [
    { key: 'Q1', text: 'Does the child need extensive support with daily activities?' },
    { key: 'Q2', text: 'Does the child have significant communication challenges?' },
    { key: 'Q3', text: 'Does the child display intense repetitive behaviors?' },
    { key: 'Q4', text: 'Does the child have extreme sensory reactions?' },
    { key: 'Q5', text: 'Does the child require constant supervision?' }
  ];

  // Check ML service availability on component mount
  useEffect(() => {
    const checkService = async () => {
      const available = await checkMLServiceHealth();
      setMlServiceAvailable(available);
    };
    checkService();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push('Name is required');
    if (!formData.age_months.trim()) newErrors.push('Age in months is required');
    
    toddlerQuestions.forEach(q => {
      if (!formData[q.key as keyof typeof formData]) {
        newErrors.push(`Question ${q.key} is required`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);
    
    try {
      // Use ML model for prediction
      const predictionResult = await predictToddlerAutism({
        A1: formData.A1,
        A2: formData.A2,
        A3: formData.A3,
        A4: formData.A4,
        A5: formData.A5,
        A6: formData.A6,
        A7: formData.A7,
        A8: formData.A8,
        A9: formData.A9,
        A10: formData.A10,
      });
      
      setPrediction(predictionResult.prediction);
      setConfidence(predictionResult.confidence || null);
    } catch (error) {
      console.error('ML prediction failed, falling back to simple logic:', error);
      // Fallback to simple prediction logic if ML service is unavailable
    const yesCount = toddlerQuestions.filter(q => formData[q.key as keyof typeof formData] === 'yes').length;
      const fallbackPrediction = yesCount >= 3 ? 'YES' : 'NO';
      setPrediction(fallbackPrediction);
      setConfidence(null);
    } finally {
      setIsLoading(false);
    }

    // Save to Supabase
    if (user) {
      try {
        const newScreeningCode = generateScreeningCode();
        const { data, error } = await supabase
          .from('toddler_screenings')
          .insert({
            user_id: user.id,
            screening_code: newScreeningCode,
            name: formData.name,
            age_months: parseInt(formData.age_months),
            responses: {
              A1: formData.A1,
              A2: formData.A2,
              A3: formData.A3,
              A4: formData.A4,
              A5: formData.A5,
              A6: formData.A6,
              A7: formData.A7,
              A8: formData.A8,
              A9: formData.A9,
              A10: formData.A10,
            },
            prediction: prediction,
          })
          .select()
          .single();

        if (data && !error) {
          setScreeningId(data.id);
          setScreeningCode(data.screening_code);
        }
      } catch (error) {
        console.error('Error saving screening:', error);
      }
    }

    // Always show classification for positive results
    setShowClassification(prediction === 'YES');
  };

  const handleClassificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    classificationQuestions.forEach(q => {
      if (!classificationData[q.key as keyof typeof classificationData]) {
        newErrors.push(`Classification question ${q.key} is required`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Mock classification result
    const supportLevel = Object.values(classificationData).filter(v => v === 'yes').length;
    let level = 'Level 1 (Requiring Support)';
    if (supportLevel >= 4) level = 'Level 3 (Requiring Very Substantial Support)';
    else if (supportLevel >= 2) level = 'Level 2 (Requiring Substantial Support)';

    const chartData = generateRadarData();

    // Update screening with classification data
    if (user && screeningId) {
      try {
        await supabase
          .from('toddler_screenings')
          .update({
            classification_responses: classificationData,
            classification_result: level,
            chart_data: chartData,
          })
          .eq('id', screeningId);
      } catch (error) {
        console.error('Error updating screening:', error);
      }
    }

    const mockData = {
      user_id: user?.id || '',
      name: formData.name,
      classification_result: level,
      chart_radar: chartData,
      screening_id: screeningId,
    };

    setClassification(mockData);
  };

  const generateRadarData = () => {
    return {
      labels: ['Social Communication', 'Repetitive Behaviors', 'Sensory Processing', 'Attention', 'Developmental Milestones'],
      datasets: [{
        label: 'Autism Traits',
        data: [
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 1
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }]
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 medical-gradient-light">
        <div className="absolute inset-0 geometric-bg"></div>
        <div className="absolute top-16 right-16 w-56 h-56 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-40 h-40 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-white/5 rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 shadow-lg backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 hover:text-red-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5" />
              <span className="font-semibold">Toddler Screening</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {mlServiceAvailable ? (
              <div className="flex items-center text-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">ML Model</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-200">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Fallback Logic</span>
              </div>
            )}
            <div className="glass px-3 py-1 rounded-full text-sm">
              User: {user?.email?.substring(0, 20)}...
            </div>
            <Logout className="text-red-200 hover:text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 relative">
        {errors.length > 0 && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Child Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Child's Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:shadow-md bg-white/80"
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Age (in months)</label>
                <input
                  type="number"
                  value={formData.age_months}
                  onChange={(e) => setFormData({...formData, age_months: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:shadow-md bg-white/80"
                  placeholder="Enter age in months"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Screening Questions</h2>
            <div className="space-y-6">
              {toddlerQuestions.map((question) => (
                <div key={question.key} className="border-b border-gray-200 pb-4 hover:bg-red-50/50 p-3 rounded-lg transition-colors duration-300">
                  <p className="text-gray-800 mb-3 font-medium">{question.text}</p>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.key}
                        value="yes"
                        checked={formData[question.key as keyof typeof formData] === 'yes'}
                        onChange={(e) => setFormData({...formData, [question.key]: e.target.value})}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="font-medium">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.key}
                        value="no"
                        checked={formData[question.key as keyof typeof formData] === 'no'}
                        onChange={(e) => setFormData({...formData, [question.key]: e.target.value})}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="font-medium">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Submit Screening
          </button>
        </form>

        {prediction && (
          <div className={`mt-6 p-6 rounded-xl backdrop-blur-sm shadow-xl border ${prediction === 'YES' ? 'bg-amber-50/90 border-amber-300' : 'bg-green-50/90 border-green-300'}`}>
            <div className="flex items-center mb-4">
              {prediction === 'YES' ? (
                <AlertCircle className="w-6 h-6 text-amber-600 mr-3" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              )}
              <h3 className="text-xl font-bold text-gray-800">
                Screening Result: {prediction === 'YES' ? 'Positive for Autism Traits' : 'Negative for Autism Traits'}
              </h3>
            </div>
            {screeningCode && (
              <div className="mb-4 p-4 bg-white/50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Your Screening Code:</span>
                  <span className="font-mono text-lg font-bold text-red-600">{screeningCode}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Save this code to access your results later
                </p>
              </div>
            )}
            <p className="text-gray-700">
              {prediction === 'YES' 
                ? 'The screening suggests autism traits. Please proceed with the classification questions below.'
                : 'The screening does not suggest significant autism traits. Consult with a healthcare professional for further evaluation if needed.'
              }
            </p>
          </div>
        )}

        {showClassification && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all duration-500 transform border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Classification Assessment</h3>
            <form onSubmit={handleClassificationSubmit} className="space-y-6">
              {classificationQuestions.map((question) => (
                <div key={question.key} className="border-b border-gray-200 pb-4 hover:bg-red-50/50 p-3 rounded-lg transition-colors duration-300">
                  <p className="text-gray-800 mb-3 font-medium">{question.text}</p>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.key}
                        value="yes"
                        checked={classificationData[question.key as keyof typeof classificationData] === 'yes'}
                        onChange={(e) => setClassificationData({...classificationData, [question.key]: e.target.value})}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="font-medium">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.key}
                        value="no"
                        checked={classificationData[question.key as keyof typeof classificationData] === 'no'}
                        onChange={(e) => setClassificationData({...classificationData, [question.key]: e.target.value})}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="font-medium">No</span>
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Generate Classification
              </button>
            </form>
          </div>
        )}

        {classification && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Classification Results</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-gray-700">User ID:</span>
                    <span className="ml-2 text-gray-600">{classification.user_id.substring(0, 8)}...</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-600">{classification.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Classification:</span>
                    <span className="ml-2 text-red-600 font-semibold">{classification.classification_result}</span>
                  </div>
                </div>
              </div>
              <div>
                <RadarChart data={classification.chart_radar} />
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setShowTreatmentModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Treatment Info
              </button>
              <Link
                to={`/report/toddler?screening_id=${classification.screening_id}`}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View Full Report
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>

      <TreatmentModal 
        isOpen={showTreatmentModal} 
        onClose={() => setShowTreatmentModal(false)} 
      />
    </div>
  );
};

export default ToddlerForm;