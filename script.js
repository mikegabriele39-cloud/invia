const intro = document.getElementById("intro");
const topbar = document.getElementById("topbar");
const heroLogo = document.getElementById("heroLogo");
const cursorLight = document.getElementById("cursorLight");
const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const featuredImageWrap = document.getElementById("featuredImageWrap");
const sizeButtons = document.querySelectorAll(".size-picker button");
const addButton = document.getElementById("addButton");
const cartCount = document.getElementById("cartCount");
const cartToast = document.getElementById("cartToast");

window.addEventListener("load", () => {
  setTimeout(() => intro.classList.add("hidden"), 2200);
});

window.addEventListener("scroll", () => {
  const p = Math.min(window.scrollY / 520, 1);
  heroLogo.style.transform = `translateY(${p * -210}px) scale(${1 - p * .61})`;
  heroLogo.style.opacity = 1 - p * .42;
  topbar.classList.toggle("visible", window.scrollY > 240);
});

window.addEventListener("mousemove", (event) => {
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;
  cursorLight.style.opacity = "1";
});

menuButton.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

featuredImageWrap.addEventListener("mousemove", (event) => {
  const img = featuredImageWrap.querySelector("img");
  const rect = featuredImageWrap.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  img.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
});

featuredImageWrap.addEventListener("mouseleave", () => {
  featuredImageWrap.querySelector("img").style.transform = "rotateY(0deg) rotateX(0deg)";
});

sizeButtons.forEach(button => {
  button.addEventListener("click", () => {
    sizeButtons.forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

addButton.addEventListener("click", () => {
  cartCount.textContent = Number(cartCount.textContent || "0") + 1;
  addButton.classList.add("added");
  cartToast.classList.add("show");

  setTimeout(() => {
    addButton.classList.remove("added");
  }, 1000);

  setTimeout(() => {
    cartToast.classList.remove("show");
  }, 1800);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .14 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas(){
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);

  particles = Array.from(
    { length: Math.min(58, Math.floor(innerWidth / 21)) },
    () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * .9 + .2,
      v: Math.random() * .11 + .02,
      a: Math.random() * .24 + .06
    })
  );
}

function drawParticles(){
  ctx.clearRect(0,0,innerWidth,innerHeight);

  for(const p of particles){
    p.y -= p.v;

    if(p.y < -3){
      p.y = innerHeight + 3;
      p.x = Math.random() * innerWidth;
    }

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}

addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();
