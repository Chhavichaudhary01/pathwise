import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signin', { email, password });
      login(res.data.accessToken, res.data.refreshToken, { id: res.data.id, email: res.data.email });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        (err.response?.status === 401 
          ? 'Invalid email or password. If you haven’t registered yet, please click "Sign up" below.' 
          : 'Unable to connect to server. Please ensure the backend is running.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black mb-2 shadow-md">
            PW
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-900">Sign in to PathWise</CardTitle>
          <CardDescription className="text-xs">
            Access your personalized learning roadmaps & career progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="text-sm"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2.5">
              {loading ? 'Signing in...' : 'Sign In 🚀'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t py-4 bg-slate-50/50">
          <p className="text-xs text-slate-600">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
