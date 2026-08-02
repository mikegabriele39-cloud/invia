
const header = document.querySelector(".site-header");
const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const cursorLight = document.getElementById("cursorLight");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartButtons = document.querySelectorAll("[data-open-cart]");
const closeCart = document.getElementById("closeCart");
const cartCount = document.querySelectorAll("[data-cart-count]");
const cartBody = document.getElementById("cartBody");
const subtotalValue = document.getElementById("subtotalValue");

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
});

window.addEventListener("mousemove", (event) => {
  if (!cursorLight) return;
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;
  cursorLight.style.opacity = "1";
});

menuButton?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  document.body.classList.toggle("locked", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    document.body.classList.remove("locked");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".reveal").forEach(el => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.disconnect();
      }
    });
  }, { threshold: .13 });
  observer.observe(el);
});

document.querySelectorAll(".product-image").forEach(wrap => {
  const img = wrap.querySelector("img");
  wrap.addEventListener("mousemove", event => {
    const rect = wrap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    img.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  });
  wrap.addEventListener("mouseleave", () => {
    img.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
});

document.querySelectorAll(".size-picker button").forEach(button => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

function getCart(){
  try { return JSON.parse(localStorage.getItem("inviaCart")) || []; }
  catch { return []; }
}
function saveCart(cart){
  localStorage.setItem("inviaCart", JSON.stringify(cart));
  renderCart();
}
function renderCart(){
  const cart = getCart();
  cartCount.forEach(el => el.textContent = cart.length);
  if (!cartBody || !subtotalValue) return;

  if (!cart.length) {
    cartBody.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add a piece from the first drop.</p>';
    subtotalValue.textContent = "$0.00";
    return;
  }

  cartBody.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="vinland-featured.png" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Size ${item.size}</p>
        <p>${item.price}</p>
      </div>
      <button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button>
    </div>
  `).join("");

  subtotalValue.textContent = `$${(cart.length * 39).toFixed(2)} CAD`;

  cartBody.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      const next = getCart();
      next.splice(Number(button.dataset.remove), 1);
      saveCart(next);
    });
  });
}

function openCartDrawer(){
  cartDrawer?.classList.add("open");
  cartOverlay?.classList.add("show");
  document.body.classList.add("locked");
}
function closeCartDrawer(){
  cartDrawer?.classList.remove("open");
  cartOverlay?.classList.remove("show");
  document.body.classList.remove("locked");
}
cartButtons.forEach(btn => btn.addEventListener("click", openCartDrawer));
closeCart?.addEventListener("click", closeCartDrawer);
cartOverlay?.addEventListener("click", closeCartDrawer);

document.querySelectorAll("[data-add-product]").forEach(button => {
  button.addEventListener("click", () => {
    const container = button.closest("[data-product]");
    const selected = container?.querySelector(".size-picker .selected")?.textContent || "M";
    const cart = getCart();
    cart.push({ name:"Love Your Enemies Tee", size:selected, price:"$39.00 CAD" });
    saveCart(cart);
    button.textContent = "Added ✓";
    setTimeout(() => button.textContent = "Add to Cart", 1100);
    openCartDrawer();
  });
});

document.querySelectorAll("a[data-transition]").forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    event.preventDefault();
    document.getElementById("pageTransition")?.classList.add("active");
    setTimeout(() => location.href = href, 360);
  });
});

const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(data.get("subject") || "INVIA website message");
  const body = encodeURIComponent(
    `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
  );
  location.href = `mailto:hello@inviaapparel.com?subject=${subject}&body=${body}`;
});

const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  function resize(){
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    particles = Array.from({length:Math.min(55,Math.floor(innerWidth/22))},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*.85+.2,v:Math.random()*.1+.02,a:Math.random()*.22+.05
    }));
  }
  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const p of particles){
      p.y -= p.v;
      if(p.y < -3){p.y = innerHeight+3;p.x = Math.random()*innerWidth}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  addEventListener("resize",resize);resize();draw();
}
renderCart();


// V15 quantity selectors
document.querySelectorAll("[data-qty-minus]").forEach(button => {
  button.addEventListener("click", () => {
    const value = button.parentElement.querySelector("[data-qty-value]");
    value.textContent = Math.max(1, Number(value.textContent) - 1);
  });
});
document.querySelectorAll("[data-qty-plus]").forEach(button => {
  button.addEventListener("click", () => {
    const value = button.parentElement.querySelector("[data-qty-value]");
    value.textContent = Math.min(10, Number(value.textContent) + 1);
  });
});

// V15 tabs
document.querySelectorAll(".product-tabs").forEach(tabs => {
  const buttons = tabs.querySelectorAll("[data-tab]");
  const panels = tabs.querySelectorAll("[data-panel]");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(item => item.classList.remove("active"));
      panels.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      tabs.querySelector(`[data-panel="${button.dataset.tab}"]`)?.classList.add("active");
    });
  });
});

// V15 lightbox
document.querySelectorAll(".gallery-expand").forEach(button => {
  button.addEventListener("click", () => {
    const source = button.parentElement.querySelector("img")?.src;
    if (!source) return;
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox open";
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">×</button>
      <img src="${source}" alt="">
    `;
    document.body.appendChild(lightbox);
    document.body.classList.add("locked");
    const close = () => {
      lightbox.remove();
      document.body.classList.remove("locked");
    };
    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) close();
    });
  });
});
