function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTheme();
  setupScrollTop();
  loadEducationPage();
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

async function loadEducationPage() {
  try {
    const [educations, experiences, bio, socialLinks] = await Promise.all([
      fetch('/api/education').then((r) => r.json()),
      fetch('/api/experience').then((r) => r.json()),
      fetch('/api/bio').then((r) => r.json()).catch(() => null),
      fetch('/api/social-links').then((r) => r.json()).catch(() => [])
    ]);

    renderBackground(educations, experiences);
    renderFooter(bio, socialLinks);

    if (window.ScrollReveal) {
      ScrollReveal().reveal('.segment', { origin: 'bottom', distance: '50px', duration: 1000, delay: 200, reset: false });
      ScrollReveal().reveal('.background__category', { interval: 300, origin: 'left' });
    }
  } catch (error) {
    console.error('Failed to load education:', error);
    document.querySelectorAll('.hero__loading').forEach((el) => { el.textContent = 'Failed to load.'; });
  }
}

function renderBackground(educations, experiences) {
  const wrapper = document.getElementById('background-wrapper');

  const educationHtml =
    '<div class="background__category">' +
    '<h3 class="background__category-title"><i class="ri-graduation-cap-line"></i> Education</h3>' +
    '<div class="background__items">' +
    (educations && educations.length
      ? educations.map((e) =>
          '<div>' +
          '<h3 class="background__item-title">' + escapeHtml(e.degree) + '</h3>' +
          '<span class="background__item-institution">' + escapeHtml(e.institution) + '</span>' +
          '<span class="background__item-duration">' + escapeHtml(e.duration) + '</span>' +
          (e.description ? '<p class="background__item-description">' + escapeHtml(e.description) + '</p>' : '') +
          '</div>'
        ).join('')
      : '<p class="hero__loading">No education entries.</p>') +
    '</div></div>';

  const experienceHtml =
    '<div class="background__category">' +
    '<h3 class="background__category-title"><i class="ri-briefcase-line"></i> Experience</h3>' +
    '<div class="background__items">' +
    (experiences && experiences.length
      ? experiences.map((x) =>
          '<div>' +
          '<h3 class="background__item-title">' + escapeHtml(x.role) + '</h3>' +
          '<span class="background__item-institution">' + escapeHtml(x.company) + '</span>' +
          '<span class="background__item-duration">' + escapeHtml(x.duration) + '</span>' +
          (x.description ? '<p class="background__item-description">' + escapeHtml(x.description) + '</p>' : '') +
          '</div>'
        ).join('')
      : '<p class="hero__loading">No experience entries.</p>') +
    '</div></div>';

  wrapper.innerHTML = educationHtml + experienceHtml;
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