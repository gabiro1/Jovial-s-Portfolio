(function () {
  const POSITIONS = ['hero', 'footer', 'both'];

  const SUGGESTED_ICONS = [
    ['ri-linkedin-box-line', 'LinkedIn'],
    ['ri-github-line', 'GitHub'],
    ['ri-twitter-line', 'Twitter / X'],
    ['ri-instagram-line', 'Instagram'],
    ['ri-facebook-box-line', 'Facebook'],
    ['ri-youtube-line', 'YouTube'],
    ['ri-dribbble-line', 'Dribbble'],
    ['ri-behance-line', 'Behance'],
    ['ri-whatsapp-line', 'WhatsApp'],
    ['ri-telegram-line', 'Telegram'],
    ['ri-gmail-line', 'Gmail'],
    ['ri-medium-line', 'Medium'],
    ['ri-stack-overflow-line', 'Stack Overflow'],
    ['ri-link', 'Custom']
  ];

  async function render(container) {
    try {
      const links = await PortfolioAPI.get('/api/social-links');

      const rows = links.length
        ? links.map((l) =>
            '<tr>' +
            '<td><i class="' + window.escapeHtml(l.iconClass || 'ri-link') + '" style="font-size:1.3rem;color:var(--first-color)"></i></td>' +
            '<td><span class="table__title">' + window.escapeHtml(l.platform) + '</span></td>' +
            '<td class="table__muted"><a href="' + window.escapeHtml(l.url) + '" target="_blank" style="color:var(--first-color)">' + window.escapeHtml(l.url) + '</a></td>' +
            '<td><span class="badge ' + (l.position === 'hero' ? 'badge--hero' : l.position === 'footer' ? 'badge--footer' : 'badge--dev') + '">' + l.position + '</span></td>' +
            '<td class="table__muted">' + (l.order || 0) + '</td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn--sm btn--ghost" onclick="Pages.social.edit(\'' + l._id + '\')"><i class="ri-edit-line"></i></button> ' +
            '<button class="btn btn--sm btn--danger" onclick="Pages.social.remove(\'' + l._id + '\')"><i class="ri-delete-bin-line"></i></button>' +
            '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="6">' + window.emptyState('No social links yet.') + '</td></tr>';

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Social Links</h2>' +
        '<p>Manage links shown in the hero and footer.</p>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="Pages.social.openModal()"><i class="ri-add-line"></i> Add link</button>' +
        '</div>' +
        '<div class="card card--flush">' +
        '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Icon</th><th>Platform</th><th>URL</th><th>Position</th><th>Order</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '</div>';
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  function openModal(link) {
    const l = link || { platform: '', url: '', iconClass: 'ri-link', position: 'both', order: 0 };

    const body =
      '<form class="form-grid">' +
      '<div class="form-group">' +
      '<label class="form-label">Platform</label>' +
      '<input class="form-input" id="l-platform" required value="' + window.escapeHtml(l.platform) + '" placeholder="e.g. LinkedIn" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Position</label>' +
      '<select class="form-select" id="l-position">' +
      POSITIONS.map((p) => '<option value="' + p + '" ' + (l.position === p ? 'selected' : '') + '>' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>').join('') +
      '</select>' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">URL</label>' +
      '<input class="form-input" id="l-url" required value="' + window.escapeHtml(l.url) + '" placeholder="https://..." />' +
      '</div>' +
      '<div class="form-group form-group--full">' +
      '<label class="form-label">Icon (Remixicon class)</label>' +
      '<select class="form-select" id="l-icon-select">' +
      '<option value="">-- choose an icon --</option>' +
      SUGGESTED_ICONS.map(([ic, name]) =>
        '<option value="' + ic + '" ' + (l.iconClass === ic ? 'selected' : '') + '>' + name + ' (' + ic + ')</option>'
      ).join('') +
      '</select>' +
      '<input class="form-input" id="l-icon" value="' + window.escapeHtml(l.iconClass || '') + '" style="margin-top:.5rem" placeholder="or paste a remixicon class" />' +
      '<span class="form-hint">Preview: <i id="l-icon-preview" class="' + window.escapeHtml(l.iconClass || 'ri-link') + '" style="font-size:1.3rem;color:var(--first-color)"></i></span>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Order</label>' +
      '<input class="form-input" type="number" id="l-order" value="' + (l.order || 0) + '" />' +
      '</div>' +
      '</form>';

    const footer =
      '<button class="btn" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn--primary" id="l-save"><i class="ri-save-line"></i> Save</button>';

    window.openModal(window.makeModal(link ? 'Edit social link' : 'Add social link', body, footer));

    const iconSelect = document.getElementById('l-icon-select');
    const iconInput = document.getElementById('l-icon');
    const preview = document.getElementById('l-icon-preview');

    const updatePreview = () => {
      preview.className = (iconInput.value.trim() || 'ri-link') + ' l-icon-preview-class';
      preview.style.cssText = 'font-size:1.3rem;color:var(--first-color);font-style:normal;';
    };

    iconSelect.addEventListener('change', () => {
      if (iconSelect.value) {
        iconInput.value = iconSelect.value;
        updatePreview();
      }
    });
    iconInput.addEventListener('input', updatePreview);
    updatePreview();

    document.getElementById('l-save').addEventListener('click', async () => {
      const btn = document.getElementById('l-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

      const payload = {
        platform: document.getElementById('l-platform').value.trim(),
        url: document.getElementById('l-url').value.trim(),
        iconClass: document.getElementById('l-icon').value.trim() || 'ri-link',
        position: document.getElementById('l-position').value,
        order: parseInt(document.getElementById('l-order').value, 10) || 0
      };

      try {
        if (link) {
          await PortfolioAPI.put('/api/social-links/' + link._id, payload);
          window.showToast('Social link updated');
        } else {
          await PortfolioAPI.post('/api/social-links', payload);
          window.showToast('Social link added');
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
    const links = await PortfolioAPI.get('/api/social-links');
    const link = links.find((l) => l._id === id);
    if (link) openModal(link);
  }

  function remove(id) {
    window.confirmDelete('Delete this social link?', async () => {
      await PortfolioAPI.del('/api/social-links/' + id);
      window.showToast('Social link deleted');
      render(document.getElementById('page-content'));
    });
  }

  window.Pages.social = { title: 'Social Links', render, openModal, edit, remove };
})();