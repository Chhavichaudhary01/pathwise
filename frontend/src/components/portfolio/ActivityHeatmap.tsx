import React, { useState } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
  hours: number;
}

interface ActivityHeatmapProps {
  days: HeatmapDay[];
  currentStreak?: number;
  longestStreak?: number;
  totalDaysActive?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  days = [],
  currentStreak = 14,
  longestStreak = 24,
  totalDaysActive = 112,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group days into 52 columns (weeks) of 7 days
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const levelStyles = [
    'bg-slate-900/60 border border-slate-800/60', // Level 0
    'bg-emerald-950 border border-emerald-800/80', // Level 1
    'bg-emerald-800 border border-emerald-600/80', // Level 2
    'bg-emerald-500 border border-emerald-400', // Level 3
    'bg-emerald-400 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]', // Level 4
  ];

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-6 text-white shadow-xl relative overflow-hidden">
      
      {/* Top Header & Streak Metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Activity Matrix
            </span>
            <span className="text-[10px] text-slate-400 font-bold">• 365 Days Verified</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            Continuous Learning & Study Activity
          </h3>
        </div>

        {/* Streak Badges Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-black">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span>{longestStreak} Day Best</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{totalDaysActive} Days Active</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="space-y-2 overflow-x-auto custom-scrollbar pb-2">
        
        {/* Month Headers */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono pl-7 min-w-[720px] max-w-full">
          {monthLabels.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* 7 Rows x 52 Columns Matrix */}
        <div className="flex gap-1 min-w-[720px] max-w-full">
          
          {/* Day of Week Labels */}
          <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2 py-0.5 select-none shrink-0">
            {dayLabels.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Weeks Columns */}
          <div className="flex flex-1 justify-between gap-[3px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-[11px] h-[11px] rounded-[3px] transition-transform hover:scale-150 cursor-pointer ${
                      levelStyles[Math.min(4, Math.max(0, day.level))]
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Bottom Footer: Tooltip Preview & Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-850 text-xs text-slate-400">
        
        {/* Live Hover Info */}
        <div className="font-mono text-[11px] min-h-[20px] flex items-center gap-2">
          {hoveredDay ? (
            <span className="text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong>{new Date(hoveredDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}:</strong>{' '}
              <span className="text-emerald-300">{hoveredDay.count} sessions ({hoveredDay.hours} hrs)</span>
            </span>
          ) : (
            <span className="text-slate-500">Hover over any square to view daily verified study activity</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <span>Less</span>
          {levelStyles.map((style, idx) => (
            <span key={idx} className={`w-2.5 h-2.5 rounded-[2px] ${style}`} />
          ))}
          <span>More</span>
        </div>

      </div>

    </div>
  );
};

export default ActivityHeatmap;
