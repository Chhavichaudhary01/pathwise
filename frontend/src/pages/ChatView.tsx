import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full flex-1 flex flex-col space-y-4">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
            &larr; Back to Dashboard
          </Button>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>AI Career Coach (Grounded in Your Roadmap)</span>
          </div>
        </div>

        {/* Chat Card */}
        <Card className="flex-1 flex flex-col border shadow-sm bg-white overflow-hidden min-h-[500px]">
          <CardHeader className="bg-slate-900 text-white py-4 px-6">
            <CardTitle className="text-lg text-white">PathWise AI Assistant</CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Ask free-form questions, get clarification on difficult concepts, or ask for role advice.
            </CardDescription>
          </CardHeader>

          {/* Messages scroll area */}
          <CardContent className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-h-[500px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                    ✨
                  </div>
                )}
                
                <div
                  className={`p-4 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-900 rounded-tl-none border'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                  ✨
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 rounded-tl-none border text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-200"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </CardContent>

          {/* Quick Suggestions & Input Bar */}
          <div className="p-4 border-t bg-slate-50 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CHAT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="text-xs bg-white hover:bg-blue-50 text-slate-700 border px-2.5 py-1 rounded-full transition-colors truncate max-w-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask anything about your learning path..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 text-base bg-white"
              />
              <Button type="submit" disabled={!input.trim() || loading} className="px-6">
                Send
              </Button>
            </form>
          </div>

        </Card>
      </div>
    </div>
  );
}
