const root = document.documentElement;
const canvas = document.getElementById('background-animation');
const ctx = canvas ? canvas.getContext('2d') : null;

const chars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

const matrixColors = {
    fade: 'rgba(8, 10, 14, 0.2)',
    base: '#00ff00',
    hover: '#B2FF59',
    glow: 'rgba(0, 255, 0, 0.42)',
};

const matrixState = {
    fontSize: 20,
    columns: 0,
    drops: [],
    pointerX: -9999,
    pointerY: -9999,
    pointerActive: false,
    lastPointerMove: 0,
    hoverRadius: 130,
    openRadius: 160,
    hoverFadeMs: 700,
    rafId: null,
    running: false,
    lastFrameTs: 0,
    frameInterval: 1000 / 20,
};

function updateMatrixThemeColors() {
    const styles = getComputedStyle(root);
    matrixColors.fade = (styles.getPropertyValue('--matrix-fade') || matrixColors.fade).trim();
    matrixColors.base = (styles.getPropertyValue('--matrix-char') || matrixColors.base).trim();
    matrixColors.hover = (styles.getPropertyValue('--matrix-char-hover') || matrixColors.hover).trim();
    matrixColors.glow = (styles.getPropertyValue('--matrix-shadow') || matrixColors.glow).trim();
}

function saveMatrixState() {
    try {
        sessionStorage.setItem('matrixDrops', JSON.stringify(matrixState.drops));
        if (canvas) {
            sessionStorage.setItem('matrixSnapshot', canvas.toDataURL('image/png'));
            sessionStorage.setItem('matrixSize', JSON.stringify({
                w: canvas.clientWidth,
                h: canvas.clientHeight,
            }));
        }
    } catch (e) {
        // Ignore storage failures (quota, private mode, etc.).
    }
}

function loadMatrixDrops(columns) {
    try {
        const saved = sessionStorage.getItem('matrixDrops');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Adapt to current column count: reuse what fits, fill the rest randomly.
                return Array.from({ length: columns }, (_, i) =>
                    i < parsed.length ? parsed[i] : Math.random() * -120
                );
            }
        }
    } catch (e) {
        // Ignore parse/storage failures.
    }
    return null;
}

function restoreCanvasSnapshot() {
    if (!canvas || !ctx) return false;
    try {
        const dataUrl = sessionStorage.getItem('matrixSnapshot');
        const sizeJson = sessionStorage.getItem('matrixSize');
        if (!dataUrl || !sizeJson) return false;

        const size = JSON.parse(sizeJson);
        // Only restore if the viewport size hasn't changed significantly.
        if (Math.abs(size.w - window.innerWidth) > 2 || Math.abs(size.h - window.innerHeight) > 2) {
            return false;
        }

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
        };
        img.src = dataUrl;
        return true;
    } catch (e) {
        return false;
    }
}

function initMatrix() {
    if (!canvas || !ctx) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = Math.ceil(window.innerWidth);
    const height = Math.ceil(window.innerHeight);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    matrixState.columns = Math.floor(width / (matrixState.fontSize * 0.72));

    const restored = loadMatrixDrops(matrixState.columns);
    matrixState.drops = restored || Array.from({ length: matrixState.columns }, () => Math.random() * -120);

    // Paint the saved snapshot immediately so there is no blank flash.
    if (restored) {
        restoreCanvasSnapshot();
    }
}

function drawMatrixFrame(timestamp) {
    if (!canvas || !ctx || !matrixState.running) {
        return;
    }

    if (timestamp - matrixState.lastFrameTs < matrixState.frameInterval) {
        matrixState.rafId = window.requestAnimationFrame(drawMatrixFrame);
        return;
    }
    matrixState.lastFrameTs = timestamp;

    ctx.fillStyle = matrixColors.fade;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.font = `600 ${matrixState.fontSize}px monospace`;
    ctx.textBaseline = 'top';

    const isHot = matrixState.pointerActive && timestamp - matrixState.lastPointerMove < matrixState.hoverFadeMs;

    for (let i = 0; i < matrixState.drops.length; i += 1) {
        const x = i * matrixState.fontSize * 0.72;
        const y = matrixState.drops[i] * matrixState.fontSize;
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const dist = Math.hypot(x - matrixState.pointerX, y - matrixState.pointerY);

        ctx.fillStyle = isHot && dist < matrixState.hoverRadius ? matrixColors.hover : matrixColors.base;
        ctx.shadowColor = matrixColors.glow;
        ctx.shadowBlur = 6;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (isHot && dist < matrixState.openRadius) {
            const push = (matrixState.openRadius - dist) / matrixState.openRadius;
            matrixState.drops[i] += 0.13 + push * 0.33;
        }

        if (y > canvas.clientHeight && Math.random() > 0.975) {
            matrixState.drops[i] = 0;
        }

        matrixState.drops[i] += 0.9;
    }

    matrixState.rafId = window.requestAnimationFrame(drawMatrixFrame);
}

function startMatrix() {
    if (!canvas || !ctx || matrixState.running) {
        return;
    }

    matrixState.running = true;
    matrixState.lastFrameTs = 0;
    initMatrix();
    matrixState.rafId = window.requestAnimationFrame(drawMatrixFrame);
}

function stopMatrix() {
    matrixState.running = false;
    if (matrixState.rafId) {
        window.cancelAnimationFrame(matrixState.rafId);
        matrixState.rafId = null;
    }
}

function initSkillBars() {
    const skillBars = Array.from(document.querySelectorAll('.skill-bar'));
    if (!skillBars.length) {
        return;
    }

    const animateBars = () => {
        skillBars.forEach((bar) => {
            const target = bar.getAttribute('data-percentage') || '0%';
            bar.style.width = target;
        });
    };

    if (!('IntersectionObserver' in window)) {
        animateBars();
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            const isVisible = entries.some((entry) => entry.isIntersecting);
            if (!isVisible) {
                return;
            }
            animateBars();
            observer.disconnect();
        },
        {
            threshold: 0.25,
        }
    );

    skillBars.forEach((bar) => observer.observe(bar));
}

function updateHeroImage(theme) {
    const heroImg = document.getElementById('hero-photo');
    if (!heroImg) {
        return;
    }

    const lightSrc = heroImg.getAttribute('data-theme-image-light');
    const darkSrc = heroImg.getAttribute('data-theme-image-dark');
    const currentSrc = heroImg.getAttribute('src');
    const nextSrc = theme === 'light' ? lightSrc || currentSrc : darkSrc || currentSrc;

    if (nextSrc && nextSrc !== currentSrc) {
        heroImg.setAttribute('src', nextSrc);
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        updateMatrixThemeColors();
        return;
    }

    const icon = themeToggle.querySelector('.theme-toggle__icon');

    const updateToggleLabel = (theme) => {
        const isLight = theme === 'light';
        themeToggle.setAttribute('aria-pressed', String(isLight));
        if (icon) {
            icon.textContent = isLight ? '☀' : '☾';
        }
    };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            // Ignore storage failures in private modes.
        }
        updateToggleLabel(theme);
        updateMatrixThemeColors();
        updateHeroImage(theme);
    };

    const currentTheme = root.getAttribute('data-theme') || 'dark';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
    });
}

function initNavigationMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');

    if (!navToggle || !nav) {
        return;
    }

    const closeMenu = () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const isOpen = nav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    };

    navToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    nav.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest('a')) {
            closeMenu();
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (!nav.contains(target) && target !== navToggle) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

function initMatrixBehavior() {
    if (!canvas || !ctx) {
        return;
    }

    updateMatrixThemeColors();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionState = () => {
        if (prefersReduced.matches || document.visibilityState === 'hidden') {
            stopMatrix();
            return;
        }
        startMatrix();
    };

    updateMotionState();

    window.addEventListener('resize', initMatrix);

    const handlePointer = (event) => {
        matrixState.pointerX = event.clientX;
        matrixState.pointerY = event.clientY;
        matrixState.pointerActive = true;
        matrixState.lastPointerMove = performance.now();
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });

    window.addEventListener('pointerleave', () => {
        matrixState.pointerActive = false;
    });

    if (typeof prefersReduced.addEventListener === 'function') {
        prefersReduced.addEventListener('change', updateMotionState);
    } else {
        prefersReduced.addListener(updateMotionState);
    }

    document.addEventListener('visibilitychange', updateMotionState);

    // Persist drop positions across page navigations.
    window.addEventListener('beforeunload', saveMatrixState);
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavigationMenu();
    initSkillBars();
    initMatrixBehavior();
});
