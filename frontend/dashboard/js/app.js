/*=============== DASHBOARD APP ===============*/
(function () {
  window.Pages = window.Pages || {};

  const content = document.getElementById('page-content');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('app-modal');

  /*=============== AUTH GUARD ===============*/
  if (!PortfolioAPI.getToken()) {
    window.location.href = '/dashboard/login.html';
    return;
  }

  PortfolioAPI.get('/api/auth/me')
    .then((data) => {
      const user = data.user || {};
      document.getElementById('user-name').textContent = user.name || 'Admin';
      document.getElementById('user-avatar').textContent = (user.name || 'A').charAt(0).toUpperCase();
    })
    .catch(() => {
      PortfolioAPI.logout();
      window.location.href = '/dashboard/login.html';
    });

  /*=============== SHARED UI HELPERS ===============*/
  window.showToast = function (msg, type) {
    const toast = document.getElementById('toast');
    toast.classList.remove('toast--success', 'toast--error');
    toast.classList.add(type === 'error' ? 'toast--error' : 'toast--success');
    toast.querySelector('i').className = type === 'error' ? 'ri-close-circle-line' : 'ri-check-circle-line';
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  };

  window.showLoading = function (html) {
    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>' + (html || '');
  };

  window.emptyState = function (message) {
    return (
      '<div class="empty"><i class="ri-inbox-line"></i><p>' + message + '</p></div>'
    );
  };

  window.escapeHtml = function (value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  /*=============== MODAL ===============*/
  window.openModal = function (html, wide) {
    modal.className = 'modal' + (wide ? ' modal--wide' : '');
    modal.innerHTML = html;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeModal();
  });

  function makeModal(title, bodyHtml, footerHtml) {
    return (
      '<div class="modal__card">' +
      '<div class="modal__header">' +
      '<h3>' + title + '</h3>' +
      '<button class="modal__close" onclick="closeModal()">&times;</button>' +
      '</div>' +
      '<div class="modal__body">' + bodyHtml + '</div>' +
      (footerHtml ? '<div class="modal__footer">' + footerHtml + '</div>' : '') +
      '</div>'
    );
  }
  window.makeModal = makeModal;

  window.confirmDelete = function (message, onConfirm) {
    const body =
      '<p style="color:var(--text-color);font-size:var(--small-font-size);line-height:1.6">' +
      message + '</p>';
    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--danger" id="modal-confirm-btn"><i class="ri-delete-bin-line"></i> Delete</button>';
    openModal(makeModal('Confirm delete', body, footer));
    document.getElementById('modal-confirm-btn').addEventListener('click', async () => {
      const btn = document.getElementById('modal-confirm-btn');
      btn.disabled = true;
      btn.textContent = 'Deleting...';
      try {
        await onConfirm();
        window.closeModal();
      } catch (error) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';
        window.showToast(error.message, 'error');
      }
    });
  };

  /*=============== SIDEBAR ===============*/
  const toggleSidebar = (force) => {
    const shouldShow = force !== undefined ? force : !sidebar.classList.contains('show');
    sidebar.classList.toggle('show', shouldShow);
    overlay.classList.toggle('show', shouldShow);
  };

  document.getElementById('sidebar-toggle').addEventListener('click', () => toggleSidebar());
  overlay.addEventListener('click', () => toggleSidebar(false));
  document.getElementById('logout-btn').addEventListener('click', () => {
    PortfolioAPI.logout();
  });

  /*=============== THEME TOGGLE ===============*/
  const applyTheme = (isDark) => {
    document.body.classList.toggle('light-theme', !isDark);
    const icon = document.getElementById('theme-icon');
    icon.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
    document.getElementById('sidebar-logo').src = isDark
      ? '/assets/logo-white.png'
      : '/assets/logo-black.png';
    localStorage.setItem(PortfolioAPI.THEME_KEY, isDark ? 'dark' : 'light');
  };

  let isDark = localStorage.getItem(PortfolioAPI.THEME_KEY) !== 'light';
  applyTheme(isDark);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    isDark = !isDark;
    applyTheme(isDark);
  });

  /*=============== UNREAD BADGE ===============*/
  async function refreshUnreadBadge() {
    const badge = document.getElementById('msg-badge');
    try {
      const messages = await PortfolioAPI.get('/api/contact');
      const unread = messages.filter((m) => !m.read).length;
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'grid' : 'none';
    } catch (e) {
      badge.style.display = 'none';
    }
  }
  window.refreshUnreadBadge = refreshUnreadBadge;

  /*=============== IDLE AUTO LOGOUT ===============*/
  let idleTimer = null;
  const idleEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];

  window.__updateIdleTimer = function (minutes, enabled) {
    if (idleTimer) clearTimeout(idleTimer);
    if (enabled !== false && !enabled) return;
    if (!minutes || minutes <= 0) return;
    idleTimer = setTimeout(() => {
      PortfolioAPI.logout();
    }, minutes * 60 * 1000);
  };

  function resetIdle() {
    window.__updateIdleTimer(window.__sessionTimeout, window.__autoLogout);
  }
  idleEvents.forEach((evt) => document.addEventListener(evt, resetIdle, { passive: true }));

  PortfolioAPI.get('/api/settings')
    .then((s) => {
      window.__autoLogout = !!s.autoLogoutEnabled;
      window.__sessionTimeout = s.sessionTimeoutMinutes || 0;
      if (window.__autoLogout) resetIdle();
    })
    .catch(() => {});

  /*=============== ROUTER ===============*/
  function getRoute() {
    const hash = window.location.hash.replace('#', '');
    return window.Pages[hash] ? hash : 'overview';
  }

  function renderRoute() {
    const route = getRoute();
    const page = window.Pages[route];

    document.querySelectorAll('.sidebar__item').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    document.getElementById('page-title').textContent = page.title;

    showLoading();
    page.render(content);
    document.querySelector('.content').scrollTop = 0;
    window.scrollTo(0, 0);
    refreshUnreadBadge();

    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1023) toggleSidebar(false);
  }

  window.addEventListener('hashchange', renderRoute);

  // Initial render
  if (!window.location.hash) {
    window.location.hash = '#overview';
  } else {
    renderRoute();
  }
})();