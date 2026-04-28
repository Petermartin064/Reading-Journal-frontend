import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Flame, Calendar as CalendarIcon, BookOpen, Library } from 'lucide-react';
import { fetchClient } from '../api/fetchClient';
import ProgressRing from '../components/ProgressRing';
import SessionCard from '../components/SessionCard';
import ActiveSessionBanner from '../components/ActiveSessionBanner';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Book Selection Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [startPage, setStartPage] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [scheduleRes, summaryRes, activeRes, booksRes] = await Promise.all([
        fetchClient('/schedule/today/'),
        fetchClient('/dashboard/summary/'),
        fetchClient('/sessions/active/'),
        fetchClient('/books/'),
      ]);
      if (scheduleRes?.status === 'success') setSchedules(scheduleRes.data);
      if (summaryRes?.status === 'success') setSummary(summaryRes.data);
      if (activeRes?.status === 'success') setActiveSession(activeRes.data);
      if (booksRes) setBooks(booksRes);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStartSession = (session) => {
    setPendingSession(session);
    // Filter books by category
    const relevantBooks = books.filter(b => b.category === session.session_type && b.status !== 'Completed');
    if (relevantBooks.length > 0) {
      setSelectedBookId(relevantBooks[0].id);
      setStartPage(relevantBooks[0].current_page);
    }
    setShowBookModal(true);
  };

  const confirmStartSession = async () => {
    try {
      const res = await fetchClient('/sessions/start/', {
        method: 'POST',
        body: JSON.stringify({
          session_type: pendingSession.session_type,
          schedule_id: pendingSession.id,
          book_id: selectedBookId || null,
          start_page: startPage ? parseInt(startPage) : null,
        }),
      });
      if (res?.status === 'success') {
        setActiveSession(res.data);
        setShowBookModal(false);
        setPendingSession(null);
      }
    } catch (e) {
      console.error('Failed to start session:', e);
    }
  };

  const handleSessionEnd = () => {
    setActiveSession(null);
    // Refresh summary stats after ending
    fetchClient('/dashboard/summary/').then(res => {
      if (res?.status === 'success') setSummary(res.data);
    });
  };

  const getNextSessionIndex = () => {
    if (!schedules.length) return -1;
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < schedules.length; i++) {
      const [h, m] = schedules[i].start_time.split(':');
      const sessionMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
      if (sessionMinutes > currentTotalMinutes) return i;
    }
    return -1;
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
  const nextSessionIndex = getNextSessionIndex();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-serif text-text-primary mb-1">
            {getGreeting()}, {user?.username}.
          </h1>
          <p className="text-text-muted font-medium flex items-center gap-2 text-sm">
            <CalendarIcon size={15} />
            {today}
          </p>
        </div>
      </header>

      {/* Active Session Banner */}
      {activeSession && (
        <ActiveSessionBanner session={activeSession} onSessionEnd={handleSessionEnd} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Schedule Column */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-sm font-serif font-bold text-text-primary flex items-center gap-2 tracking-wide uppercase">
            <BookOpen size={15} className="text-primary" />
            Today's Schedule
          </h2>

          {schedules.length === 0 ? (
            <div className="surface-card p-12 text-center border-dashed border-2 bg-transparent">
              <BookOpen className="w-10 h-10 mx-auto text-text-muted mb-4 opacity-40" />
              <p className="text-text-muted font-medium">No sessions scheduled for today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {schedules.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isNext={index === nextSessionIndex}
                  hasActiveSession={!!activeSession}
                  onStartSession={handleStartSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Currently Reading Widget */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-text-primary flex items-center gap-2 tracking-wide uppercase">
              <Library size={15} className="text-primary" />
              On the Shelf
            </h2>
            <Link to="/app/bookshelf" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {books.filter(b => b.status === 'Reading' || b.status === 'ToRead').length > 0 ? (
              books.filter(b => b.status === 'Reading' || b.status === 'ToRead').slice(0, 3).map(book => (
                <div key={book.id} className="surface-card p-4 bg-surface/80 border-l-2 border-l-primary hover:shadow-md transition-shadow cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary">{book.category}</p>
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-border/20 text-text-muted">
                      {book.status === 'ToRead' ? 'Not Started' : 'Reading'}
                    </span>
                  </div>
                  <h3 className="text-sm font-serif text-text-primary font-bold line-clamp-1">{book.title}</h3>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-text-muted">
                      <span>Progress</span>
                      <span>{book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0}%</span>
                    </div>
                    <div className="h-1 bg-surface-border/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${book.total_pages > 0 ? (book.current_page / book.total_pages) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Link to="/app/bookshelf" className="surface-card p-6 text-center bg-surface/40 border-dashed border-2 block hover:bg-surface/60 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">No active books</p>
                <p className="text-[9px] text-primary font-bold uppercase mt-1">Pick one from shelf</p>
              </Link>
            )}
          </div>

          <h2 className="text-sm font-serif font-bold text-text-primary flex items-center gap-2 tracking-wide uppercase pt-4">
            <Flame size={15} className="text-primary" />
            Daily Progress
          </h2>

          <div className="surface-card p-8 flex flex-col items-center bg-surface/80">
            <div className="relative mb-8">
              <ProgressRing
                radius={75}
                stroke={8}
                progress={summary?.daily_progress || 0}
                label="Complete"
              />
              <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm rotate-12">
                DAILY
              </div>
            </div>

            <div className="w-full space-y-1">
              <div className="flex justify-between items-center py-4 border-b border-surface-border/50 border-dashed">
                <span className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Weekly Aggregate</span>
                <span className="text-lg font-serif text-text-primary">{summary?.weekly_hours || 0} <span className="text-xs italic">hrs</span></span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-surface-border/50 border-dashed">
                <span className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Career Log</span>
                <span className="text-lg font-serif text-text-primary">{summary?.career_hours_today || 0} <span className="text-xs italic">hrs</span></span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-surface-border/50 border-dashed">
                <span className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Self-Dev Log</span>
                <span className="text-lg font-serif text-text-primary">{summary?.self_dev_hours_today || 0} <span className="text-xs italic">hrs</span></span>
              </div>
              <div className="pt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                  <Flame size={16} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
                    {summary?.current_streak || 0} Day Streak
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Book Selection Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-surface-border">
              <h2 className="text-xl font-serif text-text-primary">Prepare your Session</h2>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-1">What are we reading today?</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Select Book from Shelf</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {books.filter(b => b.status !== 'Completed').length > 0 ? (
                    <>
                      {/* Matching category */}
                      {books.filter(b => b.category === pendingSession?.session_type && b.status !== 'Completed').map(book => (
                        <button
                          key={book.id}
                          onClick={() => {
                            setSelectedBookId(book.id);
                            setStartPage(book.current_page);
                          }}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            selectedBookId === book.id 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                              : 'border-surface-border hover:border-text-primary/30 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-text-primary truncate">{book.title}</p>
                            <span className="text-[8px] font-bold uppercase px-1 rounded bg-primary/10 text-primary">Match</span>
                          </div>
                          <p className="text-[10px] text-text-muted italic">by {book.author} • Page {book.current_page}</p>
                        </button>
                      ))}
                      
                      {/* Other categories */}
                      {books.filter(b => b.category !== pendingSession?.session_type && b.status !== 'Completed').length > 0 && (
                        <div className="mt-2 mb-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted px-1">Other Categories</p>
                        </div>
                      )}
                      {books.filter(b => b.category !== pendingSession?.session_type && b.status !== 'Completed').map(book => (
                        <button
                          key={book.id}
                          onClick={() => {
                            setSelectedBookId(book.id);
                            setStartPage(book.current_page);
                          }}
                          className={`text-left p-3 rounded-xl border transition-all opacity-70 hover:opacity-100 ${
                            selectedBookId === book.id 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                              : 'border-surface-border hover:border-text-primary/30 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-text-primary truncate">{book.title}</p>
                            <span className="text-[8px] font-bold uppercase px-1 rounded bg-surface-border/30 text-text-muted">{book.category}</span>
                          </div>
                          <p className="text-[10px] text-text-muted italic">by {book.author} • Page {book.current_page}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <Link to="/app/bookshelf" className="text-center py-6 border-2 border-dashed border-surface-border rounded-xl hover:bg-surface/30 transition-colors">
                      <p className="text-xs text-text-muted">No books on your shelf.</p>
                      <p className="text-[10px] text-primary font-bold uppercase mt-1">Add one to your library</p>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setSelectedBookId('');
                      setStartPage('');
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedBookId === '' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-surface-border hover:border-text-primary/30 bg-white'
                    }`}
                  >
                    <p className="text-sm font-bold text-text-primary">Ad-hoc Reading</p>
                    <p className="text-[10px] text-text-muted italic">No specific book tracking</p>
                  </button>
                </div>
              </div>

              {selectedBookId && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Starting Page</label>
                  <input
                    type="number"
                    className="input-field py-2 text-sm"
                    value={startPage}
                    onChange={e => setStartPage(e.target.value)}
                    placeholder="Where are you starting?"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartSession}
                  className="flex-1 bg-text-primary text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-md shadow-primary/20"
                >
                  Begin Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
