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
  const { login, loginDemo, isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await api.post('/auth/signup', { email: cleanEmail, password });
      // Auto login immediately after registration
      const signinRes = await api.post('/auth/signin', { email: cleanEmail, password });
      login(signinRes.data.accessToken, signinRes.data.refreshToken, { id: signinRes.data.id, email: signinRes.data.email });
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server request timed out. Please try again in a moment.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check credentials or backend status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Demo error:', err);
      navigate('/dashboard', { replace: true });
    } finally {
      setDemoLoading(false);
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
        <CardContent className="space-y-4">
          
          <Button 
            onClick={handleDemo}
            disabled={demoLoading || loading}
            type="button" 
            variant="outline" 
            className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 font-bold py-2.5 flex items-center justify-center gap-2"
          >
            {demoLoading ? 'Launching Demo...' : '⚡ Try Instant Demo (1-Click) 🚀'}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2 text-[11px] text-slate-400 uppercase font-semibold">or create with email</span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

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
