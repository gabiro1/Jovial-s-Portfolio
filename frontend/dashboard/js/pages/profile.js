(function () {
  function formField(label, id, type, value, hint, full) {
    return (
      '<div class="form-group ' + (full ? 'form-group--full' : '') + '">' +
      '<label class="form-label" for="' + id + '">' + label + '</label>' +
      '<input class="form-input" type="' + type + '" id="' + id + '" value="' + (value || '') + '" />' +
      (hint ? '<span class="form-hint">' + hint + '</span>' : '') +
      '</div>'
    );
  }

  async function render(container) {
    try {
      const bio = await PortfolioAPI.get('/api/bio');
      const id = bio._id;
      const heroLines = bio.heroLines || [];

      // Split last "Based in" line naturally kept as a heroLine too.
      const heroText = heroLines.join('\n');

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Profile & Bio</h2>' +
        '<p>Update the information shown in the hero section and contact details.</p>' +
        '</div></div>' +

        '<div class="card">' +
        '<div class="card__body">' +
        '<form id="bio-form" class="form-grid">' +

        formField('Full name', 'bio-name', 'text', bio.fullName, 'Your display name (e.g. Jovial)') +
        formField('Greeting', 'bio-greeting', 'text', bio.greeting || "Hi, I'm", 'Text shown before your name in the hero') +

        '<div class="form-group form-group--full">' +
        '<label class="form-label" for="bio-hero">Hero lines</label>' +
        '<textarea class="form-textarea" id="bio-hero" style="min-height:110px">' + window.escapeHtml(heroText) + '</textarea>' +
        '<span class="form-hint">One line per row. These appear under your name in the hero (e.g. Web Developer, / UI &amp; UX Designer / Based in Kigali).</span>' +
        '</div>' +

        '<div class="form-group form-group--full">' +
        '<label class="form-label" for="bio-about">About / Biography</label>' +
        '<textarea class="form-textarea" id="bio-about">' + window.escapeHtml(bio.about || '') + '</textarea>' +
        '</div>' +

        formField('Location', 'bio-location', 'text', bio.location) +
        formField('Tagline', 'bio-tagline', 'text', bio.tagline, 'Short phrase for footer / SEO') +
        formField('Email', 'bio-email', 'email', bio.email) +
        formField('Phone', 'bio-phone', 'text', bio.phone) +
        formField('WhatsApp (international format)', 'bio-whatsapp', 'text', bio.whatsapp, 'e.g. +250780259327') +
        formField('Resume URL', 'bio-resume', 'text', bio.resumeUrl, 'Optional link to your CV') +

        '<div class="form-group form-group--full">' +
        '<label class="form-label">Profile photo</label>' +
        '<div class="img-upload">' +
        '<div class="img-upload__preview img-upload__preview--round" id="profile-preview">' +
        (bio.profileImage ? '<img src="' + bio.profileImage + '" alt="preview" />' : '<i class="ri-user-line"></i>') +
        '</div>' +
        '<div>' +
        '<input type="file" class="form-input" id="bio-image" accept="image/*" />' +
        '<span class="form-hint" id="bio-image-status">Current: ' + (bio.profileImage || 'none') + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="form-actions form-group--full">' +
        '<button type="submit" class="btn btn--primary" id="bio-save"><i class="ri-save-line"></i> Save changes</button>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>';

      // Image preview
      const fileInput = document.getElementById('bio-image');
      const preview = document.getElementById('profile-preview');
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.innerHTML = '<img src="' + e.target.result + '" alt="preview" />';
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      });

      // Submit
      document.getElementById('bio-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('bio-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

        try {
          const heroArr = document
            .getElementById('bio-hero').value
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          let profileImage = bio.profileImage;

          if (fileInput.files && fileInput.files[0]) {
            const uploaded = await PortfolioAPI.postForm(
              '/api/upload/image', 'image', fileInput.files[0]
            );
            profileImage = uploaded.url;
          }

          const payload = {
            fullName: document.getElementById('bio-name').value.trim(),
            greeting: document.getElementById('bio-greeting').value.trim(),
            heroLines: heroArr,
            about: document.getElementById('bio-about').value.trim(),
            location: document.getElementById('bio-location').value.trim(),
            tagline: document.getElementById('bio-tagline').value.trim(),
            email: document.getElementById('bio-email').value.trim(),
            phone: document.getElementById('bio-phone').value.trim(),
            whatsapp: document.getElementById('bio-whatsapp').value.trim(),
            resumeUrl: document.getElementById('bio-resume').value.trim(),
            profileImage
          };

          await PortfolioAPI.put('/api/bio/' + id, payload);
          window.showToast('Profile updated successfully');
          render(container);
        } catch (error) {
          window.showToast(error.message, 'error');
          btn.disabled = false;
          btn.innerHTML = '<i class="ri-save-line"></i> Save changes';
        }
      });
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  window.Pages.profile = { title: 'Profile & Bio', render };
})();