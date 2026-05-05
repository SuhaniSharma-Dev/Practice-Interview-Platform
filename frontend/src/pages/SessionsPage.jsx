import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Video, MessageSquare, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  PENDING:   { color: 'amber',  icon: Clock,       label: 'Pending' },
  ACCEPTED:  { color: 'blue',   icon: CheckCircle, label: 'Accepted' },
  SCHEDULED: { color: 'green',  icon: Calendar,    label: 'Scheduled' },
  COMPLETED: { color: 'purple', icon: Play,        label: 'Completed' },
  REJECTED:  { color: 'red',    icon: XCircle,     label: 'Rejected' },
  EXPIRED:   { color: 'gray',   icon: AlertCircle, label: 'Expired' },
};

const SessionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [tab, setTab] = useState('all');

  const loadSessions = async () => {
    try {
      const res = await matchAPI.getRequests(user.id);
      if (res.data.success) setSessions(res.data.data || []);
    } catch (e) { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) loadSessions(); }, [user]);

  const updateStatus = async (sessionId, status, scheduledAt) => {
    setUpdating(prev => ({ ...prev, [sessionId]: true }));
    try {
      const res = await matchAPI.updateStatus(sessionId, { status, scheduledAt });
      if (res.data.success) {
        toast.success(`Session ${status.toLowerCase()}!`);
        loadSessions();
      } else toast.error(res.data.message);
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setUpdating(prev => ({ ...prev, [sessionId]: false })); }
  };

  const handleEndCall = async (session) => {
    await updateStatus(session.id, 'COMPLETED');
    navigate(`/feedback/${session.id}`);
  };

  const isInterviewer = user?.role === 'INTERVIEWER';
  const filtered = tab === 'all' ? sessions
    : tab === 'upcoming' ? sessions.filter(s => s.status === 'SCHEDULED')
    : tab === 'pending' ? sessions.filter(s => s.status === 'PENDING' || s.status === 'ACCEPTED')
    : sessions.filter(s => s.status === 'COMPLETED');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">My Sessions</h1>
          <p className="text-surface-400">Manage your interview sessions and track progress</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto animate-slide-up">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}>
              {t.label} ({t.key === 'all' ? sessions.length
                : t.key === 'upcoming' ? sessions.filter(s=>s.status==='SCHEDULED').length
                : t.key === 'pending' ? sessions.filter(s=>s.status==='PENDING'||s.status==='ACCEPTED').length
                : sessions.filter(s=>s.status==='COMPLETED').length})
            </button>
          ))}
        </div>

        {/* Session Cards */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {filtered.map(session => {
            const st = statusConfig[session.status] || statusConfig.PENDING;
            const Icon = st.icon;
            const isOutgoing = session.intervieweeId === user?.id;
            const otherName = isOutgoing ? session.interviewerName : session.intervieweeName;
            const isLoading = updating[session.id];

            return (
              <div key={session.id} className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left — Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isOutgoing ? 'bg-accent-500/20' : 'bg-primary-500/20'
                    }`}>
                      {isOutgoing
                        ? <ArrowRight className="w-5 h-5 text-accent-400" />
                        : <ArrowLeft className="w-5 h-5 text-primary-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-lg">{otherName}</span>
                        <span className={`badge bg-${st.color}-500/20 text-${st.color}-400 border border-${st.color}-500/30`}>
                          <Icon className="w-3 h-3 mr-1" />{st.label}
                        </span>
                      </div>
                      <div className="text-sm text-surface-400 mt-1">
                        {isOutgoing ? 'You → ' + session.interviewerName : session.intervieweeName + ' → You'}
                        {session.scheduledAt && (
                          <span className="ml-2">• 📅 {new Date(session.scheduledAt).toLocaleString()}</span>
                        )}
                        {session.roomId && (
                          <span className="ml-2">• 🏠 {session.roomId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* PENDING → Interviewer can Accept/Reject */}
                    {session.status === 'PENDING' && isInterviewer && !isOutgoing && (
                      <>
                        <button onClick={() => updateStatus(session.id, 'ACCEPTED')}
                          disabled={isLoading}
                          className="btn-accent text-sm py-2 px-4 flex items-center gap-1">
                          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            : <><CheckCircle className="w-4 h-4" /> Accept</>}
                        </button>
                        <button onClick={() => updateStatus(session.id, 'REJECTED')}
                          disabled={isLoading}
                          className="bg-red-500/10 text-red-400 border border-red-500/30 text-sm py-2 px-4 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {/* ACCEPTED → Either can Schedule */}
                    {session.status === 'ACCEPTED' && (
                      <button onClick={() => updateStatus(session.id, 'SCHEDULED')}
                        disabled={isLoading}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                          : <><Calendar className="w-4 h-4" /> Schedule Now</>}
                      </button>
                    )}

                    {/* SCHEDULED → Join Session + End Call */}
                    {session.status === 'SCHEDULED' && (
                      <>
                        <a href={`https://meet.jit.si/${session.roomId}`} target="_blank" rel="noopener noreferrer"
                          className="btn-accent text-sm py-2 px-4 flex items-center gap-1">
                          <Video className="w-4 h-4" /> Join Session
                        </a>
                        <button onClick={() => handleEndCall(session)}
                          disabled={isLoading}
                          className="bg-red-500/10 text-red-400 border border-red-500/30 text-sm py-2 px-4 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-1">
                          End Call
                        </button>
                      </>
                    )}

                    {/* COMPLETED → Give Feedback (only if not already submitted) */}
                    {session.status === 'COMPLETED' && !session.feedbackSubmitted && (
                      <button onClick={() => navigate(`/feedback/${session.id}`)}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> Give Feedback
                      </button>
                    )}

                    {session.status === 'COMPLETED' && session.feedbackSubmitted && (
                      <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">
                        ✓ Feedback Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">No sessions found</p>
              <p className="text-sm text-surface-500 mt-1">
                {isInterviewer ? 'Wait for interviewees to send you requests!' : 'Browse interviewers and send a match request!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
