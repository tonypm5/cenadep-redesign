/* ==================== GSAP ANIMATIONS ==================== */

// Register GSAP Plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Hero Title Animation
  gsap.from('.hero h1', {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.2
  });

  gsap.from('.hero p', {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.4
  });

  gsap.from('.hero-buttons .btn', {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.6,
    stagger: 0.1
  });

  // Section Title Animation
  gsap.utils.toArray('.section-title').forEach(element => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1
      },
      opacity: 0,
      y: 30,
      duration: 0.8
    });
  });

  // Card Stagger Animation
  gsap.utils.toArray('.card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: index * 0.1
    });
  });

  // News Item Animation
  gsap.utils.toArray('.news-item').forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: index * 0.1
    });
  });

  // About Content Animation
  gsap.from('.about-content', {
    scrollTrigger: {
      trigger: '.about-content',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -50,
    duration: 0.8
  });

  gsap.from('.about-image', {
    scrollTrigger: {
      trigger: '.about-image',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: 50,
    duration: 0.8
  });

  // Parallax Effect
  gsap.utils.toArray('.hero-bg').forEach(bg => {
    gsap.to(bg, {
      scrollTrigger: {
        trigger: bg,
        scrub: true
      },
      y: (i, target) => -innerHeight * 0.5,
      ease: 'none'
    });
  });

  // Stats Counter Animation on Scroll
  gsap.utils.toArray('.stat-number').forEach(stat => {
    let proxy = { value: 0 },
      target = parseFloat(stat.textContent.replace(/[^0-9]/g, '')),
      tweeningDuration = 0.5;

    gsap.to(proxy, {
      scrollTrigger: {
        trigger: stat,
        start: 'top 80%',
        once: true
      },
      value: target,
      duration: tweeningDuration,
      onUpdate: () => {
        stat.textContent = Math.floor(proxy.value).toLocaleString();
      }
    });
  });

  // Values List Animation
  gsap.from('.values-list li', {
    scrollTrigger: {
      trigger: '.values-list',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -30,
    duration: 0.5,
    stagger: 0.1
  });

  // Contact Form Animation
  gsap.from('.contact-info', {
    scrollTrigger: {
      trigger: '.contact-info',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -50,
    duration: 0.8
  });

  gsap.from('.contact-form', {
    scrollTrigger: {
      trigger: '.contact-form',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: 50,
    duration: 0.8
  });

  // Smooth ScrollTrigger Refresh
  ScrollTrigger.refresh();
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
} else {
  console.warn('GSAP not loaded. Animations disabled.');
}