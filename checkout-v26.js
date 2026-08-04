(() => {
  const CART_KEY = "inviaCartV20";
  const ORDER_KEY = "inviaPreviewOrdersV20";
  const TAX_RATE = 0.13;
  const FREE_SHIPPING_THRESHOLD = 100;
  let discountRate = 0;

  const money = value => `$${Number(value || 0).toFixed(2)}`;
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  };

  const itemsWrap = document.getElementById("checkoutItems");
  const form = document.getElementById("checkoutForm");
  const confirmation = document.getElementById("orderConfirmation");
  const summaryContent = document.getElementById("summaryContent");

  function subtotal() {
    return getCart().reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }

  function selectedShipping() {
    const option = document.querySelector('input[name="shipping"]:checked');
    const base = Number(option?.dataset.price || 0);
    if (option?.value === "standard" && subtotal() >= FREE_SHIPPING_THRESHOLD) return 0;
    return base;
  }

  function totals() {
    const sub = subtotal();
    const discount = sub * discountRate;
    const shipping = selectedShipping();
    const taxable = Math.max(0, sub - discount + shipping);
    const tax = taxable * TAX_RATE;
    return { sub, discount, shipping, tax, total: taxable + tax };
  }

  function renderItems() {
    const cart = getCart();
    if (!cart.length) {
      itemsWrap.innerHTML = `<div class="checkout-empty"><p>Your cart is empty.</p><a href="collections.html">Explore collections</a></div>`;
      form.querySelector("button[type=submit]").disabled = true;
      return;
    }
    itemsWrap.innerHTML = cart.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-image"><img src="${item.image}" alt="${item.name}"><span>${item.quantity}</span></div>
        <div><strong>${item.name}</strong><small>Size ${item.size}</small><button type="button" data-summary-remove="${item.name}|${item.size}">Remove</button></div>
        <b>${money(Number(item.price) * Number(item.quantity))}</b>
      </div>`).join("");

    itemsWrap.querySelectorAll("[data-summary-remove]").forEach(button => {
      button.addEventListener("click", () => {
        const [name, size] = button.dataset.summaryRemove.split("|");
        const next = getCart().filter(item => !(item.name === name && item.size === size));
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        renderItems();
        updateTotals();
      });
    });
  }

  function updateTotals() {
    const t = totals();
    document.getElementById("checkoutSubtotal").textContent = money(t.sub);
    document.getElementById("checkoutShipping").textContent = t.shipping === 0 ? "Free" : money(t.shipping);
    document.getElementById("checkoutTax").textContent = money(t.tax);
    document.getElementById("checkoutTotal").textContent = money(t.total);
    document.getElementById("buttonTotal").textContent = `${money(t.total)} CAD`;
    document.getElementById("mobileTotal").textContent = `${money(t.total)} CAD`;
    document.getElementById("discountLine").hidden = !t.discount;
    document.getElementById("checkoutDiscount").textContent = `−${money(t.discount)}`;
    document.getElementById("freeShippingNote").textContent = t.sub >= FREE_SHIPPING_THRESHOLD
      ? "You unlocked free standard shipping."
      : `Add ${money(FREE_SHIPPING_THRESHOLD - t.sub)} more to unlock free standard shipping.`;
  }

  document.querySelectorAll('input[name="shipping"]').forEach(input => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".shipping-option").forEach(label => label.classList.toggle("selected", label.contains(input) && input.checked));
      updateTotals();
    });
  });

  document.getElementById("applyPromo").addEventListener("click", () => {
    const input = document.getElementById("promoCode");
    const message = document.getElementById("promoMessage");
    const code = input.value.trim().toUpperCase();
    if (code === "INVIA10") {
      discountRate = .10;
      message.textContent = "INVIA10 applied — 10% off.";
      message.className = "promo-message success";
    } else if (!code) {
      discountRate = 0;
      message.textContent = "Enter a promo code first.";
      message.className = "promo-message";
    } else {
      discountRate = 0;
      message.textContent = "That code is not active.";
      message.className = "promo-message error";
    }
    updateTotals();
  });

  const postal = document.getElementById("postalCode");
  postal.addEventListener("input", () => {
    let value = postal.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (value.length > 3) value = `${value.slice(0,3)} ${value.slice(3)}`;
    postal.value = value;
  });

  function setError(input, message) {
    const field = input.closest(".field");
    field?.classList.toggle("invalid", Boolean(message));
    const small = field?.querySelector("small");
    if (small) small.textContent = message || "";
  }

  function validate() {
    let valid = true;
    form.querySelectorAll("input[required], select[required]").forEach(input => {
      let message = "";
      if (!input.value.trim()) message = "This field is required.";
      if (input.type === "email" && input.value && !/^\S+@\S+\.\S+$/.test(input.value)) message = "Enter a valid email address.";
      if (input.id === "postalCode" && input.value && !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(input.value)) message = "Use a Canadian postal code, such as A1A 1A1.";
      setError(input, message);
      if (message) valid = false;
    });
    const terms = document.getElementById("terms");
    if (!terms.checked) valid = false;
    document.getElementById("formError").textContent = valid ? "" : "Please complete the highlighted information and accept the store policies.";
    return valid;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!getCart().length || !validate()) {
      form.querySelector(".invalid input, .invalid select")?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const t = totals();
    const order = {
      id: `INVIA-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer: data,
      cart: getCart(),
      totals: t,
      status: "Payment connection pending"
    };
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem(ORDER_KEY)) || []; } catch {}
    orders.push(order);
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));

    document.getElementById("confirmationName").textContent = data.firstName;
    document.getElementById("orderNumber").textContent = order.id;
    document.getElementById("confirmationSummary").innerHTML = `
      <div class="confirmation-delivery"><strong>Delivery address</strong><p>${data.firstName} ${data.lastName}<br>${data.address}${data.apartment ? `, ${data.apartment}` : ""}<br>${data.city}, ${data.province} ${data.postalCode}</p></div>
      <div class="confirmation-total"><span>Order total</span><strong>${money(t.total)} CAD</strong></div>`;
    form.hidden = true;
    confirmation.hidden = false;
    document.querySelector(".checkout-progress").classList.add("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("editOrderButton").addEventListener("click", () => {
    confirmation.hidden = true;
    form.hidden = false;
    document.querySelector(".checkout-progress").classList.remove("complete");
  });

  document.getElementById("mobileSummaryToggle").addEventListener("click", () => {
    summaryContent.classList.toggle("open");
  });

  renderItems();
  updateTotals();
})();
