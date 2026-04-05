'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://bgtaxwcqnjkpwzutgyzm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qnhYzUAlIwn5irmpHV-L_Q_eC9Ad0Al';

async function fetchTable(table: string, query = '') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    return await res.json();
  } catch { return []; }
}

interface User { id: string; name: string; created_at: string; last_seen: string; }
interface Event { id: string; user_id: string; event_type: string; page: string; query: string; created_at: string; }

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events'>('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    const [u, e] = await Promise.all([
      fetchTable('users', 'select=*'),
      fetchTable('events', 'select=*&limit=200'),
    ]);
    setUsers(u || []);
    setEvents(e || []);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Stats
  const totalUsers = users.length;
  const today = new Date().toDateString();
  const todayUsers = users.filter(u => new Date(u.created_at).toDateString() === today).length;
  const todayEvents = events.filter(e => new Date(e.created_at).toDateString() === today).length;
  const totalQueries = events.filter(e => e.event_type === 'query').length;
  const pageStats = events.reduce((acc: Record<string, number>, e) => { if (e.page) acc[e.page] = (acc[e.page] || 0) + 1; return acc; }, {});
  const topPages = Object.entries(pageStats).sort((a, b) => b[1] - a[1]);
  const activeToday = users.filter(u => new Date(u.last_seen).toDateString() === today).length;

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        .tab:hover{color:#e8eaf0 !important}
        .row:hover{background:rgba(255,255,255,0.02) !important}
      `}</style>

      {/* TOPBAR */}
      <div style={{ height: '60px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/landing" style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '16px', letterSpacing: '0.22em', color: '#e8eaf0', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 2px', boxShadow: '0 0 6px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
          </a>
          <div style={{ width: '1px', height: '16px', background: '#2a3347' }}></div>
          <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: 400 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          <button onClick={load} disabled={loading} style={{ padding: '7px 16px', borderRadius: '7px', background: loading ? '#1e2535' : 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: loading ? '#4a5568' : '#000', fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            {loading ? '⏳ Loading…' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users', value: totalUsers, color: '#7eb8f7', icon: '👥' },
            { label: 'New Today', value: todayUsers, color: '#4caf82', icon: '🆕' },
            { label: 'Active Today', value: activeToday, color: '#e8c96d', icon: '⚡' },
            { label: 'Total Queries', value: totalQueries, color: '#c9a84c', icon: '💬' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</span>
                <span style={{ fontSize: '18px' }}>{stat.icon}</span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '40px', fontWeight: 300, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* SECONDARY STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {/* Top Pages */}
          <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '22px 24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8eaf0', marginBottom: '18px' }}>📊 Page Activity</div>
            {topPages.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#4a5568' }}>No page data yet</div>
            ) : topPages.map(([page, count]) => (
              <div key={page} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                  <span style={{ color: '#9aa3b2', fontWeight: 300 }}>/{page}</span>
                  <span style={{ color: '#e8c96d', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px' }}>{count}</span>
                </div>
                <div style={{ height: '3px', background: '#1e2535', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((count / (topPages[0]?.[1] || 1)) * 100, 100)}%`, background: 'linear-gradient(90deg,#c9a84c,#e8c96d)', borderRadius: '2px' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Events today */}
          <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '22px 24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8eaf0', marginBottom: '18px' }}>⚡ Today's Activity</div>
            {[
              { label: 'Page visits', value: events.filter(e => e.event_type === 'page_visit' && new Date(e.created_at).toDateString() === today).length, color: '#7eb8f7' },
              { label: 'Queries sent', value: events.filter(e => e.event_type === 'query' && new Date(e.created_at).toDateString() === today).length, color: '#4caf82' },
              { label: 'Total events', value: todayEvents, color: '#e8c96d' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e2535' }}>
                <span style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}>{item.label}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 300, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e2535', marginBottom: '24px', gap: '0' }}>
          {(['overview', 'users', 'events'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="tab" style={{ padding: '10px 20px', fontSize: '13px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #c9a84c' : '2px solid transparent', color: activeTab === tab ? '#e8c96d' : '#9aa3b2', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: activeTab === tab ? 500 : 300, marginBottom: '-1px', textTransform: 'capitalize' }}>
              {tab === 'overview' ? '📋 Overview' : tab === 'users' ? `👥 Users (${totalUsers})` : `⚡ Events (${events.length})`}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>

          {activeTab === 'overview' && (
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300, lineHeight: 2 }}>
                <div>📅 Dashboard last updated: <strong style={{ color: '#e8eaf0' }}>{lastRefresh.toLocaleString()}</strong></div>
                <div>👥 Total registered users: <strong style={{ color: '#7eb8f7' }}>{totalUsers}</strong></div>
                <div>🆕 New users today: <strong style={{ color: '#4caf82' }}>{todayUsers}</strong></div>
                <div>⚡ Active users today: <strong style={{ color: '#e8c96d' }}>{activeToday}</strong></div>
                <div>💬 Total queries sent: <strong style={{ color: '#c9a84c' }}>{totalQueries}</strong></div>
                <div>📊 Total events tracked: <strong style={{ color: '#e8eaf0' }}>{events.length}</strong></div>
                <div>🏆 Most visited page: <strong style={{ color: '#e8eaf0' }}>/{topPages[0]?.[0] || 'none'}</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', background: '#111520', borderBottom: '1px solid #1e2535', fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                <span>Name</span><span>Joined</span><span>Last Seen</span><span>Queries</span>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>Loading…</div>
              ) : users.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No users yet</div>
              ) : users.map((user, i) => {
                const userQueries = events.filter(e => e.user_id === user.id && e.event_type === 'query').length;
                return (
                  <div key={user.id} className="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < users.length - 1 ? '1px solid #1e2535' : 'none', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>{user.name[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 400 }}>{user.name}</span>
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#9aa3b2', fontFamily: "'JetBrains Mono',monospace" }}>{formatDate(user.created_at)}</span>
                    <span style={{ fontSize: '12px', color: '#4a5568' }}>{timeAgo(user.last_seen)}</span>
                    <span style={{ fontSize: '13px', color: '#e8c96d', fontFamily: "'JetBrains Mono',monospace" }}>{userQueries} queries</span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', padding: '12px 20px', background: '#111520', borderBottom: '1px solid #1e2535', fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                <span>Type</span><span>Page</span><span>Query</span><span>Time</span>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>Loading…</div>
              ) : events.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No events yet</div>
              ) : events.slice(0, 100).map((event, i) => (
                <div key={event.id} className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', padding: '12px 20px', borderBottom: i < events.length - 1 ? '1px solid #1e2535' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', width: 'fit-content', background: event.event_type === 'query' ? 'rgba(76,175,130,0.1)' : 'rgba(126,184,247,0.1)', color: event.event_type === 'query' ? '#4caf82' : '#7eb8f7', border: `1px solid ${event.event_type === 'query' ? 'rgba(76,175,130,0.25)' : 'rgba(126,184,247,0.25)'}` }}>{event.event_type}</span>
                  <span style={{ fontSize: '12.5px', color: '#9aa3b2', fontFamily: "'JetBrains Mono',monospace' " }}>/{event.page || '-'}</span>
                  <span style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.query || '—'}</span>
                  <span style={{ fontSize: '11.5px', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>{timeAgo(event.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}