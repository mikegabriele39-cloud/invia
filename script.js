const topbar = document.getElementById("topbar");
const heroLogoWrap = document.getElementById("heroLogoWrap");
const featuredStage = document.getElementById("featuredStage");
const shirtViewer = document.getElementById("shirtViewer");
const shirtImage = document.getElementById("shirtImage");
const viewButtons = document.querySelectorAll(".view-button");
const sizeButtons = document.querySelectorAll(".sizes button");
const addButton = document.getElementById("addButton");
const cartCount = document.getElementById("cartCount");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const progress = Math.min(y / 520, 1);

  const scale = 1 - progress * 0.62;
  const moveY = progress * -220;
  const opacity = 1 - progress * 0.42;

  heroLogoWrap.style.transform = `translateY(${moveY}px) scale(${scale})`;
  heroLogoWrap.style.opacity = opacity;

  topbar.classList.toggle("visible", y > 260);
});

const tiltElement = (element, event, strength = 8) => {
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  element.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
};

const resetTilt = (element) => {
  element.style.transform = "rotateY(0deg) rotateX(0deg)";
};

featuredStage.addEventListener("mousemove", (event) => {
  const img = featuredStage.querySelector("img");
  tiltElement(img, event, 5);
});

featuredStage.addEventListener("mouseleave", () => {
  resetTilt(featuredStage.querySelector("img"));
});

shirtViewer.parentElement.addEventListener("mousemove", (event) => {
  tiltElement(shirtViewer, event, 10);
});

shirtViewer.parentElement.addEventListener("mouseleave", () => {
  resetTilt(shirtViewer);
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const isFront = button.dataset.view === "front";
    shirtImage.style.opacity = "0";

    setTimeout(() => {
      shirtImage.src = isFront ? "vinland-front.png" : "vinland-back.png";
      shirtImage.alt = isFront
        ? "Front view of the Love Your Enemies shirt"
        : "Back view of the Love Your Enemies shirt";
      shirtImage.style.opacity = "1";
    }, 180);
  });
});

shirtImage.style.transition = "opacity .18s ease";

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sizeButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

addButton.addEventListener("click", () => {
  const current = Number(cartCount.textContent || "0") + 1;
  cartCount.textContent = current;
  addButton.textContent = "Added to Cart";
  setTimeout(() => {
    addButton.textContent = "Add to Cart";
  }, 1200);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
