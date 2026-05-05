import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, Zap, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessRes = await matchAPI.getRequests(user.id);
        if (sessRes.data.success) setSessions(sessRes.data.data || []);

        if (user.role === 'INTERVIEWEE') {
          const ivRes = await matchAPI.listInterviewers();
          if (ivRes.data.success) setInterviewers(ivRes.data.data || []);
        }
      } catch (e) { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    if (user?.id) load();
  }, [user]);

  const upcoming = sessions.filter(s => s.status === 'SCHEDULED');
  const pending = sessions.filter(s => s.status === 'PENDING');
  const accepted = sessions.filter(s => s.status === 'ACCEPTED');
  const completed = sessions.filter(s => s.status === 'COMPLETED');

  const isInterviewer = user?.role === 'INTERVIEWER';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-surface-400">
            {isInterviewer ? 'Manage your incoming requests and upcoming sessions.' : 'Find interviewers and track your sessions.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'primary' },
            { label: 'Pending', value: pending.length, icon: Clock, color: 'amber' },
            { label: 'Accepted', value: accepted.length, icon: CheckCircle, color: 'accent' },
            { label: 'Completed', value: completed.length, icon: Zap, color: 'purple' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 text-${s.color}-400`} />
              <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
              <div className="text-xs text-surface-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" /> Upcoming Sessions
              </h2>
              <Link to="/sessions" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcoming.length > 0 ? upcoming.slice(0, 3).map(s => (
              <div key={s.id} className="glass-card-hover p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {isInterviewer ? s.intervieweeName : s.interviewerName}
                      </div>
                      <div className="text-xs text-surface-400">
                        {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : 'Time TBD'}
                      </div>
                    </div>
                  </div>
                  <Link to="/sessions" className="btn-primary text-xs py-2 px-4">
                    View
                  </Link>
                </div>
              </div>
            )) : (
              <div className="glass-card p-8 text-center">
                <Calendar className="w-10 h-10 text-surface-600 mx-auto mb-2" />
                <p className="text-surface-400 text-sm">No upcoming sessions</p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {isInterviewer ? (
              <>
                {/* Incoming Requests for Interviewer */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> Incoming Requests
                  </h2>
                </div>
                {pending.length > 0 ? pending.slice(0, 4).map(s => (
                  <div key={s.id} className="glass-card-hover p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                          {s.intervieweeName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{s.intervieweeName}</div>
                          <div className="text-xs text-surface-400">Wants to practice with you</div>
                        </div>
                      </div>
                      <Link to="/sessions" className="btn-accent text-xs py-2 px-4">
                        Respond
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="glass-card p-8 text-center">
                    <Clock className="w-10 h-10 text-surface-600 mx-auto mb-2" />
                    <p className="text-surface-400 text-sm">No pending requests</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Available Interviewers for Interviewee */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-400" /> Available Interviewers
                  </h2>
                  <Link to="/browse" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    Browse all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {interviewers.length > 0 ? interviewers.slice(0, 4).map(iv => (
                  <div key={iv.userId} className="glass-card-hover p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                          {iv.userName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{iv.userName}</div>
                          <div className="text-xs text-surface-400">{iv.domain} • {iv.experienceYears}y exp</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {iv.skills?.slice(0, 2).map(s => (
                          <span key={s} className="badge-primary text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="glass-card p-8 text-center">
                    <Users className="w-10 h-10 text-surface-600 mx-auto mb-2" />
                    <p className="text-surface-400 text-sm">No interviewers available yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
