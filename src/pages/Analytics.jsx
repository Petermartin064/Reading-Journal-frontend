import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchClient } from '../api/fetchClient';
import { TrendingUp, BookOpen, Clock, Layers } from 'lucide-react';

const COLORS = { career: '#D46242', self_dev: '#4F9E6F' };

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="surface-card p-5 flex items-center gap-4">
    <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
      <Icon size={20} className="text-primary" />
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted font-medium">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-surface-border rounded-xl shadow-soft p-3 text-sm">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}h
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('daily'); // 'daily' | 'weekly'

  useEffect(() => {
    fetchClient('/analytics/weekly/')
      .then(res => { if (res?.status === 'success') setData(res.data); })
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

  const chartData = view === 'daily' ? data?.daily_chart : data?.weekly_chart;
  const xKey = view === 'daily' ? 'day' : 'week';

  const pieData = [
    { name: 'Career', value: data?.total_career_hours || 0 },
    { name: 'Self-Dev', value: data?.total_self_dev_hours || 0 },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-text-primary mb-1">Analytics</h1>
        <p className="text-text-muted text-sm">Your reading performance at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock} label="Total Career Hours" value={`${data?.total_career_hours || 0}h`} />
        <StatCard icon={BookOpen} label="Total Self-Dev Hours" value={`${data?.total_self_dev_hours || 0}h`} />
        <StatCard icon={Layers} label="Total Sessions" value={data?.total_sessions || 0} />
        <StatCard icon={TrendingUp} label="Total Hours" value={`${((data?.total_career_hours || 0) + (data?.total_self_dev_hours || 0)).toFixed(1)}h`} />
      </div>

      {/* Bar Chart */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-text-primary">Hours Read</h2>
          <div className="flex items-center gap-1 p-1 bg-surface-hover rounded-lg border border-surface-border">
            <button
              onClick={() => setView('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'daily' ? 'bg-surface shadow-sm text-text-primary border border-surface-border' : 'text-text-muted'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setView('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'weekly' ? 'bg-surface shadow-sm text-text-primary border border-surface-border' : 'text-text-muted'}`}
            >
              8 Weeks
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#7C7A77' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#7C7A77' }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="career" name="Career" fill={COLORS.career} radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="self_dev" name="Self-Dev" fill={COLORS.self_dev} radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 justify-center">
          <span className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLORS.career }}></span>
            Career
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: COLORS.self_dev }}></span>
            Self-Development
          </span>
        </div>
      </div>

      {/* Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="font-semibold text-text-primary mb-6">Daily Reading Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.daily_chart}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D46242" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D46242" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7C7A77' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#7C7A77' }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#D46242" strokeWidth={2} fill="url(#colorTotal)" dot={{ r: 4, fill: '#D46242', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-6 flex flex-col items-center">
          <h2 className="font-semibold text-text-primary mb-6 self-start">Category Split</h2>
          {(data?.total_career_hours || 0) + (data?.total_self_dev_hours || 0) === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-muted text-sm text-center">No sessions logged yet.<br />Complete a session to see your split.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  <Cell fill={COLORS.career} />
                  <Cell fill={COLORS.self_dev} />
                </Pie>
                <Tooltip formatter={(v) => `${v}h`} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-text-muted">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
