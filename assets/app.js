(() => {
  const body = document.body;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lockScroll = () => body.classList.add('no-scroll');
  const unlockScroll = () => {
    if (!document.querySelector('.modal-overlay.open') && !document.querySelector('.drawer.open')) {
      body.classList.remove('no-scroll');
    }
  };

  const trapFocus = (container, event) => {
    const focusables = [...container.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusables.length || event.key !== 'Tab') return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const langSwitcher = document.querySelector('[data-lang-switch]');
  if (langSwitcher) {
    const trigger = langSwitcher.querySelector('[data-lang-trigger]');
    const menu = langSwitcher.querySelector('[data-lang-menu]');
    const closeMenu = () => {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', (e) => {
      if (!langSwitcher.contains(e.target)) closeMenu();
    });

    langSwitcher.querySelectorAll('[data-lang-path]').forEach(link => {
      link.addEventListener('click', () => {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const basePath = link.getAttribute('data-lang-path');
        link.setAttribute('href', `${basePath}${search}${hash}`);
      });
    });

    const suggestEl = document.querySelector('[data-lang-suggest]');
    if (suggestEl) {
      const current = document.documentElement.lang;
      const map = { en: '/index.html', de: '/de/index.html', fr: '/fr/index.html', es: '/es/index.html', it: '/it/index.html' };
      const browserLang = (navigator.language || '').slice(0, 2);
      if (browserLang && browserLang !== current && map[browserLang]) {
        suggestEl.textContent = suggestEl.dataset.template.replace('{lang}', browserLang.toUpperCase());
        suggestEl.hidden = false;
      }
    }
  }

  const drawer = document.querySelector('[data-drawer]');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const drawerToggle = document.querySelector('[data-drawer-toggle]');
  const drawerClose = document.querySelector('[data-drawer-close]');

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    drawerToggle?.setAttribute('aria-expanded', 'false');
    unlockScroll();
  };

  if (drawer) {
    drawerToggle?.addEventListener('click', () => {
      drawer.classList.add('open');
      drawerOverlay.classList.add('open');
      drawerToggle.setAttribute('aria-expanded', 'true');
      lockScroll();
      drawer.querySelector('button, a')?.focus();
    });
    drawerClose?.addEventListener('click', closeDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', (e) => {
      if (e.target.matches('a')) closeDrawer();
    });
    drawer.addEventListener('keydown', (e) => trapFocus(drawer, e));
  }

  const modal = document.querySelector('[data-modal]');
  const modalOverlay = document.querySelector('[data-modal-overlay]');
  const modalOpeners = document.querySelectorAll('[data-modal-open]');
  const modalClosers = document.querySelectorAll('[data-modal-close]');

  const closeModal = () => {
    if (!modal) return;
    modalOverlay.classList.remove('open');
    modalOpeners.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    unlockScroll();
  };

  if (modal) {
    modalOpeners.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      lockScroll();
      modal.querySelector('button, a')?.focus();
    }));
    modalClosers.forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    modal.addEventListener('keydown', (e) => trapFocus(modal, e));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeModal();
      const openLang = document.querySelector('[data-lang-menu].open');
      if (openLang) {
        openLang.classList.remove('open');
        document.querySelector('[data-lang-trigger]')?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger?.addEventListener('click', () => {
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
      const isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  const countUp = (el, to) => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const value = Math.floor(start + (to - start) * progress);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (!el.dataset.played) {
            const to = parseInt(el.dataset.counter, 10);
            countUp(el, Number.isFinite(to) ? to : 0);
            el.dataset.played = '1';
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  const bars = document.querySelectorAll('[data-bar]');
  if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = `${fill.dataset.bar}%`;
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(fill => barObserver.observe(fill));
  }

  const forms = document.querySelectorAll('[data-lead-form]');
  const toast = document.querySelector('[data-toast]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]');
      const email = form.querySelector('[name="email"]');
      const phone = form.querySelector('[name="phone"]');
      const emailValid = email.value.includes('@') && email.value.includes('.');
      if (name.value.trim().length < 2 || !emailValid || phone.value.trim().length < 6) {
        form.reportValidity();
        return;
      }
      form.reset();
      if (toast) {
        toast.textContent = toast.dataset.message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
      }
    });
  });
})();
