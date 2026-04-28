import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding / Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-text-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2070&auto=format&fit=crop" 
            alt="Library" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B28] via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-8 text-white/90" />
          <h1 className="text-4xl font-serif mb-4 leading-tight">Master your reading habits.</h1>
          <p className="text-lg text-white/70">Track your daily progress, build consistent routines, and achieve your reading goals with our command center.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
            <p className="text-text-muted">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Username</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">
              Sign in
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-8">
            Don't have an account? <Link to="/register" className="text-primary hover:text-primary-hover font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
