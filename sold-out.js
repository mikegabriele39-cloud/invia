
/*
INVIA SOLD-OUT HELPER

Usage:
1. Give any product button the class "product-buy-btn".
2. Add data-stock="0" when the item is sold out.
3. Add data-product-name="Product Name" if desired.

Example:
<button class="product-buy-btn" data-stock="0" data-product-name="Pierce the Heavens Tee">
  Add to Cart
</button>
*/

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-buy-btn").forEach((button) => {
    const stock = Number(button.dataset.stock ?? 1);

    if (stock <= 0) {
      button.disabled = true;
      button.classList.add("sold-out");
      button.textContent = "Sold Out";

      const badge = document.createElement("span");
      badge.className = "sold-out-badge";
      badge.textContent = "Sold Out";
      button.insertAdjacentElement("afterend", badge);
    }
  });
});
