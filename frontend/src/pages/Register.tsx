import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Register() {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      // Auto login immediately after registration
      const signinRes = await api.post('/auth/signin', { email, password });
      login(signinRes.data.accessToken, signinRes.data.refreshToken, { id: signinRes.data.id, email: signinRes.data.email });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try a different email or check credentials.');
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
          <CardTitle className="text-2xl font-extrabold text-slate-900">Create your account</CardTitle>
          <CardDescription className="text-xs">
            Start your personalized career and learning roadmap today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
                placeholder="Minimum 6 characters"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6} 
                className="text-sm"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2.5">
              {loading ? 'Creating account...' : 'Create Account & Start 🚀'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t py-4 bg-slate-50/50">
          <p className="text-xs text-slate-600">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
