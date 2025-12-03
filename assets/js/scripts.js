const canvas = document.getElementById('background-animation');
const ctx = canvas.getContext('2d');

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

const fontSize = 22;
let columns = 0;
let drops = [];
let intervalId = null;
let mouseX = -1000;
let mouseY = -1000;
let mouseActive = false;
let lastMouseMove = 0;
const hoverRadius = 140;
const openRadius = 160;
const hoverFadeMs = 800;

function initMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / (fontSize * 0.6));
  drops = Array.from({ length: columns }, () => Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < drops.length; i++) {
    const char = charArray[Math.floor(Math.random() * charArray.length)];
    const x = i * fontSize * 0.6;
    const y = drops[i] * fontSize;

    const now = performance.now();
    const isHot = mouseActive && now - lastMouseMove < hoverFadeMs;
    const dist = Math.hypot(x - mouseX, y - mouseY);

    // brighten near pointer
    ctx.fillStyle = dist < hoverRadius && isHot ? '#B2FF59' : '#afa';
    ctx.fillText(char, x, y);

    // create a simple "opening" effect by pushing drops away from pointer
    if (isHot && dist < openRadius) {
      const push = (openRadius - dist) / openRadius; // 0..1
      drops[i] += 0.2 + push * 0.4; // temporarily accelerate away
    }

    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

function startMatrix() {
  initMatrix();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(drawMatrix, 70);
}

window.addEventListener('resize', initMatrix);
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseActive = true;
  lastMouseMove = performance.now();
});

// Respect reduced motion preference
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!mediaQuery.matches) {
  startMatrix();
}

// Skill bars animation
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar');
  skillBars.forEach((bar) => {
    const percentage = bar.getAttribute('data-percentage');
    setTimeout(() => {
      bar.style.width = percentage;
    }, 500);
  });
}

// SPA Navigation to persist background animation
function initNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    // Ignore external links, anchors, and special schemes
    if (
      link.origin !== window.location.origin ||
      link.getAttribute('href').startsWith('#') ||
      link.getAttribute('href').startsWith('mailto:') ||
      link.target === '_blank'
    ) {
      return;
    }

    e.preventDefault();
    navigateTo(link.href);
  });

  window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
  });
}

async function navigateTo(url, push = true) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const newContent = doc.querySelector('.main-content');
    const currentContent = document.querySelector('.main-content');

    if (newContent && currentContent) {
      currentContent.innerHTML = newContent.innerHTML;
      document.title = doc.title;

      if (push) {
        history.pushState({}, '', url);
      }

      // Re-initialize page specific scripts
      initSkillBars();

      // Scroll to top
      window.scrollTo(0, 0);
    } else {
      // Fallback if structure is different
      window.location.href = url;
    }
  } catch (err) {
    console.error('Navigation failed', err);
    window.location.href = url;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initSkillBars();
  initNavigation();
});
