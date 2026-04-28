import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

const isSessionNowOrPast = (startTimeStr) => {
  const [h, m] = startTimeStr.split(':');
  const now = new Date();
  const sessionStart = new Date();
  sessionStart.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return now >= sessionStart;
};

const SessionCard = ({ session, isNext, hasActiveSession, onStartSession }) => {
  const canStart = !hasActiveSession && isSessionNowOrPast(session.start_time);

  return (
    <div className={`surface-card p-6 flex flex-col h-full transition-all duration-300 group hover:-translate-y-1 ${isNext ? 'ring-2 ring-primary bg-surface/95' : 'bg-surface/80'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest border ${
            session.session_type === 'Career'
              ? 'bg-amber-100/50 text-amber-800 border-amber-200'
              : 'bg-emerald-100/50 text-emerald-800 border-emerald-200'
          }`}>
            {session.session_type === 'Career' ? 'Career' : 'Self-Dev'}
          </span>
          <h3 className="text-2xl font-serif text-text-primary tracking-tight group-hover:text-primary transition-colors">
            {formatTime(session.start_time)}
          </h3>
          <p className="text-xs text-text-muted font-medium uppercase tracking-tighter opacity-60">
            Until {formatTime(session.end_time)}
          </p>
        </div>
        {isNext && !hasActiveSession && (
          <div className="bg-primary/5 p-2 rounded-lg border border-primary/10">
            <CountdownTimer targetTime={session.start_time} />
          </div>
        )}
      </div>

      <p className="text-sm text-text-muted mb-8 flex-grow leading-relaxed italic opacity-80 font-serif">
        "{session.session_type === 'Career'
          ? 'Professional refinement and deep focus on industry-specific knowledge.'
          : 'Personal enrichment through literature and self-improvement guides.'}"
      </p>

      {hasActiveSession ? (
        <div className="flex items-center gap-2 text-text-muted text-[10px] uppercase font-bold tracking-widest py-3 justify-center rounded-xl border border-surface-border bg-surface-hover/50">
          <CheckCircle size={12} className="text-primary animate-pulse" />
          Active elsewhere
        </div>
      ) : (
        <button
          onClick={() => onStartSession(session)}
          disabled={!canStart}
          className={`group/btn w-full mt-auto py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
            canStart 
              ? 'bg-text-primary text-white hover:bg-primary shadow-sm hover:shadow-lg active:scale-95' 
              : 'bg-surface-border text-text-muted opacity-50 cursor-not-allowed'
          }`}
        >
          <Play size={14} className={canStart ? 'group-hover/btn:fill-white' : ''} />
          {canStart ? 'Open Session' : 'Locked'}
        </button>
      )}
    </div>
  );
};

export default SessionCard;
