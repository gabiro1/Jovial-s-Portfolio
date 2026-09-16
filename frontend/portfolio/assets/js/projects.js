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

  loadProjectsPage();
});

/*=============== LOAD PROJECTS ===============*/
async function loadProjectsPage() {
  try {
    const [projects, bio, socialLinks] = await Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/bio').then((r) => r.json()).catch(() => null),
      fetch('/api/social-links').then((r) => r.json()).catch(() => [])
    ]);

    renderProjects(projects);
    renderFooter(bio, socialLinks);

    if (window.ScrollReveal) {
      ScrollReveal().reveal('.project-card', {
        interval: 120,
        origin: 'bottom',
        distance: '30px'
      });
    }
  } catch (error) {
    console.error('Failed to load projects page:', error);
    const grid = document.getElementById('projects-grid');
    if (grid) grid.innerHTML = '<p class="hero__loading">Failed to load projects.</p>';
  }
}

/*=============== RENDER PROJECTS ===============*/
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!projects || projects.length === 0) {
    grid.innerHTML = '<p class="hero__loading">No projects yet.</p>';
    return;
  }

  grid.innerHTML = projects
    .map((p) => {
      const href =
        p.link && p.link !== '#' && p.link !== ''
          ? p.link
          : p.github && p.github !== '#' && p.github !== ''
            ? p.github
            : '#';
      const target = href === '#' ? '' : 'target="_blank" rel="noopener noreferrer"';
      const detailHref = '/projects/' + p._id;
      return (
        '<article class="project-card">' +
          '<a href="' + detailHref + '" class="project-card__media-link">' +
            '<div class="project-card__media">' +
              '<img src="' + (p.image || 'assets/img/shape-circle.svg') + '" ' +
                'alt="' + escapeHtml(p.title) + '" class="project-card__image" loading="lazy" ' +
                'onerror="this.onerror=null;this.style.display=\'none\'" />' +
            '</div>' +
          '</a>' +
          '<div class="project-card__content">' +
            '<a href="' + detailHref + '" class="project-card__title-link">' +
              '<h3 class="project-card__title">' + escapeHtml(p.title) + '</h3>' +
            '</a>' +
            '<p class="project-card__description">' + escapeHtml(p.description || 'A web development project.') + '</p>' +
            '<a href="' + escapeHtml(href) + '" class="project-card__link" ' + target + '>' +
              'View Project <i class="ri-arrow-right-line"></i>' +
            '</a>' +
          '</div>' +
        '</article>'
      );
    })
    .join('');

  const count = document.getElementById('projects-count');
  if (count) {
    count.textContent = projects.length + (projects.length === 1 ? ' project' : ' projects');
  }
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