import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    api.get('/roadmaps').then(res => setRoadmaps(res.data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
          <Button variant="outline" onClick={handleLogout}>Log Out</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Roadmaps</CardTitle>
          </CardHeader>
          <CardContent>
            {roadmaps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">You haven't generated a roadmap yet.</p>
                <Button onClick={() => navigate('/onboarding')}>Create Your First Roadmap</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmaps.map(roadmap => (
                  <div key={roadmap.id} className="p-4 border rounded flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-bold">{roadmap.title}</h3>
                      <p className="text-sm text-slate-500">Status: {roadmap.status}</p>
                    </div>
                    <Button onClick={() => navigate(`/roadmap/${roadmap.id}`)}>View</Button>
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
