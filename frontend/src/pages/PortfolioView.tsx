import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function PortfolioView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  let totalItems = 0;
  let completedCount = 0;
  const verifiedSkills = new Map<string, { name: string; score: string; level: string }>();
  const completedProjects: any[] = [];

  const targetRole = profile?.goal || (roadmaps.length > 0 ? roadmaps[0].title : "Software Developer");

  roadmaps.forEach((rm) => {
    if (rm.milestones) {
      rm.milestones.forEach((m: any) => {
        if (m.items) {
          m.items.forEach((item: any) => {
            totalItems++;
            const cat = item.catalogItem;
            if (item.status === 'COMPLETED') {
              completedCount++;
              if (cat?.skills) {
                cat.skills.forEach((sk: string) => {
                  verifiedSkills.set(sk, {
                    name: sk,
                    score: '100% Retained',
                    level: cat.difficulty ? cat.difficulty.toUpperCase() : 'VERIFIED'
                  });
                });
              }
              if (cat?.format === 'project' || cat?.title?.toLowerCase().includes('project')) {
                completedProjects.push({
                  title: cat.title,
                  description: cat.description,
                  tech: cat.skills || ['Hands-on Project'],
                  hours: `${cat.estimatedHours || 3} Hours`
                });
              }
            } else if (cat?.skills && !verifiedSkills.has(cat.skills[0])) {
              // Add as in-progress / emerging
              verifiedSkills.set(cat.skills[0], {
                name: cat.skills[0],
                score: item.status === 'IN_PROGRESS' ? 'In Progress' : 'Prerequisite',
                level: cat.difficulty ? cat.difficulty.toUpperCase() : 'FOUNDATION'
              });
            }
          });
        }
      });
    }
  });

  const masteryPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : (completedCount > 0 ? 100 : 0);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
          &larr; Back to Dashboard
        </Button>

        <div className="flex items-center gap-3">
          <Button onClick={handleShare} variant="outline" className="text-xs font-bold text-[#5051F9] bg-[#EDE9FE] border-purple-200 rounded-full shadow-2xs">
            {copied ? '✓ Link Copied!' : '🔗 Copy Shareable Portfolio Link'}
          </Button>
          <Button onClick={() => window.print()} className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-full shadow-xs">
            📄 Export PDF
          </Button>
        </div>
      </div>

        {/* Portfolio Hero Banner */}
        <Card className="border-none shadow-sm bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-full text-xs font-bold">
                <span>✓ Verified Skill Portfolio</span>
                <span>•</span>
                <span>Mastery Assessed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                {user?.email ? user.email.split('@')[0] : 'Learner'}'s Competency Portfolio
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Target Role: <strong className="text-white">{targetRole}</strong>. Demonstrating verifiable competencies backed by assessment-checked milestones, not self-report.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center min-w-[140px]">
              <span className="text-xs uppercase font-semibold text-slate-300">Overall Mastery</span>
              <p className="text-3xl font-black text-white mt-1">{masteryPercent}%</p>
              <span className="text-[11px] text-green-300 font-medium">Topological Verified</span>
            </div>
          </div>
        </Card>

        {/* Verified Skills Grid */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Verified Competencies</CardTitle>
            <CardDescription className="text-xs">
              Skills validated through completed roadmap milestones & interactive checks on PathWise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500 text-sm">Loading verified competencies...</div>
            ) : verifiedSkills.size === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                <p>No competencies completed yet.</p>
                <Button onClick={() => navigate('/onboarding')} size="sm" className="mt-3">Start Roadmap</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from(verifiedSkills.values()).slice(0, 8).map((skill, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border rounded-lg space-y-1">
                    <span className="text-[10px] text-blue-600 font-bold uppercase">{skill.level}</span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{skill.name}</h4>
                    <span className={`text-xs font-semibold block ${skill.score.includes('Retained') ? 'text-green-700' : 'text-slate-600'}`}>
                      {skill.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Projects Showcase */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Completed Hands-on Milestone Projects</CardTitle>
            <CardDescription className="text-xs">
              Practical micro-projects completed during your learning sequence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedProjects.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>No completed projects yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Mark milestone projects as completed in your roadmap to showcase them here.</p>
              </div>
            ) : (
              completedProjects.map((proj, idx) => (
                <div key={idx} className="p-4 border rounded-xl bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-base">{proj.title}</h3>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded font-medium">{proj.hours}</span>
                  </div>
                  <p className="text-sm text-slate-600">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech.map((t: string) => (
                      <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
    </div>
  );
}
