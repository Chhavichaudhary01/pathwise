import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function Onboarding() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await api.post('/profile', { goal });
      const res = await api.post('/roadmaps/generate');
      navigate(`/roadmap/${res.data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Let's plan your journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Tell our AI what you want to achieve, what skills you already have, and how much time you can dedicate.
          </p>
          <Textarea 
            placeholder="I want to become a frontend developer..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="min-h-[150px]"
          />
          <Button onClick={handleGenerate} disabled={!goal || loading} className="w-full">
            {loading ? 'Generating Roadmap...' : 'Generate Roadmap'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
