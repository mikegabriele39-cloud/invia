# INVIA website add-ons

This ZIP is made for a static GitHub Pages site.

## Included
- `returns.html` — 7-day returns/exchanges policy
  - item must be unworn, unwashed, unused
  - original tags must still be attached
- `shipping.html` — shipping policy
- `size-chart.html` — placeholder size chart waiting for manufacturer measurements
- `contact.html` — contact form template
- `order-confirmation.html` — post-purchase confirmation page
- `sold-out.js` — turns product buttons into Sold Out states using `data-stock="0"`
- `invia-legal.css` — styling shared by the new pages
- `footer-links-snippet.html` — links you can paste into your existing footer

## How to add to GitHub
1. Open your `mikegabriele39-cloud/invia` repository.
2. Click **Add file → Upload files**.
3. Upload the files from this ZIP.
4. Commit the changes.
5. Add the footer links from `footer-links-snippet.html` to your existing site footer.

## Contact form
The contact form uses Formspree as a placeholder:
`https://formspree.io/f/YOUR_FORM_ID`

Replace `YOUR_FORM_ID` with your actual Formspree form ID, or connect the form to your preferred form backend.

## Sold-out example
Add this to any buy button:

```html
<button class="product-buy-btn" data-stock="0">Add to Cart</button>
<script src="sold-out.js"></script>
```

Use `data-stock="1"` (or remove the attribute) when available.

## Stripe / order confirmation
When you later connect Stripe, set your successful-payment redirect to:
`order-confirmation.html`

## Important
The size chart intentionally contains blank measurements because the final sizing should come from your manufacturer.
