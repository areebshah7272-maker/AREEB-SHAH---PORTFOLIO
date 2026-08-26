document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('[data-reveal]')];

document.querySelectorAll('[data-stagger]').forEach((group) => {
  group.querySelectorAll('[data-reveal]').forEach((item, index) => {
    if (!item.dataset.delay) item.dataset.delay = String(index * 90);
  });
});

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const parallaxElements = [...document.querySelectorAll('[data-parallax]')];
let scrollFrame = 0;

const renderParallax = () => {
  scrollFrame = 0;
  if (reducedMotion.matches) return;
  const scrollY = window.scrollY;
  parallaxElements.forEach((element) => {
    const factor = Number(element.dataset.parallax || 0);
    element.style.transform = `translate3d(0, ${scrollY * factor}px, 0)`;
  });
};

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(renderParallax);
}, { passive: true });

const finePointer = window.matchMedia('(pointer: fine)');
if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    button.addEventListener('blur', () => { button.style.transform = ''; });
  });

  document.querySelectorAll('[data-depth]').forEach((surface) => {
    const card = surface.querySelector('[data-depth-card]');
    if (!card) return;

    surface.addEventListener('pointermove', (event) => {
      const bounds = surface.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -6;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(14px)`;
    });
    surface.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  const heroStage = document.querySelector('.hero-stage');
  const heroCard = heroStage?.querySelector('[data-depth-card]');
  if (heroStage && heroCard) {
    heroStage.addEventListener('pointermove', (event) => {
      const bounds = heroStage.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -4;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
      heroCard.style.transform = `rotate(4deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    heroStage.addEventListener('pointerleave', () => { heroCard.style.transform = ''; });
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const menuLinks = mobileMenu ? [...mobileMenu.querySelectorAll('a')] : [];

const setMenuState = (open, returnFocus = false) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  const label = menuToggle.querySelector('.menu-label');
  if (label) label.textContent = open ? 'Close' : 'Menu';
  if (open) menuLinks[0]?.focus();
  if (!open && returnFocus) menuToggle.focus();
};

menuToggle?.addEventListener('click', () => {
  setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
});

menuLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));

document.addEventListener('keydown', (event) => {
  if (!menuToggle || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') setMenuState(false, true);
  if (event.key !== 'Tab' || !mobileMenu) return;
  const focusable = [menuToggle, ...menuLinks];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) setMenuState(false);
}, { passive: true });

const navigationLinks = [...document.querySelectorAll('.nav-links a')];
const trackedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navigationLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  trackedSections.forEach((section) => sectionObserver.observe(section));
}

const yearElement = document.querySelector('[data-year]');
if (yearElement) yearElement.textContent = String(new Date().getFullYear());
