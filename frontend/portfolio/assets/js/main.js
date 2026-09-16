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

/*=============== DYNAMIC PORTFOLIO DATA ===============*/

async function loadPortfolio() {
  try {
    const [bio, projects, socialLinks] =
      await Promise.all([
        fetch('/api/bio').then((r) => r.json()),
        fetch('/api/projects/featured').then((r) => r.json()),
        fetch('/api/social-links').then((r) => r.json())
      ]);

    renderBio(bio, socialLinks);
    renderProjects(projects);
    renderConnectTeaser(bio, socialLinks);
    renderFooter(bio, socialLinks);

    initReveal();
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    document.querySelectorAll('.hero__loading').forEach((el) => {
      el.textContent = 'Failed to load content. Please refresh.';
    });
  }
}

/*=============== RENDER: HERO ===============*/
function renderBio(bio, socialLinks) {
  if (bio) {
    document.title =
      (bio.fullName ? bio.fullName + "'s Portfolio" : 'Portfolio');

    // Hero heading
    const heading = document.getElementById('hero-heading');
    const greeting = bio.greeting || "Hi, I'm";
    const lines = (bio.heroLines || []).filter((l) => l && l.trim());
    let headingHtml = escapeHtml(greeting) + ' ' + escapeHtml(bio.fullName) + ' <br />';
    lines.forEach((line) => {
      headingHtml += escapeHtml(line) + ' <br />';
    });
    heading.innerHTML = headingHtml;

    // Profile image
    const profileImg = document.getElementById('hero-profile-image');
    profileImg.src = bio.profileImage || 'assets/logo-white.png';
    profileImg.alt = bio.fullName + ' profile photo';

    // Biography
    document.getElementById('hero-about').textContent =
      bio.about || 'Hello, welcome to my portfolio.';

    // Contact
    const contactParts = [];
    if (bio.location) contactParts.push(escapeHtml(bio.location));
    if (bio.email) contactParts.push('<a href="mailto:' + escapeHtml(bio.email) + '">' + escapeHtml(bio.email) + '</a>');
    if (bio.phone) contactParts.push(escapeHtml(bio.phone));
    document.getElementById('hero-contact').innerHTML =
      contactParts.join(' <br /> ') || 'Loading...';
  }

  // Hero social links
  const heroSocial = document.getElementById('hero-social-links');
  const heroLinks = (socialLinks || []).filter((l) => l.position === 'both' || l.position === 'hero');
  heroSocial.innerHTML = heroLinks
    .map(
      (l) =>
        '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener" class="hero__social-item">' +
        '<i class="' + escapeHtml(l.iconClass || 'ri-link') + '"></i></a>'
    )
    .join('');
}

/*=============== RENDER: PROJECTS ===============*/
function renderProjects(projects) {
  const grid = document.getElementById('project-grid');
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
}

/*=============== RENDER: CONNECT TEASER ===============*/
function renderConnectTeaser(bio, socialLinks) {
  const details = document.getElementById('connect-details');
  if (!details) return;

  let html = '';

  if (bio && bio.email) {
    html +=
      '<div class="connect__detail">' +
      '<span class="connect__detail-label"> Email </span>' +
      '<a href="mailto:' + escapeHtml(bio.email) + '">' +
      '<span class="connect__detail-value">' + escapeHtml(bio.email) + '</span></a>' +
      '</div>';
  }

  if (bio && bio.whatsapp) {
    const wa = bio.whatsapp.replace(/[^0-9]/g, '');
    html +=
      '<div class="connect__detail">' +
      '<span class="connect__detail-label"> WhatsApp </span>' +
      '<span class="connect__detail-value">' + escapeHtml(bio.whatsapp) + '</span>' +
      '<a href="https://wa.me/' + wa + '" target="_blank" class="connect__action">' +
      'Text me <i class="ri-arrow-right-line"></i></a>' +
      '</div>';
  }

  details.innerHTML = html || '<p class="connect__info-text">No contact info yet.</p>';
}

/*=============== SUBMIT CONTACT FORM (landing) ===============*/
async function submitContact() {
  const feedback = document.getElementById('contact-message');
  const btn = document.getElementById('contact-submit-btn');
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    feedback.textContent = 'Please fill out all fields.';
    feedback.style.color = 'red';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Sending...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send');
    feedback.textContent = 'Message sent successfully!';
    feedback.style.color = 'green';
    document.getElementById('contact-form').reset();
  } catch (error) {
    console.error(error);
    feedback.textContent = error.message || 'Failed to send. Please try again.';
    feedback.style.color = 'red';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Send <i class="ri-send-plane-fill"></i>';
  }
}

/*=============== RENDER: FOOTER ===============*/
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

/*=============== SCROLLREVEAL (run after data renders) ===============*/
function initReveal() {
  if (window.ScrollReveal) {
    ScrollReveal().reveal('.segment', {
      origin: 'bottom',
      distance: '50px',
      duration: 1000,
      delay: 200,
      reset: false
    });
    ScrollReveal().reveal('.hero__heading', { delay: 300, origin: 'left' });
    ScrollReveal().reveal('.hero__image-container', { delay: 500, origin: 'right' });
    ScrollReveal().reveal('.hero__social-item', {
      interval: 200,
      origin: 'bottom',
      distance: '20px'
    });
    ScrollReveal().reveal('.project-card', {
      interval: 150,
      origin: 'bottom',
      distance: '30px'
    });
    ScrollReveal().reveal('.expertise__item', { interval: 100, origin: 'bottom', distance: '20px' });
    ScrollReveal().reveal('.background__item', { interval: 100, origin: 'left', distance: '20px' });
    ScrollReveal().reveal('.connect__form-container', { origin: 'right', distance: '30px', delay: 300 });
  }
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

  /*=============== ACTIVE LINK STATE ===============*/
  const sections = document.querySelectorAll('section[id]');

  const scrollActive = () => {
    const scrollY = window.pageYOffset;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 58;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector('.navbar__url[href*="' + sectionId + '"]');
      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add('active-url');
        } else {
          link.classList.remove('active-url');
        }
      }
    });
  };

  window.addEventListener('scroll', scrollActive, { passive: true });

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

  /*=============== LOAD PORTFOLIO CONTENT ===============*/
  loadPortfolio();
});