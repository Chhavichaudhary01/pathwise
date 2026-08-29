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
  const { login, loginWithGoogle, loginDemo, isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError('Unauthorized Domain: Please add your deployed domain to Firebase Console -> Authentication -> Settings -> Authorized Domains. You can also use 1-Click Demo Login or Email login below!');
      } else if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        setError('Google sign-in popup was closed before completion. Please try again.');
      } else if (err.message?.includes('api-key-not-valid') || err.message?.includes('invalid-api-key')) {
        setError('Firebase API Key missing: Please add your Firebase credentials to frontend/.env (see frontend/.env.example). You can also use standard email login or 1-Click Demo Login below!');
      } else {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signin', { email: email.trim().toLowerCase(), password });
      login(res.data.accessToken, res.data.refreshToken, { id: res.data.id, email: res.data.email });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.userFriendlyMessage) {
        setError(err.userFriendlyMessage);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server request timed out. If using Render free tier, the server may be waking up (~30s). Please try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. If you haven’t registered yet, please click "Create an account" below.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message ||
          'Unable to connect to server. Please check that your backend is running and reachable.'
        );
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
          <CardTitle className="text-2xl font-extrabold text-slate-900">Sign in to PathWise</CardTitle>
          <CardDescription className="text-xs">
            Access your personalized learning roadmaps & career progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* 1-Click Sign in with Google (Firebase) */}
          <Button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || demoLoading || loading}
            type="button" 
            variant="outline" 
            className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          <Button 
            onClick={handleDemo}
            disabled={googleLoading || demoLoading || loading}
            type="button" 
            variant="outline" 
            className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 font-bold py-2.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {demoLoading ? 'Launching Demo...' : '⚡ Try Instant Demo (1-Click) 🚀'}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2 text-[11px] text-slate-400 uppercase font-semibold">or email login</span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

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
