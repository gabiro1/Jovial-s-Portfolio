function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTheme();
  setupScrollTop();
  loadConnectPage();
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

async function loadConnectPage() {
  try {
    const [bio, socialLinks] = await Promise.all([
      fetch('/api/bio').then((r) => r.json()),
      fetch('/api/social-links').then((r) => r.json()).catch(() => [])
    ]);

    renderConnect(bio, socialLinks);
    renderFooter(bio, socialLinks);

    if (window.ScrollReveal) {
      ScrollReveal().reveal('.segment', { origin: 'bottom', distance: '50px', duration: 1000, delay: 200, reset: false });
      ScrollReveal().reveal('.connect__detail', { interval: 200, origin: 'left', distance: '20px' });
    }
  } catch (error) {
    console.error('Failed to load connect:', error);
    document.querySelectorAll('.hero__loading').forEach((el) => { el.textContent = 'Failed to load.'; });
  }
}

function renderConnect(bio, socialLinks) {
  const details = document.getElementById('connect-details');
  if (!details) return;
  let html = '';

  if (bio && bio.email) {
    html += '<div class="connect__detail">' +
      '<span class="connect__detail-label"> Email </span>' +
      '<a href="mailto:' + escapeHtml(bio.email) + '">' +
      '<span class="connect__detail-value">' + escapeHtml(bio.email) + '</span></a></div>';
  }

  if (bio && bio.whatsapp) {
    const wa = bio.whatsapp.replace(/[^0-9]/g, '');
    html += '<div class="connect__detail">' +
      '<span class="connect__detail-label"> WhatsApp </span>' +
      '<span class="connect__detail-value">' + escapeHtml(bio.whatsapp) + '</span>' +
      '<a href="https://wa.me/' + wa + '" target="_blank" class="connect__action">' +
      'Text me <i class="ri-arrow-right-line"></i></a></div>';
  }

  const linkedinLink = (socialLinks || []).find((l) => l.platform && l.platform.toLowerCase().includes('linkedin'));
  if (linkedinLink) {
    html += '<div class="connect__detail">' +
      '<span class="connect__detail-label"> LinkedIn </span>' +
      '<span class="connect__detail-value">' + escapeHtml(bio ? bio.fullName : '') + '</span>' +
      '<a href="' + escapeHtml(linkedinLink.url) + '" target="_blank" class="connect__action">' +
      'Connect <i class="ri-arrow-right-line"></i></a></div>';
  }

  details.innerHTML = html || '<p class="hero__loading">No contact info.</p>';
}

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

function renderFooter(bio, socialLinks) {
  const tagline = document.getElementById('footer-tagline');
  if (bio && bio.tagline) tagline.textContent = bio.tagline;
  else if (bio && bio.about) tagline.textContent = bio.about.length > 60 ? bio.about.slice(0, 60) + '...' : bio.about;
  const footerSocial = document.getElementById('footer-social');
  footerSocial.innerHTML = (socialLinks || []).filter((l) => l.position === 'both' || l.position === 'footer')
    .map((l) => '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener" class="page-footer__social-item"><i class="' + escapeHtml(l.iconClass || 'ri-link') + '"></i></a>').join('');
  document.getElementById('copyright-text').textContent = '© ' + new Date().getFullYear() + (bio && bio.fullName ? ' ' + bio.fullName : '') + '. All rights reserved.';
}