import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoadmapView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</Button>
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-8">
              We've analyzed your goal and generated the optimal path forward. Follow these milestones to achieve your target.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
