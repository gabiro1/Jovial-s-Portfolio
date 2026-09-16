(function () {
  let currentContainer = null;

  async function render(container) {
    currentContainer = container;
    try {
      const messages = await PortfolioAPI.get('/api/contact');
      const unread = messages.filter((m) => !m.read).length;

      const list = messages.length
        ? '<div class="message-list">' +
          messages.map((m) =>
            '<div class="message-item ' + (!m.read ? 'message-item--unread' : '') + '" onclick="Pages.messages.view(\'' + m._id + '\')">' +
            '<div class="message-item__head">' +
            '<span class="message-item__name">' + window.escapeHtml(m.name) + '</span>' +
            '<span class="message-item__email">' + window.escapeHtml(m.email) + '</span>' +
            (m.subject ? '<span class="badge badge--dev">' + window.escapeHtml(m.subject) + '</span>' : '') +
            '<span class="message-item__date">' + new Date(m.createdAt).toLocaleString() + '</span>' +
            '</div>' +
            '<p class="message-item__text">' + window.escapeHtml(m.message) + '</p>' +
            '</div>'
          ).join('') +
          '</div>'
        : window.emptyState('No messages yet. Messages from the contact form will appear here.');

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Contact Messages</h2>' +
        '<p>Messages submitted from the contact form.' + (unread ? ' <span class="badge badge--unread">' + unread + ' unread</span>' : '') + '</p>' +
        '</div>' +
        '<button class="btn" onclick="Pages.messages.refresh()"><i class="ri-refresh-line"></i> Refresh</button>' +
        '</div>' +
        '<div class="card card--flush"><div class="card__body">' + list + '</div></div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function refresh() {
    if (currentContainer) render(currentContainer);
  }

  async function view(id) {
    try {
      const m = await PortfolioAPI.get('/api/contact/' + id);
      if (!m.read) {
        await PortfolioAPI.put('/api/contact/' + id + '/read', { read: true });
        window.refreshUnreadBadge();
        render(currentContainer);
      }

      const body =
        '<div style="display:grid;gap:.9rem">' +
        '<div>' +
        '<span class="form-label">From</span>' +
        '<p style="color:var(--title-color);font-weight:600;margin-top:.2rem">' + window.escapeHtml(m.name) + ' <span style="color:var(--text-color-light);font-weight:400">(' + window.escapeHtml(m.email) + ')</span></p>' +
        '</div>' +
        (m.subject
          ? '<div><span class="form-label">Subject</span><p style="color:var(--title-color);margin-top:.2rem">' + window.escapeHtml(m.subject) + '</p></div>'
          : '') +
        '<div>' +
        '<span class="form-label">Received</span>' +
        '<p style="color:var(--title-color);margin-top:.2rem">' + new Date(m.createdAt).toLocaleString() + '</p>' +
        '</div>' +
        '<div>' +
        '<span class="form-label">Message</span>' +
        '<p style="white-space:pre-wrap;margin-top:.2rem;line-height:1.7">' + window.escapeHtml(m.message) + '</p>' +
        '</div>' +
        '</div>';

      const footer =
        '<a class="btn btn--ghost" href="mailto:' + window.escapeHtml(m.email) + '"><i class="ri-mail-send-line"></i> Reply</a>' +
        '<button class="btn btn--danger" id="msg-delete"><i class="ri-delete-bin-line"></i> Delete</button>' +
        '<button class="btn btn--primary" onclick="closeModal()">Close</button>';

      window.openModal(window.makeModal('Message from ' + window.escapeHtml(m.name), body, footer), true);

      document.getElementById('msg-delete').addEventListener('click', async () => {
        try {
          await PortfolioAPI.del('/api/contact/' + id);
          window.closeModal();
          window.showToast('Message deleted');
          window.refreshUnreadBadge();
          render(currentContainer);
        } catch (error) {
          window.showToast(error.message, 'error');
        }
      });
    } catch (error) {
      window.showToast(error.message, 'error');
    }
  }

  window.Pages.messages = { title: 'Contact Messages', render, view, refresh };
})();