import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function SettingsView() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [saved, setSaved] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then((res) => {
        if (res.data) {
          if (res.data.weeklyHours) setWeeklyHours(res.data.weeklyHours);
          if (res.data.learningStyle) setLearningStyle(res.data.learningStyle);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/profile', { weeklyHours, learningStyle });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation */}
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
          &larr; Back to Dashboard
        </Button>

        <h1 className="text-3xl font-extrabold text-slate-900">Account & Learning Settings</h1>

        {/* Learning Preferences */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Learning Pacing & Constraints</CardTitle>
            <CardDescription className="text-xs">
              PathWise uses your weekly hours as a hard constraint to calculate realistic milestone deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Weekly Time Availability (Hours/Week)</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                  className="max-w-xs"
                />
                <p className="text-xs text-slate-500">
                  Used by the pacing recalibration engine to balance your study schedule.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Preferred Learning Format</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full max-w-xs p-2 border rounded-md bg-white text-sm"
                >
                  <option value="hands-on">Hands-on Projects First</option>
                  <option value="video">Interactive Video & Visual Courses</option>
                  <option value="documentation">Documentation & In-depth Articles</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit">Save Preferences</Button>
                {saved && <span className="text-sm text-green-600 font-semibold">✓ Preferences updated!</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Data Ownership & Export */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Data Privacy & Portability</CardTitle>
            <CardDescription className="text-xs">
              Download all your learning history, profile details, and generated roadmaps in standard JSON format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              You own 100% of your career data. Export everything anytime with one click.
            </p>
            <Button variant="outline" onClick={handleExportData} disabled={exportLoading}>
              {exportLoading ? 'Preparing JSON...' : '📥 Export My Learning Data (.JSON)'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone: 2-Click Account Deletion */}
        <Card className="border border-red-200 shadow-sm bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-red-900">Danger Zone</CardTitle>
            <CardDescription className="text-xs text-red-700">
              Permanently delete your account, learner profile, roadmaps, and chat history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!deleteConfirm ? (
              <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                Delete My Account
              </Button>
            ) : (
              <div className="space-y-2 p-4 bg-white border border-red-300 rounded-lg">
                <p className="text-sm font-bold text-red-900">
                  Are you sure you want to delete your account? This action is irreversible.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Yes, Permanently Delete All Data
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
