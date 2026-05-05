import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import { Users, Search, Send, Star, Briefcase, Code, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const BrowsePage = () => {
  const { user } = useAuth();
  const [interviewers, setInterviewers] = useState([]);
  const [autoMatches, setAutoMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await matchAPI.listInterviewers();
        if (res.data.success) setInterviewers(res.data.data || []);
      } catch (e) { toast.error('Failed to load interviewers'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAutoMatch = async () => {
    setMatching(true);
    try {
      const res = await matchAPI.autoMatch();
      if (res.data.success) {
        setAutoMatches(res.data.data || []);
        toast.success(`Found ${res.data.data?.length || 0} matches! 🎯`);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Auto match failed'); }
    finally { setMatching(false); }
  };

  const handleSendRequest = async (interviewerId) => {
    setSending(prev => ({ ...prev, [interviewerId]: true }));
    try {
      const res = await matchAPI.sendRequest({ interviewerId });
      if (res.data.success) toast.success('Match request sent! 🚀');
      else toast.error(res.data.message);
    } catch (e) { toast.error(e.response?.data?.message || 'Request failed'); }
    finally { setSending(prev => ({ ...prev, [interviewerId]: false })); }
  };

  const filtered = interviewers.filter(i =>
    i.userName?.toLowerCase().includes(search.toLowerCase()) ||
    i.domain?.toLowerCase().includes(search.toLowerCase()) ||
    i.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="bg-orb bg-orb-1"/><div className="bg-orb bg-orb-2"/>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Browse Interviewers</h1>
            <p className="text-surface-400">Find and connect with experienced interviewers</p>
          </div>
          {user?.role === 'INTERVIEWEE' && (
            <button onClick={handleAutoMatch} disabled={matching} className="btn-primary flex items-center gap-2">
              {matching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Zap className="w-5 h-5"/>Auto Match</>}
            </button>
          )}
        </div>

        {/* Auto Match Results */}
        {autoMatches.length > 0 && (
          <div className="mb-8 animate-slide-up">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400"/>Top Matches For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {autoMatches.map((m, i) => (
                <div key={m.interviewerId} className="glass-card-hover p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500/20 to-transparent w-20 h-20 rounded-bl-full"/>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">#{i+1}</div>
                    <div><div className="font-semibold text-white">{m.interviewerName}</div><div className="text-xs text-surface-400">{m.domain}</div></div>
                    <div className="ml-auto badge-amber">Score: {m.matchScore}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-white/5 rounded-lg p-2"><div className="text-xs text-surface-400">Skills</div><div className="text-sm font-semibold text-accent-400">{m.skillOverlap}</div></div>
                    <div className="bg-white/5 rounded-lg p-2"><div className="text-xs text-surface-400">Domain</div><div className="text-sm font-semibold text-primary-400">{m.domainMatch?'✓':'✗'}</div></div>
                    <div className="bg-white/5 rounded-lg p-2"><div className="text-xs text-surface-400">Avail</div><div className="text-sm font-semibold text-amber-400">{m.availabilityOverlap}</div></div>
                  </div>
                  <button onClick={() => handleSendRequest(m.interviewerId)} disabled={sending[m.interviewerId]} className="btn-accent w-full text-sm py-2 flex items-center justify-center gap-2">
                    {sending[m.interviewerId]?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Send className="w-4 h-4"/>Request Match</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 animate-slide-up" style={{animationDelay:'0.1s'}}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} className="input-field pl-11" placeholder="Search by name, domain, or skill..."/>
          </div>
        </div>

        {/* Interviewer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up" style={{animationDelay:'0.2s'}}>
          {filtered.map(iv => (
            <div key={iv.userId} className="glass-card-hover p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">{iv.userName?.charAt(0)}</div>
                <div><div className="font-semibold text-white">{iv.userName}</div><div className="text-xs text-surface-400">{iv.userEmail}</div></div>
              </div>
              <div className="flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-primary-400"/><span className="text-sm text-surface-300">{iv.domain}</span><span className="text-xs text-surface-500">• {iv.experienceYears}y exp</span></div>
              {iv.bio && <p className="text-xs text-surface-400 mb-3 line-clamp-2">{iv.bio}</p>}
              <div className="flex flex-wrap gap-1 mb-4">{iv.skills?.slice(0,5).map(s=><span key={s} className="badge-primary text-[10px]">{s}</span>)}{iv.skills?.length>5&&<span className="badge text-[10px] text-surface-400">+{iv.skills.length-5}</span>}</div>
              {user?.role === 'INTERVIEWEE' && (
                <button onClick={() => handleSendRequest(iv.userId)} disabled={sending[iv.userId]} className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-2">
                  {sending[iv.userId]?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Send className="w-4 h-4"/>Request Interview</>}
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12"><Users className="w-12 h-12 text-surface-600 mx-auto mb-3"/><p className="text-surface-400">No interviewers found</p></div>}
        </div>
      </div>
    </div>
  );
};
export default BrowsePage;
