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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

/*=============== LOAD ALL BACKEND DATA ===============*/
async function loadPortfolio() {
  try {
    const [bio, projects, skills, services, experience, education, socialLinks] =
      await Promise.all([
        api('/api/bio').catch(() => null),
        api('/api/projects').catch(() => null),
        api('/api/skills').catch(() => null),
        api('/api/services').catch(() => null),
        api('/api/experience').catch(() => null),
        api('/api/education').catch(() => null),
        api('/api/social-links').catch(() => null)
      ]);

    renderHero(bio);
    renderAbout(bio, skills);
    renderProjects(projects);
    renderSkills(skills);
    renderServices(services);
    renderTimeline(experience, education);
    renderContact(bio);
    renderFooter(bio, socialLinks);
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
  } finally {
    initReveal();
  }
}

/*=============== HERO ===============*/
function renderHero(bio) {
  if (!bio) return;

  if (bio.fullName) document.title = bio.fullName + ' — Portfolio';

  const brand = document.getElementById('nav-brand');
  if (brand && bio.fullName) {
    brand.textContent = bio.fullName.split(/\s+/)[0].toUpperCase() + '.';
  }

  const greeting = document.getElementById('hero-greeting');
  if (greeting) {
    greeting.innerHTML =
      '<span class="dot"></span>' + escapeHtml(bio.greeting || "Hello, I'm");
  }

  const name = document.getElementById('hero-name');
  if (name && bio.fullName) {
    const parts = bio.fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      const last = parts.pop();
      name.innerHTML = escapeHtml(parts.join(' ')) + '<br>' + escapeHtml(last);
    } else {
      name.textContent = bio.fullName;
    }
  }

  const lines = (bio.heroLines || [])
    .map((l) => String(l).trim().replace(/[,;]+$/, ''))
    .filter(Boolean);

  setText('hero-role', lines.length ? lines.join('  ·  ') : bio.tagline || '');

  let desc = (bio.tagline || '').trim();
  if (!desc && bio.about) {
    desc = ((bio.about.match(/.*?[.!?](\s|$)/) || [bio.about])[0]).trim();
  }
  setText('hero-desc', desc.length > 240 ? desc.slice(0, 237) + '...' : desc);

  const resumeBtn = document.getElementById('hero-resume');
  if (resumeBtn) {
    const href = (bio.resumeFile || '').trim() || (bio.resumeUrl || '').trim();
    if (href) {
      resumeBtn.href = href;
      if (bio.resumeFile) resumeBtn.setAttribute('download', '');
      resumeBtn.innerHTML = '<i class="ri-download-2-line"></i>Download CV';
      resumeBtn.style.display = 'inline-flex';
    } else {
      resumeBtn.removeAttribute('download');
      resumeBtn.style.display = 'none';
    }
  }
}

/*=============== ABOUT ===============*/
function renderAbout(bio, skills) {
  const body = document.getElementById('about-body');
  if (body) {
    if (bio && bio.about) {
      const paragraphs = bio.about
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
      body.innerHTML = paragraphs
        .map((p) => '<p class="reveal">' + escapeHtml(p) + '</p>')
        .join('');
    } else {
      body.innerHTML =
        '<p class="reveal">Hello, welcome to my portfolio.</p>';
    }
  }

  const focus = document.getElementById('about-focus');
  if (focus && skills && skills.length) {
    const groups = {};
    skills.forEach((s) => {
      const cat = s.category || 'Skills';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s.name);
    });
    focus.innerHTML = Object.keys(groups)
      .map(
        (cat) =>
          '<li><span>' + escapeHtml(cat) + '</span>' +
          escapeHtml(groups[cat].join(', ')) + '</li>'
      )
      .join('');
  }
}

/*=============== PROJECTS ===============*/
function renderProjects(projects) {
  if (window.PortfolioProjects) {
    window.PortfolioProjects.render(projects || []);
  }
}

/*=============== SKILLS ===============*/
const SKILL_CATEGORY_ICONS = {
  Development: 'ri-braces-line',
  Design: 'ri-palette-line',
  Tools: 'ri-tools-line'
};

const SKILL_CATEGORY_ORDER = ['Development', 'Design', 'Tools'];

function renderSkills(skills) {
  const wrap = document.getElementById('skill-groups');
  if (!wrap) return;

  if (!skills || !skills.length) {
    wrap.innerHTML = '<p class="loading">No skills yet.</p>';
    return;
  }

  const order = [];
  const groups = {};
  skills.forEach((s) => {
    const cat = s.category || 'Skills';
    if (!groups[cat]) {
      groups[cat] = [];
      order.push(cat);
    }
    groups[cat].push(s);
  });

  order.sort((a, b) => {
    const ia = SKILL_CATEGORY_ORDER.indexOf(a);
    const ib = SKILL_CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  wrap.innerHTML = order
    .map((cat) => {
      const catIcon = SKILL_CATEGORY_ICONS[cat] || 'ri-code-s-slash-line';
      const items = groups[cat]
        .map(
          (s) =>
            '<div class="expertise-item">' +
              '<div class="expertise-icon">' +
                (s.icon
                  ? '<img src="' + escapeHtml(s.icon) + '" alt="' +
                    escapeHtml(s.name) + '" loading="lazy">'
                  : '<i class="' + catIcon + '"></i>') +
              '</div>' +
              '<h3 class="expertise-name">' + escapeHtml(s.name) + '</h3>' +
              (s.level
                ? '<span class="expertise-level">' + escapeHtml(s.level) + '</span>'
                : '') +
            '</div>'
        )
        .join('');

      return (
        '<div class="expertise-category">' +
          '<h3 class="expertise-category-title"><i class="' + catIcon + '"></i>' +
            escapeHtml(cat) + '</h3>' +
          '<div class="expertise-items">' + items + '</div>' +
        '</div>'
      );
    })
    .join('');
}

/*=============== SERVICES ===============*/
function renderServices(services) {
  const grid = document.getElementById('service-grid');
  if (!grid) return;

  if (!services || !services.length) {
    grid.innerHTML = '<div class="service-card"><p class="loading">No services yet.</p></div>';
    return;
  }

  grid.innerHTML = services
    .map(
      (s) =>
        '<div class="service-card">' +
          '<div class="service-icon"><i class="' + escapeHtml(s.icon || 'ri-code-line') + '"></i></div>' +
          '<h3>' + escapeHtml(s.name) + '</h3>' +
          '<p class="service-desc">' + escapeHtml(s.description || '') + '</p>' +
          '<a href="#contact" class="service-request" data-service="' +
            escapeHtml(s.name) + '">Request this service <span class="arrow">&rarr;</span></a>' +
        '</div>'
    )
    .join('');

  populateServiceOptions(services);
  bindServiceRequests();
}

function populateServiceOptions(services) {
  const select = document.getElementById('service-field');
  if (!select) return;

  const current = select.value;
  const names = (services || []).map((s) => s.name).filter(Boolean);
  let html = '<option value="General inquiry">General inquiry</option>';
  names.forEach((name) => {
    html += '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
  });
  select.innerHTML = html;

  if (current && names.indexOf(current) !== -1) select.value = current;
}

function bindServiceRequests() {
  document.querySelectorAll('.service-request').forEach((btn) => {
    btn.addEventListener('click', () => {
      const select = document.getElementById('service-field');
      const name = btn.getAttribute('data-service');
      if (select && name) {
        Array.prototype.forEach.call(select.options, (opt) => {
          if (opt.value === name) select.value = name;
        });
      }
      window.setTimeout(() => {
        const nameField = document.getElementById('name-field');
        if (nameField) nameField.focus({ preventScroll: true });
      }, 550);
    });
  });
}

/*=============== EXPERIENCE & EDUCATION ===============*/
function renderTimeline(experience, education) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const items = [];

  (experience || []).forEach((e) => {
    items.push({
      tag: 'Experience',
      date: e.duration || '',
      title: e.role || '',
      desc: [e.company, e.description].filter(Boolean).join(' — ')
    });
  });

  (education || []).forEach((ed) => {
    items.push({
      tag: 'Education',
      date: ed.duration || '',
      title: ed.degree || '',
      desc: [ed.institution, ed.description].filter(Boolean).join(' — ')
    });
  });

  if (!items.length) {
    timeline.innerHTML = '<p class="loading">No timeline entries yet.</p>';
    return;
  }

  timeline.innerHTML = items
    .map(
      (it) =>
        '<div class="timeline-item reveal">' +
          (it.tag ? '<span class="timeline-tag">' + escapeHtml(it.tag) + '</span>' : '') +
          (it.date ? '<p class="timeline-date">' + escapeHtml(it.date) + '</p>' : '') +
          '<h3 class="timeline-title">' + escapeHtml(it.title) + '</h3>' +
          (it.desc ? '<p class="timeline-desc">' + escapeHtml(it.desc) + '</p>' : '') +
        '</div>'
    )
    .join('');
}

/*=============== CONTACT ===============*/
function renderContact(bio) {
  const heading = document.querySelector('.contact-inner h2');
  const intro = document.getElementById('contact-intro');

  if (intro && bio && bio.tagline) intro.textContent = bio.tagline;

  if (heading && bio && bio.fullName) {
    heading.textContent = "Let's build something meaningful.";
  }
}

/*=============== FOOTER ===============*/
function renderFooter(bio, socialLinks) {
  if (bio && bio.fullName) setText('footer-brand', bio.fullName);

  const desc =
    (bio && bio.tagline) ||
    (bio && bio.about ? bio.about.slice(0, 90) : '') ||
    'Creating digital experiences that matter.';
  setText('footer-desc', desc);

  const social = document.getElementById('footer-social');
  if (social) {
    const visible = (socialLinks || []).filter(
      (l) => l.position === 'both' || l.position === 'footer'
    );
    social.innerHTML = visible
      .map(
        (l) =>
          '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(l.platform) + '</a>'
      )
      .join('');
  }

  setText(
    'footer-copy',
    '\u00A9 ' + new Date().getFullYear() + (bio && bio.fullName ? ' ' + bio.fullName : '')
  );
}

/*=============== CONTACT FORM ===============*/
function setFormStatus(message, type) {
  const status = document.getElementById('form-status');
  if (!status) return;
  status.textContent = message;
  status.classList.remove('success', 'error');
  status.classList.add('visible');
  if (type) status.classList.add(type);
}

async function submitContact(event) {
  event.preventDefault();

  const form = document.getElementById('contact-form');
  const btn = document.getElementById('contact-submit');
  const name = document.getElementById('name-field').value.trim();
  const email = document.getElementById('email-field').value.trim();
  const service = document.getElementById('service-field').value;
  const message = document.getElementById('message-field').value.trim();

  if (!name || !email || !message) {
    setFormStatus('Please fill in your name, email and message.', 'error');
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const isServiceRequest = service && service !== 'General inquiry';
    const url = isServiceRequest ? '/api/service-requests' : '/api/contact';
    const payload = isServiceRequest
      ? { service, fullName: name, email, message }
      : { name, email, subject: 'General inquiry', message };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || 'Failed to send');

    setFormStatus(data.message || 'Message sent. Thank you!', 'success');
    form.reset();
  } catch (error) {
    setFormStatus(error.message || 'Failed to send. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

/*=============== REVEAL ON SCROLL ===============*/
function initReveal() {
  const targets = document.querySelectorAll('.reveal, .timeline-item');
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
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-toggle');
  const closeBtn = document.getElementById('nav-close');
  if (menu) {
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

  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  const setActive = (id) => {
    navAnchors.forEach((a) =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + id)
    );
  };

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }
}

/*=============== HERO BEAMS ===============*/
function initBeams() {
  const beamGroup = document.getElementById('beam-group');
  const svg = document.getElementById('beam-svg');
  if (!beamGroup || !svg) return;

  const NUM_LINES = 22;
  const cx = 640;
  const cy = 500;
  const svgns = 'http://www.w3.org/2000/svg';

  const describeWavyRing = (r, wobble, points) => {
    let d = '';
    for (let p = 0; p <= points; p++) {
      const t = (p / points) * Math.PI * 2;
      const wob =
        Math.sin(t * 3 + r * 0.05) * wobble * 0.35 + Math.cos(t * 5) * wobble * 0.15;
      const rr = r + wob;
      const x = cx + Math.cos(t) * rr * 1.35;
      const y = cy + Math.sin(t) * rr * 0.7;
      d += (p === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d + 'Z';
  };

  beamGroup.innerHTML = '';
  for (let i = 0; i < NUM_LINES; i++) {
    const r = 90 + i * 26;
    const wobble = 34 + (i % 5) * 6;
    const path = document.createElementNS(svgns, 'path');
    path.setAttribute('d', describeWavyRing(r, wobble, 64 + (i % 3) * 10));
    path.setAttribute('transform', 'rotate(' + ((i * 7) % 360) + ' ' + cx + ' ' + cy + ')');
    path.setAttribute('opacity', Math.max(0.55 - (i / NUM_LINES) * 0.42, 0.05).toFixed(2));
    path.setAttribute('stroke-width', i % 4 === 0 ? '1.1' : '0.6');
    beamGroup.appendChild(path);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches && hero) {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 26;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    });

    const raf = () => {
      curX += (targetX - curX) * 0.04;
      curY += (targetY - curY) * 0.04;
      svg.style.transform =
        'translate(calc(-50% + ' + curX.toFixed(1) + 'px), calc(-50% + ' +
        curY.toFixed(1) + 'px))';
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const t0 = Date.now();
    const ambient = () => {
      const t = (Date.now() - t0) / 1000;
      beamGroup.style.transform = 'rotate(' + (Math.sin(t * 0.05) * 1.6).toFixed(2) + 'deg)';
      requestAnimationFrame(ambient);
    };
    requestAnimationFrame(ambient);
  }
}

/*=============== INPUT FOCUS STATES ===============*/
function initFields() {
  document
    .querySelectorAll('.field input, .field select, .field textarea')
    .forEach((input) => {
      const field = input.closest('.field');
      input.addEventListener('focus', () => field.classList.add('focused'));
      input.addEventListener('blur', () => field.classList.remove('focused'));
    });
}

/*=============== INIT ===============*/
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initBeams();
  initFields();

  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', submitContact);

  loadPortfolio();
});
