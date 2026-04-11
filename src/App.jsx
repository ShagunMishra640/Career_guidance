import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Compass, 
  Bookmark, 
  ArrowRight, 
  CheckCircle, 
  Search, 
  TrendingUp, 
  Award,
  ChevronLeft,
  X,
  ExternalLink,
  Loader2,
  Globe,
  Zap
} from 'lucide-react';

/**
 * --- APP DATA & CONSTANTS ---
 */

const RIASEC_CATEGORIES = {
  R: { name: 'Realistic', icon: '🛠️', desc: 'The "Doers". You like working with tools, animals, or machines.' },
  I: { name: 'Investigative', icon: '🔬', desc: 'The "Thinkers". You like to observe, learn, investigate, and solve problems.' },
  A: { name: 'Artistic', icon: '🎨', desc: 'The "Creators". You have artistic, innovating, or intuitional abilities.' },
  S: { name: 'Social', icon: '🤝', desc: 'The "Helpers". You like to work with people to enlighten, inform, or help.' },
  E: { name: 'Enterprising', icon: '📢', desc: 'The "Persuaders". You like to work with people, influencing or leading.' },
  C: { name: 'Conventional', icon: '📊', desc: 'The "Organizers". You like to work with data and carry out tasks in detail.' },
};

const QUESTIONS = [
  { id: 1, text: "I like to work on cars or mechanical equipment.", cat: 'R' },
  { id: 2, text: "I enjoy doing puzzles or complex math problems.", cat: 'I' },
  { id: 3, text: "I like to write stories, poems, or music.", cat: 'A' },
  { id: 4, text: "I like to help people with their problems.", cat: 'S' },
  { id: 5, text: "I enjoy leading or managing a team of people.", cat: 'E' },
  { id: 6, text: "I like keeping detailed records and organizing files.", cat: 'C' },
  { id: 7, text: "I prefer working outdoors in nature.", cat: 'R' },
  { id: 8, text: "I like to conduct scientific experiments.", cat: 'I' },
  { id: 9, text: "I enjoy sketching, drawing, or painting.", cat: 'A' },
  { id: 10, text: "I find fulfillment in teaching others new skills.", cat: 'S' },
  { id: 11, text: "I like to persuade others to my point of view.", cat: 'E' },
  { id: 12, text: "I am very good at following instructions exactly.", cat: 'C' },
];

const CAREER_SUGGESTIONS = {
  R: ["Mechanical Engineer", "Pilot", "Chef", "Electrician", "Civil Engineer"],
  I: ["Software Developer", "Data Scientist", "Physician", "Chemist", "Market Analyst"],
  A: ["UX Designer", "Architect", "Graphic Designer", "Copywriter", "Musician"],
  S: ["Human Resources", "Teacher", "Counselor", "Nurse", "Social Worker"],
  E: ["Project Manager", "Entrepreneur", "Sales Manager", "Lawyer", "Real Estate Agent"],
  C: ["Accountant", "Actuary", "Database Admin", "Financial Planner", "Paralegal"],
};

/**
 * --- MAIN APP COMPONENT ---
 */

export default function App() {
  const [view, setView] = useState('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [savedCareers, setSavedCareers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('idle'); // idle, loading, success, error

  // Configuration for APIs
  const ADZUNA_ID = ""; 
  const ADZUNA_KEY = ""; 

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('career_app_saved');
    if (saved) setSavedCareers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('career_app_saved', JSON.stringify(savedCareers));
  }, [savedCareers]);

  /**
   * --- API HANDLER ---
   */

  const fetchGlobalJobs = async (keyword) => {
    setLoadingJobs(true);
    setApiStatus('loading');
    
    // 1. Try Adzuna if keys exist (Localized data)
    if (ADZUNA_ID && ADZUNA_KEY) {
      try {
        const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${ADZUNA_ID}&app_key=${ADZUNA_KEY}&what=${keyword}`);
        const data = await res.json();
        const formatted = data.results.map(j => ({
          id: j.id,
          title: j.title,
          company: j.company.display_name,
          location: j.location.display_name,
          salary: j.salary_min ? `$${(j.salary_min/1000).toFixed(0)}k+` : 'Unspecified',
          source: 'Adzuna'
        }));
        setJobs(formatted);
        setApiStatus('success');
        setLoadingJobs(false);
        return;
      } catch (err) {
        console.warn("Adzuna failed, falling back to Jobicy", err);
      }
    }

    // 2. Open API: Jobicy (Remote/Global Focus - No Key Required)
    try {
      const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=15&tag=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      
      if (data.jobs && data.jobs.length > 0) {
        const formatted = data.jobs.map(j => ({
          id: j.id,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || 'Remote',
          salary: j.annualSalaryMin ? `${j.salaryCurrency} ${j.annualSalaryMin.toLocaleString()}+` : 'Remote Competitive',
          source: 'Jobicy (Open API)'
        }));
        setJobs(formatted);
        setApiStatus('success');
      } else {
        throw new Error("No results");
      }
    } catch (err) {
      console.error("Jobicy API Error:", err);
      setApiStatus('error');
      // Final Fallback: Static Mock Data
      setJobs([
        { id: 'm1', title: keyword + ' Specialist', company: 'Global Vision Inc', location: 'Remote', salary: '$95k', source: 'Internal Database' },
        { id: 'm2', title: 'Senior ' + keyword, company: 'Nexus Systems', location: 'London, UK', salary: '£70k', source: 'Internal Database' },
      ]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleQuizAnswer = (value) => {
    const category = QUESTIONS[currentQuestion].cat;
    if (value) {
      setScores(prev => ({ ...prev, [category]: prev[category] + 1 }));
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setView('results');
    }
  };

  const topCategory = useMemo(() => {
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, [scores, view]);

  const toggleSave = (career) => {
    setSavedCareers(prev => {
      const isSaved = prev.find(c => (c.id === career.id || c.title === career.title));
      if (isSaved) return prev.filter(c => (c.id !== career.id && c.title !== career.title));
      return [...prev, career];
    });
  };

  /**
   * --- VIEWS ---
   */

  const renderLanding = () => (
    <div className="flex flex-col items-center text-center py-16 px-6 max-w-4xl mx-auto">
      <div className="bg-indigo-600 p-5 rounded-3xl mb-8 shadow-2xl shadow-indigo-200 animate-bounce-slow">
        <Compass className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
        Build a Career <br/><span className="text-indigo-600 underline decoration-indigo-200">That Actually Fits.</span>
      </h1>
      <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl">
        A self-contained career engine powered by the RIASEC framework and real-time job feeds from Jobicy Open API. No backend, no accounts.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
        <button 
          onClick={() => setView('quiz')}
          className="flex-1 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:-translate-y-1"
        >
          Start Personality Quiz <ArrowRight className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('browse')}
          className="flex-1 bg-white text-slate-700 border-2 border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:border-indigo-300 hover:text-indigo-600 transition-all hover:-translate-y-1"
        >
          Explore Market
        </button>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center gap-2">
          <Globe className="text-emerald-500 w-6 h-6" />
          <span className="text-sm font-bold text-slate-400">Global API</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Zap className="text-amber-500 w-6 h-6" />
          <span className="text-sm font-bold text-slate-400">Zero Latency</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Award className="text-indigo-500 w-6 h-6" />
          <span className="text-sm font-bold text-slate-400">RIASEC Model</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="text-blue-500 w-6 h-6" />
          <span className="text-sm font-bold text-slate-400">Privacy First</span>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    const q = QUESTIONS[currentQuestion];

    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Question {currentQuestion + 1} / {QUESTIONS.length}</span>
            <span className="text-xs font-bold text-slate-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-indigo-200" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 mb-8 min-h-[250px] flex items-center justify-center text-center">
          <p className="text-3xl font-bold text-slate-800 leading-tight">{q.text}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button 
            onClick={() => handleQuizAnswer(true)}
            className="group bg-indigo-50 border-2 border-transparent hover:border-indigo-400 p-8 rounded-3xl transition-all flex flex-col items-center hover:scale-[1.02]"
          >
            <CheckCircle className="w-10 h-10 text-indigo-600 mb-3" />
            <span className="text-xl font-black text-indigo-900">Agree</span>
          </button>
          <button 
            onClick={() => handleQuizAnswer(false)}
            className="group bg-slate-50 border-2 border-transparent hover:border-slate-300 p-8 rounded-3xl transition-all flex flex-col items-center hover:scale-[1.02]"
          >
            <X className="w-10 h-10 text-slate-400 mb-3" />
            <span className="text-xl font-black text-slate-500">Disagree</span>
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const data = RIASEC_CATEGORIES[topCategory];
    const careers = CAREER_SUGGESTIONS[topCategory];

    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-6xl mb-6">{data.icon}</div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-indigo-400 mb-2">Personality Result</h2>
            <h1 className="text-5xl font-black mb-4">The {data.name}</h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">{data.desc}</p>
            <button 
              onClick={() => { setView('quiz'); setCurrentQuestion(0); setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }); }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            >
              Retake Assessment
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
        </div>

        <div className="flex items-center justify-between mb-8 px-2">
           <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Award className="text-amber-500 w-7 h-7" /> Path Recommendations
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client-Side Matching</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {careers.map((careerName, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-50 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-all group hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">{careerName}</h4>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">High Fit Score</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSearchQuery(careerName);
                    setView('browse');
                    fetchGlobalJobs(careerName);
                  }}
                  className="p-3 text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="Search Live Openings"
                >
                  <Search className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => toggleSave({ id: `career-${idx}`, title: careerName, type: data.name })}
                  className={`p-3 rounded-2xl transition-all shadow-sm ${savedCareers.some(c => c.title === careerName) ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  <Bookmark className="w-6 h-6" fill={savedCareers.some(c => c.title === careerName) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBrowse = () => (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Open Job Market</h1>
        <p className="text-slate-500 font-medium mb-8">Querying <span className="text-indigo-600 font-bold">Global Networks</span> for opportunities.</p>
        
        <div className="relative max-w-2xl mx-auto group">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGlobalJobs(searchQuery)}
            placeholder="Search roles (e.g. React Developer, Data...)"
            className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-xl shadow-slate-100 focus:border-indigo-400 outline-none transition-all text-lg font-medium"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-indigo-400 transition-colors" />
          <button 
            onClick={() => fetchGlobalJobs(searchQuery)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Fetch Jobs
          </button>
        </div>
      </div>

      {loadingJobs ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
          </div>
          <p className="font-black text-slate-800 text-xl">Scanning Global Networks</p>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Public API Handshake...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <div key={job.id} className="bg-white p-7 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-indigo-50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">{job.source}</span>
                    <button 
                      onClick={() => toggleSave(job)}
                      className={`p-2 rounded-xl transition-all ${savedCareers.some(c => c.id === job.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-indigo-50 hover:text-indigo-400'}`}
                    >
                      <Bookmark className="w-5 h-5" fill={savedCareers.some(c => c.id === job.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                  <p className="text-indigo-600 font-black text-sm mb-1">{job.company}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6">
                    <Globe className="w-3 h-3" /> {job.location}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-400">EST. PAY</span>
                    <span className="text-sm font-black text-emerald-600">{job.salary}</span>
                  </div>
                  {/* Redirect to Google Search to avoid 'File Not Found' errors with API redirects */}
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(job.title + " job at " + job.company)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-slate-50 text-slate-700 py-4 rounded-2xl text-center text-sm font-black hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Details <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
              <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-black text-xl">Enter a role to browse live data.</p>
              <p className="text-slate-300 text-sm font-bold mt-1 uppercase tracking-widest">Connect to global job feeds instantly</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSaved = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-end justify-between mb-10 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Career Roadmap</h1>
          <p className="text-slate-400 font-bold">Your private inventory, stored locally.</p>
        </div>
        <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-xl">
          {savedCareers.length}
        </div>
      </div>

      {savedCareers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedCareers.map((c, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-800">{c.title}</h4>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{c.company || `Profile: ${c.type}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(c.title + (c.company ? " at " + c.company : ""))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                >
                  <ExternalLink className="w-6 h-6" />
                </a>
                <button 
                  onClick={() => toggleSave(c)}
                  className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
          <Bookmark className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black text-xl mb-6">No milestones saved yet.</p>
          <button 
            onClick={() => setView('landing')}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Start Discovering
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            onClick={() => setView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">CareerPath<span className="text-indigo-600">.</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            {['landing', 'quiz', 'browse'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)} 
                className={`text-sm font-black uppercase tracking-widest transition-all ${view === v ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {v}
              </button>
            ))}
            <button 
              onClick={() => setView('saved')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${view === 'saved' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Bookmark className="w-4 h-4" /> Roadmap
            </button>
          </nav>

          <button onClick={() => setView('saved')} className="md:hidden p-3 bg-slate-50 text-slate-400 rounded-xl relative">
            <Bookmark className="w-6 h-6" />
            {savedCareers.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></span>}
          </button>
        </div>
      </header>

      <main className="pb-32">
        {view === 'landing' && renderLanding()}
        {view === 'quiz' && renderQuiz()}
        {view === 'results' && renderResults()}
        {view === 'browse' && renderBrowse()}
        {view === 'saved' && renderSaved()}
      </main>

      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg text-white rounded-[2rem] p-3 flex gap-2 shadow-2xl z-50 border border-white/10">
        <button onClick={() => setView('landing')} className={`p-4 rounded-2xl transition-all ${view === 'landing' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/10'}`}><Compass className="w-6 h-6" /></button>
        <button onClick={() => setView('quiz')} className={`p-4 rounded-2xl transition-all ${view === 'quiz' || view === 'results' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/10'}`}><Award className="w-6 h-6" /></button>
        <button onClick={() => setView('browse')} className={`p-4 rounded-2xl transition-all ${view === 'browse' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/10'}`}><Search className="w-6 h-6" /></button>
        <button onClick={() => setView('saved')} className={`p-4 rounded-2xl transition-all ${view === 'saved' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/10'}`}><Bookmark className="w-6 h-6" /></button>
      </div>

      <footer className="py-20 text-center border-t border-slate-50">
        <p className="text-slate-300 font-black text-sm uppercase tracking-[0.3em]">CareerPath</p>
        <p className="mt-3 text-slate-400 text-xs font-bold">Search results via Google • Local Storage Persistence</p>
      </footer>
    </div>
  );
}