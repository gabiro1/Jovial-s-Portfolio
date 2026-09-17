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

        '<div class="form-group form-group--full">' +
        '<label class="form-label">Resume / CV</label>' +
        '<div class="seg">' +
        '<button type="button" class="seg__btn" data-resume-mode="link">Use a link</button>' +
        '<button type="button" class="seg__btn" data-resume-mode="upload">Upload from PC</button>' +
        '</div>' +
        '<div class="resume-field" id="resume-link-field">' +
        '<input class="form-input" type="text" id="bio-resume" placeholder="https://example.com/your-cv.pdf" value="' + window.escapeHtml(bio.resumeUrl || '') + '" />' +
        '<span class="form-hint">Paste a link to your CV hosted online (Google Drive, Dropbox, etc).</span>' +
        '</div>' +
        '<div class="resume-field" id="resume-upload-field" style="display:none">' +
        '<div class="resume-file" id="resume-file-box">' +
        '<div class="resume-file__icon"><i class="ri-file-pdf-line"></i></div>' +
        '<div class="resume-file__meta">' +
        '<span class="resume-file__name" id="resume-file-name">' + (bio.resumeFile ? window.escapeHtml(bio.resumeFile.split('/').pop()) : 'No file uploaded') + '</span>' +
        '<span class="form-hint">PDF file, up to 5 MB. The Download CV button will appear on the landing page.</span>' +
        '</div>' +
        '</div>' +
        '<input type="file" class="form-input" id="bio-resume-file" accept=".pdf,application/pdf" style="margin-top:.5rem" />' +
        '<button type="button" class="btn btn--sm btn--danger" id="resume-remove" style="' + (bio.resumeFile ? 'display:inline-flex' : 'display:none') + ';margin-top:.6rem"><i class="ri-delete-bin-line"></i> Remove</button>' +
        '</div>' +

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

      // Resume mode toggle
      const segBtns = document.querySelectorAll('.seg__btn[data-resume-mode]');
      const resumeLinkField = document.getElementById('resume-link-field');
      const resumeUploadField = document.getElementById('resume-upload-field');
      const resumeFileInput = document.getElementById('bio-resume-file');
      const resumeFileName = document.getElementById('resume-file-name');
      const resumeFileBox = document.getElementById('resume-file-box');
      const resumeRemove = document.getElementById('resume-remove');
      let resumeMode = bio.resumeFile ? 'upload' : 'link';
      let resumeFileValue = bio.resumeFile || '';

      function refreshResumeFileUI() {
        const hasFile = !!resumeFileValue;
        resumeFileName.textContent = hasFile ? resumeFileValue.split('/').pop() : 'No file uploaded';
        resumeRemove.style.display = hasFile ? 'inline-flex' : 'none';
        resumeFileBox.classList.toggle('resume-file--green', hasFile);
      }

      function applyResumeMode(mode) {
        resumeMode = mode;
        segBtns.forEach((b) => b.classList.toggle('active', b.dataset.resumeMode === mode));
        resumeLinkField.style.display = mode === 'link' ? 'block' : 'none';
        resumeUploadField.style.display = mode === 'upload' ? 'block' : 'none';
      }
      applyResumeMode(resumeMode);
      refreshResumeFileUI();
      segBtns.forEach((b) => b.addEventListener('click', () => applyResumeMode(b.dataset.resumeMode)));

      resumeFileInput.addEventListener('change', () => {
        if (resumeFileInput.files && resumeFileInput.files[0]) {
          resumeFileName.textContent = resumeFileInput.files[0].name;
          resumeFileBox.classList.add('resume-file--green');
        }
      });

      resumeRemove.addEventListener('click', () => {
        resumeFileValue = '';
        resumeFileInput.value = '';
        resumeFileName.textContent = 'No file uploaded';
        resumeFileBox.classList.remove('resume-file--green');
        resumeRemove.style.display = 'none';
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
          let resumeFile = resumeFileValue;
          let resumeUrl = document.getElementById('bio-resume').value.trim();

          if (fileInput.files && fileInput.files[0]) {
            const uploaded = await PortfolioAPI.postForm(
              '/api/upload/image', 'image', fileInput.files[0]
            );
            profileImage = uploaded.url;
          }

          if (resumeMode === 'upload') {
            if (resumeFileInput.files && resumeFileInput.files[0]) {
              const uploaded = await PortfolioAPI.postForm(
                '/api/upload/resume', 'resume', resumeFileInput.files[0]
              );
              resumeFile = uploaded.url;
            }
            resumeUrl = '';
          } else {
            resumeFile = '';
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
            resumeUrl,
            resumeFile,
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