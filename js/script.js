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

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || (entry.target.closest('.feature-grid, .steps-grid') ? (i % 3) * 90 : 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Animated counters
  const counters = document.querySelectorAll('.stat-num');
  const animateCount = function (el) {
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
  const countObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));

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
});
