import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/roadmaps')
      .then((res) => setRoadmaps(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Learner Dashboard</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                🔥 5-Day Momentum Streak
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Welcome, {user?.email}</h1>
            <p className="text-slate-600 text-xs mt-0.5">
              Empowered by Google Gemini AI & Deterministic Prerequisite DAG Engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => navigate('/onboarding')} className="bg-blue-600 hover:bg-blue-700 font-semibold">
              + New Roadmap
            </Button>
            <Button variant="outline" onClick={() => navigate('/chat')} className="font-semibold text-blue-700">
              💬 AI Coach
            </Button>
            <Button variant="outline" onClick={() => navigate('/skill-graph')} className="font-semibold">
              🕸️ Skill DAG
            </Button>
            <Button variant="outline" onClick={() => navigate('/portfolio')} className="font-semibold">
              📜 Portfolio
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              ⚙️ Settings
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-500">
              Log Out
            </Button>
          </div>
        </div>

        {/* Weekly Digest & Progress Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Weekly AI Progress Digest */}
          <Card className="md:col-span-2 border shadow-sm bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">AI Weekly Progress Digest</span>
                <span className="text-xs bg-blue-700/60 px-2 py-0.5 rounded-full text-blue-200">Week 1 Active</span>
              </div>
              <CardTitle className="text-xl font-bold text-white">Great Momentum This Week!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-100">
              <p>
                "You showed up 5 of 7 days this week and mastered the <strong>HTML5 & Semantic Web</strong> milestone ahead of schedule! You are moving <strong>25% faster</strong> than your stated time budget."
              </p>
              <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs space-y-1">
                <span className="font-semibold text-white">Next Recommended Action:</span>
                <p className="text-slate-200">
                  Begin <strong>JavaScript ES6+ Asynchronous Programming</strong> to unlock React component lifecycles.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Competency Mastery Card */}
          <Card className="border shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Skill Competencies</CardTitle>
              <CardDescription className="text-xs">Based on mastery check assessments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                { name: 'HTML5 & Semantics', percent: 100, color: 'bg-green-600' },
                { name: 'CSS3 & Responsive', percent: 90, color: 'bg-green-600' },
                { name: 'JavaScript ES6+', percent: 75, color: 'bg-blue-600' },
                { name: 'React 18 & Hooks', percent: 60, color: 'bg-blue-600' },
                { name: 'PostgreSQL / SQL', percent: 40, color: 'bg-amber-500' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{s.name}</span>
                    <span>{s.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${s.color} h-1.5 rounded-full`} style={{ width: `${s.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Roadmaps List */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold">Your Active Learning Roadmaps</CardTitle>
                <CardDescription className="text-xs">
                  Topologically sorted milestone paths personalized to your goals.
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/onboarding')} size="sm" className="font-semibold">
                + Create Path
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading roadmaps...
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-4xl">🗺️</div>
                <h3 className="text-lg font-bold text-slate-800">No Roadmaps Yet</h3>
                <p className="text-slate-600 max-w-md mx-auto text-sm">
                  Tell PathWise what you want to achieve, and we'll generate an optimal milestone roadmap for you.
                </p>
                <Button onClick={() => navigate('/onboarding')} size="lg">
                  Create Your First Roadmap 🚀
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmaps.map((roadmap) => (
                  <div 
                    key={roadmap.id} 
                    className="p-5 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{roadmap.title}</h3>
                        <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 rounded-full">
                          {roadmap.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {roadmap.milestones?.length || 3} Learning Phases • Created {roadmap.createdAt ? new Date(roadmap.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => navigate(`/roadmap/${roadmap.id}`)}>
                        Open Roadmap &rarr;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
