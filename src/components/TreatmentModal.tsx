import React from 'react';
import { X, Heart, BookOpen, Users, Stethoscope, Pill } from 'lucide-react';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const treatments = [
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Applied Behavior Analysis (ABA)',
      description: 'Evidence-based therapy that focuses on improving specific behaviors and skills through structured learning.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      title: 'Educational Interventions',
      description: 'Specialized educational programs and accommodations to support learning and development.'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: 'Family Therapy',
      description: 'Support and training for families to better understand and support their loved ones with autism.'
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-red-600" />,
      title: 'Other Therapies',
      description: 'Speech therapy, occupational therapy, and physical therapy to address specific needs.'
    },
    {
      icon: <Pill className="w-8 h-8 text-yellow-600" />,
      title: 'Medications',
      description: 'When appropriate, medications may help manage certain symptoms and co-occurring conditions.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Treatment Options</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            There are several evidence-based treatments and interventions that can help individuals with autism spectrum disorder. 
            Treatment plans are typically individualized based on specific needs and goals.
          </p>
          
          <div className="space-y-4">
            {treatments.map((treatment, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200/50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {treatment.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {treatment.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {treatment.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-200/50">
            <p className="text-blue-800 font-medium leading-relaxed">
              <strong>Important Note:</strong> This screening tool is not a diagnostic instrument. 
              Please consult with qualified healthcare professionals for proper evaluation and treatment planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentModal;