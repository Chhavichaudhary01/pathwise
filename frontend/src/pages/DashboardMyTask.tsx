import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  Clock,
  CheckCircle2,
  Hourglass,
  ChevronDown,
  MoreHorizontal,
  Paperclip,
  MessageCircle,
  Calendar as CalendarIcon,
  Edit2,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface TaskProject {
  id: string;
  name: string;
  commentsCount: number;
  attachmentsCount: number;
  assignee: {
    name: string;
    avatar: string;
  };
  status: 'In Progress' | 'Pending' | 'Completed';
}

interface ScheduleEvent {
  id: string;
  title: string;
  timeRange: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
  avatars: string[];
}

interface NoteItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function DashboardMyTask() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const displayName = profile?.goal 
    ? (user?.email?.split('@')[0] || 'John')
    : 'John';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const [projects] = useState<TaskProject[]>([
    {
      id: '1',
      name: 'Help DStudio get more customers',
      commentsCount: 7,
      attachmentsCount: 2,
      assignee: {
        name: 'Phoenix Withers',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      status: 'In Progress'
    },
    {
      id: '2',
      name: 'Plan a trip',
      commentsCount: 10,
      attachmentsCount: 3,
      assignee: {
        name: 'Cohen Merrill',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      status: 'Pending'
    },
    {
      id: '3',
      name: 'Return a package',
      commentsCount: 5,
      attachmentsCount: 8,
      assignee: {
        name: 'Lukas Juarez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
      },
      status: 'Completed'
    }
  ]);

  const [scheduleEvents] = useState<ScheduleEvent[]>([
    {
      id: 'e1',
      title: 'Kickoff Meeting',
      timeRange: '01:00 PM to 02:30 PM',
      color: 'green',
      avatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'e2',
      title: 'Create Wordpress website for event registration',
      timeRange: '04:00 PM to 05:00 PM',
      color: 'blue',
      avatars: [
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'e3',
      title: 'Create User flow for hotel booking',
      timeRange: '02:00 PM to 03:30 PM',
      color: 'orange',
      avatars: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
      ]
    }
  ]);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      title: 'Landing Page For Website',
      description: 'To get started on a landing page, could you provide a bit more detail about its purpose?',
      completed: false
    },
    {
      id: 'n2',
      title: 'Fixing icons with dark backgrounds',
      description: 'Use icons that are easily recognizable and simplified to work. Avoid overly complex designs that might confuse users.',
      completed: false
    },
    {
      id: 'n3',
      title: 'Discussion regarding workflow or placement',
      description: 'What is the main goal of the landing page? (e.g., lead generation, product)',
      completed: true
    }
  ]);

  const toggleNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  };

  const getStatusBadge = (status: TaskProject['status']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f8ee] text-[#16a34a]">
            In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f4e8ff] text-[#9333ea]">
            Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0284c7]">
            Completed
          </span>
        );
    }
  };

  const getEventAccentBorder = (color: ScheduleEvent['color']) => {
    switch (color) {
      case 'green':
        return 'border-l-4 border-emerald-500 bg-emerald-50/30';
      case 'blue':
        return 'border-l-4 border-blue-500 bg-blue-50/30';
      case 'orange':
        return 'border-l-4 border-amber-500 bg-amber-50/30';
      case 'purple':
        return 'border-l-4 border-purple-500 bg-purple-50/30';
    }
  };

  const calendarDays = [
    { day: 'Mo', date: '15', active: false },
    { day: 'Tu', date: '16', active: false },
    { day: 'We', date: '17', active: true },
    { day: 'Th', date: '18', active: false },
    { day: 'Fr', date: '19', active: false },
    { day: 'Sa', date: '20', active: false },
    { day: 'Su', date: '14', active: false }
  ];

  return (
    <div className="space-y-6 w-full">
      
      {/* GREETING HEADER ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Thursday, 20th February</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {getGreeting()} {displayName},
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/portfolio')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          <button 
            onClick={() => navigate('/roadmap')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP (Pill-style single row) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-white border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xs text-xs font-semibold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span><strong className="text-slate-900">12hrs</strong> Time Saved</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xs text-xs font-semibold text-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span><strong className="text-slate-900">24</strong> Projects Completed</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xs text-xs font-semibold text-slate-700">
          <Hourglass className="w-3.5 h-3.5 text-amber-500" />
          <span><strong className="text-slate-900">7</strong> Projects In-progress</span>
        </div>
      </div>

      {/* "MY PROJECTS" CARD (Table / List) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>My Projects</span>
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 font-medium flex items-center gap-1 cursor-pointer">
              <span>This Week</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <button 
            onClick={() => navigate('/roadmap')}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            See All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="pb-3 pl-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Edit2 className="w-3 h-3" />
                    <span>Task Name</span>
                  </div>
                </th>
                <th className="pb-3 font-medium">Assign</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {projects.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pl-1">
                    <div className="space-y-1">
                      <span className="text-slate-800 font-semibold">{task.name}</span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {task.commentsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {task.attachmentsCount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-slate-700">{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    {getStatusBadge(task.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* BOTTOM TWO-COLUMN ROW (Schedule & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SCHEDULE CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>Schedule</span>
            </h2>
            <button className="text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 7-Day Mini Calendar Strip */}
          <div className="flex items-center justify-between bg-slate-50/60 rounded-xl p-2 border border-slate-100">
            {calendarDays.map((item, idx) => (
              <div
                key={idx}
                className={`
                  flex flex-col items-center justify-center w-9 h-12 rounded-xl transition-all cursor-pointer text-xs
                  ${item.active 
                    ? 'bg-[#c084fc] text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:bg-white'}
                `}
              >
                <span className="text-[10px] font-medium opacity-80">{item.day}</span>
                <span className="text-xs font-bold mt-0.5">{item.date}</span>
              </div>
            ))}
          </div>

          {/* Time-blocked Events List */}
          <div className="space-y-2.5 pt-1">
            {scheduleEvents.map((evt) => (
              <div
                key={evt.id}
                className={`
                  ${getEventAccentBorder(evt.color)}
                  p-3 rounded-r-xl flex items-center justify-between transition-all hover:translate-x-0.5
                `}
              >
                <div className="space-y-0.5 pr-2">
                  <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{evt.timeRange}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {evt.avatars.map((av, avIdx) => (
                      <img
                        key={avIdx}
                        src={av}
                        alt="Attendee"
                        className="inline-block w-5 h-5 rounded-full ring-1 ring-white object-cover"
                      />
                    ))}
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* NOTES CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Notes</h2>
          </div>

          {/* Notes List */}
          <div className="space-y-3.5">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => toggleNote(note.id)}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Checkbox / Radio Circle */}
                <div className="pt-0.5">
                  <div 
                    className={`
                      w-4 h-4 rounded-full flex items-center justify-center transition-all border
                      ${note.completed 
                        ? 'bg-[#c084fc] border-[#c084fc] text-white shadow-2xs' 
                        : 'border-slate-300 group-hover:border-purple-400'}
                    `}
                  >
                    {note.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <h4 className={`text-xs font-bold ${note.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {note.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
