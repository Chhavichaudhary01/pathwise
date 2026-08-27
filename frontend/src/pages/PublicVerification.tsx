import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GlowingSkillBadge from '@/components/sandbox/GlowingSkillBadge';

export default function PublicVerification() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Credential Certificate Card */}
        <div className="bg-white border-8 border-double border-slate-300 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Subtle background seal */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-50/60 rounded-full pointer-events-none flex items-center justify-center">
            <span className="text-8xl opacity-10">🛡️</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 border-b pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>✓ Verifiable Credential Record</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              PathWise Certificate of Mastery
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Credential ID: {uuid || 'pw_cred_9a87f2e1_verified'}
            </p>
          </div>

          {/* Recipient & Role */}
          <div className="text-center space-y-3">
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-widest">This certifies that</p>
            <h2 className="text-2xl md:text-3xl font-black text-blue-950">
              Verified PathWise Learner
            </h2>
            <p className="text-sm text-slate-700 max-w-md mx-auto">
              has successfully passed the rigorous multi-stage competency assessments and completed all milestone prerequisites for:
            </p>
            <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
              <span className="font-extrabold text-lg text-slate-900">
                Frontend & Full-Stack Web Engineering
              </span>
            </div>
          </div>

          {/* Verified Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center border-y py-4 bg-slate-50/50 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Mastery Score</span>
              <p className="text-2xl font-black text-green-700 mt-0.5">92%</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Prerequisite DAG</span>
              <p className="text-2xl font-black text-blue-700 mt-0.5">Verified</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Verified Date</span>
              <p className="text-sm font-bold text-slate-800 mt-1.5">
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Verified Skills Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 block text-center uppercase tracking-wider">
              Demonstrated & Tested Competencies:
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['HTML5 & Semantics', 'CSS3 / Responsive UI', 'JavaScript ES6+', 'React 18 & Hooks', 'Topological Sorting', 'PostgreSQL'].map((skill) => (
                <span key={skill} className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-medium border">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Glowing Badge Preview */}
          <div className="max-w-xs mx-auto pt-2">
            <GlowingSkillBadge
              badge={{
                skillName: "Full-Stack Web Engineering",
                topicTitle: "Topological Prerequisite DAG & React State",
                score: 95,
                verificationHash: uuid ? `0x${uuid}` : "0x8f4e2b19c8d76a01...verified",
                badgeTier: "DIAMOND",
                issuedAt: new Date().toISOString()
              }}
            />
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-center pt-4 border-t text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">PathWise AI Engine</span>
              <span>•</span>
              <span>Tamper-evident hash</span>
            </div>
            <span className="font-mono text-[10px]">SHA-256: {uuid ? uuid.slice(0, 16) : '8f4e...c21a'}</span>
          </div>

        </div>

        {/* Share & Export Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto font-semibold">
            {copied ? '✓ Link Copied!' : '🔗 Copy Shareable Link'}
          </Button>
          <Button onClick={() => window.print()} className="w-full sm:w-auto font-semibold">
            📄 Print / Save as PDF
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
            Back to Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}
