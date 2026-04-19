/* ============================================
   Red Mountain — Shared JavaScript
   ============================================ */

/* ── Navigation scroll behavior ── */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  const hamburger = document.querySelector('.nav__hamburger');
  const links = document.querySelector('.nav__links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      hamburger.classList.toggle('open');
      
      if (links.classList.contains('mobile-open')) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('mobile-open');
        hamburger.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }
}

function initFadeUps() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}

/* ── FAQ accordion ── */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ── Language switcher ── */
function initLang() {
  const buttons = document.querySelectorAll('.nav__lang button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In production: swap text nodes or redirect to /vi/ /ko/
      const lang = btn.dataset.lang;
      console.log('Language switched to:', lang);
    });
  });
}

/* ── Counter animation ── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentVal = target * eased;
    const isDecimal = target % 1 !== 0;
    const value = isDecimal ? currentVal.toFixed(1) : Math.round(currentVal);
    el.innerHTML = `${prefix}${value}<span class="stat-suffix">${suffix}</span>`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

/* ── Contact form ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#3D5A47';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 4000);
  });
}

/* ── Hero Slider ── */
function initHeroSlider() {
  const slider = document.getElementById('hero-slideshow');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero__slide');
  const dots = slider.querySelectorAll('.hero__dot');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    if (!slides.length) return;
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    if (!slides.length) return;
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetInterval();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetInterval();
    });
  }

  // Click on slide/image to advance
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(index);
      resetInterval();
    });
  });

  function startInterval() {
    slideInterval = setInterval(nextSlide, 4000); // 4 seconds for a more dynamic feel
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  startInterval();
}

/* ── Lightbox (Image Zoom) ── */
function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <button class="lightbox-arrow lightbox-arrow--prev" aria-label="Previous image">&lsaquo;</button>
    <button class="lightbox-arrow lightbox-arrow--next" aria-label="Next image">&rsaquo;</button>
    <img src="" alt="Zoomed view">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-arrow--prev');
  const nextBtn = lightbox.querySelector('.lightbox-arrow--next');

  let currentGallery = [];
  let currentIndex = 0;

  const showImage = (index) => {
    if (!currentGallery.length) return;
    if (index < 0) index = currentGallery.length - 1;
    if (index >= currentGallery.length) index = 0;
    
    currentIndex = index;
    const targetImg = currentGallery[currentIndex];
    
    // Smooth transition
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = targetImg.src;
      lightboxImg.style.opacity = '1';
    }, 150);

    // Toggle arrows
    const showArrows = currentGallery.length > 1;
    prevBtn.style.display = showArrows ? 'flex' : 'none';
    nextBtn.style.display = showArrows ? 'flex' : 'none';
  };

  // Open lightbox
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.room-card__image img, .split__image img, .slide, .hero__slide');
    if (img && !e.target.closest('.hero__arrow') && !e.target.closest('.hero__dot') && !e.target.closest('.lightbox-arrow')) {
      
      // Determine gallery context (all images in the same section/container)
      const container = img.closest('.slider-container, .rooms-grid, .hero__slideshow, .split');
      if (container) {
        currentGallery = Array.from(container.querySelectorAll('img')).filter(i => {
          // Filter out small icons or decorative element images if any exist
          return i.src && i.offsetParent !== null; 
        });
        currentIndex = currentGallery.indexOf(img);
        if (currentIndex === -1) {
           currentGallery = [img];
           currentIndex = 0;
        }
      } else {
        currentGallery = [img];
        currentIndex = 0;
      }

      showImage(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === closeBtn) {
      closeLightbox();
    }
  });

  // Navigation clicks
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* ── Init all ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroSlider();
  initLightbox();
  initFadeUps();
  initFAQ();
  initLang();
  initCounters();
  initContactForm();
});
