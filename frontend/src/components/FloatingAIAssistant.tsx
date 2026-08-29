import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Zap, 
  CheckCircle2,
  LayoutDashboard,
  Map,
  Award,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dock } from '@/components/ui/dock';
import { DockIcon } from '@/components/ui/dock-icon';
import api from '@/lib/api';

function renderClickableText(content: string, isUser: boolean) {
  if (!content) return null;
  if (isUser) return <p className="whitespace-pre-line leading-relaxed">{content}</p>;

  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<)]+)|`([^`]+)`|\*\*([^*]+)\*\*)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        elements.push(line.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        elements.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5"
          >
            <span>{match[2]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      } else if (match[4]) {
        elements.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={match[4]}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5 break-all"
          >
            <span>{match[4]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      } else if (match[5]) {
        elements.push(
          <code
            key={`${lineIdx}-${match.index}`}
            className="bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-[10px] border border-indigo-500/30"
          >
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        elements.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-white">
            {match[6]}
          </strong>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(line.substring(lastIndex));
    }

    return (
      <p key={lineIdx} className="my-1 leading-relaxed text-left text-slate-200">
        {elements.length > 0 ? elements : '\u00A0'}
      </p>
    );
  });
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  actionCard?: {
    actionType: 'MARK_DONE' | 'RECALIBRATE';
    description: string;
  };
}

const PROMPT_SUGGESTION_CHIPS = [
  { text: '🎯 Audit my React roadmap', icon: '🎯' },
  { text: '📄 Tailor resume for Senior SWE', icon: '📄' },
  { text: '⚡ Generate Quiz for current phase', icon: '⚡' },
  { text: '📺 Find verified YouTube masterclasses', icon: '📺' },
  { text: '🕸️ Explain prerequisite DAG sequencing', icon: '🕸️' },
];

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your docked AI Career Coach. Ask me to audit your prerequisite DAG, generate a phase quiz, recommend video masterclasses, or tailor your resume."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionApplied, setActionApplied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: text });
      const reply = res.data?.reply || "I've analyzed your progress! Let me know if you'd like to dive into specific exercises.";
      
      let actionCard = undefined;
      const lower = text.toLowerCase();
      if (lower.includes('mark') && (lower.includes('done') || lower.includes('complete'))) {
        actionCard = {
          actionType: 'MARK_DONE' as const,
          description: 'Mark current milestone as completed & advance learning streak'
        };
      } else if (lower.includes('recalibrate') || lower.includes('adjust pace') || lower.includes('regenerate')) {
        actionCard = {
          actionType: 'RECALIBRATE' as const,
          description: 'Rebalance roadmap DAG based on your weekly study velocity'
        };
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply, actionCard }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "⚠️ I couldn't reach the AI engine. Please verify the backend status or try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async (desc: string) => {
    setActionApplied(desc);
    setTimeout(() => setActionApplied(null), 4000);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `✓ Action completed: **${desc}**. Your learning DAG is updated.` }
    ]);
  };

  // Dock items configuration
  const dockItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
      onClick: () => navigate('/dashboard'),
      isActive: location.pathname === '/dashboard',
    },
    {
      title: 'Roadmap DAG',
      icon: <Map className="w-5 h-5" />,
      path: '/roadmap',
      onClick: () => navigate('/roadmap'),
      isActive: location.pathname.startsWith('/roadmap'),
    },
    {
      title: 'Resume Scanner',
      icon: <FileText className="w-5 h-5" />,
      path: '/resume-analyzer',
      onClick: () => navigate('/resume-analyzer'),
      isActive: location.pathname === '/resume-analyzer',
    },
    {
      title: 'Skill Badges',
      icon: <Award className="w-5 h-5" />,
      path: '/portfolio',
      onClick: () => navigate('/portfolio'),
      isActive: location.pathname === '/portfolio' || location.pathname === '/badges',
    },
  ];

  return (
    <>
      {/* 21st.dev Floating Navigation Dock (Centered at Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
        <Dock
          iconSize={44}
          iconMagnification={66}
          iconDistance={140}
          className="border-slate-800/90 bg-slate-950/85 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl px-3.5 py-2"
        >
          {dockItems.map((item, idx) => (
            <div key={idx} className="relative group flex items-center justify-center">
              <DockIcon
                onClick={item.onClick}
                className={`${
                  item.isActive
                    ? 'bg-[#5051F9]/25 text-[#5051F9] border-[#5051F9]/50 shadow-[0_0_16px_rgba(80,81,249,0.4)]'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
              </DockIcon>

              {/* Hover Tooltip */}
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap shadow-md z-30">
                {item.title}
              </span>
            </div>
          ))}

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-800 mx-1" />

          {/* AI Assistant Chat Trigger Dock Icon */}
          <div className="relative group flex items-center justify-center">
            <DockIcon
              onClick={() => setIsOpen(!isOpen)}
              className={`relative bg-gradient-to-r from-[#5051F9] via-[#6366F1] to-[#06B6D4] text-white border-white/20 shadow-[0_0_20px_rgba(79,70,229,0.45)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] ${
                isOpen ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </DockIcon>

            {/* Hover Tooltip */}
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-cyan-300 opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap shadow-md z-30">
              {isOpen ? 'Close AI Coach' : 'AI Career Coach'}
            </span>
          </div>
        </Dock>
      </div>

      {/* Floating AI Assistant Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] rounded-3xl bg-slate-950/95 border border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border-b border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5051F9] to-[#06B6D4] flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>PathWise AI Coach</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-400">Grounded in Google Gemini 1.5 Flash</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action applied banner */}
            {actionApplied && (
              <div className="bg-emerald-600/90 text-white text-[11px] px-3 py-1.5 font-bold flex items-center gap-1.5 border-b border-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Action Applied: {actionApplied}</span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#5051F9] to-[#6366F1] text-white rounded-tr-none shadow-sm'
                          : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800 shadow-sm'
                      }`}
                    >
                      {renderClickableText(msg.content, msg.role === 'user')}
                    </div>
                  </div>

                  {/* Inline Action Confirmation Card */}
                  {msg.actionCard && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2 text-white shadow-sm">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-indigo-400">
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Proposed AI Autonomous Action</span>
                      </div>
                      <p className="text-xs text-slate-300">{msg.actionCard.description}</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => confirmAction(msg.actionCard!.description)}
                          className="text-[11px] h-7 px-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl"
                        >
                          Confirm & Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {}}
                          className="text-[11px] h-7 px-2 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-900/90 rounded-2xl rounded-tl-none border border-slate-800 text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="text-[11px] font-mono">Synthesizing personalized response...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Prompt Suggestion Chips Container */}
            <div className="p-3 border-t border-slate-800/90 bg-slate-950/90 space-y-2.5">
              
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {PROMPT_SUGGESTION_CHIPS.map((chip, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSend(chip.text)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[10px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Glow-Bordered Prompt Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    placeholder="Ask AI Coach (e.g. explain React DAGs)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl focus:ring-2 focus:ring-[#5051F9]/50 focus:border-[#5051F9] transition-all"
                  />
                </div>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || loading}
                  className="h-10 px-3.5 bg-[#5051F9] hover:bg-indigo-600 text-white rounded-xl cursor-pointer shadow-sm disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
