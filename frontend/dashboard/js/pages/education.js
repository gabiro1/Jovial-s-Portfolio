(function () {
  async function render(container) {
    try {
      const items = await PortfolioAPI.get('/api/education');

      const rows = items.length
        ? items.map((x) =>
            '<tr>' +
            '<td><span class="table__title">' + window.escapeHtml(x.degree) + '</span></td>' +
            '<td class="table__muted">' + window.escapeHtml(x.institution) + '</td>' +
            '<td class="table__muted">' + window.escapeHtml(x.duration) + '</td>' +
            '<td class="table__muted">' + (x.order || 0) + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn--sm btn--ghost" onclick="Pages.education.edit(\'' + x._id + '\')"><i class="ri-edit-line"></i></button> ' +
            '<button class="btn btn--sm btn--danger" onclick="Pages.education.remove(\'' + x._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
            '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="5">' + window.emptyState('No education entries yet.') + '</td></tr>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Education</h2>' +
        '<p>Manage your academic background shown under "My Journey".</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.education.openModal()"><i class="ri-add-line"></i> Add education</button>' +
        '</div>' +
        '<div class="card card--flush">' +
        '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Degree</th><th>Institution</th><th>Duration</th><th>Order</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function openModal(item) {
    const x = item || { degree: '', institution: '', duration: '', description: '', order: 0 };

    const body =
      '<form class="form-grid">' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Degree *</label>' +
      '<input class="form-input" id="e-degree" required value="' + window.escapeHtml(x.degree) + '" placeholder="e.g. Bachelor of Information Technology" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Institution</label>' +
      '<input class="form-input" id="e-institution" value="' + window.escapeHtml(x.institution) + '" placeholder="e.g. University of Rwanda" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Duration</label>' +
      '<input class="form-input" id="e-duration" value="' + window.escapeHtml(x.duration) + '" placeholder="e.g. 2022 - 2026" />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Description</label>' +
      '<textarea class="form-textarea" id="e-desc" style="min-height:80px">' + window.escapeHtml(x.description) + '</textarea>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="e-order" value="' + (x.order || 0) + '" />' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="e-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(item ? 'Edit education' : 'Add education', body, footer));

    document.getElementById('e-save').addEventListener('click', async () => {
      const btn = document.getElementById('e-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

      const payload = {
        degree: document.getElementById('e-degree').value.trim(),
        institution: document.getElementById('e-institution').value.trim(),
        duration: document.getElementById('e-duration').value.trim(),
        description: document.getElementById('e-desc').value.trim(),
        order: parseInt(document.getElementById('e-order').value, 10) || 0
      };

      try {
        if (item) {
          await PortfolioAPI.put('/api/education/' + item._id, payload);
          window.showToast('Education updated');
        } else {
          await PortfolioAPI.post('/api/education', payload);
          window.showToast('Education added');
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
    const items = await PortfolioAPI.get('/api/education');
    const item = items.find((x) => x._id === id);
    if (item) openModal(item);
  }

  function remove(id) {
    window.confirmDelete('Delete this education entry?', async () => {
      await PortfolioAPI.del('/api/education/' + id);
      window.showToast('Education deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.education = { title: 'Education', render, openModal, edit, remove };
})();