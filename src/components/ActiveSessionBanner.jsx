import React, { useState, useEffect } from 'react';
import { Square } from 'lucide-react';
import { fetchClient } from '../api/fetchClient';

const formatElapsed = (startedAt) => {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ActiveSessionBanner = ({ session, onSessionEnd }) => {
  const [elapsed, setElapsed] = useState(formatElapsed(session.started_at));
  const [notes, setNotes] = useState('');
  const [endPage, setEndPage] = useState('');
  const [stopping, setStopping] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(formatElapsed(session.started_at));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.started_at]);

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

  return (
    <div className="surface-card border-l-4 border-l-primary p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Pulsing live dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">Session In Progress</p>
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
          <span className="font-mono text-2xl font-bold text-text-primary pl-4 border-l border-surface-border">{elapsed}</span>
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
