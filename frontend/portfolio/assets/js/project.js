/*=============== HELPERS ===============*/
function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function api(path) {
  return fetch(path, { headers: { Accept: 'application/json' } }).then((res) => {
    if (!res.ok) throw new Error(path + ' -> ' + res.status);
    return res.json();
  });
}

/*=============== THEME ===============*/
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const icon = btn.querySelector('i');

  const apply = (light) => {
    document.body.classList.toggle('light-theme', light);
    if (icon) icon.className = light ? 'ri-moon-line' : 'ri-sun-line';
  };

  apply(localStorage.getItem('selected-theme') === 'light');

  btn.addEventListener('click', () => {
    const light = !document.body.classList.contains('light-theme');
    apply(light);
    localStorage.setItem('selected-theme', light ? 'light' : 'dark');
  });
}

/*=============== NAV / HEADER ===============*/
function initNav() {
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-toggle');
  const closeBtn = document.getElementById('nav-close');
  if (!menu) return;

  const closeMenu = () => {
    menu.classList.remove('show-menu');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    menu.classList.add('show-menu');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (menu.classList.contains('show-menu')) closeMenu();
      else openMenu();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/*=============== REVEAL ===============*/
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}

/*=============== RENDER PROJECT DETAIL ===============*/
function renderProject(p) {
  const el = document.getElementById('project-content');
  if (!el) return;

  const tech = (p.technologies || []).filter((t) => t && String(t).trim());
  const techHtml = tech.length
    ? '<div class="project-detail-tech">' +
        tech.map((t) => '<span>' + escapeHtml(t) + '</span>').join('') +
      '</div>'
    : '';

  const buttons = [];
  if (p.link && p.link !== '#') {
    buttons.push(
      '<a class="btn btn-primary" href="' + escapeHtml(p.link) +
        '" target="_blank" rel="noopener noreferrer">Live demo <i class="ri-external-link-line"></i></a>'
    );
  }
  if (p.github && p.github !== '#') {
    buttons.push(
      '<a class="btn btn-secondary" href="' + escapeHtml(p.github) +
        '" target="_blank" rel="noopener noreferrer">Source code <i class="ri-github-line"></i></a>'
    );
  }

  const hero = p.image
    ? '<div class="project-detail-hero reveal">' +
        '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.title) + '" ' +
          'onerror="this.onerror=null;this.parentNode.style.display=\'none\'">' +
      '</div>'
    : '';

  el.innerHTML =
    hero +
    '<div class="project-detail-body reveal">' +
      (p.type ? '<span class="eyebrow">' + escapeHtml(p.type) + '</span>' : '') +
      '<h1 class="project-detail-title">' + escapeHtml(p.title) + '</h1>' +
      '<p class="project-detail-desc">' +
        escapeHtml(p.description || 'No description provided yet.') + '</p>' +
      techHtml +
      (buttons.length ? '<div class="project-detail-actions">' + buttons.join('') + '</div>' : '') +
    '</div>' +
    '<div class="project-detail-nav reveal">' +
      '<a href="/#projects"><i class="ri-arrow-left-line"></i> All projects</a>' +
      '<a href="/#contact">Start a project <i class="ri-arrow-right-line"></i></a>' +
    '</div>';

  initReveal();
}

/*=============== FOOTER ===============*/
function renderFooter(bio, socialLinks) {
  if (bio && bio.fullName) {
    const brand = document.getElementById('nav-brand');
    if (brand) brand.textContent = bio.fullName.split(/\s+/)[0].toUpperCase() + '.';
    const footerBrand = document.getElementById('footer-brand');
    if (footerBrand) footerBrand.textContent = bio.fullName;
  }

  const desc =
    (bio && bio.tagline) ||
    (bio && bio.about ? bio.about.slice(0, 90) : '') ||
    'Creating digital experiences that matter.';
  const footerDesc = document.getElementById('footer-desc');
  if (footerDesc) footerDesc.textContent = desc;

  const social = document.getElementById('footer-social');
  if (social) {
    social.innerHTML = (socialLinks || [])
      .filter((l) => l.position === 'both' || l.position === 'footer')
      .map(
        (l) =>
          '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(l.platform) + '</a>'
      )
      .join('');
  }

  const copy = document.getElementById('footer-copy');
  if (copy) {
    copy.textContent =
      '\u00A9 ' + new Date().getFullYear() +
      (bio && bio.fullName ? ' ' + bio.fullName : '');
  }
}

/*=============== LOAD ===============*/
async function loadProject() {
  const id = window.location.pathname.split('/').filter(Boolean).pop();
  const el = document.getElementById('project-content');

  try {
    const [project, bio, socialLinks] = await Promise.all([
      api('/api/projects/' + encodeURIComponent(id)),
      api('/api/bio').catch(() => null),
      api('/api/social-links').catch(() => [])
    ]);

    renderProject(project);
    renderFooter(bio, socialLinks);

    if (project.title) document.title = project.title + ' | Portfolio';
  } catch (error) {
    console.error(error);
    if (el) {
      el.innerHTML =
        '<p class="loading">' + escapeHtml(error.message || 'Project not found') + '</p>';
    }
  }
}

/*=============== INIT ===============*/
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  loadProject();
});
