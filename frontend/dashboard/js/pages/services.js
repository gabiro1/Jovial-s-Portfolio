(function () {
  let currentContainer = null;

  async function render(container) {
    currentContainer = container;
    try {
      const [services, requests] = await Promise.all([
        PortfolioAPI.get('/api/services'),
        PortfolioAPI.get('/api/service-requests')
      ]);

      const serviceRows = services.length
        ? services.map((s) =>
            '<tr>' +
            '<td><span class="table__icon"><i class="' + window.escapeHtml(s.icon || 'ri-code-line') + '"></i></span></td>' +
            '<td><span class="table__title">' + window.escapeHtml(s.name) + '</span></td>' +
            '<td class="table__muted">' + window.escapeHtml(s.price || '—') + '</td>' +
            '<td class="table__muted">' + (s.order || 0) + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn--sm btn--ghost" onclick="Pages.services.edit(\'' + s._id + '\')"><i class="ri-edit-line"></i></button> ' +
            '<button class="btn btn--sm btn--danger" onclick="Pages.services.remove(\'' + s._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
            '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="5">' + window.emptyState('No services yet. Add your first service.') + '</td></tr>';

      const requestList = requests.length
        ? '<div class="message-list">' +
          requests.map((r) => {
            const statusColor = r.status === 'Done' ? 'ok' : r.status === 'In progress' ? 'warn' : 'new';
            return (
              '<div class="message-item">' +
              '<div class="message-item__head">' +
              '<span class="message-item__name">' + window.escapeHtml(r.fullName) + '</span>' +
              '<span class="message-item__email">' + window.escapeHtml(r.email) + '</span>' +
              '<span class="badge" style="' +
                (statusColor === 'ok' ? 'background:var(--success,#22c55e);color:#0b1020' :
                 statusColor === 'warn' ? 'background:#f59e0b;color:#0b1020' :
                 'background:var(--first-color,#3b82f6);color:#fff') + '">' +
                window.escapeHtml(r.status) + '</span>' +
              '<span class="message-item__date">' + new Date(r.createdAt).toLocaleString() + '</span>' +
              '</div>' +
              '<p class="message-item__text"><strong>Service:</strong> ' + window.escapeHtml(r.service) +
              (r.phone ? ' &nbsp;·&nbsp; <strong>Phone:</strong> ' + window.escapeHtml(r.phone) : '') +
              (r.message ? '<br/>' + window.escapeHtml(r.message) : '') + '</p>' +
              '<div class="message-item__actions">' +
              '<button class="btn btn--sm btn--ghost" onclick="Pages.services.setStatus(\'' + r._id + '\',\'New\')">New</button>' +
              '<button class="btn btn--sm btn--ghost" onclick="Pages.services.setStatus(\'' + r._id + '\',\'In progress\')">In progress</button>' +
              '<button class="btn btn--sm btn--ghost" onclick="Pages.services.setStatus(\'' + r._id + '\',\'Done\')">Done</button>' +
              '<button class="btn btn--sm btn--danger" onclick="Pages.services.removeRequest(\'' + r._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
              '</div>' +
              '</div>'
            );
          }).join('') +
          '</div>'
        : window.emptyState('No service requests yet. Requests from the "Request a Service" form will appear here.');

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Services</h2>' +
        '<p>Manage the services you offer and the requests you receive.</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.services.openModal()"><i class="ri-add-line"></i> Add service</button>' +
        '</div>' +

        '<div class="card card--flush">' +
        '<div class="card__head"><h3>Services</h3><span class="badge">' + services.length + '</span></div>' +
        '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Icon</th><th>Name</th><th>Price</th><th>Order</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + serviceRows + '</tbody></table></div>' +
        '</div>' +

        '<div class="card card--flush">' +
        '<div class="card__head"><h3>Service Requests</h3><span class="badge">' + requests.length + '</span></div>' +
        '<div class="card__body">' + requestList + '</div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function openModal(service) {
    const s = service || { name: '', description: '', icon: 'ri-code-line', price: '', order: 0 };

    const body =
      '<form id="service-form" class="form-grid">' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Name *</label>' +
      '<input class="form-input" id="s-name" required value="' + window.escapeHtml(s.name) + '" placeholder="e.g. Web Development" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Icon (Remixicon class)</label>' +
      '<input class="form-input" id="s-icon" value="' + window.escapeHtml(s.icon) + '" placeholder="ri-code-line" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Price</label>' +
      '<input class="form-input" id="s-price" value="' + window.escapeHtml(s.price) + '" placeholder="From $300" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="s-order" value="' + (s.order || 0) + '" />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Description</label>' +
      '<textarea class="form-textarea" id="s-desc" style="min-height:90px">' + window.escapeHtml(s.description) + '</textarea>' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="s-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(service ? 'Edit service' : 'Add service', body, footer), true);

    document.getElementById('s-save').addEventListener('click', async () => {
      const btn = document.getElementById('s-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

      const payload = {
        name: document.getElementById('s-name').value.trim(),
        icon: document.getElementById('s-icon').value.trim() || 'ri-code-line',
        price: document.getElementById('s-price').value.trim(),
        description: document.getElementById('s-desc').value.trim(),
        order: parseInt(document.getElementById('s-order').value, 10) || 0
      };

      try {
        if (service) {
          await PortfolioAPI.put('/api/services/' + service._id, payload);
          window.showToast('Service updated');
        } else {
          await PortfolioAPI.post('/api/services', payload);
          window.showToast('Service added');
        }
        window.closeModal();
        render(document.getElementById('page-content'));
      } catch (error) {
        window.showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="ri-save-line"></i> Save';
      }
    });
  }

  async function edit(id) {
    try {
      const services = await PortfolioAPI.get('/api/services');
      const service = services.find((s) => s._id === id);
      if (service) openModal(service);
    } catch (e) {
      window.showToast(e.message, 'error');
    }
  }

  function remove(id) {
    window.confirmDelete('Delete this service? This cannot be undone.', async () => {
      await PortfolioAPI.del('/api/services/' + id);
      window.showToast('Service deleted');
      render(document.getElementById('page-content'));
    });
  }

  async function setStatus(id, status) {
    try {
      await PortfolioAPI.put('/api/service-requests/' + id, { status });
      window.showToast('Status updated to ' + status);
      render(document.getElementById('page-content'));
    } catch (e) {
      window.showToast(e.message, 'error');
    }
  }

  function removeRequest(id) {
    window.confirmDelete('Delete this service request? This cannot be undone.', async () => {
      await PortfolioAPI.del('/api/service-requests/' + id);
      window.showToast('Service request deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.services = { title: 'Services', render, openModal, edit, remove, setStatus, removeRequest };
})();