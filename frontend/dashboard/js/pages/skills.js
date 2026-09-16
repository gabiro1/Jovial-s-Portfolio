(function () {
  const CATEGORIES = ['Development', 'Design'];
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  let cache = [];
  let filter = 'all';

  function renderTable() {
    const list = filter === 'all' ? cache : cache.filter((s) => s.category === filter);
    if (list.length === 0) {
      return '<div class="empty"><i class="ri-code-s-slash-line"></i><p>No skills found. Add your first skill.</p></div>';
    }
    return (
      '<div class="table-wrap"><table class="table">' +
      '<thead><tr>' +
      '<th>Skill</th><th>Category</th><th>Level</th><th>Order</th><th style="text-align:right">Actions</th>' +
      '</tr></thead><tbody>' +
      list.map((s) =>
        '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:.7rem">' +
        (s.icon
          ? '<img class="table__icon" src="' + s.icon + '" alt="" />'
          : '<i class="ri-command-line" style="font-size:1.2rem;color:var(--first-color)"></i>') +
        '<span class="table__title">' + window.escapeHtml(s.name) + '</span></div></td>' +
        '<td><span class="badge ' + (s.category === 'Development' ? 'badge--dev' : 'badge--design') + '">' + s.category + '</span></td>' +
        '<td class="table__muted">' + s.level + '</td>' +
        '<td class="table__muted">' + (s.order || 0) + '</td>' +
        '<td style="text-align:right;white-space:nowrap">' +
        '<button class="btn btn--sm btn--ghost" onclick="Pages.skills.edit(\'' + s._id + '\')"><i class="ri-edit-line"></i></button> ' +
        '<button class="btn btn--sm btn--danger" onclick="Pages.skills.remove(\'' + s._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
        '</td>' +
        '</tr>'
      ).join('') +
      '</tbody></table></div>'
    );
  }

  async function render(container) {
    try {
      cache = await PortfolioAPI.get('/api/skills');

      const tabs =
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.25rem">' +
        '<button class="btn btn--sm ' + (filter === 'all' ? 'btn--primary' : '') + '" onclick="Pages.skills.setFilter(\'all\')">All</button>' +
        CATEGORIES.map((c) =>
          '<button class="btn btn--sm ' + (filter === c ? 'btn--primary' : '') + '" onclick="Pages.skills.setFilter(\'' + c + '\')">' + c + '</button>'
        ).join('') +
        '</div>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Skills</h2>' +
        '<p>Manage the skills displayed under "My Expertise".</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.skills.openModal()"><i class="ri-add-line"></i> Add skill</button>' +
        '</div>' +
        '<div class="card card--flush">' + tabs +
        '<div id="skills-list">' + renderTable() + '</div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function setFilter(value) {
    filter = value;
    const listEl = document.getElementById('skills-list');
    if (listEl) listEl.innerHTML = renderTable();
  }

  function openModal(skill) {
    const s = skill || { name: '', category: 'Development', level: 'Intermediate', icon: '', order: 0 };

    const body =
      '<form id="skill-form" class="form-grid">' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Name</label>' +
      '<input class="form-input" id="s-name" required value="' + window.escapeHtml(s.name) + '" placeholder="e.g. JavaScript" />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Category</label>' +
      '<select class="form-select" id="s-category">' +
      CATEGORIES.map((c) => '<option value="' + c + '" ' + (s.category === c ? 'selected' : '') + '>' + c + '</option>').join('') +
      '</select>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Level</label>' +
      '<select class="form-select" id="s-level">' +
      LEVELS.map((l) => '<option value="' + l + '" ' + (s.level === l ? 'selected' : '') + '>' + l + '</option>').join('') +
      '</select>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="s-order" value="' + (s.order || 0) + '" />' +
      '<span class="form-hint">Lower = shown first</span>' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Icon</label>' +
      '<div class="img-upload">' +
      '<div class="img-upload__preview" id="s-icon-preview">' +
      (s.icon ? '<img src="' + s.icon + '" alt="icon" />' : '<i class="ri-image-line"></i>') +
      '</div>' +
      '<div style="flex:1">' +
      '<input class="form-input" id="s-icon-path" value="' + (s.icon || '') + '" placeholder="Icon URL or upload below" style="margin-bottom:.5rem" />' +
      '<input type="file" class="form-input" id="s-icon-file" accept="image/*" />' +
      '<span class="form-hint">Upload an icon or paste a URL</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="s-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(skill ? 'Edit skill' : 'Add skill', body, footer));

    // preview icon typing
    const pathInput = document.getElementById('s-icon-path');
    const preview = document.getElementById('s-icon-preview');
    pathInput.addEventListener('input', () => {
      if (pathInput.value.trim()) {
        preview.innerHTML = '<img src="' + pathInput.value.trim() + '" alt="icon" onerror="this.style.display=\'none\'" />';
      } else {
        preview.innerHTML = '<i class="ri-image-line"></i>';
      }
    });
    const fileInput = document.getElementById('s-icon-file');
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { preview.innerHTML = '<img src="' + e.target.result + '" alt="icon" />'; };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });

    document.getElementById('s-save').addEventListener('click', async () => {
      const btn = document.getElementById('s-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
      try {
        let icon = document.getElementById('s-icon-path').value.trim();
        if (fileInput.files && fileInput.files[0]) {
          const uploaded = await PortfolioAPI.postForm('/api/upload/image', 'image', fileInput.files[0]);
          icon = uploaded.url;
        }

        const payload = {
          name: document.getElementById('s-name').value.trim(),
          category: document.getElementById('s-category').value,
          level: document.getElementById('s-level').value,
          order: parseInt(document.getElementById('s-order').value, 10) || 0,
          icon
        };

        if (skill) {
          await PortfolioAPI.put('/api/skills/' + skill._id, payload);
          window.showToast('Skill updated');
        } else {
          await PortfolioAPI.post('/api/skills', payload);
          window.showToast('Skill added');
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

  function edit(id) {
    const skill = cache.find((s) => s._id === id);
    if (skill) openModal(skill);
  }

  function remove(id) {
    const skill = cache.find((s) => s._id === id);
    window.confirmDelete('Delete the skill "' + (skill ? skill.name : '') + '"?', async () => {
      await PortfolioAPI.del('/api/skills/' + id);
      window.showToast('Skill deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.skills = { title: 'Skills', render, setFilter, openModal, edit, remove };
})();