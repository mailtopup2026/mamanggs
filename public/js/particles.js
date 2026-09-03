// PARTICLE CANVAS FLOATING SYSTEM (CYBER VOLT LIME EDITION)
document.addEventListener("DOMContentLoaded", () => {
  let canvas = document.getElementById("bg-particles");

  // Jika canvas belum ada di HTML, buat otomatis
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "bg-particles";
    document.body.prepend(canvas);
  }

  // Pastikan style canvas mengunci layar penuh dan berada di layer yang pas
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0"; // Berada tepat di atas background body
  canvas.style.opacity = "0.85";

  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.6 - 0.2; // Melayang perlahan ke atas
      this.opacity = Math.random() * 0.7 + 0.3;

      // Palet: Putih, Volt Lime (#ccff00), dan Cyber Gold
      const rand = Math.random();
      if (rand > 0.5) {
        this.color = "255, 255, 255"; // Kristal Putih
      } else if (rand > 0.15) {
        this.color = "204, 255, 0";   // Volt Lime
      } else {
        this.color = "250, 204, 21";  // Cyber Gold
      }
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
        this.reset();
        this.y = canvas.height;
      }
    }
    draw() {
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Jumlah partikel dioptimalkan untuk mobile & desktop
  const particleCount = window.innerWidth < 768 ? 45 : 75;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
});