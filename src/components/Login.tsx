import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/api/login', {
        email,
        password
      });

      if (response.data.success) {
        dispatch(login({
          user: response.data.user,
          token: response.data.token
        }));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 items-center justify-center p-4 ">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-center">Login</h2>
        {error && <div className="text-red-500 my-3 text-center">{error}</div>}
        <div className='mt-5'>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            className="border p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all rounded-lg"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='mt-5'>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            className="border p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all rounded-lg"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='mt-5'>
          <button
            className="bg-blue-500 text-white p-2 rounded disabled:bg-blue-300 w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;