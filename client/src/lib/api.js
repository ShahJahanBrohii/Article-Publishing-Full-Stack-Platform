const base = () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function postJson(path, body) {
  const url = `${base()}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Newsletter / Morning Briefing — POST /api/subscribe; local fallback */
export async function subscribeEmail(email, source = 'newsletter') {
  const trimmed = email.trim();
  if (!trimmed) return { ok: false, error: 'Email is required' };

  try {
    const res = await postJson('/api/subscribe', { email: trimmed, source });
    if (res.ok) return { ok: true, remote: true };
  } catch {
    /* use local */
  }

  try {
    const key = 'crwj_newsletter_subscribers';
    const raw = localStorage.getItem(key) || '[]';
    const arr = JSON.parse(raw);
    if (!arr.some((x) => x.email === trimmed)) {
      arr.push({ email: trimmed, source, at: new Date().toISOString() });
    }
    localStorage.setItem(key, JSON.stringify(arr));
    return { ok: true, local: true };
  } catch {
    return { ok: false, error: 'Could not save subscription.' };
  }
}

/** Contact — POST /api/contact; local fallback if offline or server error */
export async function submitContact(payload) {
  try {
    const res = await postJson('/api/contact', payload);
    if (res.ok) return { ok: true, remote: true };
  } catch {
    /* fall through to local */
  }

  try {
    const key = 'crwj_contact_messages';
    const raw = localStorage.getItem(key) || '[]';
    const arr = JSON.parse(raw);
    arr.push({ ...payload, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
    return { ok: true, local: true };
  } catch {
    return { ok: false, error: 'Could not send or save your message.' };
  }
}

const commentsKey = (articleId) => `crwj_comments_${articleId}`;

export function loadCommentsLocal(articleId) {
  try {
    const raw = localStorage.getItem(commentsKey(articleId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCommentsLocal(articleId, comments) {
  localStorage.setItem(commentsKey(articleId), JSON.stringify(comments));
}

/** GET /api/articles/:id/comments */
export async function fetchComments(articleId) {
  try {
    const res = await fetch(`${base()}/api/articles/${articleId}/comments`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : data.comments || [];
    }
  } catch {
    /* ignore */
  }
  return loadCommentsLocal(articleId);
}

/** POST /api/articles/:id/comments body: { body, author? } */
export async function postComment(articleId, { body, author }) {
  const payload = {
    body: body.trim(),
    author: (author || 'Reader').trim() || 'Reader',
  };

  try {
    const res = await postJson(`/api/articles/${articleId}/comments`, payload);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const c = data?.comment ?? data;
      if (c && (c.body || c.text)) {
        return {
          ok: true,
          comment: {
            id: c.id ?? `srv-${Date.now()}`,
            author: c.author ?? payload.author,
            body: c.body ?? c.text,
            createdAt: c.createdAt ?? c.created_at ?? new Date().toISOString(),
          },
        };
      }
      return { ok: true };
    }
  } catch {
    /* local */
  }

  const list = loadCommentsLocal(articleId);
  const comment = {
    id: `local-${Date.now()}`,
    body: payload.body,
    author: payload.author,
    createdAt: new Date().toISOString(),
  };
  list.push(comment);
  saveCommentsLocal(articleId, list);
  return { ok: true, comment, local: true };
}
