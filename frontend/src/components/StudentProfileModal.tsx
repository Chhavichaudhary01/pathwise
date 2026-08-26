import React, { useState, useEffect } from 'react';
import { User, GraduationCap, MapPin, Sparkles, X, CheckCircle2, Bookmark } from 'lucide-react';
import api from '@/lib/api';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedProfile: any) => void;
  initialProfile?: any;
  mandatory?: boolean;
}

const INTERESTS_OPTIONS = [
  'Full Stack Development',
  'Frontend & React',
  'Backend & APIs',
  'AI & Machine Learning',
  'Data Science & Analytics',
  'DevOps & Cloud',
  'Mobile Apps (Android/iOS)',
  'Cybersecurity',
  'System Design',
  'UI/UX & Product Design'
];

export default function StudentProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
  initialProfile,
  mandatory = false
}: StudentProfileModalProps) {
  const [age, setAge] = useState<number | ''>('');
  const [classGrade, setClassGrade] = useState('Undergraduate (B.Tech / BCA / B.Sc)');
  const [board, setBoard] = useState('Autonomous / State University');
  const [address, setAddress] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.age) setAge(initialProfile.age);
      if (initialProfile.classGrade) setClassGrade(initialProfile.classGrade);
      if (initialProfile.board) setBoard(initialProfile.board);
      if (initialProfile.address) setAddress(initialProfile.address);
      if (initialProfile.goal) setGoal(initialProfile.goal);
      if (initialProfile.weeklyHours) setWeeklyHours(initialProfile.weeklyHours);
      if (initialProfile.learningStyle) setLearningStyle(initialProfile.learningStyle);

      if (initialProfile.interests) {
        try {
          const parsed = typeof initialProfile.interests === 'string' 
            ? JSON.parse(initialProfile.interests) 
            : initialProfile.interests;
          if (Array.isArray(parsed)) setSelectedInterests(parsed);
        } catch (ignored) {}
      }
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || Number(age) < 10 || Number(age) > 100) {
      setError('Please enter a valid age (10-100).');
      return;
    }
    if (!classGrade.trim()) {
      setError('Please select or specify your class/grade.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        age: Number(age),
        classGrade: classGrade.trim(),
        board: board.trim(),
        address: address.trim(),
        goal: goal.trim() || 'Full Stack Web Developer',
        interests: selectedInterests,
        weeklyHours,
        learningStyle,
        isProfileComplete: true
      };

      const res = await api.post('/profile', payload);
      if (onProfileUpdated) {
        onProfileUpdated(res.data);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save student profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                {mandatory ? 'Complete Your Student Profile' : 'Edit Profile Information'}
              </h2>
              <p className="text-xs text-blue-100">
                {mandatory 
                  ? 'Please fill in your academic details to tailor your prerequisite roadmap.'
                  : 'Update your academic level, board, location, and technical interests.'}
              </p>
            </div>
          </div>

          {!mandatory && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Age & Class Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Age *</span>
              </label>
              <input
                type="number"
                min={10}
                max={100}
                placeholder="e.g., 20"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                required
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Class / Grade *</span>
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                required
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
              >
                <option value="Class 9th / 10th">Class 9th / 10th</option>
                <option value="Class 11th / 12th (High School)">Class 11th / 12th (High School)</option>
                <option value="Undergraduate (B.Tech / BCA / B.Sc)">Undergraduate (B.Tech / BCA / B.Sc)</option>
                <option value="Postgraduate (M.Tech / MCA / M.Sc)">Postgraduate (M.Tech / MCA / M.Sc)</option>
                <option value="Working Professional / Self-Taught">Working Professional / Self-Taught</option>
              </select>
            </div>
          </div>

          {/* Board & Address Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Board / University / School</span>
              </label>
              <input
                type="text"
                placeholder="e.g., CBSE / ICSE / State Board / University Name"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Address / Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bengaluru, Karnataka, India"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
              />
            </div>
          </div>

          {/* Primary Career Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5051F9]" />
              <span>Target Dream Role / Goal</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Full Stack Web Developer / AI Engineer"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
            />
          </div>

          {/* Interests Multi-Select Pills */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800">
              Technical Interests & Domains (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1
                      ${isSelected 
                        ? 'bg-[#5051F9] text-white shadow-2xs' 
                        : 'bg-[#F4F6FB] text-slate-600 hover:bg-purple-50 hover:text-[#5051F9] border border-slate-200/60'}
                    `}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pacing & Style Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800">Weekly Study Availability</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                  className="w-24 bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 font-medium">Hours / Week</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800">Learning Format Preference</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                <option value="hands-on">🛠️ Hands-on Projects First</option>
                <option value="course">🎥 Interactive Video Courses</option>
                <option value="article">📖 In-depth Documentation</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            {!mandatory && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-full shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              {loading ? 'Saving Profile...' : 'Save Student Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
