import { useEffect, useState, useRef } from 'react';
import { Sparkles, Send, Bot, User, Flame } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_PROMPTS = [
  "How should I prepare for my next milestone?",
  "What is the industry difference between Frontend and Full-Stack roles?",
  "Can you explain why React custom hooks are useful?",
  "How can I build a strong portfolio project to get hired?"
];

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your PathWise AI Career Coach. I'm grounded in your personalized roadmap, learning style, and skill gaps. How can I help you master your upcoming milestones today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/chat')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.content }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Based on your career roadmap, focusing on hands-on practical implementation and daily coding practice is the best way to accelerate your progress!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-5xl mx-auto">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400">Adaptive AI Mentorship</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Career Coach</span>
            <Sparkles className="w-5 h-5 text-[#5051F9]" />
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#5051F9] bg-[#EDE9FE] border border-purple-200 px-3.5 py-1.5 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#5051F9] animate-pulse"></span>
          <span>Grounded in Active Roadmap</span>
        </div>
      </div>

      {/* Main Chat Container Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
        
        {/* Card Header Strip */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white leading-tight">PathWise AI Assistant</h3>
              <p className="text-[10px] text-blue-100">Directly powered by Google Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>Interactive Coach</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#5051F9] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    ✦
                  </div>
                )}
                
                <div
                  className={`p-4 rounded-3xl max-w-[82%] text-xs md:text-sm font-medium leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#5051F9] text-white rounded-tr-xs'
                      : 'bg-[#F8F9FD] text-slate-800 rounded-tl-xs border border-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-[#5051F9] text-white flex items-center justify-center text-xs shrink-0">
                ✦
              </div>
              <div className="p-3.5 rounded-3xl bg-[#F8F9FD] text-slate-600 rounded-tl-xs border border-slate-100 text-xs flex items-center gap-2 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#5051F9] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#5051F9] animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-[#5051F9] animate-bounce delay-200"></div>
                <span className="font-bold text-slate-500">Synthesizing personalized advice...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Suggestions & Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-[#F8F9FD] space-y-3">
          
          {/* Suggestion Pills */}
          <div className="flex flex-wrap gap-2">
            {CHAT_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-[11px] font-semibold bg-white hover:bg-purple-50 text-slate-700 hover:text-[#5051F9] border border-slate-200/80 px-3 py-1 rounded-full transition-all shadow-2xs truncate max-w-xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your learning path, concepts, or interview prep..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white border border-slate-200/80 rounded-full px-5 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9] shadow-2xs transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-full flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
