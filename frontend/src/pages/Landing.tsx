import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function Landing() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();

  const handleInstantDemo = () => {
    const demoToken = "demo-access-token";
    const demoRefresh = "demo-refresh-token";
    login(demoToken, demoRefresh, { email: "demo@pathwise.com", id: "demo" });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Your AI-Powered Career <span className="text-blue-600">PathWise</span>
        </h1>
        <p className="text-xl text-slate-600">
          Tell us where you want to go. We'll generate a personalized, adaptive roadmap to get you there—step by step.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">Start Your Journey</Button>
              </Link>
              <Button size="lg" variant="outline" onClick={handleInstantDemo} className="w-full sm:w-auto text-lg px-8">
                Try Instant Demo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
