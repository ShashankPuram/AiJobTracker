import { useState, useRef } from "react";
import { useApplicationStore } from "../store/useApplicationStore";
import type { AppStatus } from "../store/useApplicationStore";
import { Briefcase, Building2, MapPin, DollarSign, Calendar, Clock, ChevronRight, XCircle, Plus, X } from "lucide-react";

export default function Applications() {
  const { applications, updateStatus, deleteApplication, addApplication } = useApplicationStore();
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', company: '', location: '', salary: '' });
  
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim() || !manualForm.company.trim()) return;
    
    addApplication({
      id: Math.random().toString(36).substring(7),
      title: manualForm.title,
      company: manualForm.company,
      location: manualForm.location,
      salary: manualForm.salary
    }, 'Applied');
    
    setManualForm({ title: '', company: '', location: '', salary: '' });
    setShowManualModal(false);
  };

  if (applications.length === 0) {
    return (
      <div className="flex-1 p-8 text-center bg-[#121212] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1F1F1F] m-8 mt-4 flex flex-col items-center justify-center font-sans h-full">
        <div className="w-24 h-24 bg-[#1A1A1A] text-[#EF4444] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#EF4444]/20">
          <Briefcase className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-3">No Applications Yet</h2>
        <p className="text-[#A1A1AA] max-w-md mx-auto text-[15px] font-medium leading-relaxed mb-6">
          You haven't tracked any applications. Start applying from your curated Job Feed and they will dynamically appear here!
        </p>
        <button onClick={() => setShowManualModal(true)} className="px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Manually
        </button>
        
        {/* Manual Modal definition reused below */}
        {showManualModal && <ManualAddModal onClose={() => setShowManualModal(false)} form={manualForm} setForm={setManualForm} onSubmit={handleManualAdd} />}
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 font-sans overflow-y-auto relative">
      <div className="flex justify-between items-end mb-8">
         <div>
           <h1 className="text-3xl font-black text-white tracking-tight">Your Applications</h1>
           <p className="text-[#A1A1AA] font-medium mt-1">Track and manage your job applications</p>
         </div>
         <div className="flex gap-4 items-center">
           {['Applied', 'Interview', 'Offer', 'Rejected'].map(status => (
             <div key={status} className="flex flex-col items-center px-2 border-r border-[#1F1F1F] last:border-0">
               <span className="text-[20px] font-bold text-white">{applications.filter(a => a.status === status).length}</span>
               <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{status}</span>
             </div>
           ))}
           <button onClick={() => setShowManualModal(true)} className="ml-4 px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center gap-2 text-sm">
             <Plus className="w-4 h-4" /> Add Application
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {applications.map(app => (
          <ApplicationCard key={app.id} app={app} updateStatus={updateStatus} deleteApplication={deleteApplication} />
        ))}
      </div>

      {showManualModal && <ManualAddModal onClose={() => setShowManualModal(false)} form={manualForm} setForm={setManualForm} onSubmit={handleManualAdd} />}
    </div>
  );
}

function ManualAddModal({ onClose, form, setForm, onSubmit }: { onClose: () => void, form: any, setForm: any, onSubmit: (e: any) => void }) {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
           <div className="p-6 border-b border-[#1F1F1F] flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Manual Tracking</h3>
                <p className="text-sm font-medium text-[#A1A1AA] mt-1">Log an external pipeline</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-full text-[#6B7280] hover:text-[#EF4444] transition-colors">
                 <X className="w-5 h-5" />
              </button>
           </div>
           <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                 <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Job Title *</label>
                 <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white placeholder-[#6B7280] focus:border-[#EF4444] outline-none" placeholder="e.g. Senior Developer" />
              </div>
              <div>
                 <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Company *</label>
                 <input type="text" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white placeholder-[#6B7280] focus:border-[#EF4444] outline-none" placeholder="e.g. Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Location</label>
                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white placeholder-[#6B7280] focus:border-[#EF4444] outline-none" placeholder="Remote, NYC..." />
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Salary Estimate</label>
                    <input type="text" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white placeholder-[#6B7280] focus:border-[#EF4444] outline-none" placeholder="$120k+" />
                 </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] mt-4">
                 Add Application
              </button>
           </form>
        </div>
     </div>
  );
}

function ApplicationCard({ app, updateStatus, deleteApplication }: { app: any, updateStatus: any, deleteApplication: any }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const checkOverflow = () => {
    if (titleRef.current) {
      setIsOverflowing(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  };

  const statuses: AppStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected'];
  
  const getStatusColor = (status: AppStatus) => {
    switch(status) {
      case 'Applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Interview': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Offer': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-[#1A1A1A] text-[#A1A1AA] border-[#1F1F1F]';
    }
  };

  return (
    <div 
      onMouseEnter={checkOverflow}
      className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-[linear-gradient(145deg,#121212,rgba(239,68,68,0.05))] hover:border-[rgba(239,68,68,0.5)] hover:shadow-[0_0_10px_rgba(239,68,68,0.25),0_0_20px_rgba(239,68,68,0.15),0_0_30px_rgba(239,68,68,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:scale-[1.01] flex flex-col group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
           <div className="w-12 h-12 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl flex items-center justify-center flex-shrink-0 text-[#EF4444] group-hover:bg-[#EF4444] group-hover:text-white group-hover:shadow-[0_0_12px_rgba(239,68,68,0.6)] transition-all duration-300">
             <Building2 className="w-6 h-6" />
           </div>
           <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
             <h3 
               ref={titleRef}
               style={{ animationDelay: '0.5s' }}
               className={`text-[18px] font-black text-gray-100 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-[4000ms] ease-linear inline-block max-w-full ${isOverflowing ? 'group-hover:overflow-visible group-hover:animate-[marquee_4s_linear_infinite_alternate]' : ''}`}
             >
               {app.title}
             </h3>
             <p className="text-[14px] font-semibold text-[#A1A1AA] mt-0.5 truncate">{app.company}</p>
           </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(app.status)} shadow-sm flex-shrink-0 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all`}>
           {app.status.toUpperCase()}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-6">
        {app.location && <span className="flex items-center gap-1 bg-[#1A1A1A] border border-[#1F1F1F] px-2 py-1 rounded-md text-[#A1A1AA]"><MapPin className="w-3.5 h-3.5" />{app.location}</span>}
        {app.salary && <span className="flex items-center gap-1 bg-[#1A1A1A] border border-[#1F1F1F] px-2 py-1 rounded-md text-[#A1A1AA]"><DollarSign className="w-3.5 h-3.5" />{app.salary}</span>}
      </div>

      <div className="border-t border-[#1F1F1F] pt-5 mt-auto flex items-center justify-between">
         <div className="flex gap-2">
            {statuses.map(s => (
               <button 
                 key={s}
                 onClick={() => updateStatus(app.id, s)}
                 className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${app.status === s ? getStatusColor(s) : 'bg-[#121212] border-[#1F1F1F] text-[#6B7280] hover:border-[#EF4444] hover:text-[#EF4444]'}`}
               >
                 {s}
               </button>
            ))}
         </div>
         <button onClick={() => setExpanded(!expanded)} className="text-sm font-bold text-[#6B7280] group-hover:text-[#EF4444] group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] hover:text-[#DC2626] flex items-center gap-1 transition-all">
            {expanded ? 'Hide Timeline' : 'View Timeline'}
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
         </button>
      </div>

      {expanded && (
         <div className="mt-5 bg-[#0B0B0B] rounded-xl p-5 border border-[#1F1F1F] animate-in fade-in slide-in-from-top-2">
            <h4 className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Application History
            </h4>
            <div className="space-y-4">
               {app.timeline.map((event: any, idx: number) => (
                 <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                       <div className={`w-2.5 h-2.5 rounded-full ${idx === app.timeline.length - 1 ? 'bg-[#EF4444] ring-4 ring-[#EF4444]/20' : 'bg-[#333]'}`} />
                       {idx !== app.timeline.length - 1 && <div className="w-0.5 h-full bg-[#1F1F1F] mt-2" />}
                    </div>
                    <div className="-mt-1.5">
                       <p className="text-[13px] font-bold text-white">{event.status}</p>
                       <p className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1 mt-0.5">
                         <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleString()}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => deleteApplication(app.id)} className="w-full mt-6 py-2 border border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
               <XCircle className="w-3.5 h-3.5" /> Drop Application
            </button>
         </div>
      )}
    </div>
  );
}
