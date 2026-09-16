function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTheme();
  setupScrollTop();
  loadSkillsPage();
});

function setupNav() {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');
  if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
  if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));
  document.querySelectorAll('.navbar__url').forEach((l) => {
    l.addEventListener('click', () => navMenu.classList.remove('show-menu'));
  });
}

function setupTheme() {
  const themeButton = document.getElementById('theme-toggle');
  const darkTheme = 'dark-theme';
  const iconTheme = 'ri-sun-line';
  const logos = document.querySelectorAll('.logo');
  const selectedTheme = localStorage.getItem('selected-theme');
  const selectedIcon = localStorage.getItem('selected-icon');
  const updateLogo = (isDark) => logos.forEach((l) => { l.src = isDark ? 'assets/logo-white.png' : 'assets/logo-black.png'; });

  if (selectedTheme) {
    const isDark = selectedTheme === 'dark';
    document.body.classList[isDark ? 'add' : 'remove'](darkTheme);
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
    updateLogo(isDark);
  } else {
    const isDarkDefault = document.body.classList.contains(darkTheme);
    themeButton.classList[isDarkDefault ? 'remove' : 'add'](iconTheme);
    updateLogo(isDarkDefault);
  }

  themeButton.addEventListener('click', () => {
    const isDarkNow = document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', isDarkNow ? 'dark' : 'light');
    localStorage.setItem('selected-icon', themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line');
    updateLogo(isDarkNow);
  });
}

function setupScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show-scroll', window.scrollY >= 350);
  }, { passive: true });
  btn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

async function loadSkillsPage() {
  try {
    const [skills, bio, socialLinks] = await Promise.all([
      fetch('/api/skills').then((r) => r.json()),
      fetch('/api/bio').then((r) => r.json()).catch(() => null),
      fetch('/api/social-links').then((r) => r.json()).catch(() => [])
    ]);

    renderSkills(skills);
    renderFooter(bio, socialLinks);

    if (window.ScrollReveal) {
      ScrollReveal().reveal('.segment', { origin: 'bottom', distance: '50px', duration: 1000, delay: 200, reset: false });
      ScrollReveal().reveal('.expertise__category', { interval: 300, origin: 'bottom' });
    }
  } catch (error) {
    console.error('Failed to load skills:', error);
    document.querySelectorAll('.hero__loading').forEach((el) => { el.textContent = 'Failed to load.'; });
  }
}

function renderSkills(skills) {
  const wrapper = document.getElementById('skills-wrapper');
  if (!skills || skills.length === 0) { wrapper.innerHTML = '<p>No skills added yet.</p>'; return; }
  const categories = ['Development', 'Design'];
  const categoryIcons = { Development: 'ri-braces-line', Design: 'ri-palette-line' };
  wrapper.innerHTML = categories.map((category) => {
    const items = skills.filter((s) => s.category === category);
    if (items.length === 0) return '';
    return '<div class="expertise__category">' +
      '<h3 class="expertise__category-title"><i class="' + categoryIcons[category] + '"></i> ' + category + '</h3>' +
      '<div class="expertise__items">' +
      items.map((s) =>
        '<div class="expertise__item">' +
        '<div class="expertise__icon">' + (s.icon ? '<img src="' + escapeHtml(s.icon) + '" alt="' + escapeHtml(s.name) + ' icon" />' : '<i class="ri-braces-line"></i>') + '</div>' +
        '<h3 class="expertise__name">' + escapeHtml(s.name) + '</h3>' +
        '<span class="expertise__level">' + escapeHtml(s.level) + '</span>' +
        '</div>'
      ).join('') +
      '</div></div>';
  }).join('');
}

function renderFooter(bio, socialLinks) {
  const tagline = document.getElementById('footer-tagline');
  if (bio && bio.tagline) tagline.textContent = bio.tagline;
  else if (bio && bio.about) tagline.textContent = bio.about.length > 60 ? bio.about.slice(0, 60) + '...' : bio.about;
  const footerSocial = document.getElementById('footer-social');
  footerSocial.innerHTML = (socialLinks || []).filter((l) => l.position === 'both' || l.position === 'footer')
    .map((l) => '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener" class="page-footer__social-item"><i class="' + escapeHtml(l.iconClass || 'ri-link') + '"></i></a>').join('');
  document.getElementById('copyright-text').textContent = '© ' + new Date().getFullYear() + (bio && bio.fullName ? ' ' + bio.fullName : '') + '. All rights reserved.';
}