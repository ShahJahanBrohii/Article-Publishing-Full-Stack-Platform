import { API_URL } from './AdminAuthContext';

function token() {
  return sessionStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`,
  };
}

async function req(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Articles ─────────────────────────────────────────────────────────────

export const createArticle  = (body)   => req('POST', '/api/articles', body);
export const updateArticle  = (id, b)  => req('PUT', `/api/articles/${id}`, b);
export const deleteArticle  = (id)     => req('DELETE', `/api/articles/${id}`);
export const togglePublish  = (id)     => req('PUT', `/api/articles/${id}/publish`);

// ─── Subscribers ──────────────────────────────────────────────────────────
export const getSubscribers    = (q = '') => req('GET', `/api/subscribers?${q}`);
export const deleteSubscriber  = (id)     => req('DELETE', `/api/subscribers/${id}`);
export const exportSubscribers = () => {
  const a = document.createElement('a');
  a.href = `${API_URL}/api/subscribers/export?token=${token()}`;
  a.download = 'subscribers.csv';
  a.click();
};

// ─── Messages ─────────────────────────────────────────────────────────────
export const getMessages   = (q = '') => req('GET', `/api/messages?${q}`);
export const getMessage    = (id)     => req('GET', `/api/messages/${id}`);
export const markRead      = (id)     => req('PUT', `/api/messages/${id}/read`);
export const deleteMessage = (id)     => req('DELETE', `/api/messages/${id}`);

// ─── Home Content ─────────────────────────────────────────────────────────
export const getHomeContent    = () =>      req('GET', '/api/home');
export const updateHomeContent = (body) =>  req('PUT', '/api/home', body);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const changePassword = (body) => req('PUT', '/api/auth/password', body);


// export const getArticles    = (q = '') => req('GET', `/api/articles?${q}`);
// export const getArticle     = (id)     => req('GET', `/api/articles/${id}`);


export const getArticles = ()=>{
const res = fetch(`${API_URL}/api/general`).then(res => res.json())
return res
}

export const getArticle  = (id)=>{
  const res = fetch(`${API_URL}/api/general/${id}`).then(res => res.json())
  return res
}