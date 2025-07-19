import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LogoutProps {
  className?: string;
}

const Logout: React.FC<LogoutProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      const { error } = await signOut();
      
      // Don't treat session_not_found as a real error since user is logged out anyway
      if (error && error.message !== 'Logout completed locally') {
        console.warn('Logout warning:', error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to login and reset loading state
      navigate('/login');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export default Logout;