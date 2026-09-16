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

function projectHref(p) {
  if (p.link && p.link !== '#' && p.link !== '') return p.link;
  if (p.github && p.github !== '#' && p.github !== '') return p.github;
  return '';
}

/*=============== MENU TOGGLE ===============*/
document.addEventListener('DOMContentLoaded', () => {
  const navMenu = document.getElementById('nav-menu'),
        navToggle = document.getElementById('nav-toggle'),
        navClose = document.getElementById('nav-close'),
        navLinks = document.querySelectorAll('.navbar__url');

  if (navToggle) {
    navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
  }
  if (navClose) {
    navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));
  }
  navLinks.forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('show-menu'));
  });

  /*=============== DARK THEME ===============*/
  const themeButton = document.getElementById('theme-toggle');
  const darkTheme = 'dark-theme';
  const iconTheme = 'ri-sun-line';
  const logos = document.querySelectorAll('.logo');

  const selectedTheme = localStorage.getItem('selected-theme');
  const selectedIcon = localStorage.getItem('selected-icon');

  const getCurrentTheme = () =>
    document.body.classList.contains(darkTheme) ? 'dark' : 'light';
  const getCurrentIcon = () =>
    themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line';
  const updateLogo = (isDark) => {
    logos.forEach((l) => {
      l.src = isDark ? 'assets/logo-white.png' : 'assets/logo-black.png';
    });
  };

  if (selectedTheme) {
    const isDark = selectedTheme === 'dark';
    document.body.classList[isDark ? 'add' : 'remove'](darkTheme);
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
    updateLogo(isDark);
  } else {
    const isDarkDefault = document.body.classList.contains(darkTheme);
    if (isDarkDefault) {
      themeButton.classList.remove(iconTheme);
    } else {
      themeButton.classList.add(iconTheme);
    }
    updateLogo(isDarkDefault);
  }

  themeButton.addEventListener('click', () => {
    const isDarkNow = document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
    updateLogo(isDarkNow);
  });

  /*=============== SHOW SCROLL UP BUTTON ===============*/
  const scrollTopBtn = document.getElementById('scroll-top');

  const scrollUp = () => {
    if (window.scrollY >= 350) {
      scrollTopBtn.classList.add('show-scroll');
    } else {
      scrollTopBtn.classList.remove('show-scroll');
    }
  };

  window.addEventListener('scroll', scrollUp, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  loadProject();
});

/*=============== LOAD PROJECT ===============*/
async function loadProject() {
  const pathId = window.location.pathname.split('/').filter(Boolean).pop();
  const wrap = document.querySelector('.project-detail__wrap');

  try {
    const [project, bio, socialLinks] = await Promise.all([
      fetch('/api/projects/' + encodeURIComponent(pathId)).then((r) => {
        if (!r.ok) throw new Error('Project not found');
        return r.json();
      }),
      fetch('/api/bio').then((r) => r.json()).catch(() => null),
      fetch('/api/social-links').then((r) => r.json()).catch(() => [])
    ]);

    renderProject(project);
    renderFooter(bio, socialLinks);

    document.title = project.title + ' | Portfolio';

    if (window.ScrollReveal) {
      ScrollReveal().reveal('.project-detail__hero', { origin: 'bottom', distance: '30px' });
      ScrollReveal().reveal('.project-detail__body', { delay: 150, origin: 'bottom', distance: '30px' });
    }
  } catch (error) {
    console.error(error);
    wrap.innerHTML =
      '<p class="hero__loading">' + escapeHtml(error.message) + '</p>' +
      '<p class="projects-page__count"><a href="/projects" style="color:var(--first-color)">Go back to all projects</a></p>';
  }
}

/*=============== RENDER PROJECT DETAIL ===============*/
function renderProject(p) {
  const wrap = document.querySelector('.project-detail__wrap');
  const href = projectHref(p);

  const techHtml =
    p.technologies && p.technologies.length
      ? '<div class="project-detail__subsection">' +
          '<h3>Technologies</h3>' +
          '<div class="project-detail__tech">' +
          p.technologies
            .filter((t) => t && t.trim())
            .map((t) => '<span class="project-detail__tech-chip">' + escapeHtml(t) + '</span>')
            .join('') +
          '</div></div>'
      : '';

  const buttonsHtml =
    '<div class="project-detail__buttons">' +
      (href
        ? '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" class="project-detail__btn project-detail__btn--primary">' +
            'Visit Live Project <i class="ri-external-link-line"></i></a>'
        : '') +
      (p.github
        ? '<a href="' + escapeHtml(p.github) + '" target="_blank" rel="noopener noreferrer" class="project-detail__btn project-detail__btn--secondary">' +
            'Source Code <i class="ri-github-line"></i></a>'
        : '') +
    '</div>';

  const prevNextHtml =
    '<div class="project-detail__footer">' +
      '<a href="' + (window.history.length > 1 ? 'javascript:history.back()' : '/projects') + '"><i class="ri-arrow-left-s-line"></i> Go back</a>' +
      '<a href="/projects">All Projects <i class="ri-arrow-right-s-line"></i></a>' +
    '</div>';

  wrap.innerHTML =
    '<div class="project-detail__hero">' +
      '<img src="' + (p.image || 'assets/img/shape-circle.svg') + '" alt="' + escapeHtml(p.title) + '" ' +
        'onerror="this.onerror=null;this.style.display=\'none\'" />' +
    '</div>' +
    '<div class="project-detail__body">' +
      '<h1 class="project-detail__title">' + escapeHtml(p.title) + '</h1>' +
      (p.type ? '<span class="project-detail__type">' + escapeHtml(p.type) + '</span>' : '') +
      '<p class="project-detail__description">' + escapeHtml(p.description || 'No description provided yet.') + '</p>' +
      techHtml +
      buttonsHtml +
    '</div>' +
    prevNextHtml;
}

/*=============== RENDER FOOTER ===============*/
function renderFooter(bio, socialLinks) {
  const tagline = document.getElementById('footer-tagline');
  if (bio && bio.tagline) {
    tagline.textContent = bio.tagline;
  } else if (bio && bio.about) {
    tagline.textContent = bio.about.length > 60 ? bio.about.slice(0, 60) + '...' : bio.about;
  }

  const footerSocial = document.getElementById('footer-social');
  const footerLinks = (socialLinks || []).filter((l) => l.position === 'both' || l.position === 'footer');
  footerSocial.innerHTML = footerLinks
    .map(
      (l) =>
        '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener" class="page-footer__social-item">' +
        '<i class="' + escapeHtml(l.iconClass || 'ri-link') + '"></i></a>'
    )
    .join('');

  document.getElementById('copyright-text').textContent =
    '© ' + new Date().getFullYear() + (bio && bio.fullName ? ' ' + bio.fullName : '') + '. All rights reserved.';
}