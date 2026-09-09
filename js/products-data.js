/**
 * Dynamic Product Catalog Loader
 * Replaces hardcoded mock data with live database records from MySQL.
 */

// Helper to resolve local vs remote image URLs
function resolveProductImage(url) {
  if (!url || url.trim() === '') {
    return 'images/ceramic-kettle.jpg'; // Default fallback image
  }
  // If full URL (http:// or https://) or already prefixed with images/
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('images/')) {
    return url;
  }
  // If just filename (e.g. "running-shoes.jpg")
  return `images/${url}`;
}

async function loadStoreProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  try {
    const res = await ApiClient.products.list();
    const products = res.data || [];

    if (products.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 24px;">No products available in the store.</p>`;
      return;
    }

    // Render using teammates' exact CSS classes and structure
    grid.innerHTML = products.map(product => `
      <article class="product-card" data-category="${product.category || 'all'}">
        <div class="product-image">
          <img src="${resolveProductImage(product.image_url)}" alt="${product.name}">
        </div>
        <div class="product-info">
          <span class="product-category">${product.category || 'Store Item'}</span>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          <div class="product-bottom">
            <span class="price">₹${parseFloat(product.price).toLocaleString()}</span>
            <a href="product.html?id=${product.product_id}" class="view-product">View Product</a>
          </div>
        </div>
      </article>
    `).join('');

  } catch (err) {
    grid.innerHTML = `<p style="grid-column: 1/-1; color: red; text-align: center;">Failed to load catalog: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadStoreProducts);