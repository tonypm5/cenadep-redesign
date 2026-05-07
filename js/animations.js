if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
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

  gsap.from('.hero-btn', {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.6
  });

  // Section title animations
  gsap.utils.toArray('.section-title').forEach(element => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 30,
      duration: 0.8
    });
  });

  // Card animations
  gsap.utils.toArray('.program-card').forEach((card, index) => {
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

  // Blog animations
  gsap.utils.toArray('.blog-item').forEach((item, index) => {
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

  // About section animation
  gsap.from('.about-container > *', {
    scrollTrigger: {
      trigger: '.about-container',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: (index) => index === 0 ? -50 : 50,
    duration: 0.8
  });

  // Stats counter animation with GSAP
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

  // CTA animation
  gsap.from('.cta', {
    scrollTrigger: {
      trigger: '.cta',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    scale: 0.95,
    duration: 0.8
  });

  ScrollTrigger.refresh();
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
} else {
  console.warn('GSAP or ScrollTrigger not loaded. Animations disabled.');
}