(function () {
  async function render(container) {
    try {
      const items = await PortfolioAPI.get('/api/experience');

      const rows = items.length
        ? items.map((x) =>
            '<tr>' +
            '<td><span class="table__title">' + window.escapeHtml(x.role) + '</span></td>' +
            '<td class="table__muted">' + window.escapeHtml(x.company) + '</td>' +
            '<td class="table__muted">' + window.escapeHtml(x.duration) + '</td>' +
            '<td class="table__muted">' + (x.order || 0) + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn--sm btn--ghost" onclick="Pages.experience.edit(\'' + x._id + '\')"><i class="ri-edit-line"></i></button> ' +
            '<button class="btn btn--sm btn--danger" onclick="Pages.experience.remove(\'' + x._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
            '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="5">' + window.emptyState('No experience entries yet.') + '</td></tr>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Experience</h2>' +
        '<p>Manage your work history shown under "My Journey".</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.experience.openModal()"><i class="ri-add-line"></i> Add experience</button>' +
        '</div>' +
        '<div class="card card--flush">' +
        '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Role</th><th>Company</th><th>Duration</th><th>Order</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function openModal(item) {
    const x = item || { role: '', company: '', duration: '', description: '', order: 0 };

    const body =
      '<form class="form-grid">' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Role *</label>' +
      '<input class="form-input" id="x-role" required value="' + window.escapeHtml(x.role) + '" placeholder="e.g. Frontend Developer" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Company</label>' +
      '<input class="form-input" id="x-company" value="' + window.escapeHtml(x.company) + '" placeholder="e.g. Freelances" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Duration</label>' +
      '<input class="form-input" id="x-duration" value="' + window.escapeHtml(x.duration) + '" placeholder="e.g. Jan 2024 - Present" />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Description</label>' +
      '<textarea class="form-textarea" id="x-desc" style="min-height:80px">' + window.escapeHtml(x.description) + '</textarea>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="x-order" value="' + (x.order || 0) + '" />' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="x-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(item ? 'Edit experience' : 'Add experience', body, footer));

    document.getElementById('x-save').addEventListener('click', async () => {
      const btn = document.getElementById('x-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

      const payload = {
        role: document.getElementById('x-role').value.trim(),
        company: document.getElementById('x-company').value.trim(),
        duration: document.getElementById('x-duration').value.trim(),
        description: document.getElementById('x-desc').value.trim(),
        order: parseInt(document.getElementById('x-order').value, 10) || 0
      };

      try {
        if (item) {
          await PortfolioAPI.put('/api/experience/' + item._id, payload);
          window.showToast('Experience updated');
        } else {
          await PortfolioAPI.post('/api/experience', payload);
          window.showToast('Experience added');
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
    const items = await PortfolioAPI.get('/api/experience');
    const item = items.find((x) => x._id === id);
    if (item) openModal(item);
  }

  function remove(id) {
    window.confirmDelete('Delete this experience entry?', async () => {
      await PortfolioAPI.del('/api/experience/' + id);
      window.showToast('Experience deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.experience = { title: 'Experience', render, openModal, edit, remove };
})();