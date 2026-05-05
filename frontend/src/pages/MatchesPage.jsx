import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import { Zap, ArrowRight, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  PENDING: { color: 'amber', icon: Clock, label: 'Pending' },
  ACCEPTED: { color: 'green', icon: CheckCircle, label: 'Accepted' },
  REJECTED: { color: 'red', icon: XCircle, label: 'Rejected' },
  EXPIRED: { color: 'gray', icon: AlertCircle, label: 'Expired' },
};

const MatchesPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await matchAPI.getRequests(user.id);
        if (res.data.success) setRequests(res.data.data || []);
      } catch (e) { toast.error('Failed to load match requests'); }
      finally { setLoading(false); }
    };
    if (user?.id) load();
  }, [user]);

  const outgoing = requests.filter(r => r.intervieweeId === user?.id);
  const incoming = requests.filter(r => r.interviewerId === user?.id);
  const displayed = tab === 'outgoing' ? outgoing : tab === 'incoming' ? incoming : requests;

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="bg-orb bg-orb-1"/><div className="bg-orb bg-orb-2"/>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Match Requests</h1>
          <p className="text-surface-400">Track all your interview match requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          {[
            { label: 'Total', value: requests.length, color: 'primary' },
            { label: 'Sent', value: outgoing.length, color: 'accent' },
            { label: 'Received', value: incoming.length, color: 'amber' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
              <div className="text-xs text-surface-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-slide-up" style={{animationDelay:'0.1s'}}>
          {['all','outgoing','incoming'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab===t?'bg-primary-500/20 text-primary-300 border border-primary-500/30':'text-surface-400 hover:text-white hover:bg-white/5'}`}>
              {t.charAt(0).toUpperCase()+t.slice(1)} {t==='outgoing'?`(${outgoing.length})`:t==='incoming'?`(${incoming.length})`:`(${requests.length})`}
            </button>
          ))}
        </div>

        {/* Request Cards */}
        <div className="space-y-3 animate-slide-up" style={{animationDelay:'0.2s'}}>
          {displayed.map(req => {
            const st = statusConfig[req.status] || statusConfig.PENDING;
            const Icon = st.icon;
            const isOutgoing = req.intervieweeId === user?.id;

            return (
              <div key={req.id} className="glass-card-hover p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOutgoing?'bg-accent-500/20':'bg-primary-500/20'}`}>
                      {isOutgoing?<ArrowRight className="w-5 h-5 text-accent-400"/>:<ArrowLeft className="w-5 h-5 text-primary-400"/>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{isOutgoing ? req.interviewerName : req.intervieweeName}</span>
                        <span className={`badge bg-${st.color}-500/20 text-${st.color}-300 border-${st.color}-500/30`}>
                          <Icon className="w-3 h-3 mr-1"/>{st.label}
                        </span>
                      </div>
                      <div className="text-xs text-surface-400 mt-1">
                        {isOutgoing ? 'You → '+req.interviewerName : req.intervieweeName+' → You'}
                        {req.createdAt && <span className="ml-2">• {new Date(req.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && (
            <div className="text-center py-16">
              <Zap className="w-12 h-12 text-surface-600 mx-auto mb-3"/>
              <p className="text-surface-400">No match requests yet</p>
              <p className="text-sm text-surface-500 mt-1">Browse interviewers and send your first request!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MatchesPage;
