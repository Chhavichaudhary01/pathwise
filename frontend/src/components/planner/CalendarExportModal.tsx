import React, { useState } from 'react';
import { 
  X, Download, ExternalLink, Clock, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapTitle?: string;
  weeklyHours?: number;
  graduationDate?: string;
  quickAddUrl?: string;
  studyBlocks?: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    googleCalendarUrl: string;
  }>;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  roadmapTitle = 'Career Learning Path',
  weeklyHours = 10,
  graduationDate,
  quickAddUrl,
  studyBlocks = [],
}) => {
  const [downloadingIcs, setDownloadingIcs] = useState(false);

  if (!isOpen) return null;

  const handleDownloadIcs = async () => {
    try {
      setDownloadingIcs(true);
      const res = await api.get('/schedule/export-ics', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pathwise-learning-schedule.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('ICS download failed:', err);
    } finally {
      setDownloadingIcs(false);
    }
  };

  const handleOpenGoogleCal = () => {
    if (quickAddUrl) {
      window.open(quickAddUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://calendar.google.com', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Gradient Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Calendar Sync Engine
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-0.5">
                Export Schedule to Personal Calendar
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 text-slate-200 overflow-y-auto max-h-[75vh] custom-scrollbar">
          
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Track Title:</span>
              <strong className="text-white">{roadmapTitle}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Target Commitment:</span>
              <strong className="text-indigo-300">{weeklyHours} Hours / Week</strong>
            </div>
            {graduationDate && (
              <div className="flex justify-between items-center text-slate-400">
                <span>Estimated Target Completion:</span>
                <strong className="text-emerald-400">{new Date(graduationDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            )}
          </div>

          {/* Sync Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Option 1: Google Calendar Direct Web Intent */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 flex flex-col justify-between hover:border-indigo-400 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                  <span>🌐 Google Calendar</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  One-click browser redirect to schedule study sprint blocks and milestone reminders directly into Google Calendar.
                </p>
              </div>

              <Button
                onClick={handleOpenGoogleCal}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Add to Google Cal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Option 2: Apple Calendar / Outlook .ics File */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs">
                  <span>📱 Apple / Outlook iCal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Standard RFC 5545 `.ics` file with all milestone deadlines and 15-min recurring alarm reminders.
                </p>
              </div>

              <Button
                onClick={handleDownloadIcs}
                disabled={downloadingIcs}
                variant="outline"
                className="w-full border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-300" />
                <span>{downloadingIcs ? 'Generating...' : 'Download .ics File'}</span>
              </Button>
            </div>

          </div>

          {/* Upcoming Pre-Scheduled Study Sessions */}
          {studyBlocks.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next Scheduled Study Blocks</span>
              </h4>

              <div className="space-y-2">
                {studyBlocks.slice(0, 3).map((block) => (
                  <div
                    key={block.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-white text-[11px]">{block.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(block.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {block.startTime} - {block.endTime}
                      </p>
                    </div>

                    <a
                      href={block.googleCalendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>+ Google Cal</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Bell className="w-3 h-3 text-amber-400" />
            <span>Includes 15-min notification alarms</span>
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CalendarExportModal;
