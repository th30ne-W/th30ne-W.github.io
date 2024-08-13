// Get the background animation container
const backgroundAnimation = document.getElementById('background-animation');

// Increase the number of elements generated
const numberOfElements = 200; // Set to the desired number of elements

// Create the number elements
for (let i = 0; i < numberOfElements; i++) { 
  const number = document.createElement('div');
  number.classList.add('number');
  number.textContent = Math.random() < 0.5 ? '0' : '1'; // Generate only "0" and "1"

  // Random initial position
  number.style.left = `${Math.random() * 100}%`;
  number.style.top = `${Math.random() * 100}%`;

  // Set a constant downward speed
  number.dataset.dy = 0.1 + Math.random() * 0.2; // Slow downward speed

  backgroundAnimation.appendChild(number);
}

// Store mouse coordinates
let mouseX = 0;
let mouseY = 0;

// Add event listener for mousemove
backgroundAnimation.addEventListener('mousemove', (event) => {
  const rect = backgroundAnimation.getBoundingClientRect();
  mouseX = (event.clientX - rect.left) / rect.width * 100; // Adjust for container offset and convert to percentage
  mouseY = (event.clientY - rect.top) / rect.height * 100;
});

// Animation loop
function animate() {
    const numbers = document.querySelectorAll('.number');
  
    numbers.forEach(number => {
      let x = parseFloat(number.style.left); 
      let y = parseFloat(number.style.top); 
      let dy = parseFloat(number.dataset.dy); 
  
      // Mouse interaction
      const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
      const maxDistance = 10; // Small evasion distance
      const evasionRadius = 1.5; // Small evasion radius
      let dx = 0; // No horizontal movement by default
  
      if (distance < maxDistance) {
        const angle = Math.atan2(y - mouseY, x - mouseX);
        const evasionX = Math.cos(angle) * evasionRadius;
  
        // Slightly adjust dx to just miss the mouse pointer horizontally
        dx += evasionX / 10;
      }
  
      // Apply only downward movement (dy)
      y += dy;
      x += dx; // Apply horizontal evasion only when necessary
  
      // Wrap around if number goes offscreen (vertically only)
      if (y > 100) {
        y = -10;
        // Optionally reset to a new random position when wrapping
        x = Math.random() * 100;
        number.dataset.dy = 0.1 + Math.random() * 0.2; // Reset to a slow downward speed
      }
  
      number.style.left = `${x}%`;
      number.style.top = `${y}%`;
    });
  
    requestAnimationFrame(animate);
}
  
// Start the animation
animate();
