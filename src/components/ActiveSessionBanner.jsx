import React, { useState, useEffect } from 'react';
import { Square, Play, Pause, AlertTriangle, RefreshCcw } from 'lucide-react';
import { fetchClient } from '../api/fetchClient';

const formatElapsed = (session) => {
  if (!session?.started_at) return '00:00:00';
  
  const startTime = new Date(session.started_at).getTime();
  const now = Date.now();
  let diff = Math.floor((now - startTime) / 1000);
  
  let totalPaused = session.total_paused_seconds || 0;
  if (session.is_paused && session.last_paused_at) {
    const pauseTime = new Date(session.last_paused_at).getTime();
    totalPaused += Math.floor((now - pauseTime) / 1000);
  }
  
  diff = Math.max(0, diff - totalPaused);
  
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ActiveSessionBanner = ({ session, onSessionEnd, onSessionUpdate }) => {
  const [elapsed, setElapsed] = useState(formatElapsed(session));
  const [notes, setNotes] = useState('');
  const [endPage, setEndPage] = useState('');
  const [stopping, setStopping] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (session.last_heartbeat_at) {
      const hbTime = new Date(session.last_heartbeat_at).getTime();
      if (Date.now() - hbTime > 300000) { // 5 minutes
        setIsStale(true);
      }
    }
  }, [session.last_heartbeat_at]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(formatElapsed(session));
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    const hbTimer = setInterval(() => {
      if (!session.is_paused && !isStale) {
        fetchClient('/sessions/heartbeat/', { method: 'POST' }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(hbTimer);
  }, [session.is_paused, isStale]);

  const handleRecover = async () => {
    try {
      await fetchClient('/sessions/heartbeat/', { method: 'POST' });
      setIsStale(false);
      const res = await fetchClient('/sessions/active/');
      if (res?.status === 'success') onSessionUpdate(res.data);
    } catch (e) {
      console.error('Failed to recover session:', e);
    }
  };

  const handleEndStale = async () => {
    setStopping(true);
    try {
      await fetchClient('/sessions/end/', {
        method: 'POST',
        body: JSON.stringify({ 
          end_time: session.last_heartbeat_at,
          notes: 'Session recovered after interruption.'
        }),
      });
      onSessionEnd();
    } catch (e) {
      console.error('Failed to end stale session:', e);
    } finally {
      setStopping(false);
    }
  };

  const handleTogglePause = async () => {
    setPausing(true);
    try {
      const endpoint = session.is_paused ? '/sessions/resume/' : '/sessions/pause/';
      const res = await fetchClient(endpoint, { method: 'POST' });
      if (res?.status === 'success') {
        onSessionUpdate(res.data);
      }
    } catch (e) {
      console.error('Failed to toggle pause:', e);
    } finally {
      setPausing(false);
    }
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await fetchClient('/sessions/end/', {
        method: 'POST',
        body: JSON.stringify({ 
          notes,
          end_page: endPage ? parseInt(endPage) : null
        }),
      });
      onSessionEnd();
    } catch (e) {
      console.error('Failed to end session:', e);
    } finally {
      setStopping(false);
    }
  };

  if (isStale) {
    return (
      <div className="surface-card border-l-4 border-l-yellow-500 p-6 mb-8 bg-yellow-50/30 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-500 p-2 rounded-xl text-white shadow-lg shadow-yellow-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-serif text-text-primary font-bold">Session Interrupted</h3>
              <p className="text-sm text-text-muted max-w-md">
                We noticed this session was inactive for a while (maybe a shutdown?). 
                Last known activity was at <span className="font-bold">{new Date(session.last_heartbeat_at).toLocaleTimeString()}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEndStale}
              disabled={stopping}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-all border border-surface-border"
            >
              {stopping ? '...' : 'End at Last Activity'}
            </button>
            <button
              onClick={handleRecover}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
            >
              <RefreshCcw size={14} />
              Resume Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card border-l-4 border-l-primary p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Pulsing live dot */}
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${session.is_paused ? 'bg-yellow-500' : 'bg-primary'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${session.is_paused ? 'bg-yellow-500' : 'bg-primary'}`}></span>
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
              {session.is_paused ? 'Session Paused' : 'Session In Progress'}
            </p>
            <p className="text-text-primary font-serif">
              {session.book ? (
                <>Reading <span className="font-bold">{session.book_title || 'a book'}</span></>
              ) : (
                session.session_type === 'Career' ? 'Career-Specific Reading' : 'Self-Development Reading'
              )}
            </p>
            {session.book && (
              <p className="text-[10px] text-text-muted italic">Started at page {session.start_page}</p>
            )}
          </div>
          <span className={`font-mono text-2xl font-bold pl-4 border-l border-surface-border transition-colors ${session.is_paused ? 'text-text-muted' : 'text-text-primary'}`}>
            {elapsed}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {session.book && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Current Page:</label>
              <input
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                placeholder="..."
                className="w-16 bg-white border border-surface-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          )}
          <button
            onClick={() => setShowNotes(v => !v)}
            className="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors px-3 py-2 rounded-lg border border-surface-border hover:border-primary"
          >
            {showNotes ? 'Close Notes' : 'Add Notes'}
          </button>
          
          <button
            onClick={handleTogglePause}
            disabled={pausing}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all shadow-md ${
              session.is_paused 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-surface border border-surface-border text-text-primary hover:bg-surface-hover'
            }`}
          >
            {session.is_paused ? <Play size={12} fill="white" /> : <Pause size={12} />}
            {pausing ? '...' : (session.is_paused ? 'Resume' : 'Pause')}
          </button>

          <button
            onClick={handleStop}
            disabled={stopping}
            className="flex items-center gap-2 bg-text-primary hover:bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-60"
          >
            <Square size={12} fill="white" />
            {stopping ? 'Closing...' : 'End Session'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-4 pt-4 border-t border-surface-border/50 border-dashed">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down what you read, key insights, or favorite quotes..."
            rows={3}
            className="input-field text-sm resize-none bg-white/50"
          />
        </div>
      )}
    </div>
  );
};

export default ActiveSessionBanner;
