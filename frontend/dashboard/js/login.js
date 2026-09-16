(function () {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  // Redirect if already logged in
  if (PortfolioAPI.getToken()) {
    window.location.href = '/dashboard/index.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('show');
    errorBox.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorBox.textContent = 'Please enter your email and password.';
      errorBox.classList.add('show');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const data = await PortfolioAPI.post('/api/auth/login', { email, password });
      PortfolioAPI.setAuth(data.token, data.user);
      window.location.href = '/dashboard/index.html';
    } catch (error) {
      errorBox.textContent = error.message || 'Login failed. Please try again.';
      errorBox.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="ri-login-box-line"></i> Sign In';
    }
  });
})();