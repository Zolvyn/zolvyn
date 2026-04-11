const SUPABASE_URL = 'https://bgtaxwcqnjkpwzutgyzm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qnhYzUAlIwn5irmpHV-L_Q_eC9Ad0Al';

// ─── CORE HELPERS ───────────────────────────
async function supabaseInsert(table: string, data: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=representation' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json[0] || null;
  } catch { return null; }
}

async function supabaseUpdate(table: string, id: string, data: Record<string, any>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify(data),
    });
  } catch {}
}

async function supabaseSelect(table: string, params: string = '') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: 'GET',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function supabaseRpc(fn: string, body: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ─── USER FUNCTIONS (unchanged) ─────────────
export function getStoredUser(): { id: string; name: string } | null {
  if (typeof window === 'undefined') return null;
  try { const raw = localStorage.getItem('zolvyn_user'); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

export function storeUser(user: { id: string; name: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('zolvyn_user', JSON.stringify(user));
}

export async function createUser(name: string) {
  const user = await supabaseInsert('users', { name });
  if (!user) return null;
  const stored = { id: user.id, name: user.name };
  storeUser(stored);
  return stored;
}

export async function updateLastSeen(userId: string) {
  await supabaseUpdate('users', userId, { last_seen: new Date().toISOString() });
}

export async function trackEvent(eventType: string, page: string, query?: string) {
  const user = getStoredUser();
  if (!user) return;
  await supabaseInsert('events', { user_id: user.id, event_type: eventType, page, query: query || null });
}

export async function trackPageVisit(page: string) {
  await trackEvent('page_visit', page);
  const user = getStoredUser();
  if (user) await updateLastSeen(user.id);
}

export async function trackQuery(page: string, query: string) {
  await trackEvent('query', page, query);
}

// ─── BLOG FUNCTIONS (new) ───────────────────
export interface BlogPost {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  excerpt: string;
  date: string;
  read_time: number;
  likes: number;
  created_at?: string;
}

/** Fetch all blog posts, newest first */
export async function getBlogs(): Promise<BlogPost[]> {
  const data = await supabaseSelect('blogs', 'order=created_at.desc&limit=100');
  return data || [];
}

/** Insert a new blog post */
export async function createBlog(post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost | null> {
  return await supabaseInsert('blogs', post);
}

/** Increment likes by 1 using a Postgres RPC function */
export async function likeBlog(id: string): Promise<void> {
  await supabaseRpc('increment_blog_likes', { blog_id: id });
}