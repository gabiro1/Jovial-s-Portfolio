(function () {
  async function render(container) {
    try {
      const projects = await PortfolioAPI.get('/api/projects');

      const rows = projects.length
        ? projects.map((p) =>
            '<tr>' +
            '<td>' +
            (p.image
              ? '<img class="table__thumb" src="' + p.image + '" alt="" />'
              : '<span class="table__thumb" style="display:inline-grid;place-items:center;background:var(--card-color)"><i class="ri-image-line"></i></span>') +
            '</td>' +
            '<td><span class="table__title">' + window.escapeHtml(p.title) + '</span></td>' +
            '<td><span class="badge badge--dev">' + window.escapeHtml(p.type || 'Project') + '</span></td>' +
            '<td class="table__muted">' + (p.technologies || []).length + '</td>' +
            '<td class="table__muted">' + (p.order || 0) + '</td>' +
            '<td>' + (p.featured ? '<span class="badge badge--featured">Featured</span>' : '<span class="table__muted">—</span>') + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn--sm btn--ghost" onclick="Pages.projects.edit(\'' + p._id + '\')"><i class="ri-edit-line"></i></button> ' +
            '<button class="btn btn--sm btn--danger" onclick="Pages.projects.remove(\'' + p._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
            '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="7">' + window.emptyState('No projects yet. Add your first project.') + '</td></tr>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Projects</h2>' +
        '<p>Manage the projects shown in your portfolio.</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.projects.openModal()"><i class="ri-add-line"></i> Add project</button>' +
        '</div>' +
        '<div class="card card--flush">' +
        '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Preview</th><th>Title</th><th>Type</th><th>Tech</th><th>Order</th><th>Featured</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function openModal(project) {
    const p = project || { title: '', description: '', type: '', image: '', link: '', github: '', technologies: [], order: 0, featured: false };

    const body =
      '<form id="project-form" class="form-grid">' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Title *</label>' +
      '<input class="form-input" id="p-title" required value="' + window.escapeHtml(p.title) + '" placeholder="e.g. Blog Website" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Type</label>' +
      '<input class="form-input" id="p-type" value="' + window.escapeHtml(p.type) + '" placeholder="e.g. Frontend, Website, Mobile" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="p-order" value="' + (p.order || 0) + '" />' +
      '</div>' +
      '<div class="form-group form-group--full" style="display:flex;align-items:center;gap:.6rem">' +
      '<input type="checkbox" id="p-featured" ' + (p.featured ? 'checked' : '') + ' style="width:18px;height:18px;accent-color:var(--accent,#3b82f6)" />' +
      '<label for="p-featured" class="form-label" style="margin:0">Featured (show on homepage)</label>' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Description</label>' +
      '<textarea class="form-textarea" id="p-desc" style="min-height:90px">' + window.escapeHtml(p.description) + '</textarea>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Live link</label>' +
      '<input class="form-input" id="p-link" value="' + window.escapeHtml(p.link || '') + '" placeholder="https://..." />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">GitHub link</label>' +
      '<input class="form-input" id="p-github" value="' + window.escapeHtml(p.github || '') + '" placeholder="https://github.com/..." />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Technologies (comma separated)</label>' +
      '<input class="form-input" id="p-tech" value="' + window.escapeHtml((p.technologies || []).join(', ')) + '" placeholder="HTML, CSS, JavaScript" />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Cover image</label>' +
      '<div class="img-upload">' +
      '<div class="img-upload__preview" id="p-preview">' +
      (p.image ? '<img src="' + p.image + '" alt="preview" />' : '<i class="ri-image-line"></i>') +
      '</div>' +
      '<div style="flex:1">' +
      '<input type="file" class="form-input" id="p-image" accept="image/*" />' +
      '<span class="form-hint" id="p-image-status">Current: ' + (p.image || 'none') + '</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="p-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(project ? 'Edit project' : 'Add project', body, footer), true);

    const fileInput = document.getElementById('p-image');
    const preview = document.getElementById('p-preview');
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { preview.innerHTML = '<img src="' + e.target.result + '" alt="preview" />'; };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });

    document.getElementById('p-save').addEventListener('click', async () => {
      const btn = document.getElementById('p-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

      const technologies = document
        .getElementById('p-tech').value
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: document.getElementById('p-title').value.trim(),
        type: document.getElementById('p-type').value.trim(),
        link: document.getElementById('p-link').value.trim(),
        github: document.getElementById('p-github').value.trim(),
        description: document.getElementById('p-desc').value.trim(),
        technologies,
        order: parseInt(document.getElementById('p-order').value, 10) || 0,
        featured: document.getElementById('p-featured').checked
      };

      try {
        const file = fileInput.files && fileInput.files[0];
        if (project) {
          await PortfolioAPI.putForm('/api/projects/' + project._id, 'image', file, payload);
          window.showToast('Project updated');
        } else {
          await PortfolioAPI.postForm('/api/projects', 'image', file, payload);
          window.showToast('Project added');
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
      const projects = await PortfolioAPI.get('/api/projects');
      const project = projects.find((p) => p._id === id);
      if (project) openModal(project);
    } catch (e) {
      window.showToast(e.message, 'error');
    }
  }

  function remove(id) {
    window.confirmDelete('Delete this project? This cannot be undone.', async () => {
      await PortfolioAPI.del('/api/projects/' + id);
      window.showToast('Project deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.projects = { title: 'Projects', render, openModal, edit, remove };
})();