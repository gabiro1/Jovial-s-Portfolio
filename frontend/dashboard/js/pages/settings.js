(function () {
  function field(label, id, type, value, hint, placeholder) {
    return (
      '<div class="form-group">' +
      '<label class="form-label" for="' + id + '">' + label + '</label>' +
      '<input class="form-input" type="' + type + '" id="' + id + '" value="' + (value || '') + '" ' +
      (placeholder ? 'placeholder="' + placeholder + '"' : '') + ' />' +
      (hint ? '<span class="form-hint">' + hint + '</span>' : '') +
      '</div>'
    );
  }

  function toggle(label, id, checked, hint) {
    return (
      '<div class="setting-row">' +
      '<div class="setting-row__text">' +
      '<span class="setting-row__label">' + label + '</span>' +
      (hint ? '<span class="setting-row__hint">' + hint + '</span>' : '') +
      '</div>' +
      '<label class="switch">' +
      '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + ' />' +
      '<span class="switch__slider"></span>' +
      '</label>' +
      '</div>'
    );
  }

  function renderSecurity(settings) {
    return (
      '<div class="card">' +
      '<div class="card__header"><h3><i class="ri-shield-check-line"></i> Login &amp; Session Security</h3></div>' +
      '<div class="card__body">' +
      '<form id="security-form">' +

      toggle(
        'Login protection',
        'sec-login-protection',
        settings.loginProtectionEnabled,
        'Lock the admin account after repeated failed sign-in attempts.'
      ) +

      '<div class="setting-row">' +
      '<div class="setting-row__text">' +
      '<span class="setting-row__label">Failed attempts before lockout</span>' +
      '<span class="setting-row__hint">Maximum wrong password tries before the account is locked.</span>' +
      '</div>' +
      '<input class="form-input setting-row__input" type="number" id="sec-threshold" min="1" max="20" value="' +
      (settings.failedLoginThreshold || 5) + '" />' +
      '</div>' +

      '<div class="setting-row">' +
      '<div class="setting-row__text">' +
      '<span class="setting-row__label">Lockout duration (minutes)</span>' +
      '<span class="setting-row__hint">How long the account stays locked after too many failures.</span>' +
      '</div>' +
      '<input class="form-input setting-row__input" type="number" id="sec-lockout" min="1" max="1440" value="' +
      (settings.lockoutMinutes || 15) + '" />' +
      '</div>' +

      toggle(
        'Auto logout inactive sessions',
        'sec-auto-logout',
        settings.autoLogoutEnabled,
        'Sign out automatically when you are idle for a while.'
      ) +

      '<div class="setting-row">' +
      '<div class="setting-row__text">' +
      '<span class="setting-row__label">Session timeout (minutes)</span>' +
      '<span class="setting-row__hint">Inactivity time before you are signed out. Used when auto logout is on.</span>' +
      '</div>' +
      '<input class="form-input setting-row__input" type="number" id="sec-timeout" min="1" max="1440" value="' +
      (settings.sessionTimeoutMinutes || 30) + '" />' +
      '</div>' +

      '<div class="form-actions">' +
      '<button type="submit" class="btn btn--primary" id="sec-save"><i class="ri-save-line"></i> Save security settings</button>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>'
    );
  }

  function renderAccount(account) {
    const lastLogin = account.lastLoginAt
      ? new Date(account.lastLoginAt).toLocaleString()
      : 'Never';

    return (
      '<div class="card">' +
      '<div class="card__header"><h3><i class="ri-user-settings-line"></i> Account &amp; Credentials</h3></div>' +
      '<div class="card__body">' +
      '<div class="setting-row">' +
      '<div class="setting-row__text">' +
      '<span class="setting-row__label">Last sign in</span>' +
      '<span class="setting-row__hint" id="acc-last-login">' + lastLogin + '</span>' +
      '</div>' +
      '</div>' +
      '<form id="account-form" class="form-grid" style="margin-top:1rem">' +

      field('Admin name', 'acc-name', 'text', account.name, 'Shown in the top bar.') +
      field('Sign-in email', 'acc-email', 'email', account.email, 'You will use this to log in.') +
      field(
        'New password',
        'acc-password',
        'password',
        '',
        'Leave blank to keep the current password.',
        '••••••••'
      ) +

      '<div class="form-group form-group--full">' +
      '<label class="form-label" for="acc-current">Current password</label>' +
      '<input class="form-input" type="password" id="acc-current" placeholder="Required to change email or password" />' +
      '<span class="form-hint">Changing the password signs out all other sessions.</span>' +
      '</div>' +

      '<div class="form-actions form-group--full">' +
      '<button type="submit" class="btn btn--primary" id="acc-save"><i class="ri-save-line"></i> Update account</button>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>'
    );
  }

  async function render(container) {
    try {
      const data = await PortfolioAPI.get('/api/settings');

      container.innerHTML =
        '<div class="page-head"><div>' +
        '<h2>Settings</h2>' +
        '<p>Manage your login credentials and security preferences.</p>' +
        '</div></div>' +
        renderAccount(data.account) +
        renderSecurity(data);

      if (data.autoLogoutEnabled) {
        document.getElementById('sec-timeout').classList.remove('setting-row__input--disabled');
        document.getElementById('sec-timeout').disabled = false;
      }

      const autoLogout = document.getElementById('sec-auto-logout');
      autoLogout.addEventListener('change', () => {
        document.getElementById('sec-timeout').disabled = !autoLogout.checked;
      });

      document.getElementById('account-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('acc-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
        try {
          const payload = {
            name: document.getElementById('acc-name').value.trim(),
            email: document.getElementById('acc-email').value.trim(),
            currentPassword: document.getElementById('acc-current').value,
            newPassword: document.getElementById('acc-password').value
          };
          const result = await PortfolioAPI.put('/api/settings/account', payload);
          if (result.token) {
            PortfolioAPI.setAuth(result.token, result.user);
          }
          window.showToast(result.message || 'Account updated successfully');
          render(container);
        } catch (error) {
          window.showToast(error.message, 'error');
          btn.disabled = false;
          btn.innerHTML = '<i class="ri-save-line"></i> Update account';
        }
      });

      document.getElementById('security-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('sec-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
        try {
          await PortfolioAPI.put('/api/settings/security', {
            loginProtectionEnabled: document.getElementById('sec-login-protection').checked,
            failedLoginThreshold: document.getElementById('sec-threshold').value,
            lockoutMinutes: document.getElementById('sec-lockout').value,
            autoLogoutEnabled: document.getElementById('sec-auto-logout').checked,
            sessionTimeoutMinutes: document.getElementById('sec-timeout').value
          });
          window.showToast('Security settings saved successfully');
          const after = await PortfolioAPI.get('/api/settings');
          window.__updateIdleTimer(after.sessionTimeoutMinutes);
          render(container);
        } catch (error) {
          window.showToast(error.message, 'error');
          btn.disabled = false;
          btn.innerHTML = '<i class="ri-save-line"></i> Save security settings';
        }
      });
    } catch (error) {
      container.innerHTML = window.emptyState(error.message);
    }
  }

  window.Pages.settings = { title: 'Settings', render };
})();