import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, GraduationCap, MapPin, Sparkles, CheckCircle2, Bookmark, Download, Trash2, ArrowLeft, Mail, Bell, Flame, Clock, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

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

export default function SettingsView() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // Student Profile State
  const [age, setAge] = useState<number | ''>('');
  const [classGrade, setClassGrade] = useState('Undergraduate (B.Tech / BCA / B.Sc)');
  const [board, setBoard] = useState('Autonomous / State University');
  const [address, setAddress] = useState('');
  const [goal, setGoal] = useState('Full Stack Web Developer');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Daily Email Reminders & Streak State
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState('09:00');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [streakCount, setStreakCount] = useState(1);
  const [longestStreak, setLongestStreak] = useState(1);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    api.get('/profile')
      .then((res) => {
        if (res.data) {
          const d = res.data;
          if (d.age) setAge(d.age);
          if (d.classGrade) setClassGrade(d.classGrade);
          if (d.board) setBoard(d.board);
          if (d.address) setAddress(d.address);
          if (d.goal) setGoal(d.goal);
          if (d.weeklyHours) setWeeklyHours(d.weeklyHours);
          if (d.learningStyle) setLearningStyle(d.learningStyle);
          if (d.dailyReminderEnabled !== undefined) setDailyReminderEnabled(d.dailyReminderEnabled);
          if (d.dailyReminderTime) setDailyReminderTime(d.dailyReminderTime);
          if (d.notificationEmail) setNotificationEmail(d.notificationEmail);
          if (d.streakCount) setStreakCount(d.streakCount);
          if (d.longestStreak) setLongestStreak(d.longestStreak);

          if (d.interests) {
            try {
              const parsed = typeof d.interests === 'string' ? JSON.parse(d.interests) : d.interests;
              if (Array.isArray(parsed)) setSelectedInterests(parsed);
            } catch (ignored) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/profile', {
        age: age ? Number(age) : null,
        classGrade,
        board,
        address,
        goal,
        interests: selectedInterests,
        weeklyHours,
        learningStyle,
        dailyReminderEnabled,
        dailyReminderTime,
        notificationEmail,
        isProfileComplete: true
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    try {
      const res = await api.post('/notifications/test-reminder');
      setTestEmailStatus(res.data?.message || 'Reminder email dispatched successfully!');
      setTimeout(() => setTestEmailStatus(null), 5000);
    } catch (err: any) {
      console.error('Failed to send test email:', err);
      setTestEmailStatus('Failed to dispatch test email. Please check your notification email.');
      setTimeout(() => setTestEmailStatus(null), 5000);
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/profile/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pathwise_data_${user?.email || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/profile/account');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 mb-1 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Account & Student Profile</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage your academic credentials, pacing constraints, and profile options.</p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Student Profile Form Card */}
      <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-[#F8F9FD] border-b border-slate-100 py-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5051F9] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900">Student & Academic Profile</CardTitle>
              <CardDescription className="text-[11px] text-slate-400">
                Personal details used to calibrate your roadmap pacing and recommendations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Age & Class Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5051F9]" />
                  <span>Age</span>
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  placeholder="e.g., 20"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#5051F9]" />
                  <span>Class / Grade Level</span>
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
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
                  className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5051F9]" />
                  <span>Address / City / Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bengaluru, Karnataka, India"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
                />
              </div>
            </div>

            {/* Target Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Primary Goal / Target Role</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Full Stack Web Developer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9]"
              />
            </div>

            {/* Interests Chips */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800">
                Technical Interests (Select all that apply)
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
                          : 'bg-[#F8F9FD] text-slate-600 hover:bg-purple-50 hover:text-[#5051F9] border border-slate-200/60'}
                      `}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pacing & Learning Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800">Weekly Study Availability</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                    className="w-24 bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                  <span className="text-xs text-slate-500 font-medium">Hours / Week</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800">Preferred Learning Format</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full bg-[#F8F9FD] border border-slate-200/80 rounded-2xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="hands-on">🛠️ Hands-on Projects First</option>
                  <option value="course">🎥 Interactive Video Courses</option>
                  <option value="article">📖 In-depth Documentation</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-full shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Daily Email Reminders & Streak Notifications */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <CardHeader className="py-4 px-6 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-100/50 dark:border-orange-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Daily Study Reminders & Streak Engine
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Automated email briefings with your active streak and next milestone item.
                </CardDescription>
              </div>
            </div>

            {/* Streak Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-full border border-amber-200 dark:border-amber-800">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakCount} Day Streak ({longestStreak} Max)</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-[#F8F9FD] dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700">
            <div className="space-y-0.5">
              <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#5051F9]" />
                <span>Enable Daily Email Briefings</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive a daily nudge with your next curriculum module so you never break your streak.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDailyReminderEnabled(!dailyReminderEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                dailyReminderEnabled ? 'bg-[#5051F9]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  dailyReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time & Recipient Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preferred Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Preferred Dispatch Time</span>
              </label>
              <select
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                disabled={!dailyReminderEnabled}
                className="w-full bg-[#F8F9FD] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <option value="07:00">🌅 07:00 AM (Early Bird)</option>
                <option value="09:00">☕ 09:00 AM (Morning Routine)</option>
                <option value="12:00">🥪 12:00 PM (Mid-day Review)</option>
                <option value="18:00">🌇 06:00 PM (Post-Work/School)</option>
                <option value="20:00">🌙 08:00 PM (Evening Deep Work)</option>
                <option value="22:00">🌌 10:00 PM (Night Owl Session)</option>
              </select>
            </div>

            {/* Notification Email Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#5051F9]" />
                <span>Notification Email</span>
              </label>
              <input
                type="email"
                placeholder={user?.email || "e.g., student@example.com"}
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled={!dailyReminderEnabled}
                className="w-full bg-[#F8F9FD] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 disabled:opacity-50"
              />
            </div>

          </div>

          {/* Test Dispatch Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Want to see what your email briefing looks like? Send a preview test right now.
            </p>

            <div className="flex items-center gap-2">
              {testEmailStatus && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  ✓ {testEmailStatus}
                </span>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleSendTestEmail}
                disabled={testEmailLoading}
                className="text-xs font-extrabold rounded-full border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-[#5051F9] cursor-pointer shadow-2xs"
              >
                <Send className="w-3 h-3 mr-1.5 text-[#5051F9]" />
                <span>{testEmailLoading ? 'Dispatching...' : '⚡ Send Test Email Now'}</span>
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Data Ownership & Export */}
      <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl">
        <CardHeader className="py-4 px-6">
          <CardTitle className="text-sm font-extrabold text-slate-900">Data Privacy & Portability</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Download your profile information, academic records, and generated roadmaps in JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-3">
          <p className="text-xs text-slate-600">
            You own 100% of your career and academic data. Export everything anytime with one click.
          </p>
          <Button 
            variant="outline" 
            onClick={handleExportData} 
            disabled={exportLoading}
            className="text-xs font-bold rounded-full border-slate-200"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>{exportLoading ? 'Preparing JSON...' : 'Export My Learning Data (.JSON)'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="border border-red-100 shadow-sm bg-red-50/40 rounded-3xl">
        <CardHeader className="py-4 px-6">
          <CardTitle className="text-sm font-extrabold text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-xs text-red-700">
            Permanently delete your account, learner profile, roadmaps, and chat history.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-3">
          {!deleteConfirm ? (
            <Button 
              variant="destructive" 
              onClick={() => setDeleteConfirm(true)}
              className="text-xs font-bold rounded-full bg-red-600 hover:bg-red-700 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Delete My Account</span>
            </Button>
          ) : (
            <div className="space-y-2 p-4 bg-white border border-red-200 rounded-2xl shadow-xs">
              <p className="text-xs font-bold text-red-900">
                Are you sure you want to delete your account? This action is irreversible.
              </p>
              <div className="flex gap-2 pt-1">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="text-xs font-bold rounded-full bg-red-600 hover:bg-red-700"
                >
                  Yes, Permanently Delete All Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs font-bold rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
