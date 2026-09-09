/**
 * Product Detail Page Loader
 * Injects dynamic database product details and images into product.html
 */
document.addEventListener("DOMContentLoaded", async () => {
  const detailContainer = document.querySelector(".product-detail-container");
  if (!detailContainer) return;

  // 1. Read product ID from query string: product.html?id=X
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    detailContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <h2>No Product Selected</h2>
        <p>Please return to the <a href="index.html" style="color:#0071e3;">catalog</a> and choose a product.</p>
      </div>`;
    return;
  }

  try {
    // 2. Fetch single product record from backend
    const response = await ApiClient.products.get(productId);
    const product = response.data;

    // 3. Inject image from backend (external CDN URL or local assets/images)
    const imgEl = detailContainer.querySelector(".product-detail-image img");
    if (imgEl) {
      imgEl.src = product.image_url || "images/ceramic-kettle.jpg";
      imgEl.alt = product.name;
    }

    // 4. Inject Title, Price, and Description
    const titleEl = detailContainer.querySelector(".product-detail-info h1");
    if (titleEl) titleEl.textContent = product.name;

    const priceEl = detailContainer.querySelector(".product-detail-price");
    if (priceEl) priceEl.textContent = `₹${parseFloat(product.price).toLocaleString("en-IN")}`;

    const descEl = detailContainer.querySelector(".product-detail-description");
    if (descEl) descEl.textContent = product.description || "No description provided.";

    // 5. Update Stock / Availability Specification Row
    const specs = detailContainer.querySelectorAll(".spec-row strong");
    if (specs.length >= 3) {
      specs[0].textContent = "General"; // Category
      specs[1].textContent = product.name; // Type
      specs[2].textContent = product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : "Out of Stock";
      if (product.stock_quantity <= 0) {
        specs[2].style.color = "#ef4444";
      }
    }

    // 6. Set hidden form inputs and bind Add to Cart
    const hiddenId = detailContainer.querySelector('input[name="product_id"]');
    if (hiddenId) hiddenId.value = product.product_id;

    const addCartForm = detailContainer.querySelector(".add-cart-form");
    if (addCartForm) {
      addCartForm.onsubmit = async (e) => {
        e.preventDefault();
        const qtyInput = document.getElementById("quantity");
        const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;

        if (product.stock_quantity <= 0) {
          alert("Sorry, this product is currently out of stock.");
          return;
        }

        try {
          await ApiClient.cart.add(product.product_id, qty);
          alert(`Added ${qty} × "${product.name}" to your cart!`);
        } catch (err) {
          alert("Could not add to cart: " + err.message);
        }
      };
    }
  } catch (err) {
    detailContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">
        <h2>Error Loading Product</h2>
        <p>${err.message}</p>
        <a href="index.html" style="display:inline-block; margin-top:12px; color:#0071e3;">Return to Storefront</a>
      </div>`;
  }
});