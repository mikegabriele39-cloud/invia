const topbar = document.getElementById("topbar");
const heroLogo = document.getElementById("heroLogo");
const featuredStage = document.getElementById("featuredStage");
const viewerShell = document.getElementById("viewerShell");
const spinScene = document.getElementById("spinScene");
const viewButtons = document.querySelectorAll(".view-button");
const sizeButtons = document.querySelectorAll(".sizes button");
const addButton = document.getElementById("addButton");
const cartCount = document.getElementById("cartCount");

let currentAngle = 0;
let dragging = false;
let startX = 0;
let startAngle = 0;

function setAngle(angle, animate = true) {
  currentAngle = angle;
  spinScene.style.transition = animate ? "transform .5s cubic-bezier(.2,.7,.2,1)" : "none";
  spinScene.style.transform = `rotateY(${currentAngle}deg)`;

  const normalized = ((currentAngle % 360) + 360) % 360;
  const frontActive = normalized < 90 || normalized > 270;
  viewButtons[0].classList.toggle("active", frontActive);
  viewButtons[1].classList.toggle("active", !frontActive);
}

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const progress = Math.min(y / 520, 1);
  heroLogo.style.transform = `translateY(${progress * -220}px) scale(${1 - progress * .62})`;
  heroLogo.style.opacity = 1 - progress * .42;
  topbar.classList.toggle("visible", y > 260);
});

featuredStage.addEventListener("mousemove", (event) => {
  const img = featuredStage.querySelector("img");
  const rect = featuredStage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  img.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
});
featuredStage.addEventListener("mouseleave", () => {
  featuredStage.querySelector("img").style.transform = "rotateY(0deg) rotateX(0deg)";
});

viewerShell.addEventListener("pointerdown", (event) => {
  dragging = true;
  startX = event.clientX;
  startAngle = currentAngle;
  viewerShell.setPointerCapture(event.pointerId);
});

viewerShell.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const delta = event.clientX - startX;
  setAngle(startAngle + delta * .7, false);
});

viewerShell.addEventListener("pointerup", (event) => {
  dragging = false;
  const normalized = ((currentAngle % 360) + 360) % 360;
  setAngle(normalized < 90 || normalized > 270 ? Math.round(currentAngle / 360) * 360 : Math.round((currentAngle - 180) / 360) * 360 + 180);
  viewerShell.releasePointerCapture(event.pointerId);
});

viewButtons.forEach(button => {
  button.addEventListener("click", () => setAngle(Number(button.dataset.angle)));
});

sizeButtons.forEach(button => {
  button.addEventListener("click", () => {
    sizeButtons.forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
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
