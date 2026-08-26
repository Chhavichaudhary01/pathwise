import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Flame,
  UserPlus,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface CourseProgress {
  id: string;
  category: 'UI/UX Design' | 'Branding' | 'Front End';
  watched: string;
  color: string;
  iconBg: string;
  iconColor: string;
}

interface CourseCard {
  id: string;
  title: string;
  category: 'FRONT END' | 'UI/UX DESIGN' | 'BRANDING';
  thumbnail: string;
  mentor: {
    name: string;
    role: string;
    avatar: string;
  };
  isFavorite: boolean;
}

interface LessonRow {
  id: string;
  mentor: {
    name: string;
    date: string;
    avatar: string;
  };
  type: 'UI/UX DESIGN' | 'FRONT END' | 'BRANDING';
  desc: string;
}

interface MentorItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isFollowed: boolean;
}

export default function DashboardCoursue() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const userName = user?.email?.split('@')[0] || 'Jason Ranti';

  // 1. Quick Category Trackers
  const [progressCards] = useState<CourseProgress[]>([
    {
      id: 'p1',
      category: 'UI/UX Design',
      watched: '2/8 watched',
      color: '#7C3AED',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED'
    },
    {
      id: 'p2',
      category: 'Branding',
      watched: '3/8 watched',
      color: '#DB2777',
      iconBg: '#FCE7F3',
      iconColor: '#DB2777'
    },
    {
      id: 'p3',
      category: 'Front End',
      watched: '6/12 watched',
      color: '#0284C7',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7'
    }
  ]);

  // 2. Continue Watching Course Cards
  const [courses, setCourses] = useState<CourseCard[]>([
    {
      id: 'c1',
      title: "Beginner's Guide to Becoming a Professional Front-End Developer",
      category: 'FRONT END',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      mentor: {
        name: 'Leonardo samsul',
        role: 'Mentor',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      },
      isFavorite: false
    },
    {
      id: 'c2',
      title: 'Optimizing User Experience with the Best UI/UX Design',
      category: 'UI/UX DESIGN',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
      mentor: {
        name: 'Bayu Salto',
        role: 'Mentor',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80'
      },
      isFavorite: true
    },
    {
      id: 'c3',
      title: 'Reviving and Refreshing Company Image',
      category: 'BRANDING',
      thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
      mentor: {
        name: 'Padhang Satrio',
        role: 'Mentor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      isFavorite: false
    }
  ]);

  // 3. Lessons Table
  const [lessons] = useState<LessonRow[]>([
    {
      id: 'l1',
      mentor: {
        name: 'Padhang Satrio',
        date: '2/16/2004',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      type: 'UI/UX DESIGN',
      desc: 'Understand Of UI/UX Design'
    }
  ]);

  // 4. Mentors
  const [mentors, setMentors] = useState<MentorItem[]>([
    {
      id: 'm1',
      name: 'Padhang Satrio',
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isFollowed: false
    },
    {
      id: 'm2',
      name: 'Zakir Horizontal',
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      isFollowed: false
    },
    {
      id: 'm3',
      name: 'Leonardo Samsul',
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      isFollowed: false
    }
  ]);

  const toggleFavorite = (courseId: string) => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const toggleFollow = (mentorId: string) => {
    setMentors(prev =>
      prev.map(m => (m.id === mentorId ? { ...m, isFollowed: !m.isFollowed } : m))
    );
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'FRONT END':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'UI/UX DESIGN':
        return 'bg-[#EDE9FE] text-[#7C3AED]';
      case 'BRANDING':
        return 'bg-[#FCE7F3] text-[#DB2777]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      
      {/* CENTER MAIN CONTENT AREA */}
      <div className="flex-1 space-y-6 overflow-hidden min-w-0">
        
        {/* Hero Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 md:p-8 text-white shadow-md">
          <div className="absolute right-12 top-6 text-white/20 text-5xl select-none font-black pointer-events-none">
            ✦
          </div>
          <div className="absolute right-36 bottom-6 text-white/15 text-7xl select-none font-black pointer-events-none">
            ✦
          </div>

          <div className="relative z-10 max-w-md space-y-3">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white">
              ONLINE COURSE
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Sharpen Your Skills with Professional Online Courses
            </h2>
            <div className="pt-2">
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-2.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <span>Join Now</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Progress Cards (3-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progressCards.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between hover:border-purple-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ backgroundColor: p.iconBg, color: p.iconColor }}
                >
                  ✦
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">{p.watched}</p>
                  <h4 className="text-xs font-extrabold text-slate-900">{p.category}</h4>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* "Continue Watching" Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Continue Watching</h3>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-full bg-[#5051F9] text-white flex items-center justify-center shadow-xs hover:bg-indigo-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-3">
                  <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(course.id)}
                      className={`
                        absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110
                        ${course.isFavorite ? 'text-red-500' : 'text-white'}
                      `}
                    >
                      <Heart className={`w-3.5 h-3.5 ${course.isFavorite ? 'fill-red-500' : ''}`} />
                    </button>
                  </div>

                  <div className="pt-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider ${getCategoryBadgeStyle(course.category)}`}>
                      {course.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h4>
                </div>

                <div className="px-3 pb-3 pt-2 border-t border-slate-50 flex items-center gap-2">
                  <img
                    src={course.mentor.avatar}
                    alt={course.mentor.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 leading-none">
                      {course.mentor.name}
                    </h5>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {course.mentor.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "Your Lesson" Data Table */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Your Lesson</h3>
            <button 
              onClick={() => navigate('/roadmap')}
              className="text-xs font-bold text-[#5051F9] hover:underline"
            >
              See all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2 pl-1 font-semibold">Mentor</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Desc</th>
                  <th className="pb-2 text-right pr-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {lessons.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={l.mentor.avatar}
                          alt={l.mentor.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{l.mentor.name}</h5>
                          <span className="text-[10px] text-slate-400">{l.mentor.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider ${getCategoryBadgeStyle(l.type)}`}>
                        {l.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-700 font-semibold">
                      {l.desc}
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <button 
                        onClick={() => navigate('/roadmap')}
                        className="w-7 h-7 rounded-full border border-slate-200 hover:border-purple-500 hover:text-purple-600 inline-flex items-center justify-center text-slate-500 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT STATS & MENTOR PANEL (~320px) */}
      <div className="w-full lg:w-80 shrink-0 space-y-5">
        
        {/* User Statistic Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Statistic</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#5051F9]"
                  strokeWidth="7"
                  strokeDasharray="251.2"
                  strokeDashoffset="170.8"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="User 3D Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute top-1 right-2 bg-[#5051F9] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                32%
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
              <span>Good Morning {userName.split(' ')[0]}</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Continue your learning to achieve your target!
            </p>
          </div>

          <div className="pt-3 border-t border-slate-50 space-y-2">
            <div className="flex items-end justify-between h-28 px-4 pt-4 bg-slate-50/60 rounded-2xl">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 bg-[#C7D2FE] rounded-t-lg h-10"></div>
                <span className="text-[9px] font-bold text-slate-400">1-10 Aug</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 bg-[#818CF8] rounded-t-lg h-16"></div>
                <span className="text-[9px] font-bold text-slate-400">11-20 Aug</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 bg-[#5051F9] rounded-t-lg h-24 shadow-xs"></div>
                <span className="text-[9px] font-bold text-slate-600">21-30 Aug</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 bg-[#E0E7FF] rounded-t-lg h-8"></div>
                <span className="text-[9px] font-bold text-slate-400">...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Your mentor</h3>
            <button 
              onClick={() => navigate('/chat')}
              className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mentors.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{m.name}</h5>
                    <span className="text-[10px] text-slate-400 font-medium">{m.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(m.id)}
                  className={`
                    px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1
                    ${m.isFollowed 
                      ? 'bg-[#5051F9] text-white' 
                      : 'bg-[#F4F6FB] text-[#5051F9] hover:bg-purple-100/70'}
                  `}
                >
                  {m.isFollowed ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>+ Follow</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/portfolio')}
            className="w-full py-2.5 bg-[#F4F6FB] hover:bg-indigo-50 text-[#5051F9] text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer shadow-2xs"
          >
            See All
          </button>
        </div>

      </div>

    </div>
  );
}
