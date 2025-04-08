// import '@fontsource/sen';

/*=============== MENU TOGGLE ===============*/
document.addEventListener('DOMContentLoaded', () => {
  const navMenu = document.getElementById('nav-menu'),
        navToggle = document.getElementById('nav-toggle'),
        navClose = document.getElementById('nav-close'),
        navLinks = document.querySelectorAll('.navbar__url');

  // Show menu
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu');
    });
  }

  // Hide menu
  if (navClose) {
    navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
    });
  }

  // Remove menu when clicking links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
    });
  });

  /*=============== DARK THEME ===============*/
  const themeButton = document.getElementById('theme-toggle');
  const darkTheme = 'dark-theme';
  const iconTheme = 'ri-sun-line';
  const logo = document.getElementById('logo');

  const selectedTheme = localStorage.getItem('selected-theme');
  const selectedIcon = localStorage.getItem('selected-icon');

  const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
  const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line';
  const updateLogo = (isDark) => {
    if (logo) {
      logo.src = isDark ? '/assets/logo-white.png' : '/assets/logo-black.png';
    }
  };

  // On load
  if (selectedTheme) {
    const isDark = selectedTheme === 'dark';
    document.body.classList[isDark ? 'add' : 'remove'](darkTheme);
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
    updateLogo(isDark);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add(darkTheme);
      themeButton.classList.remove(iconTheme);
    }
    updateLogo(prefersDark);
  }

  // On theme toggle
  themeButton.addEventListener('click', () => {
    const isDarkNow = document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
    updateLogo(isDarkNow);
  });

  /*=============== ACTIVE LINK STATE ===============*/
  const sections = document.querySelectorAll('section[id]');

  const scrollActive = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 58;
      const sectionId = current.getAttribute('id');

      const link = document.querySelector(`.navbar__url[href*="${sectionId}"]`);
      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add('active-url');
        } else {
          link.classList.remove('active-url');
        }
      }
    });
  };

  window.addEventListener('scroll', scrollActive, { passive: true });

  /*=============== SHOW SCROLL UP BUTTON ===============*/
  const scrollTopBtn = document.getElementById('scroll-top');

  const scrollUp = () => {
    if (window.scrollY >= 350) {
      scrollTopBtn.classList.add('show-scroll');
    } else {
      scrollTopBtn.classList.remove('show-scroll');
    }
  };

  window.addEventListener('scroll', scrollUp, { passive: true });

  // Scroll to top with smooth behavior
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /*=============== INTERSECTION OBSERVER FOR ANIMATIONS ===============*/
  const animateOnScroll = () => {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(element => observer.observe(element));
  };

  animateOnScroll();
});


/*=============== SWIPER ===============*/
var swiper = new Swiper(".swiper", {
  slidesPerView: 1,
  spaceBetween: 20,
  grabCursor: true,
  breakpoints: {
    768: {
      slidesPerView: 2,
    }
  }
});

/*=============== SCROLL REVEAL ANIMATION ===============*/
ScrollReveal().reveal('.segment', {
  origin: 'bottom',
  distance: '50px',
  duration: 1000,
  delay: 200,
  reset: false
});

// Reveal hero heading and image with slight delay
ScrollReveal().reveal('.hero__heading', { delay: 300, origin: 'left' });
ScrollReveal().reveal('.hero__image-container', { delay: 500, origin: 'right' });

// Reveal social links one by one
ScrollReveal().reveal('.hero__social-item', {
  interval: 200,
  origin: 'bottom',
  distance: '20px'
});

// Reveal skills and design blocks
ScrollReveal().reveal('.expertise__category', {
  interval: 300,
  origin: 'bottom'
});

// Reveal education and experience
ScrollReveal().reveal('.background__category', {
  interval: 300,
  origin: 'left'
});
