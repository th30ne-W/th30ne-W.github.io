const canvas = document.getElementById('background-animation');
const ctx = canvas.getContext('2d');

// Matrix rain characters
const chars =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

// Rain settings
const fontSize = 22;
let columns = 0;
let drops = [];
let intervalId = null;

// Hover interaction
let mouseX = -1000;
let mouseY = -1000;
let mouseActive = false;
let lastMouseMove = 0;
const hoverRadius = 140;
const openRadius = 160;
const hoverFadeMs = 800;

// Theme-aware matrix colors
const matrixColors = {
  fade: 'rgba(0, 0, 0, 0.1)',
  base: '#afa',
  hover: '#B2FF59',
  glow: 'rgba(0, 255, 138, 0.35)',
};

function initMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / (fontSize * 0.6));
  drops = Array.from({ length: columns }, () => Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = matrixColors.fade;
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
    ctx.fillStyle = dist < hoverRadius && isHot ? matrixColors.hover : matrixColors.base;
    ctx.shadowColor = matrixColors.glow;
    ctx.shadowBlur = 6;
    ctx.fillText(char, x, y);
    ctx.shadowBlur = 0;

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

function updateMatrixThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  matrixColors.fade = (styles.getPropertyValue('--matrix-fade') || matrixColors.fade).trim();
  matrixColors.base = (styles.getPropertyValue('--matrix-char') || matrixColors.base).trim();
  matrixColors.hover = (styles.getPropertyValue('--matrix-char-hover') || matrixColors.hover).trim();
  matrixColors.glow = (styles.getPropertyValue('--matrix-shadow') || matrixColors.glow).trim();
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
  updateMatrixThemeColors();
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
      initThemeToggle();

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

function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function updateToggleLabel(theme) {
    if (!themeToggle) return;
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', isLight);
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    const label = themeToggle.querySelector('.theme-toggle__label');
    if (icon) icon.textContent = isLight ? '☀' : '☾';
    if (label) label.textContent = isLight ? 'Light' : 'Dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) { /* ignore */ }
    updateMatrixThemeColors();
    updateToggleLabel(theme);
    updateHeroImage(theme);
  }

  if (themeToggle) {
    const current = root.getAttribute('data-theme') || 'dark';
    updateToggleLabel(current);
    updateHeroImage(current);
    themeToggle.onclick = null;
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  } else {
    updateMatrixThemeColors();
    updateHeroImage(root.getAttribute('data-theme') || 'dark');
  }
}

function updateHeroImage(theme) {
  const heroImg = document.getElementById('hero-photo');
  if (!heroImg) return;
  const lightSrc = heroImg.getAttribute('data-theme-image-light');
  const darkSrc = heroImg.getAttribute('data-theme-image-dark');
  const nextSrc = theme === 'light' ? lightSrc || heroImg.getAttribute('src') : darkSrc || heroImg.getAttribute('src');
  if (nextSrc && heroImg.getAttribute('src') !== nextSrc) {
    heroImg.setAttribute('src', nextSrc);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initSkillBars();
  initNavigation();
  initThemeToggle();
});
