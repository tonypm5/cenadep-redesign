// Navigation Mobile Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// Update active nav link based on scroll
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

if (document.querySelectorAll('section[id]').length > 0) {
  updateActiveNav();
}

// Counter Animation
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      
      if (entry.target.classList.contains('stat-number')) {
        const target = parseInt(entry.target.textContent.replace(/[^0-9]/g, ''));
        if (!entry.target.dataset.animated) {
          animateCounter(entry.target, target);
          entry.target.dataset.animated = 'true';
        }
      }
      
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.program-card, .blog-item, .stat, [data-animate]').forEach(el => {
  observer.observe(el);
});

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    console.log('Form submitted:', formData);
    alert('Merci pour votre message ! Nous vous recontacterons bientôt.');
    this.reset();
  });
}

console.log('%c🌱 Bienvenue sur le site CENADEP', 'color: #1A8F4D; font-size: 16px; font-weight: bold;');
console.log('%cAppui au développement et à la participation populaire en RDC', 'color: #736B63; font-size: 12px;');