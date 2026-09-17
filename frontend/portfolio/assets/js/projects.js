/*============================================================
  Projects browser — Grid / List / Stack + detail modal
  Vanilla JS. Data-driven from a single normalized array.
============================================================*/
(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-projects-layout';
  var LAYOUTS = ['grid', 'list', 'stack'];

  var projects = [];
  var layout = 'grid';

  var browserEl = null;
  var modalEl = null;
  var stackEl = null;
  var stackOrder = [];       // project indices, [0] = active/top
  var cardEls = {};          // project index -> stack card element
  var lastFocused = null;

  var drag = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- helpers ---------------- */
  function esc(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function placeholder(index) {
    var variants = [
      '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Project preview placeholder">' +
        '<rect width="400" height="250" fill="#0c0c0d"/>' +
        '<g stroke="rgba(244,244,241,0.4)" stroke-width="1" fill="none"><circle cx="140" cy="125" r="24"/><circle cx="140" cy="125" r="50"/><circle cx="140" cy="125" r="76"/></g>' +
        '<circle cx="140" cy="125" r="6" fill="#f4f4f1"/>' +
        '<g stroke="rgba(244,244,241,0.22)" stroke-width="1"><line x1="230" y1="90" x2="360" y2="90"/><line x1="230" y1="120" x2="330" y2="120"/><line x1="230" y1="150" x2="350" y2="150"/></g></svg>',
      '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Project preview placeholder">' +
        '<rect width="400" height="250" fill="#0c0c0d"/>' +
        '<g stroke="rgba(244,244,241,0.4)" stroke-width="1" fill="none"><rect x="60" y="55" width="150" height="140" rx="2"/><path d="M135 75 V175 M85 125 H185"/></g>' +
        '<g stroke="rgba(244,244,241,0.22)" stroke-width="1" fill="none"><rect x="245" y="70" width="100" height="12"/><rect x="245" y="98" width="80" height="12"/><rect x="245" y="126" width="92" height="12"/></g></svg>',
      '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Project preview placeholder">' +
        '<rect width="400" height="250" fill="#0c0c0d"/>' +
        '<g stroke="rgba(244,244,241,0.4)" stroke-width="1" fill="none"><ellipse cx="200" cy="125" rx="110" ry="42"/><ellipse cx="200" cy="125" rx="110" ry="42" transform="rotate(60 200 125)"/><ellipse cx="200" cy="125" rx="110" ry="42" transform="rotate(120 200 125)"/></g>' +
        '<circle cx="200" cy="125" r="6" fill="#f4f4f1"/></svg>'
    ];
    return variants[index % variants.length];
  }

  function mediaHtml(p, index) {
    if (p.image) {
      return '<img src="' + esc(p.image) + '" alt="' + esc(p.title) +
        ' preview" loading="lazy" draggable="false">';
    }
    return placeholder(index);
  }

  function metaText(p) {
    if (p.type) return p.type;
    if (p.technologies && p.technologies.length) {
      return p.technologies.slice(0, 3).join(' · ');
    }
    return 'Project';
  }

  function normalize(list) {
    return (list || []).map(function (p, i) {
      return {
        index: i,
        id: p._id || p.id || String(i),
        title: p.title || 'Untitled project',
        image: p.image || '',
        type: p.type || '',
        description: p.description || '',
        technologies: (p.technologies || []).filter(Boolean),
        liveUrl: p.link && p.link !== '#' ? p.link : '',
        githubUrl: p.github && p.github !== '#' ? p.github : ''
      };
    });
  }

  /* ---------------- layout switcher ---------------- */
  function readLayout() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return LAYOUTS.indexOf(stored) !== -1 ? stored : 'grid';
  }

  function setLayout(next) {
    if (LAYOUTS.indexOf(next) === -1) next = 'grid';
    layout = next;
    localStorage.setItem(STORAGE_KEY, next);

    document.querySelectorAll('.layout-btn').forEach(function (btn) {
      var on = btn.dataset.layout === next;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    render();
  }

  /* ---------------- grid ---------------- */
  function gridHtml() {
    return '<div class="project-grid">' +
      projects.map(function (p) {
        return '<article class="project-card" role="button" tabindex="0" data-project="' + p.index +
          '" aria-label="View ' + esc(p.title) + ' details">' +
          '<div class="project-card__media">' + mediaHtml(p, p.index) +
            (p.type ? '<span class="project-card__type">' + esc(p.type) + '</span>' : '') +
          '</div>' +
          '<div class="project-card__body">' +
            '<div>' +
              '<h3 class="project-card__title">' + esc(p.title) + '</h3>' +
              '<p class="project-card__meta">' + esc(metaText(p)) + '</p>' +
            '</div>' +
            '<span class="project-card__view">View Project <i class="ri-arrow-right-line" aria-hidden="true"></i></span>' +
          '</div>' +
        '</article>';
      }).join('') +
    '</div>';
  }

  /* ---------------- list ---------------- */
  function listHtml() {
    return '<div class="project-list">' +
      projects.map(function (p) {
        return '<article class="project-row" role="button" tabindex="0" data-project="' + p.index +
          '" aria-label="View ' + esc(p.title) + ' details">' +
          '<div class="project-row__media">' + mediaHtml(p, p.index) + '</div>' +
          '<div>' +
            '<h3 class="project-row__title">' + esc(p.title) + '</h3>' +
            '<p class="project-row__meta">' + esc(metaText(p)) + '</p>' +
          '</div>' +
          '<span class="project-row__view">View <i class="ri-arrow-right-line" aria-hidden="true"></i></span>' +
        '</article>';
      }).join('') +
    '</div>';
  }

  /* ---------------- stack ---------------- */
  function depthTransform(d) {
    if (d === 0) return 'translate(-50%, -50%) scale(1)';
    var scale = (1 - d * 0.05).toFixed(3);
    var rotate = d % 2 === 1 ? -1.2 : 1.4;
    return 'translate(-50%, -50%) translateY(' + (-d * 14) + 'px) scale(' + scale + ') rotate(' + rotate + 'deg)';
  }

  function stackHtml() {
    var cards = stackOrder.map(function (pi, d) {
      var p = projects[pi];
      return '<div class="stack-card' + (d === 0 ? ' is-active' : '') + (d > 3 ? ' is-hidden' : '') +
        '" data-project="' + pi + '" role="button" tabindex="' + (d > 3 ? '-1' : '0') + '" style="transform:' + depthTransform(d) + ';z-index:' + (200 - d) + '" ' +
        (d > 3 ? 'aria-hidden="true" ' : '') +
        'aria-label="' + esc(p.title) + (d === 0 ? ' — view project' : '') + '">' +
        mediaHtml(p, pi) +
        (p.type ? '<span class="stack-card__type">' + esc(p.type) + '</span>' : '') +
        '<div class="stack-card__caption"><h3>' + esc(p.title) + '</h3><span>' + esc(metaText(p)) + '</span></div>' +
      '</div>';
    }).join('');

    return '<div class="project-stack-wrap">' +
      '<div class="project-stack" id="stack-stage">' + cards + '</div>' +
      '<div class="stack-controls">' +
        '<button type="button" class="stack-nav" data-stack="prev" aria-label="Previous project"><i class="ri-arrow-left-line" aria-hidden="true"></i> Previous</button>' +
        '<div class="stack-dots" role="group" aria-label="Choose project">' +
          projects.map(function (p, i) {
            return '<button type="button" class="stack-dot' + (i === stackOrder[0] ? ' is-active' : '') +
              '" data-dot="' + i + '" aria-label="Show ' + esc(p.title) + '"' +
              (i === stackOrder[0] ? ' aria-current="true"' : '') + '></button>';
          }).join('') +
        '</div>' +
        '<button type="button" class="stack-nav" data-stack="next" aria-label="Next project">Next <i class="ri-arrow-right-line" aria-hidden="true"></i></button>' +
      '</div>' +
    '</div>';
  }

  function cacheStackCards() {
    cardEls = {};
    stackEl = document.getElementById('stack-stage');
    if (!stackEl) return;
    stackEl.querySelectorAll('.stack-card').forEach(function (el) {
      cardEls[el.dataset.project] = el;
    });
    updateStackControls();
  }

  function layoutStack() {
    if (!stackEl) return;
    stackOrder.forEach(function (pi, d) {
      var el = cardEls[pi];
      if (!el) return;
      var hidden = d > 3;
      el.style.zIndex = String(200 - d);
      el.classList.toggle('is-active', d === 0);
      el.classList.toggle('is-hidden', hidden);
      el.setAttribute('tabindex', hidden ? '-1' : '0');
      if (hidden) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');
      el.style.transform = depthTransform(d);
    });
    updateStackControls();
  }

  function updateStackControls() {
    if (!stackEl) return;
    var active = stackOrder[0];
    stackEl.parentElement.querySelectorAll('.stack-dot').forEach(function (dot) {
      var on = Number(dot.dataset.dot) === active;
      dot.classList.toggle('is-active', on);
      if (on) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function rotateTo(pi) {
    if (stackOrder[0] === pi) return;
    var n = stackOrder.length;
    var pos = stackOrder.indexOf(pi);
    if (pos < 0) return;
    if (pos <= n / 2) {
      for (var i = 0; i < pos; i++) stackOrder.push(stackOrder.shift());
    } else {
      for (var j = 0; j < n - pos; j++) stackOrder.unshift(stackOrder.pop());
    }
    layoutStack();
  }

  function nextCard() {
    if (stackOrder.length < 2) return;
    stackOrder.push(stackOrder.shift());
    layoutStack();
  }

  function prevCard() {
    if (stackOrder.length < 2) return;
    stackOrder.unshift(stackOrder.pop());
    layoutStack();
  }

  function commitDrag(direction) {
    var activeEl = cardEls[stackOrder[0]];
    var advance = direction < 0 ? nextCard : prevCard;

    if (reduceMotion || !activeEl) {
      advance();
      return;
    }

    var width = activeEl.offsetWidth || 400;
    activeEl.style.transition = 'transform .32s ease, opacity .32s ease';
    activeEl.style.transform =
      'translate(-50%, -50%) translateX(' + (direction * (width + 240)) + 'px) rotate(' + (direction * 18) + 'deg)';
    activeEl.style.opacity = '0';

    window.setTimeout(function () {
      if (activeEl) {
        activeEl.style.transition = '';
        activeEl.style.opacity = '';
      }
      advance();
    }, 280);
  }

  /* ---------------- stack drag / swipe ---------------- */
  function onPointerDown(e) {
    if (!stackEl) return;
    var card = e.target.closest('.stack-card');
    if (!card || card.classList.contains('is-hidden')) return;

    drag = {
      el: card,
      pi: card.dataset.project,
      active: card.classList.contains('is-active'),
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      moved: false,
      decided: false
    };
    if (drag.active) {
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    }
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;

    if (!drag.decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.decided = true;
      if (!drag.active || Math.abs(dy) >= Math.abs(dx)) {
        // Not a horizontal drag on the active card — leave it to scroll / tap.
        drag.ignore = true;
        return;
      }
      drag.el.classList.add('is-dragging');
    }

    if (drag.ignore) return;

    drag.moved = true;
    drag.dx = dx;
    drag.el.style.transform =
      'translate(-50%, -50%) translateX(' + dx + 'px) rotate(' + (dx * 0.045) + 'deg)';
  }

  function onPointerUp() {
    if (!drag) return;
    var current = drag;
    drag = null;

    if (current.ignore) return;

    if (current.el.classList.contains('is-dragging')) {
      current.el.classList.remove('is-dragging');
    }

    if (!current.moved) {
      if (current.active) openModal(Number(current.pi));
      else rotateTo(Number(current.pi));
      return;
    }

    var threshold = Math.max(80, (current.el.offsetWidth || 400) * 0.22);
    if (Math.abs(current.dx) > threshold) {
      commitDrag(current.dx < 0 ? -1 : 1);
    } else {
      current.el.style.transform = depthTransform(0);
    }
  }

  /* ---------------- modal ---------------- */
  function openModal(pi) {
    var p = projects[pi];
    if (!p || !modalEl) return;

    lastFocused = document.activeElement;

    var media = document.getElementById('project-modal-media');
    if (media) media.innerHTML = mediaHtml(p, pi);

    var title = document.getElementById('project-modal-title');
    if (title) title.textContent = p.title;

    var desc = document.getElementById('project-modal-desc');
    if (desc) desc.textContent = p.description || 'No description provided yet.';

    var tech = document.getElementById('project-modal-tech');
    if (tech) {
      tech.innerHTML = p.technologies
        .map(function (t) { return '<span>' + esc(t) + '</span>'; })
        .join('');
      tech.style.display = p.technologies.length ? 'flex' : 'none';
    }

    var actions = document.getElementById('project-modal-actions');
    if (actions) {
      var out = [];
      if (p.liveUrl) {
        out.push('<a class="btn btn-primary" href="' + esc(p.liveUrl) +
          '" target="_blank" rel="noopener noreferrer">Live Demo <i class="ri-external-link-line" aria-hidden="true"></i></a>');
      }
      if (p.githubUrl) {
        out.push('<a class="btn btn-secondary" href="' + esc(p.githubUrl) +
          '" target="_blank" rel="noopener noreferrer">GitHub <i class="ri-github-line" aria-hidden="true"></i></a>');
      }
      actions.innerHTML = out.join('');
    }

    modalEl.hidden = false;
    document.body.classList.add('project-modal-open');
    requestAnimationFrame(function () { modalEl.classList.add('is-open'); });

    var closeBtn = modalEl.querySelector('.project-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modalEl || modalEl.hidden) return;
    modalEl.classList.remove('is-open');
    modalEl.classList.add('is-closing');
    document.body.classList.remove('project-modal-open');

    window.setTimeout(function () {
      modalEl.hidden = true;
      modalEl.classList.remove('is-closing');
    }, reduceMotion ? 0 : 260);

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onModalKeydown(e) {
    if (!modalEl || modalEl.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key !== 'Tab') return;

    var focusables = modalEl.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------- interactions ---------------- */
  function onBrowserClick(e) {
    var dot = e.target.closest('.stack-dot');
    if (dot) {
      rotateTo(Number(dot.dataset.dot));
      return;
    }

    var stackNav = e.target.closest('[data-stack]');
    if (stackNav) {
      if (stackNav.dataset.stack === 'next') nextCard();
      else prevCard();
      return;
    }

    var card = e.target.closest('[data-project]');
    if (card) {
      // Stack cards are driven by pointer events so a drag never opens the modal.
      if (card.classList.contains('stack-card')) return;
      openModal(Number(card.dataset.project));
    }
  }

  function onBrowserKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('[data-project]');
    if (!card) return;
    e.preventDefault();
    openModal(Number(card.dataset.project));
  }

  function onImgError(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    var host = img.parentElement;
    if (!host) return;
    var card = host.closest('[data-project]');
    var idx = card ? Number(card.dataset.project) : 0;
    host.innerHTML = placeholder(idx);
  }

  /* ---------------- render ---------------- */
  function render() {
    if (!browserEl) return;

    if (!projects.length) {
      browserEl.innerHTML = '<p class="loading">No projects yet.</p>';
      return;
    }

    browserEl.dataset.layout = layout;

    if (layout === 'grid') {
      browserEl.innerHTML = gridHtml();
      stackEl = null;
    } else if (layout === 'list') {
      browserEl.innerHTML = listHtml();
      stackEl = null;
    } else {
      if (!stackOrder.length) {
        stackOrder = projects.map(function (p) { return p.index; });
      }
      browserEl.innerHTML = stackHtml();
      cacheStackCards();
    }
  }

  /* ---------------- public API ---------------- */
  window.PortfolioProjects = {
    render: function (list) {
      projects = normalize(list);
      stackOrder = projects.map(function (p) { return p.index; });

      browserEl = document.getElementById('project-browser');
      modalEl = document.getElementById('project-modal');
      if (!browserEl) return;

      if (modalEl && !modalEl.dataset.bound) {
        modalEl.dataset.bound = '1';
        modalEl.addEventListener('click', function (e) {
          if (e.target.closest('[data-close]')) closeModal();
        });
        document.addEventListener('keydown', onModalKeydown);
      }

      if (!browserEl.dataset.bound) {
        browserEl.dataset.bound = '1';
        browserEl.addEventListener('click', onBrowserClick);
        browserEl.addEventListener('keydown', onBrowserKeydown);
        browserEl.addEventListener('pointerdown', onPointerDown);
        browserEl.addEventListener('pointermove', onPointerMove);
        browserEl.addEventListener('pointerup', onPointerUp);
        browserEl.addEventListener('pointercancel', onPointerUp);
        browserEl.addEventListener('error', onImgError, true);
        document.querySelectorAll('.layout-btn').forEach(function (btn) {
          btn.addEventListener('click', function () { setLayout(btn.dataset.layout); });
        });
      }

      layout = readLayout();
      setLayout(layout);
    }
  };
})();
