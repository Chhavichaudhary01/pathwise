import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function DemoModeBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const isDemo = !isAuthenticated || user?.email === 'demo@pathwise.ai';

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs md:text-sm font-medium shadow-sm flex items-center justify-between z-50 sticky top-0">
      <div className="flex items-center gap-2 max-w-2xl">
        <span className="font-extrabold bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
          Demo Mode
        </span>
        <span className="text-slate-900 font-semibold">
          You are currently exploring PathWise with temporary session state.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigate('/register')}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-3 py-1 h-7"
        >
          Save Your Progress — Sign Up 🚀
        </Button>
      </div>
    </div>
  );
}
