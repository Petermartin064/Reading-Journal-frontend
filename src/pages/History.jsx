import React, { useEffect, useState } from 'react';
import { fetchClient } from '../api/fetchClient';
import { Clock, BookOpen } from 'lucide-react';

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const History = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient('/sessions/history/')
      .then(res => { if (res?.status === 'success') setSessions(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-text-primary mb-1">Session History</h1>
        <p className="text-text-muted text-sm">Your last {sessions.length} completed reading sessions.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="surface-card p-16 text-center border-dashed border-2 bg-transparent">
          <BookOpen className="w-10 h-10 mx-auto text-text-muted mb-4 opacity-40" />
          <p className="text-text-muted font-medium">No sessions logged yet.</p>
          <p className="text-text-muted text-sm mt-1">Head to the Dashboard and start your first session!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="surface-card p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${
                  session.session_type === 'Career'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">
                    {session.session_type === 'Career' ? 'Career-Specific Reading' : 'Self-Development Reading'}
                  </p>
                  <p className="text-text-muted text-xs mt-1 flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatDateTime(session.started_at)}
                  </p>
                  {session.notes && (
                    <p className="text-text-muted text-xs mt-2 italic bg-surface-hover px-3 py-2 rounded-lg border border-surface-border max-w-md">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-text-primary text-sm">
                  {formatDuration(session.duration_minutes)}
                </span>
                <p className="text-xs text-text-muted mt-1">duration</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
