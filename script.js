
/* =========================================================
   UTKARSH CHOUDHARY — TECH PORTFOLIO JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelectorAll(".nav__links a");
  const canvas = document.getElementById("netCanvas");

  /* ---------- Sticky nav state ---------- */
  const updateNav = () => {
    nav?.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  /* ---------- Mobile menu ---------- */
  navToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));

    const bars = navToggle.querySelectorAll("span");

    if (isOpen) {
      bars[0].style.transform = "translateY(6px) rotate(45deg)";
      bars[1].style.opacity = "0";
      bars[2].style.transform = "translateY(-6px) rotate(-45deg)";
    } else {
      bars[0].style.transform = "";
      bars[1].style.opacity = "";
      bars[2].style.transform = "";
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      navToggle?.setAttribute("aria-expanded", "false");

      navToggle?.querySelectorAll("span").forEach((bar) => {
        bar.style.transform = "";
        bar.style.opacity = "";
      });
    });
  });

  /* ---------- Reveal sections/cards ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .about__lead, .about__body, .skill-group, .project, .timeline__item, .contact__card"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Tech network canvas ---------- */
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let animationId;

  const config = {
    particleCount: window.innerWidth < 650 ? 42 : 78,
    maxDistance: 155,
    speed: reducedMotion ? 0 : 0.28,
    pointerRadius: 170
  };

  const pointer = {
    x: null,
    y: null
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(randomPosition = false) {
      this.x = randomPosition ? Math.random() * width : width + 10;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;

      if (this.vx === 0) this.vx = 0.1;
      if (this.vy === 0) this.vy = -0.1;

      this.size = Math.random() * 1.5 + 0.6;
      this.blue = Math.random() > 0.54;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -30 || this.x > width + 30) this.vx *= -1;
      if (this.y < -30 || this.y > height + 30) this.vy *= -1;

      if (pointer.x !== null && pointer.y !== null && !reducedMotion) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.pointerRadius && distance > 0) {
          const force = (1 - distance / config.pointerRadius) * 0.35;
          this.x += (dx / distance) * force;
          this.y += (dy / distance) * force;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.blue
        ? "rgba(24,191,255,0.85)"
        : "rgba(255,36,72,0.72)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.blue ? "#18bfff" : "#ff2448";
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const desiredCount = window.innerWidth < 650 ? 42 : 78;
    config.particleCount = desiredCount;

    particles = Array.from(
      { length: config.particleCount },
      () => new Particle()
    );
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > config.maxDistance) continue;

        const opacity = 1 - distance / config.maxDistance;

        const blueLine = a.blue || b.blue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle = blueLine
          ? `rgba(24,191,255,${opacity * 0.10})`
          : `rgba(255,36,72,${opacity * 0.08})`;

        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  function drawPointerLinks() {
    if (pointer.x === null || pointer.y === null) return;

    particles.forEach((p) => {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > config.pointerRadius) return;

      const opacity = 1 - distance / config.pointerRadius;

      ctx.beginPath();
      ctx.moveTo(pointer.x, pointer.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(255,36,72,${opacity * 0.20})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    drawConnections();
    drawPointerLinks();

    if (!reducedMotion) {
      animationId = requestAnimationFrame(render);
    }
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    render();
  });

  resizeCanvas();
  render();
});
