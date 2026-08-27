import React, { useState, useEffect, useRef } from 'react';
import { User, GraduationCap, MapPin, Sparkles, X, CheckCircle2, Bookmark, Camera, Upload, Trash2 } from 'lucide-react';
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

const PRESET_AVATARS = [
  { label: 'Pro', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Geek', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { label: 'Innovator', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { label: 'Coder', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
  { label: '3D Art', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80' },
  { label: 'Cyber', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
];

export default function StudentProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
  initialProfile,
  mandatory = false
}: StudentProfileModalProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.avatarUrl) setAvatarUrl(initialProfile.avatarUrl);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        avatarUrl,
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
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Profile Picture Upload & Presets */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Profile Picture</span>
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-cyan-400 p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center text-xl font-black text-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Action & Presets */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#5051F9] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5051F9]" />
                    <span>Upload Custom Photo</span>
                  </button>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP &lt; 5MB</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Presets:</span>
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(p.url)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        avatarUrl === p.url ? 'ring-2 ring-[#5051F9] border-transparent scale-110' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
