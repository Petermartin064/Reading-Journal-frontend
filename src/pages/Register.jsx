import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(username, email, password);
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
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop" 
            alt="Bookshelf" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B28] via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-8 text-white/90" />
          <h1 className="text-4xl font-serif mb-4 leading-tight">Start your journey.</h1>
          <p className="text-lg text-white/70">Join us to build a consistent reading habit and separate your career growth from self-development.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Create an account</h2>
            <p className="text-text-muted">Enter your details below to get started.</p>
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
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email <span className="text-text-muted font-normal">(Optional)</span></label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">
              Create account
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-8">
            Already have an account? <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
