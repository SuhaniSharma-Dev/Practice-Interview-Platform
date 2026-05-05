import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { Save, Plus, X, Briefcase, Code, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const SLOTS = ['09:00-10:00','10:00-11:00','11:00-12:00','13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00','18:00-19:00','19:00-20:00'];
const DOMAINS = ['Backend','Frontend','Full Stack','Data Science','DevOps','Mobile','System Design','Cloud','AI/ML','Cybersecurity'];

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [form, setForm] = useState({ bio:'', skills:[], domain:'', experienceYears:0, availability:{} });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileAPI.get(user.id);
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setForm({ bio:p.bio||'', skills:p.skills||[], domain:p.domain||'', experienceYears:p.experienceYears||0, availability:p.availability||{} });
        }
      } catch(e) {} finally { setLoading(false); }
    };
    if (user?.id) load();
  }, [user]);

  const addSkill = () => { const s=newSkill.trim(); if(s&&!form.skills.includes(s)){setForm({...form,skills:[...form.skills,s]});setNewSkill('');} };
  const removeSkill = (s) => setForm({...form, skills:form.skills.filter(x=>x!==s)});
  const toggleSlot = (day, slot) => {
    const cur = form.availability[day]||[];
    const upd = cur.includes(slot)?cur.filter(s=>s!==slot):[...cur,slot];
    setForm({...form, availability:{...form.availability,[day]:upd}});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update(user.id, form);
      if(res.data.success) toast.success('Profile saved! ✨');
      else toast.error(res.data.message||'Failed');
    } catch(e) { toast.error(e.response?.data?.message||'Failed to save'); } finally { setSaving(false); }
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="bg-orb bg-orb-1"/><div className="bg-orb bg-orb-2"/>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Setup</h1>
          <p className="text-surface-400">{user?.role==='INTERVIEWER'?'Set up your profile so interviewees can find you.':'Tell us your skills so we find the best interviewers.'}</p>
        </div>
        <div className="space-y-6">
          {/* Bio & Domain */}
          <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-400"/>About You</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-surface-300 mb-2">Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} className="input-field h-24 resize-none" placeholder="Tell us about yourself..."/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-surface-300 mb-2"><Briefcase className="w-4 h-4 inline mr-1"/>Domain</label>
                  <select value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} className="input-field">
                    <option value="" className="bg-surface-800">Select domain</option>
                    {DOMAINS.map(d=><option key={d} value={d} className="bg-surface-800">{d}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-surface-300 mb-2"><Clock className="w-4 h-4 inline mr-1"/>Years of Experience</label>
                  <input type="number" min="0" max="50" value={form.experienceYears} onChange={e=>setForm({...form,experienceYears:parseInt(e.target.value)||0})} className="input-field"/></div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-6 animate-slide-up" style={{animationDelay:'0.1s'}}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Code className="w-5 h-5 text-accent-400"/>Skills</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addSkill();}}} className="input-field flex-1" placeholder="Add a skill (e.g. Java, React)"/>
              <button onClick={addSkill} className="btn-accent px-4 py-3"><Plus className="w-5 h-5"/></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s=><span key={s} className="badge-primary flex items-center gap-1.5 pr-1.5">{s}<button onClick={()=>removeSkill(s)} className="hover:text-red-400 transition p-0.5 rounded-full hover:bg-white/10"><X className="w-3 h-3"/></button></span>)}
              {form.skills.length===0&&<p className="text-sm text-surface-500">No skills added yet.</p>}
            </div>
          </div>

          {/* Availability */}
          <div className="glass-card p-6 animate-slide-up" style={{animationDelay:'0.2s'}}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400"/>Availability</h2>
            <p className="text-sm text-surface-400 mb-4">Click time slots to toggle</p>
            <div className="overflow-x-auto"><div className="min-w-[600px]">
              <div className="grid grid-cols-[90px_repeat(10,1fr)] gap-1 mb-2"><div/>{SLOTS.map(s=><div key={s} className="text-[10px] text-surface-500 text-center">{s.split('-')[0]}</div>)}</div>
              {DAYS.map(day=><div key={day} className="grid grid-cols-[90px_repeat(10,1fr)] gap-1 mb-1">
                <div className="text-xs font-medium text-surface-300 flex items-center">{day.charAt(0)+day.slice(1).toLowerCase()}</div>
                {SLOTS.map(slot=>{const active=(form.availability[day]||[]).includes(slot);return <button key={`${day}-${slot}`} onClick={()=>toggleSlot(day,slot)} className={`h-8 rounded-md transition-all ${active?'bg-accent-500/30 border border-accent-500/50 text-accent-300':'bg-white/5 border border-white/5 hover:bg-white/10'}`}/>;})}
              </div>)}
            </div></div>
          </div>

          <div className="flex justify-end animate-slide-up" style={{animationDelay:'0.3s'}}>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8">
              {saving?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Save className="w-5 h-5"/>Save Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
