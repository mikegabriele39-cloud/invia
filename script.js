const topbar = document.getElementById("topbar");
const heroLogo = document.getElementById("heroLogo");
const cursorGlow = document.getElementById("cursorGlow");
const viewerShell = document.getElementById("viewerShell");
const shirtObject = document.getElementById("shirtObject");
const viewButtons = document.querySelectorAll(".view-btn");
const sizeButtons = document.querySelectorAll(".sizes button");
const addButton = document.getElementById("addButton");
const cartCount = document.getElementById("cartCount");

let angle = 0;
let zoom = 1;
let dragging = false;
let startX = 0;
let startAngle = 0;

function applyTransform(animate = true) {
  shirtObject.style.transition = animate ? "transform .5s cubic-bezier(.2,.75,.2,1)" : "none";
  shirtObject.style.transform = `rotateY(${angle}deg) scale(${zoom})`;

  const n = ((angle % 360) + 360) % 360;
  const front = n < 90 || n > 270;
  viewButtons[0].classList.toggle("active", front);
  viewButtons[1].classList.toggle("active", !front);
}

window.addEventListener("scroll", () => {
  const progress = Math.min(window.scrollY / 520, 1);
  heroLogo.style.transform = `translateY(${progress * -220}px) scale(${1 - progress * .62})`;
  heroLogo.style.opacity = 1 - progress * .42;
  topbar.classList.toggle("visible", window.scrollY > 260);
});

window.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
  cursorGlow.style.opacity = "1";
});

viewerShell.addEventListener("pointerdown", (e) => {
  dragging = true;
  startX = e.clientX;
  startAngle = angle;
  viewerShell.setPointerCapture(e.pointerId);
});
viewerShell.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  angle = startAngle + (e.clientX - startX) * .72;
  applyTransform(false);
});
viewerShell.addEventListener("pointerup", (e) => {
  dragging = false;
  const n = ((angle % 360) + 360) % 360;
  angle = (n < 90 || n > 270)
    ? Math.round(angle / 360) * 360
    : Math.round((angle - 180) / 360) * 360 + 180;
  applyTransform(true);
  viewerShell.releasePointerCapture(e.pointerId);
});
viewerShell.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoom = Math.min(1.22, Math.max(.88, zoom - e.deltaY * .0007));
  applyTransform(false);
}, { passive:false });

viewButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    angle = Number(btn.dataset.angle);
    applyTransform(true);
  });
});

sizeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sizeButtons.forEach(x => x.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

addButton.addEventListener("click", () => {
  cartCount.textContent = Number(cartCount.textContent || "0") + 1;
  addButton.textContent = "Added to Cart";
  setTimeout(() => addButton.textContent = "Add to Cart", 1200);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold:.15 });
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

  particles = Array.from({length: Math.min(70, Math.floor(innerWidth/18))}, () => ({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:Math.random()*1.1+.2,
    v:Math.random()*.16+.03,
    a:Math.random()*.35+.1
  }));
}
function drawParticles(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of particles){
    p.y -= p.v;
    if(p.y < -5){p.y = innerHeight+5; p.x = Math.random()*innerWidth}
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();
