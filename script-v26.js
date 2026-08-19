
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

window.addEventListener("load", () => {
  window.setTimeout(() => document.getElementById("siteLoader")?.classList.add("hidden"), 950);
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
  document.querySelector("[data-sticky-product]")?.classList.toggle("visible", window.scrollY > 650);
});

window.addEventListener("mousemove", event => {
  if (!cursorLight) return;
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;
  cursorLight.style.opacity = "1";
});

menuButton?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("open");
  document.body.classList.toggle("locked", Boolean(open));
  menuButton.setAttribute("aria-expanded", String(Boolean(open)));
});

navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    document.body.classList.remove("locked");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:.13 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

document.querySelectorAll(".product-image").forEach(wrap => {
  const img = wrap.querySelector("img");
  if (!img) return;
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

function getCart(){
  try { return JSON.parse(localStorage.getItem("inviaCartV20")) || []; }
  catch { return []; }
}
function saveCart(cart){
  localStorage.setItem("inviaCartV20", JSON.stringify(cart));
  renderCart();
}
function cartQuantity(cart){
  return cart.reduce((sum,item) => sum + Number(item.quantity || 1), 0);
}
function cartSubtotal(cart){
  return cart.reduce((sum,item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
}
function renderCart(){
  const cart = getCart();
  cartCount.forEach(el => el.textContent = cartQuantity(cart));
  if (!cartBody || !subtotalValue) return;

  if (!cart.length) {
    cartBody.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add a piece from the current drops.</p>';
    subtotalValue.textContent = "$0.00 CAD";
    return;
  }

  cartBody.innerHTML = cart.map((item,index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Size ${item.size}</p>
        <p>$${Number(item.price).toFixed(2)} CAD</p>
        <div class="cart-item-controls">
          <button data-cart-minus="${index}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-cart-plus="${index}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button>
    </div>
  `).join("");

  subtotalValue.textContent = `$${cartSubtotal(cart).toFixed(2)} CAD`;

  cartBody.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      const next = getCart();
      next.splice(Number(button.dataset.remove),1);
      saveCart(next);
    });
  });
  cartBody.querySelectorAll("[data-cart-minus]").forEach(button => {
    button.addEventListener("click", () => {
      const next = getCart();
      const i = Number(button.dataset.cartMinus);
      next[i].quantity = Math.max(1, Number(next[i].quantity) - 1);
      saveCart(next);
    });
  });
  cartBody.querySelectorAll("[data-cart-plus]").forEach(button => {
    button.addEventListener("click", () => {
      const next = getCart();
      const i = Number(button.dataset.cartPlus);
      next[i].quantity = Math.min(10, Number(next[i].quantity) + 1);
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

function addCurrentProduct(button){
  const container = button.closest("[data-product]");
  if (!container) return;
  const size = container.querySelector(".size-picker .selected")?.textContent || "M";
  const quantity = Number(container.querySelector("[data-qty-value]")?.textContent || 1);
  const name = container.dataset.productName || button.dataset.name || "INVIA Tee";
  const price = Number(container.dataset.productPrice || button.dataset.price || 39);
  const image = container.dataset.productImage || "vinland-featured.png";

  const cart = getCart();
  const match = cart.find(item => item.name === name && item.size === size);
  if (match) match.quantity = Math.min(10, Number(match.quantity) + quantity);
  else cart.push({name,size,quantity,price,image});
  saveCart(cart);

  const original = button.innerHTML;
  button.innerHTML = "<span>Added ✓</span>";
  window.setTimeout(() => button.innerHTML = original, 1000);
  openCartDrawer();
}
document.querySelectorAll("[data-add-product]").forEach(button => {
  button.addEventListener("click", () => addCurrentProduct(button));
});
document.querySelector("[data-sticky-add]")?.addEventListener("click", () => {
  const button = document.querySelector("[data-add-product]");
  if (button) addCurrentProduct(button);
});

document.querySelectorAll(".gallery-thumb").forEach(button => {
  button.addEventListener("click", () => {
    const gallery = button.closest(".product-gallery-column");
    const main = gallery?.querySelector(".gallery-main-image");
    if (!main) return;
    gallery.querySelectorAll(".gallery-thumb").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    main.style.opacity = "0";
    window.setTimeout(() => {
      main.src = button.dataset.gallerySrc;
      main.style.opacity = "1";
    }, 160);
  });
});

document.querySelectorAll(".premium-gallery").forEach(gallery => {
  const image = gallery.querySelector(".gallery-main-image");
  const openLightbox = () => {
    if (!image?.src) return;
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox open";
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">×</button>
      <img src="${image.src}" alt="">
    `;
    document.body.appendChild(lightbox);
    document.body.classList.add("locked");
    const close = () => {
      lightbox.remove();
      document.body.classList.remove("locked");
    };
    lightbox.querySelector(".lightbox-close").addEventListener("click",close);
    lightbox.addEventListener("click",event => { if (event.target === lightbox) close(); });
  };
  gallery.addEventListener("click", event => {
    if (!event.target.closest(".gallery-expand") && !event.target.classList.contains("gallery-main-image")) return;
    openLightbox();
  });
});

document.querySelectorAll("[data-size-guide]").forEach(button => {
  button.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "size-guide-modal open";
    modal.innerHTML = `
      <div class="size-guide-card">
        <header><h2>Size Guide</h2><button aria-label="Close">×</button></header>
        <table class="size-table">
          <thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead>
          <tbody>
            <tr><td>XS</td><td>20 in</td><td>27 in</td></tr>
            <tr><td>S</td><td>21 in</td><td>28 in</td></tr>
            <tr><td>M</td><td>22 in</td><td>29 in</td></tr>
            <tr><td>L</td><td>23 in</td><td>30 in</td></tr>
            <tr><td>XL</td><td>24.5 in</td><td>31 in</td></tr>
            <tr><td>XXL</td><td>26 in</td><td>32 in</td></tr>
          </tbody>
        </table>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add("locked");
    const close = () => {
      modal.remove();
      document.body.classList.remove("locked");
    };
    modal.querySelector("button").addEventListener("click",close);
    modal.addEventListener("click",event => { if (event.target === modal) close(); });
  });
});

document.querySelectorAll("a[data-transition]").forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    event.preventDefault();
    document.getElementById("pageTransition")?.classList.add("active");
    window.setTimeout(() => location.href = href,360);
  });
});

const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(data.get("subject") || "INVIA website message");
  const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
  location.href = `mailto:invia.apparel@gmail.com?subject=${subject}&body=${body}`;
});

// INVIA waitlist — public insert only. Reading the table remains blocked by RLS.
const waitlistForm = document.getElementById("waitlistForm");
const waitlistEmail = document.getElementById("waitlistEmail");
const waitlistStatus = document.getElementById("waitlistStatus");
const waitlistSubmit = document.getElementById("waitlistSubmit");
const waitlistSuccess = document.getElementById("waitlistSuccess");
const waitlistAgain = document.getElementById("waitlistAgain");
const SUPABASE_URL = "https://ibwwdsnlbwvuyhfdasdj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nXg3n9IgxQTveiYLCd1CQA_y9cNWdnV";

waitlistForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = String(waitlistEmail?.value || "").trim().toLowerCase();
  if (!email || !waitlistEmail.checkValidity()) {
    waitlistStatus.textContent = "Enter a valid email address.";
    waitlistStatus.className = "waitlist-status error";
    waitlistEmail?.focus();
    return;
  }

  waitlistStatus.textContent = "";
  waitlistSubmit.disabled = true;
  waitlistSubmit.classList.add("loading");
  waitlistSubmit.querySelector("span").textContent = "Joining...";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Waitlist`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      waitlistForm.hidden = true;
      waitlistSuccess.hidden = false;
      localStorage.setItem("inviaWaitlistJoined", "true");
      return;
    }

    const text = await response.text();
    if (response.status === 409 || /duplicate|unique/i.test(text)) {
      waitlistStatus.textContent = "That email is already on the waitlist.";
      waitlistStatus.className = "waitlist-status note";
    } else {
      console.error("INVIA waitlist error:", response.status, text);
      waitlistStatus.textContent = "Couldn’t join right now. Please try again.";
      waitlistStatus.className = "waitlist-status error";
    }
  } catch (error) {
    console.error("INVIA waitlist network error:", error);
    waitlistStatus.textContent = "Connection issue. Please try again.";
    waitlistStatus.className = "waitlist-status error";
  } finally {
    waitlistSubmit.disabled = false;
    waitlistSubmit.classList.remove("loading");
    waitlistSubmit.querySelector("span").textContent = "Join Waitlist";
  }
});

waitlistAgain?.addEventListener("click", () => {
  waitlistSuccess.hidden = true;
  waitlistForm.hidden = false;
  waitlistForm.reset();
  waitlistStatus.textContent = "";
  waitlistStatus.className = "waitlist-status";
  waitlistEmail?.focus();
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
    particles = Array.from({length:Math.min(48,Math.floor(innerWidth/24))},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*.8+.2,v:Math.random()*.085+.018,a:Math.random()*.18+.04
    }));
  }
  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const p of particles){
      p.y -= p.v;
      if(p.y < -3){p.y=innerHeight+3;p.x=Math.random()*innerWidth}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${p.a})`;ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  addEventListener("resize",resize);resize();draw();
}
renderCart();

// Reset the page transition overlay when Chrome restores a page with Back/Forward.
window.addEventListener("pageshow", () => {
  const transition = document.getElementById("pageTransition");
  transition?.classList.remove("active");
  document.body.classList.remove("locked");
});

// Keep unfinished collection cards visible without allowing navigation.
document.querySelectorAll(".world-coming-soon, .related-coming-soon").forEach(card => {
  card.addEventListener("click", event => event.preventDefault());
});

// INVIA sold-out helper: set data-stock="0" on a product/add button when unavailable.
document.querySelectorAll('[data-stock="0"]').forEach(el => {
  el.classList.add('sold-out-state');
  if (el.matches('button')) {
    el.disabled = true;
    const span = el.querySelector('span');
    if (span) span.textContent = 'Sold Out'; else el.textContent = 'Sold Out';
  }
  if (!el.nextElementSibling?.classList?.contains('sold-out-label')) {
    const label = document.createElement('span');
    label.className = 'sold-out-label';
    label.textContent = 'Sold Out';
    el.insertAdjacentElement('afterend', label);
  }
});
