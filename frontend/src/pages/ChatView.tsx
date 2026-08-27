import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, Send, User, Globe, ExternalLink, 
  Copy, Check, ArrowRight, BookOpen, Trash2
} from 'lucide-react';
import api from '@/lib/api';

interface SourceCitation {
  index: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  isSearchGrounded?: boolean;
  sources?: SourceCitation[];
  followUpQuestions?: string[];
  createdAt?: string;
}

const POPULAR_SEARCH_TOPICS = [
  "How do React 19 Actions and useActionState work?",
  "What is the difference between Monolith, Microservices, and Modular Monolith?",
  "How does PostgreSQL indexing with B-Tree and GIN work under the hood?",
  "How to build production RAG with Vector Embeddings and LangChain?"
];

function renderFormattedMessage(content: string, sources?: SourceCitation[], isUser: boolean = false) {
  if (!content) return null;
  if (isUser) return <p className="whitespace-pre-line leading-relaxed">{content}</p>;

  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    const isHeader = /^#{1,4}\s/.test(line);
    const cleanLine = isHeader ? line.replace(/^#{1,4}\s*/, '') : line;

    // Tokenize line by markdown links, raw urls, citations, code, and bold
    const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[(\d+)\]|(https?:\/\/[^\s<)]+)|`([^`]+)`|\*\*([^*]+)\*\*)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        elements.push(cleanLine.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        // Markdown link: [text](url)
        const linkText = match[2];
        const linkUrl = match[3];
        elements.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#5051F9] dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else if (match[4]) {
        // Citation: [1]
        const num = match[4];
        const src = sources?.find(s => s.index === num || s.index === `${parseInt(num)}`);
        const targetUrl = src?.url || (sources && sources[parseInt(num) - 1]?.url);

        if (targetUrl) {
          elements.push(
            <a
              key={`${lineIdx}-${match.index}`}
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              title={src?.title || `Citation [${num}]`}
              className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold text-[#5051F9] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-md mx-0.5 hover:scale-110 transition-transform cursor-pointer"
            >
              [{num}]
            </a>
          );
        } else {
          elements.push(
            <span
              key={`${lineIdx}-${match.index}`}
              className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold text-[#5051F9] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-md mx-0.5"
            >
              [{num}]
            </span>
          );
        }
      } else if (match[5]) {
        // Raw URL
        const rawUrl = match[5];
        elements.push(
          <a
            key={`${lineIdx}-${match.index}`}
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#5051F9] dark:text-indigo-400 font-bold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5 mx-0.5 break-all"
          >
            <span>{rawUrl}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else if (match[6]) {
        // Inline code: `code`
        elements.push(
          <code
            key={`${lineIdx}-${match.index}`}
            className="bg-slate-200/70 dark:bg-slate-700/70 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono text-[11px]"
          >
            {match[6]}
          </code>
        );
      } else if (match[7]) {
        // Bold: **text**
        elements.push(
          <strong key={`${lineIdx}-${match.index}`} className="font-bold text-slate-900 dark:text-slate-100">
            {match[7]}
          </strong>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < cleanLine.length) {
      elements.push(cleanLine.substring(lastIndex));
    }

    if (isHeader) {
      return (
        <h4 key={lineIdx} className="text-xs md:text-sm font-black text-slate-900 dark:text-slate-100 mt-2.5 mb-1 text-left">
          {elements}
        </h4>
      );
    }

    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5 text-left">
          <span className="text-[#5051F9] dark:text-indigo-400 font-bold">•</span>
          <div className="flex-1">{elements}</div>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="my-0.5 leading-relaxed text-left">
        {elements.length > 0 ? elements : '\u00A0'}
      </p>
    );
  });
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your PathWise AI Research & Career Engine. I synthesize real-time technical documentation, roadmaps, and verifiable engineering benchmarks with numbered citations.",
      isSearchGrounded: true,
      sources: [
        {
          index: "1",
          title: "Roadmap.sh Engineering Guides",
          url: "https://roadmap.sh",
          snippet: "Curated developer learning tracks & prerequisite trees",
          domain: "roadmap.sh"
        },
        {
          index: "2",
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org",
          snippet: "Official web platform standards, APIs, and reference",
          domain: "developer.mozilla.org"
        }
      ],
      followUpQuestions: [
        "What is the best roadmap to follow for my goal?",
        "How can I test out of upcoming prerequisites?",
        "Can you generate a code challenge for me?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchGrounded, setIsSearchGrounded] = useState(true);
  const [searchFocus, setSearchFocus] = useState<'ALL' | 'DOCS' | 'ROADMAP' | 'CODE'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    api.get('/chat')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: text,
      isSearchGrounded 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { 
        message: text,
        isSearchGrounded,
        searchFocus 
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Based on engineering standards and your roadmap, consistent hands-on execution and verifying proof-of-skill is the most reliable way to master this milestone.",
          followUpQuestions: [
            "Can you break down the prerequisite concepts?",
            "What projects should I build to practice this?"
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, msgIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`msg_${msgIdx}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = async () => {
    try {
      await api.delete('/chat');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-5xl mx-auto pb-10">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-[#5051F9] dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              Perplexity-Grounded Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 mt-1">
            <span>AI Knowledge & Career Search</span>
            <Sparkles className="w-5 h-5 text-[#5051F9]" />
          </h1>
        </div>

        {/* Search Mode & Clear Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Web Grounding Toggle */}
          <button
            onClick={() => setIsSearchGrounded(!isSearchGrounded)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              isSearchGrounded
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle Live Web & Docs Grounding"
          >
            <Globe className={`w-3.5 h-3.5 ${isSearchGrounded ? 'text-emerald-500 animate-spin-slow' : 'text-slate-400'}`} />
            <span>{isSearchGrounded ? '🌐 Web Grounded (Active)' : '⚡ Fast Mode'}</span>
            <span className={`w-2 h-2 rounded-full ${isSearchGrounded ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
          </button>

          {/* Focus Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-0.5 text-[11px] font-bold">
            {(['ALL', 'DOCS', 'ROADMAP', 'CODE'] as const).map((focus) => (
              <button
                key={focus}
                onClick={() => setSearchFocus(focus)}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  searchFocus === focus
                    ? 'bg-[#5051F9] text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {focus}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[660px]">
        
        {/* Message Stream */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-[#5051F9] text-white flex items-center justify-center text-xs shrink-0 shadow-xs font-black">
                    ✦
                  </div>
                )}
                
                <div className={`max-w-[85%] space-y-3 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                  
                  {/* Sources Citation Strip (Perplexity Style) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <BookOpen className="w-3 h-3 text-[#5051F9]" />
                        <span>Sources & Citations ({msg.sources.length})</span>
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/80 hover:border-[#5051F9] dark:hover:border-indigo-400 min-w-[170px] max-w-[210px] text-left transition-all shrink-0 group shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#5051F9] dark:text-indigo-300 font-bold flex items-center justify-center text-[9px]">
                                {src.index || sIdx + 1}
                              </span>
                              <span className="truncate font-semibold">{src.domain}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#5051F9]">
                              {src.title}
                            </h5>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {src.snippet}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Message Bubble */}
                  <div
                    className={`p-4 md:p-5 rounded-3xl text-xs md:text-sm font-normal leading-relaxed shadow-2xs text-left ${
                      isUser
                        ? 'bg-[#5051F9] text-white rounded-tr-xs ml-auto'
                        : 'bg-[#F8F9FD] dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
                    }`}
                  >
                    <div className="leading-relaxed space-y-1.5">
                      {renderFormattedMessage(msg.content, msg.sources, isUser)}
                    </div>

                    {/* Copy & Feedback Bar */}
                    {!isUser && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-400">
                        <div className="flex items-center gap-1 text-[10px] font-semibold">
                          <Sparkles className="w-3 h-3 text-[#5051F9]" />
                          <span>PathWise AI Verified</span>
                        </div>
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="flex items-center gap-1 text-[10px] font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedId === `msg_${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Perplexity-Style Related Follow-up Suggestions */}
                  {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Related Questions
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.followUpQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#5051F9] dark:hover:border-indigo-400 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#5051F9] dark:hover:text-indigo-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer text-left"
                          >
                            <span>{q}</span>
                            <ArrowRight className="w-3 h-3 text-[#5051F9] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center animate-in fade-in">
              <div className="w-8 h-8 rounded-2xl bg-[#5051F9] text-white flex items-center justify-center text-xs shrink-0 shadow-xs font-black">
                ✦
              </div>
              <div className="p-4 rounded-3xl bg-[#F8F9FD] dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-tl-xs border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2.5 shadow-2xs">
                <Globe className="w-4 h-4 text-[#5051F9] animate-spin" />
                <span className="font-semibold">Synthesizing web sources & prerequisite graph...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Bottom Input Area with Suggestions */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          
          {/* Quick Search Starters */}
          {messages.length <= 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {POPULAR_SEARCH_TOPICS.map((topic, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => handleSend(topic)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#5051F9] dark:hover:text-indigo-300 whitespace-nowrap transition-all cursor-pointer shrink-0"
                >
                  ⚡ {topic}
                </button>
              ))}
            </div>
          )}

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={isSearchGrounded ? "Search anything technical (e.g. React 19 Server Components, Spring Boot Kafka)..." : "Ask your AI Career Coach anything..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full bg-[#F8F9FD] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-5 pr-12 py-3.5 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/30 focus:border-[#5051F9] transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
