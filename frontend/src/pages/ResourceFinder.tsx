import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Bookmark, 
  FolderGit2, 
  Video, 
  FileCode, 
  Copy, 
  Check, 
  ArrowRight,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface ResourceItem {
  title: string;
  url: string;
  type: string;
  description: string;
  provider: string;
  level: string;
  isOfficial: boolean;
}

interface SearchResult {
  query: string;
  matchedTopic: string;
  roadmapShUrl: string;
  summary: string;
  resources: ResourceItem[];
}

const SUGGESTIONS = [
  'React.js & Hooks',
  'Next.js Server Components',
  'Docker & Containerization',
  'Python Data Science',
  'System Design Primer',
  'Spring Boot Microservices',
  'TypeScript Handbook',
  'PostgreSQL Relational SQL',
  'Tailwind CSS Modern Layouts',
  'LangChain & RAG AI'
];

export default function ResourceFinder() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('React.js & Hooks');
  const [activeQuery, setActiveQuery] = useState('React.js & Hooks');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchResources = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setActiveQuery(query);
    try {
      const res = await api.get('/resources/search', {
        params: { query: query.trim() }
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to scrape resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(activeQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(searchQuery);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredResources = result?.resources?.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Official Docs') return item.type === 'OFFICIAL_DOCS' || item.isOfficial;
    if (selectedFilter === 'Roadmap Guides') return item.type === 'ROADMAP_GUIDE' || item.type === 'ARTICLE';
    if (selectedFilter === 'Starter Projects') return item.type === 'PRACTICE_PROJECT';
    if (selectedFilter === 'Video Courses') return item.type === 'VIDEO_TUTORIAL';
    return true;
  }) || [];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 md:p-8 rounded-3xl text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-2">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Roadmap.sh & Web Scraper Resource Hub
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ask For Learning Resources
            </h1>
            <p className="text-xs md:text-sm text-blue-100 max-w-2xl mt-1">
              Search any skill, tool, or library to instantly pull verified documentation, roadmap.sh interactive nodes, starter boilerplates, and top video masterclasses.
            </p>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="px-5 py-2.5 bg-white text-[#5051F9] hover:bg-slate-50 text-xs font-bold rounded-full shadow-xs transition-transform hover:scale-105 cursor-pointer shrink-0"
          >
            Create New Roadmap 🚀
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any skill (e.g. 'Docker Networking', 'React Server Actions', 'LangChain RAG', 'Spring Security')..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full pl-12 pr-28 py-3.5 text-xs md:text-sm font-medium shadow-md focus:outline-none focus:ring-4 focus:ring-purple-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 px-5 py-2 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-full transition-colors cursor-pointer shadow-xs"
          >
            {loading ? 'Scraping...' : 'Find Resources'}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider pr-1">Popular:</span>
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => {
                setSearchQuery(sug);
                fetchResources(sug);
              }}
              className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Result Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Official Docs', 'Roadmap Guides', 'Starter Projects', 'Video Courses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`
                px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer
                ${selectedFilter === tab 
                  ? 'bg-[#5051F9] text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {result && (
          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-[#5051F9] font-extrabold">{filteredResources.length}</span> curated materials for <span className="text-slate-800 font-extrabold">"{result.query}"</span>
          </div>
        )}
      </div>

      {/* Direct Roadmap.sh Live Link Card */}
      {result?.roadmapShUrl && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5051F9] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span>Explore on Roadmap.sh Official Hub</span>
                <span className="text-[10px] bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Interactive Node
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Full visual career tree with community upvotes, alternative skill paths, and mastery benchmarks.
              </p>
            </div>
          </div>

          <a
            href={result.roadmapShUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white hover:bg-purple-50 text-[#5051F9] border border-purple-200 text-xs font-bold rounded-full transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <span>Open on Roadmap.sh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Scraped Resource Cards Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 border-3 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Scraping Roadmap.sh & official documentation for "{activeQuery}"...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No resources found matching this filter.</p>
          <button
            onClick={() => setSelectedFilter('All')}
            className="text-xs font-bold text-[#5051F9] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((item, idx) => {
            const isDocs = item.type === 'OFFICIAL_DOCS';
            const isProject = item.type === 'PRACTICE_PROJECT';
            const isVideo = item.type === 'VIDEO_TUTORIAL';
            const isGuide = item.type === 'ROADMAP_GUIDE' || item.type === 'ARTICLE';

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Badge & Provider */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1
                        ${isDocs 
                          ? 'bg-blue-100 text-blue-800' 
                          : isProject 
                          ? 'bg-amber-100 text-amber-800' 
                          : isVideo 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-purple-100 text-purple-800'}
                      `}>
                        {isDocs && <FileCode className="w-3 h-3" />}
                        {isProject && <FolderGit2 className="w-3 h-3" />}
                        {isVideo && <Video className="w-3 h-3" />}
                        {isGuide && <Bookmark className="w-3 h-3" />}
                        <span>{item.type.replace('_', ' ')}</span>
                      </span>

                      {item.isOfficial && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                          ✓ Official
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400">
                      {item.provider}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#5051F9] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedUrl === item.url ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === item.url ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/chat')}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F8F9FD] text-slate-600 hover:text-[#5051F9] hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      Ask AI Coach
                    </button>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 bg-[#5051F9] hover:bg-indigo-700 text-white text-[11px] font-extrabold rounded-full inline-flex items-center gap-1 shadow-2xs transition-transform hover:scale-105 cursor-pointer"
                    >
                      <span>Open Material</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
