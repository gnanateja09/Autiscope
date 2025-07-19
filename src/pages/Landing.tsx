import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Baby, User } from 'lucide-react';
import Logout from '../components/Logout';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden mesh-gradient">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-lg rotate-45 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-white/10 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/10 rounded-lg rotate-12 animate-float animation-delay-5000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-white/10 rounded-lg rotate-45 animate-float animation-delay-4000"></div>
      </div>
      
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="glass rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300 text-white hover:text-blue-200 font-medium"
          >
            Dashboard
          </Link>
          <div className="glass rounded-full p-2 hover:bg-white/20 transition-all duration-300">
            <Logout className="text-white hover:text-red-200" />
          </div>
        </div>
      </div>
      
      <div className="text-center p-8 max-w-2xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <Brain className="w-16 h-16 text-white mx-auto mb-4 relative z-10 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            AutiScope
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Modern autism screening tools for adults and toddlers
          </p>
        </div>
        
        <div className="glass rounded-2xl p-8 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:transform hover:scale-105 pulse-glow">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Choose Your Screening Type
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/form/adult"
              className="group bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center space-y-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
              <User className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Adult Screening</h3>
                <p className="text-blue-100 text-sm">
                  Self-assessment questionnaire for adults
                </p>
              </div>
            </Link>
            
            <Link
              to="/form/toddler"
              className="group bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center space-y-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
              <Baby className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Toddler Screening</h3>
                <p className="text-red-100 text-sm">
                  Parent/caregiver assessment for toddlers
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;