import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useEffect, useState } from 'react';
import api from '../utils/axios';

interface Score {
  judge?: number;
  member?: number;
  interaction?: number;
  submitted: boolean;
}

interface ExamScores {
  scores: {
    [email: string]: Score;
  };
}

interface Scores {
  [examId: string]: ExamScores;
}

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [scores, setScores] = useState<Scores>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [scoresRes, statusRes] = await Promise.all([
          api.get('/api/get-scores'),
          api.get('/api/scoring-status')
        ]);
        
        setScores(scoresRes.data);
        setIsLocked(statusRes.data.isLocked);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      const updatedScores = { ...scores };
      Object.keys(updatedScores).forEach(examId => {
        if (updatedScores[examId].scores[user.email]) {
          updatedScores[examId].scores[user.email].submitted = true;
        }
      });

      const response = await api.post('/api/submit-scores', { scores: updatedScores });
      if (response.status === 200) {
        setScores(updatedScores);
        alert('Scores saved successfully!');
      }
    } catch (err) {
      console.error('Error submitting scores:', err);
      alert('Failed to save scores');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please login</div>;

  const getScoreType = (role: string) => {
    switch (role) {
      case 'admin':
      case 'bgk':
        return 'judge';
      case 'member':
        return 'member';
      default:
        return 'interaction';
    }
  };

  const scoreType = getScoreType(user?.role || '');
  const isSubmitted = (examId: string) => scores[examId]?.scores[user.email]?.submitted;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {isLocked && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4">
          Chấm điểm đã bị khóa
        </div>
      )}
      
      <div className="mt-4">
        {Object.entries(scores).map(([examId, examData]) => (
          <div key={examId} className="flex flex-col mb-4 p-4 border rounded">
            <h3 className="font-bold">{examId}</h3>
            <div className="mt-2">
              <label>{`${scoreType.charAt(0).toUpperCase() + scoreType.slice(1)} Score:`}</label>
              <input
                type="number"
                max={10}
                min={0}
                value={examData.scores[user.email]?.[scoreType] || 0}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [examId]: {
                      ...prev[examId],
                      scores: {
                        ...prev[examId].scores,
                        [user.email]: {
                          ...prev[examId].scores[user.email],
                          [scoreType]: Number(e.target.value)
                        }
                      }
                    }
                  }))
                }
                disabled={isLocked || isSubmitted(examId)}
                className={`border p-1 w-16 text-center ml-2 ${
                  isLocked || isSubmitted(examId) ? 'bg-gray-100' : ''
                }`}
              />
              {isSubmitted(examId) && (
                <span className="ml-2 text-green-500">Đã chấm điểm</span>
              )}
            </div>
          </div>
        ))}
        
        <button
          className="bg-green-500 text-white p-2 mt-4 rounded disabled:bg-gray-400"
          onClick={handleSubmit}
          disabled={isLocked || Object.keys(scores).every(examId => isSubmitted(examId))}
        >
          Submit Scores
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
