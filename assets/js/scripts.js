(function () {
  const canvas = document.getElementById('background-animation');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, columns;
  const fontSize = 16;
  const drops = [];
  const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops.length = 0;
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }
  }

  window.addEventListener('resize', init);
  init();

  let mouseX = -1000;
  let mouseY = -1000;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let frameCount = 0;

  function draw() {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px monospace';

    frameCount++;
    if (frameCount % 4 !== 0) {
      requestAnimationFrame(draw);
      return;
    }

    for (let i = 0; i < drops.length; i++) {
      const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const dist = Math.hypot(x - mouseX, y - mouseY);
      ctx.fillStyle = dist < 150 ? '#B2FF59' : '#03A062';
      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.95) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mediaQuery.matches) {
    draw();
  }
})();
