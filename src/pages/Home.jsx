import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const newId = uuidv4();
    navigate(`/canvas/${newId}?new=true`, { replace: true });
  }, [navigate]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 h-screen w-screen">
      <div className="text-gray-400">Loading your canvas...</div>
    </div>
  );
}
