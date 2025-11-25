const canvas = document.getElementById('background-animation');
const ctx = canvas.getContext('2d');

let width, height;
let columns;
const fontSize = 16; // Slightly larger for better visibility of characters
const drops = [];

// Katakana, Latin, and Numbers
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const alphabet = katakana + latin + nums;

// Initialize or reset the animation state
function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);

    // Initialize drops if array is empty or size changed significantly
    if (drops.length !== columns) {
        drops.length = 0;
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -100); // Start at random positions above
        }
    }
}

window.addEventListener('resize', init);
init();

// Mouse interaction
let mouseX = -1000;
let mouseY = -1000;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

let frameCount = 0;

function draw() {
    // Reset shadow properties to prevent "blinking" bug on the background clear
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Semi-transparent black to create trail effect
    // Lower alpha = longer trails = "fuller" rain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px monospace';

    // Slow down the animation by updating only every 4th frame (half speed of previous)
    frameCount++;
    if (frameCount % 4 !== 0) {
        requestAnimationFrame(draw);
        return;
    }

    for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Mouse interaction: brighten characters near mouse
        const dist = Math.hypot(x - mouseX, y - mouseY);
        if (dist < 150) {
            ctx.fillStyle = '#B2FF59'; // Brighter green
            // Removed shadowBlur to prevent artifacts
        } else {
            ctx.fillStyle = '#03A062'; // Matrix green
        }

        ctx.fillText(text, x, y);

        // Reset drop to top randomly
        // Lower threshold = more frequent resets = "fuller" rain
        if (y > height && Math.random() > 0.95) {
            drops[i] = 0;
        }

        drops[i]++;
    }

    requestAnimationFrame(draw);
}

// Check for reduced motion preference
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!mediaQuery.matches) {
    draw();
}

// Skill bars animation
document.addEventListener("DOMContentLoaded", function () {
    const skillBars = document.querySelectorAll('.skill-bar');

    skillBars.forEach(bar => {
        const percentage = bar.getAttribute('data-percentage');
        // Add a small delay for visual effect
        setTimeout(() => {
            bar.style.width = percentage;
        }, 500);
    });
});

