document.addEventListener('DOMContentLoaded', function () {
  // Year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Sticky header shadow
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');
  const onScroll = function () {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (backToTop) backToTop.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const toggleMenu = function (force) {
    const open = force !== undefined ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars', !open);
    icon.classList.toggle('fa-xmark', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () { toggleMenu(); });
  }

  // Nav links: active state + smooth scroll + close mobile menu
  const navLinks = document.querySelectorAll('.nav-list a');
  navLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      if (nav.classList.contains('open')) toggleMenu(false);
    });
  });

  // Scrollspy — highlight active nav link
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Animated counters
  const animateCount = function (el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const tick = function (now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };

  // Reveal-on-scroll (robust: reveals anything at/above the trigger line, so
  // nothing stays hidden after fast scrolling or jumping via anchor links).
  const revealEls = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('.stat-num');
  const revealAll = function () {
    revealEls.forEach(el => el.classList.add('visible'));
    counters.forEach(c => animateCount(c));
  };

  if (!('requestAnimationFrame' in window) || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    const checkReveal = function () {
      const trigger = window.innerHeight * 0.9;
      revealEls.forEach(function (el) {
        if (!el.classList.contains('visible') && el.getBoundingClientRect().top < trigger) {
          el.classList.add('visible');
        }
      });
      counters.forEach(function (c) {
        if (!c.dataset.counted && c.getBoundingClientRect().top < window.innerHeight * 0.85) {
          animateCount(c);
        }
      });
    };
    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal, { passive: true });
    window.addEventListener('load', checkReveal);
    // Initial reveal: run now and on the next frame (after layout) so
    // above-the-fold content shows instantly with no flash.
    checkReveal();
    requestAnimationFrame(checkReveal);
    // Safety net: never leave content hidden even if a scroll event is missed.
    setTimeout(checkReveal, 600);
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) {
        status.textContent = 'الرجاء تعبئة جميع الحقول.';
        status.style.color = '#D32F2F';
        return;
      }
      status.textContent = 'جاري إرسال الرسالة...';
      status.style.color = 'var(--primary)';
      setTimeout(function () {
        status.textContent = 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً ✅';
        status.style.color = 'var(--accent)';
        form.reset();
      }, 1400);
    });
  }

  // "Coming soon" toast for store badges (app not launched yet)
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<i class="fas fa-rocket"></i>' +
    '<div><strong>قريباً بإذن الله</strong><span>يُسر تحت الإطلاق — ترقّب توفّره على المتجر قريباً.</span></div>';
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = function () {
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
  };
  document.querySelectorAll('.app-badge').forEach(function (badge) {
    badge.addEventListener('click', function (e) {
      e.preventDefault();
      showToast();
    });
  });
});
