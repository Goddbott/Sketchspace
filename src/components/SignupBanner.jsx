import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function SignupBanner({ canvasId }) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isVisible || user) return null;

  return (
    <div className="absolute top-4 right-4 z-[300] bg-white border border-yellow-200 shadow-lg rounded-2xl p-3 flex flex-col gap-2 max-w-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
          <p>
            You are drawing anonymously. This canvas will expire and be deleted in <strong>7 days</strong>.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex justify-end mt-1">
        <button 
          onClick={() => navigate(canvasId ? `/auth?migrate=${canvasId}` : '/auth')}
          className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign up to save forever
        </button>
      </div>
    </div>
  );
}
