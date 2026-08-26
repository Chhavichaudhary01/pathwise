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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/roadmaps').catch(() => ({ data: [] })),
      api.get('/profile').catch(() => ({ data: null }))
    ])
      .then(([roadmapsRes, profileRes]) => {
        setRoadmaps(roadmapsRes.data || []);
        setProfile(profileRes.data || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Compute live dynamic statistics from real user roadmaps
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  const completedSkillSet = new Map<string, number>();
  let nextRecommendedAction = "Complete your first onboarding milestone to build core momentum.";
  let currentGoal = profile?.goal || (roadmaps.length > 0 ? roadmaps[0].title : "Software & Web Development");

  roadmaps.forEach((rm) => {
    if (rm.milestones) {
      rm.milestones.forEach((m: any) => {
        if (m.items) {
          m.items.forEach((item: any) => {
            totalItems++;
            if (item.status === 'COMPLETED') {
              completedItems++;
              if (item.catalogItem?.skills) {
                item.catalogItem.skills.forEach((sk: string) => {
                  completedSkillSet.set(sk, (completedSkillSet.get(sk) || 0) + 1);
                });
              }
            } else if (item.status === 'IN_PROGRESS') {
              inProgressItems++;
              if (!nextRecommendedAction.startsWith('Continue:')) {
                nextRecommendedAction = `Continue: "${item.catalogItem?.title || 'Active Module'}" in ${m.title}`;
              }
            }
          });
        }
      });
    }
  });

  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const weeklyHours = profile?.weeklyHours || 10;

  // Build competencies list dynamically from completed skills or active roadmap skills
  const dynamicCompetencies: { name: string; percent: number; color: string }[] = [];
  if (completedSkillSet.size > 0) {
    completedSkillSet.forEach((count, skillName) => {
      const pct = Math.min(100, Math.round((count / Math.max(1, totalItems * 0.2)) * 100));
      dynamicCompetencies.push({
        name: skillName,
        percent: Math.max(25, pct),
        color: pct >= 80 ? 'bg-green-600' : 'bg-blue-600'
      });
    });
  } else if (roadmaps.length > 0 && roadmaps[0].milestones?.length > 0) {
    // Extract first few roadmap skills
    const firstItems = roadmaps[0].milestones[0]?.items || [];
    firstItems.slice(0, 4).forEach((it: any) => {
      if (it.catalogItem?.skills?.[0]) {
        dynamicCompetencies.push({
          name: it.catalogItem.skills[0],
          percent: it.status === 'COMPLETED' ? 100 : (it.status === 'IN_PROGRESS' ? 40 : 10),
          color: it.status === 'COMPLETED' ? 'bg-green-600' : 'bg-blue-500'
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Learner Dashboard</span>
              <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                ⏱️ {weeklyHours}h / week pace
              </span>
              {completedItems > 0 && (
                <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                  ✓ {completedItems} Milestone{completedItems > 1 ? 's' : ''} Completed
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, {user?.email || 'Learner'}
            </h1>
            <p className="text-slate-600 text-xs mt-0.5">
              Goal: <strong className="text-slate-800">{currentGoal}</strong> • Empowered by Google Gemini AI & Prerequisite DAG Engine.
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
          
          {/* Dynamic AI Progress Digest */}
          <Card className="md:col-span-2 border shadow-sm bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">AI Personalized Progress Digest</span>
                <span className="text-xs bg-blue-600/80 px-2.5 py-0.5 rounded-full text-white font-medium">
                  {completionPercent}% Path Completion
                </span>
              </div>
              <CardTitle className="text-xl font-bold text-white">
                {completedItems > 0 ? "Momentum in Progress!" : "Ready to Start Your Learning Path"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-100">
              <p>
                {completedItems > 0 
                  ? `You have mastered ${completedItems} of ${totalItems} milestone items toward your goal of "${currentGoal}". Your prerequisite sequence is dynamically adapting to your pacing.`
                  : `Your path for "${currentGoal}" is ready. Follow the prerequisite DAG to master core concepts before advancing to complex frameworks.`}
              </p>
              <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs space-y-1">
                <span className="font-semibold text-white">Next Recommended Action:</span>
                <p className="text-slate-200">{nextRecommendedAction}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Competency Mastery Card */}
          <Card className="border shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Skill Competencies</CardTitle>
              <CardDescription className="text-xs">
                {dynamicCompetencies.length > 0 ? "Calculated from your active milestones." : "Generated upon completing milestones."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {dynamicCompetencies.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  <p>No competency data yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Complete roadmap items & quizzes to unlock verified skill percentages.</p>
                </div>
              ) : (
                dynamicCompetencies.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{s.name}</span>
                      <span>{s.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${s.color} h-1.5 rounded-full`} style={{ width: `${s.percent}%` }}></div>
                    </div>
                  </div>
                ))
              )}
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
                Loading your personalized roadmaps...
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-4xl">🗺️</div>
                <h3 className="text-lg font-bold text-slate-800">No Roadmaps Yet</h3>
                <p className="text-slate-600 max-w-md mx-auto text-sm">
                  Tell PathWise what you want to achieve, and we'll generate an optimal milestone roadmap for you.
                </p>
                <Button onClick={() => navigate('/onboarding')} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Roadmap 🚀
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmaps.map((roadmap) => {
                  let rTotal = 0;
                  let rDone = 0;
                  if (roadmap.milestones) {
                    roadmap.milestones.forEach((m: any) => {
                      if (m.items) {
                        m.items.forEach((it: any) => {
                          rTotal++;
                          if (it.status === 'COMPLETED') rDone++;
                        });
                      }
                    });
                  }
                  const rPercent = rTotal > 0 ? Math.round((rDone / rTotal) * 100) : 0;

                  return (
                    <div 
                      key={roadmap.id} 
                      className="p-5 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:border-blue-300 transition-colors shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{roadmap.title}</h3>
                          <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 rounded-full">
                            {roadmap.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{roadmap.milestones?.length || 0} Learning Phases</span>
                          <span>•</span>
                          <span>{rDone}/{rTotal} Milestones Done ({rPercent}%)</span>
                          <span>•</span>
                          <span>Created {roadmap.createdAt ? new Date(roadmap.createdAt).toLocaleDateString() : 'Recently'}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${rPercent}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => navigate(`/roadmap/${roadmap.id}`)}>
                          Open Roadmap &rarr;
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
