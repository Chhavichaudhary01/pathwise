import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

export default function PortfolioView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
            &larr; Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <Button onClick={handleShare} variant="outline" className="text-sm font-semibold">
              {copied ? '✓ Link Copied!' : '🔗 Copy Shareable Portfolio Link'}
            </Button>
            <Button onClick={() => window.print()} className="text-sm font-semibold">
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
                {user?.email ? user.email.split('@')[0] : 'Learner'}'s Career Portfolio
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Target Role: <strong className="text-white">Frontend & Full-Stack Developer</strong>. Demonstrating verifiable competencies backed by assessment-checked milestones, not self-report.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center min-w-[140px]">
              <span className="text-xs uppercase font-semibold text-slate-300">Overall Mastery</span>
              <p className="text-3xl font-black text-white mt-1">85%</p>
              <span className="text-[11px] text-green-300 font-medium">Topological Verified</span>
            </div>
          </div>
        </Card>

        {/* Verified Skills Grid */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Verified Competencies</CardTitle>
            <CardDescription className="text-xs">
              Skills validated through interactive mini-assessments on PathWise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'HTML5 & Semantics', score: '100% Score', level: 'Advanced' },
                { name: 'Responsive CSS / Tailwind', score: '95% Score', level: 'Advanced' },
                { name: 'JavaScript (ES6+)', score: '90% Score', level: 'Intermediate' },
                { name: 'React 18 & Hooks', score: '88% Score', level: 'Intermediate' },
                { name: 'REST APIs & Async', score: '85% Score', level: 'Intermediate' },
                { name: 'PostgreSQL & Neon DB', score: '82% Score', level: 'Intermediate' },
                { name: 'State Management (Zustand)', score: '80% Score', level: 'Intermediate' },
                { name: 'Topological DAG Sorting', score: '100% Score', level: 'Advanced' },
              ].map((skill, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border rounded-lg space-y-1">
                  <span className="text-xs text-blue-600 font-bold uppercase">{skill.level}</span>
                  <h4 className="font-bold text-sm text-slate-900">{skill.name}</h4>
                  <span className="text-xs text-green-700 font-semibold block">{skill.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects Showcase */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Completed Hands-on Milestone Projects</CardTitle>
            <CardDescription className="text-xs">
              Practical micro-projects completed during the learning roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: 'Full-Stack Recommender & Interactive Dashboard',
                tech: ['React', 'TypeScript', 'Tailwind', 'Spring Boot', 'PostgreSQL'],
                description: 'Engineered a career recommendation web app with topological DAG sorting and JWT authentication.',
                hours: '15 Hours',
              },
              {
                title: 'JavaScript ES6+ Asynchronous Data Transformer',
                tech: ['JavaScript', 'Promises', 'Async/Await', 'REST APIs'],
                description: 'Implemented recursive data fetchers, error retries, and structured JSON parsing.',
                hours: '8 Hours',
              },
              {
                title: 'Responsive Accessible Portfolio Architecture',
                tech: ['HTML5', 'CSS3', 'Semantic Markup', 'ARIA'],
                description: 'Built a compliant, mobile-first responsive portfolio with keyboard navigation and dark mode.',
                hours: '6 Hours',
              }
            ].map((proj, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-base">{proj.title}</h3>
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded font-medium">{proj.hours}</span>
                </div>
                <p className="text-sm text-slate-600">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.tech.map((t) => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
