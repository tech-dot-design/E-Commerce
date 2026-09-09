/**
 * Handles client-side cart interactions, state synchronization, and DOM updates[cite: 2, 11].
 * Integrates directly with the ApiClient cart endpoints[cite: 1, 7].
 */
const CartManager = (() => {
  // DOM element selectors
  const SELECTORS = {
    badge: '.cart-count',
    totalContainer: '#cart-total',
    itemsContainer: '#cart-items-body',
    emptyCartMessage: '#empty-cart-msg',
    cartTableWrapper: '#cart-table-wrapper',
    checkoutBtn: '#checkout-btn'
  };

  /**
   * Updates global badge counters and summary totals across navigation[cite: 1, 11].
   * @param {number} count 
   * @param {number} total 
   */
  function updateBadgeAndTotal(count, total) {
    const badgeElements = document.querySelectorAll(SELECTORS.badge);
    badgeElements.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });

    const totalEl = document.querySelector(SELECTORS.totalContainer);
    if (totalEl && total !== undefined) {
      totalEl.textContent = `$${parseFloat(total).toFixed(2)}`;
    }
  }

  /**
   * Fetches the full cart state from the server and refreshes the UI[cite: 1, 11].
   */
  async function refreshCart() {
    try {
      const response = await ApiClient.cart.list();
      const items = response.data || [];
      
      let count = 0;
      let total = 0.0;

      items.forEach((item) => {
        count += parseInt(item.quantity, 10);
        total += parseFloat(item.price) * parseInt(item.quantity, 10);
      });

      updateBadgeAndTotal(count, total);

      // Render cart table if current page contains the container
      if (document.querySelector(SELECTORS.itemsContainer)) {
        renderCartView(items, total);
      }
    } catch (error) {
      console.warn('Unable to load cart session:', error.message);
    }
  }

  /**
   * Renders the cart line items dynamically for cart.html.
   * @param {Array} items 
   * @param {number} total 
   */
  function renderCartView(items, total) {
    const container = document.querySelector(SELECTORS.itemsContainer);
    const emptyMsg = document.querySelector(SELECTORS.emptyCartMessage);
    const tableWrapper = document.querySelector(SELECTORS.cartTableWrapper);
    const checkoutBtn = document.querySelector(SELECTORS.checkoutBtn);

    if (!container) return;

    if (items.length === 0) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
      return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    container.innerHTML = items
      .map((item) => {
        const itemSubtotal = (parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2);
        return `
          <tr data-product-id="${item.product_id}">
            <td>
              <div class="product-info-cell">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="cart-thumb">` : ''}
                <span>${item.name}</span>
              </div>
            </td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>
              <div class="quantity-controls">
                <button type="button" class="btn-qty-minus" onclick="CartManager.changeQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
                <input type="number" min="1" value="${item.quantity}" class="qty-input" 
                       onchange="CartManager.changeQuantity(${item.product_id}, this.value)">
                <button type="button" class="btn-qty-plus" onclick="CartManager.changeQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
              </div>
            </td>
            <td>$${itemSubtotal}</td>
            <td>
              <button type="button" class="btn-remove-item" onclick="CartManager.removeItem(${item.product_id})">
                &times;
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    const totalEl = document.querySelector(SELECTORS.totalContainer);
    if (totalEl) {
      totalEl.textContent = `$${parseFloat(total).toFixed(2)}`;
    }
  }

  /**
   * Adds an item to the shopping cart[cite: 1, 5].
   * @param {number} productId 
   * @param {number} quantity 
   */
  async function addItem(productId, quantity = 1) {
    try {
      const response = await ApiClient.cart.add(productId, quantity);
      const data = response.data;
      updateBadgeAndTotal(data.cart_count, data.cart_total);
      alert('Product added to your cart!');
    } catch (error) {
      alert(`Error adding item: ${error.message}`);
    }
  }

  /**
   * Updates an item's quantity in the cart[cite: 1, 5].
   * @param {number} productId 
   * @param {number} newQuantity 
   */
  async function changeQuantity(productId, newQuantity) {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 0) return;

    try {
      if (qty === 0) {
        await removeItem(productId);
      } else {
        const response = await ApiClient.cart.update(productId, qty);
        const data = response.data;
        updateBadgeAndTotal(data.cart_count, data.cart_total);
        await refreshCart();
      }
    } catch (error) {
      alert(`Could not update quantity: ${error.message}`);
      await refreshCart();
    }
  }

  /**
   * Removes an item completely from the cart[cite: 1, 5].
   * @param {number} productId 
   */
  async function removeItem(productId) {
    try {
      const response = await ApiClient.cart.remove(productId);
      const data = response.data;
      updateBadgeAndTotal(data.cart_count, data.cart_total);
      await refreshCart();
    } catch (error) {
      alert(`Could not remove item: ${error.message}`);
    }
  }

  // Self-initialize on script execution
  document.addEventListener('DOMContentLoaded', () => {
    refreshCart();
  });

  return {
    refreshCart,
    addItem,
    changeQuantity,
    removeItem
  };
})();