(function () {
  const statCard = function (icon, value, label, extra) {
    return (
      '<div class="stat-card">' +
      '<div class="stat-card__icon"><i class="' + icon + '"></i></div>' +
      '<div><div class="stat-card__value">' + value + '</div>' +
      '<div class="stat-card__label">' + label + '</div></div>' +
      (extra || '') +
      '</div>'
    );
  };

  async function render(container) {
    try {
      const [skills, projects, experiences, educations, messages] = await Promise.all([
        PortfolioAPI.get('/api/skills'),
        PortfolioAPI.get('/api/projects'),
        PortfolioAPI.get('/api/experience'),
        PortfolioAPI.get('/api/education'),
        PortfolioAPI.get('/api/contact')
      ]);

      const unread = messages.filter((m) => !m.read).length;

      const stats =
        '<div class="cards-grid">' +
        statCard('ri-code-line', skills.length, 'Skills') +
        statCard('ri-macbook-line', projects.length, 'Projects') +
        statCard('ri-briefcase-line', experiences.length, 'Experience') +
        statCard('ri-graduation-cap-line', educations.length, 'Education') +
        statCard('ri-chat-4-line', unread + ' / ' + messages.length, 'Messages (unread / total)') +
        '</div>';

      const recent = messages.slice(0, 5);
      const recentHtml =
        '<div class="card card--flush">' +
        '<div class="card__header">' +
        '<h3><i class="ri-chat-3-line" style="color:var(--first-color)"></i> Recent messages</h3>' +
        '<a href="#messages" class="btn btn--sm btn--ghost">View all <i class="ri-arrow-right-line"></i></a>' +
        '</div>' +
        '<div class="card__body">' +
        (recent.length === 0
          ? window.emptyState('No messages yet')
          : '<div class="message-list">' +
            recent.map((m) =>
              '<div class="message-item ' + (!m.read ? 'message-item--unread' : '') + '">' +
              '<div class="message-item__head">' +
              '<span class="message-item__name">' + window.escapeHtml(m.name) + '</span>' +
              '<span class="message-item__email">' + window.escapeHtml(m.email) + '</span>' +
              '<span class="message-item__date">' + new Date(m.createdAt).toLocaleDateString() + '</span>' +
              '</div>' +
              '<p class="message-item__text">' + window.escapeHtml(m.message) + '</p>' +
              '</div>'
            ).join('') +
            '</div>') +
        '</div>' +
        '</div>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Welcome back</h2>' +
        '<p>Here\'s a quick overview of your portfolio content.</p>' +
        '</div>' +
        '<a href="/" target="_blank" class="btn btn--primary"><i class="ri-external-link-line"></i> View Portfolio</a>' +
        '</div>' +
        stats +
        recentHtml;
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  window.Pages.overview = { title: 'Overview', render };
})();