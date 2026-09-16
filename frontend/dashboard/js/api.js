window.PortfolioAPI = (function () {
  const TOKEN_KEY = 'portfolio_admin_token';
  const USER_KEY = 'portfolio_admin_user';
  const THEME_KEY = 'portfolio_admin_theme';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function logout() {
    clearAuth();
    window.location.href = '/dashboard/login.html';
  }

  function redirectToLogin() {
    clearAuth();
    window.location.href = '/dashboard/login.html';
  }

  async function request(method, url, body, isForm) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const opts = { method, headers };
    if (body !== undefined) {
      if (isForm) {
        opts.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }

    const res = await fetch(url, opts);
    if (res.status === 401) {
      clearAuth();
      window.location.href = '/dashboard/login.html';
      throw new Error('Session expired. Please sign in again.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  function formData(field, file, payload) {
    const fd = new FormData();
    if (file) fd.append(field, file);
    if (payload) {
      Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if (Array.isArray(value)) {
          value.forEach((v) => fd.append(key, v));
        } else if (value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });
    }
    return fd;
  }

  return {
    getToken,
    getUser,
    setAuth,
    clearAuth,
    logout,
    redirectToLogin,
    get THEME_KEY() { return THEME_KEY; },

    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    del: (url) => request('DELETE', url),

    postForm: (url, field, file, payload) =>
      request('POST', url, formData(field, file, payload), true),
    putForm: (url, field, file, payload) =>
      request('PUT', url, formData(field, file, payload), true)
  };
})();