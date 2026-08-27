import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
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
            className="text-blue-600 dark:text-blue-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5"
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
            className="text-blue-600 dark:text-blue-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5 break-all"
          >
            <span>{match[4]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      } else if (match[5]) {
        elements.push(
          <code
            key={`${lineIdx}-${match.index}`}
            className="bg-slate-200/70 dark:bg-slate-700/70 text-indigo-600 px-1 py-0.5 rounded font-mono text-[10px]"
          >
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        elements.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold">
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
      <p key={lineIdx} className="my-0.5 leading-relaxed text-left">
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

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your docked AI Career Coach. Need quick clarification on a concept or advice on your next milestone?"
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
      
      // Check if user is asking to mark milestone done or recalibrate
      const lower = text.toLowerCase();
      let actionCard = undefined;
      if (lower.includes('mark') && (lower.includes('done') || lower.includes('complete'))) {
        actionCard = {
          actionType: 'MARK_DONE' as const,
          description: 'Mark upcoming prerequisite milestone as COMPLETED in your roadmap.'
        };
      } else if (lower.includes('swap') || lower.includes('recalibrate') || lower.includes('too hard')) {
        actionCard = {
          actionType: 'RECALIBRATE' as const,
          description: 'Recalibrate roadmap pacing to reinforce foundational concepts.'
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.content,
          actionCard
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      let errMsg = err.response?.data?.message;
      if (!errMsg) {
        if (err.response?.status === 401) {
          errMsg = 'Your session has expired. Please log out and sign in again to refresh your session.';
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          errMsg = 'AI Coach took a bit longer to respond. Please try sending your message once more.';
        } else {
          errMsg = 'Unable to connect to AI Coach. Please ensure your backend is running on port 4444 and you are signed in.';
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errMsg
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (actionDesc: string) => {
    setActionApplied(actionDesc);
    setTimeout(() => setActionApplied(null), 4000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110 focus:ring-4 focus:ring-blue-300"
        title="Open AI Career Coach"
        aria-label="Open AI Career Coach"
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* Docked Drawer / Side Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <div>
                <h3 className="font-bold text-sm text-white">AI Career Coach</h3>
                <p className="text-[11px] text-slate-300">Docked & Grounded in Roadmap</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-sm">
              ✕
            </button>
          </div>

          {/* Action applied banner */}
          {actionApplied && (
            <div className="bg-green-600 text-white text-xs px-3 py-2 font-medium flex items-center justify-between">
              <span>✓ Action Applied: {actionApplied}</span>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {renderClickableText(msg.content, msg.role === 'user')}
                  </div>
                </div>

                {/* Inline Action Confirmation Card */}
                {msg.actionCard && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 text-slate-900">
                    <span className="font-bold text-[11px] text-blue-900 uppercase">⚡ Proposed AI Action</span>
                    <p className="text-xs text-slate-700">{msg.actionCard.description}</p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => confirmAction(msg.actionCard!.description)}
                        className="text-xs h-7 px-3 bg-blue-600 hover:bg-blue-700 font-bold"
                      >
                        Confirm & Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {}}
                        className="text-xs h-7 px-2"
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
                <div className="p-3 bg-slate-100 rounded-xl rounded-tl-none text-slate-600 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-200"></div>
                  <span>Reasoning...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick suggestions & Input */}
          <div className="p-3 border-t bg-slate-50 space-y-2">
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {['Explain next milestone', 'Recommend project', 'Mark current item done'].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="bg-white border text-slate-700 hover:bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-1.5"
            >
              <Input
                placeholder="Ask your coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="text-xs bg-white h-9"
              />
              <Button type="submit" size="sm" disabled={!input.trim() || loading} className="h-9 px-3">
                Send
              </Button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
