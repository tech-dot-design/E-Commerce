/**
 * ShopEase - Master Integration Script
 * Resolves all schema, protocol, CSRF, filtering, and calculation mismatches.
 */

// ========================================================
// 1. HELPERS & BIDIRECTIONAL ADDRESS SERIALIZER
// ========================================================

function parseShippingAddress(rawStr) {
  if (!rawStr) return { fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };

  let phone = "";
  const phoneMatch = rawStr.match(/Phone:\s*([^,]+)/i);
  if (phoneMatch) phone = phoneMatch[1].trim();

  let pincode = "";
  const pinMatch = rawStr.match(/(?:PIN|PIN Code|Postal)?(?:\s*[:–-]\s*)(\b\d{5,6}\b)/i);
  if (pinMatch) pincode = pinMatch[1].trim();

  let fullName = "";
  const firstComma = rawStr.indexOf(",");
  if (firstComma !== -1) {
    fullName = rawStr.substring(0, firstComma).trim();
  }

  return {
    fullName: fullName,
    phone: phone,
    address: rawStr,
    city: "",
    state: "",
    pincode: pincode
  };
}

function formatShippingAddress(data) {
  return `${data.fullName}, Phone: ${data.phone}, ${data.address}, ${data.city}, ${data.state} - ${data.pincode}`;
}

// ========================================================
// 2. USER PROFILE & ADDRESS BRIDGE (profile.html)
// ========================================================

async function loadProfile() {
  const profileDetails = document.querySelector(".profile-details");
  if (!profileDetails) return;

  try {
    const res = await ApiClient.users.profile();
    const user = res.data;

    const storageKey = `shopease_address_${user.user_id}`;
    let saved = null;
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try { saved = JSON.parse(localData); } catch (e) {}
    }

    if (!saved) {
      try {
        const orderRes = await ApiClient.orders.myOrders();
        const orders = orderRes.data || [];
        if (orders.length > 0 && orders[0].shipping_address) {
          saved = parseShippingAddress(orders[0].shipping_address);
          saved.fullName = `${user.first_name} ${user.last_name}`.trim();
          localStorage.setItem(storageKey, JSON.stringify(saved));
        }
      } catch (e) {}
    }

    const displayPhone = (saved && saved.phone && saved.phone.trim()) ? saved.phone : "Not set";
    let displayAddress = "No default delivery address saved.";
    if (saved) {
      if (saved.city || saved.pincode) {
        displayAddress = `${saved.address || ''}, ${saved.city || ''}, ${saved.state || ''} - ${saved.pincode || ''}`
          .replace(/^[\s,-]+|[\s,-]+$/g, '');
      } else if (saved.address) {
        displayAddress = saved.address;
      }
    }

    profileDetails.innerHTML = `
      <div class="profile-field"><span>Full Name</span><strong>${user.first_name} ${user.last_name}</strong></div>
      <div class="profile-field"><span>Email</span><strong>${user.email}</strong></div>
      <div class="profile-field"><span>Phone</span><strong>${displayPhone}</strong></div>
      <div class="profile-field"><span>Saved Address</span><strong>${displayAddress}</strong></div>
      <div style="margin-top: 15px;">
        <button type="button" class="login-btn" style="padding: 6px 14px; font-size: 0.85rem; cursor: pointer;" onclick="editSavedAddress(${user.user_id})">
          ✎ Edit Delivery Details
        </button>
      </div>
    `;
  } catch (err) {
    profileDetails.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <p style="color: #ef4444;">You are currently not logged in.</p>
        <button class="login-btn" style="margin-top: 12px;" onclick="openModal('login')">Log In</button>
      </div>`;
  }
}

window.editSavedAddress = function (userId) {
  const storageKey = `shopease_address_${userId}`;
  let current = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try { current = Object.assign(current, JSON.parse(existing)); } catch (e) {}
  }

  const phone = prompt("Enter Phone Number:", current.phone || "");
  if (phone === null) return;
  const address = prompt("Enter Street Address:", current.address || "");
  if (address === null) return;
  const city = prompt("Enter City:", current.city || "");
  if (city === null) return;
  const state = prompt("Enter State:", current.state || "");
  if (state === null) return;
  const pincode = prompt("Enter PIN Code:", current.pincode || "");
  if (pincode === null) return;

  const updated = {
    fullName: current.fullName,
    phone: phone.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim()
  };

  localStorage.setItem(storageKey, JSON.stringify(updated));
  alert("Delivery details saved successfully!");
  loadProfile();
};

// ========================================================
// 3. CHECKOUT & SHIPPING INTEGRITY (checkout.html)
// ========================================================

async function setupCheckout() {
  const checkoutForm = document.querySelector(".checkout-form");
  const checkoutSummary = document.querySelector(".checkout-summary");
  if (!checkoutForm || !checkoutSummary) return;

  let currentUser = null;
  try {
    const userRes = await ApiClient.users.profile();
    currentUser = userRes.data;

    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    if (nameInput && !nameInput.value) nameInput.value = `${currentUser.first_name} ${currentUser.last_name}`.trim();
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email;
  } catch {}

  if (currentUser) {
    const storageKey = `shopease_address_${currentUser.user_id}`;
    let saved = null;
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try { saved = JSON.parse(localData); } catch (e) {}
    }
    if (!saved) {
      try {
        const ordersRes = await ApiClient.orders.myOrders();
        const orders = ordersRes.data || [];
        if (orders.length > 0 && orders[0].shipping_address) {
          saved = parseShippingAddress(orders[0].shipping_address);
        }
      } catch (e) {}
    }

    if (saved) {
      if (document.getElementById("phone") && saved.phone) document.getElementById("phone").value = saved.phone;
      if (document.getElementById("address") && saved.address) document.getElementById("address").value = saved.address;
      if (document.getElementById("city") && saved.city) document.getElementById("city").value = saved.city;
      if (document.getElementById("state") && saved.state) document.getElementById("state").value = saved.state;
      if (document.getElementById("pincode") && saved.pincode) document.getElementById("pincode").value = saved.pincode;
    }
  }

  try {
    const res = await ApiClient.cart.list();
    const items = res.data || [];

    if (items.length === 0) {
      checkoutSummary.innerHTML = `<h2>Order Summary</h2><p style="padding: 20px;">Your cart is empty.</p>`;
      return;
    }

    // Backend calculates totalAmount strictly as sum(price * quantity). Shipping is set to FREE (₹0).
    let orderTotal = 0;
    const itemsHtml = items.map((item) => {
      const sub = item.price * item.quantity;
      orderTotal += sub;
      return `
        <div class="checkout-product">
          <img src="${item.image_url || 'images/ceramic-kettle.jpg'}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <p>Qty: ${item.quantity}</p>
            <strong>₹${sub.toLocaleString('en-IN')}</strong>
          </div>
        </div>`;
    }).join("");

    checkoutSummary.innerHTML = `
      <h2>Order Summary</h2>
      ${itemsHtml}
      <div class="checkout-divider"></div>
      <div class="checkout-summary-row"><span>Subtotal</span><span>₹${orderTotal.toLocaleString('en-IN')}</span></div>
      <div class="checkout-summary-row"><span>Shipping</span><span style="color:#16a34a; font-weight:600;">FREE</span></div>
      <div class="checkout-divider"></div>
      <div class="checkout-total"><span>Total</span><strong>₹${orderTotal.toLocaleString('en-IN')}</strong></div>
    `;

    checkoutForm.onsubmit = async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const city = document.getElementById("city").value.trim();
      const state = document.getElementById("state").value.trim();
      const pincode = document.getElementById("pincode").value.trim();

      if (!fullName || !phone || !address || !city || !state || !pincode) {
        alert("Please fill in all shipping fields.");
        return;
      }

      if (currentUser) {
        const storageKey = `shopease_address_${currentUser.user_id}`;
        localStorage.setItem(storageKey, JSON.stringify({ fullName, phone, address, city, state, pincode }));
      }

      const shippingAddress = formatShippingAddress({ fullName, phone, address, city, state, pincode });

      try {
        const orderRes = await ApiClient.orders.checkout(shippingAddress);
        alert("Order placed successfully!");
        window.location.href = `order-details.html?id=${orderRes.data.order_id}`;
      } catch (err) {
        alert("Checkout Error: " + err.message);
      }
    };
  } catch (err) {
    console.error("Checkout setup error:", err);
  }
}

// ========================================================
// 4. ORDER STATUS MAPPING & FILTER TABS (orders.html)
// ========================================================

async function loadMyOrders() {
  const container = document.querySelector(".orders-list");
  if (!container) return;

  try {
    const res = await ApiClient.orders.myOrders();
    const orders = res.data || [];

    // Map backend database enums ('completed', 'pending', 'cancelled') to UI tabs
    const categorized = orders.map((o) => {
      const st = (o.status || "").toLowerCase().trim();
      let category = "processing";
      let displayBadge = "Processing";

      if (st === "completed" || st === "delivered") {
        category = "delivered";
        displayBadge = "Delivered";
      } else if (st === "shipped" || st === "transit" || st === "in transit") {
        category = "transit";
        displayBadge = "In Transit";
      } else if (st === "cancelled") {
        category = "cancelled";
        displayBadge = "Cancelled";
      }

      return { ...o, category, displayBadge };
    });

    const countAll = categorized.length;
    const countDelivered = categorized.filter(o => o.category === "delivered").length;
    const countTransit = categorized.filter(o => o.category === "transit").length;
    const countProcessing = categorized.filter(o => o.category === "processing").length;

    // Update filter pills dynamically with real counts
    const filterBtns = document.querySelectorAll("[data-filter], .order-filter-btn, .filter-btn, .order-tab");
    filterBtns.forEach((btn) => {
      const f = (btn.getAttribute("data-filter") || btn.textContent).toLowerCase();
      if (f.includes("all")) {
        btn.setAttribute("data-filter", "all");
        btn.textContent = `All Orders (${countAll})`;
      } else if (f.includes("deliver")) {
        btn.setAttribute("data-filter", "delivered");
        btn.textContent = `Delivered (${countDelivered})`;
      } else if (f.includes("transit")) {
        btn.setAttribute("data-filter", "transit");
        btn.textContent = `In Transit (${countTransit})`;
      } else if (f.includes("process")) {
        btn.setAttribute("data-filter", "processing");
        btn.textContent = `Processing (${countProcessing})`;
      }
    });

    if (categorized.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 50px 20px; background:#fff; border-radius:8px; border:1px solid #e5e7eb;">
          <h3>No Orders Found</h3>
          <p style="margin-top:8px; color:#6b7280;">You have not placed any orders yet.</p>
          <a href="index.html#products" style="display:inline-block; margin-top:16px; color:#0071e3; font-weight:600;">Start Shopping →</a>
        </div>`;
      return;
    }

    container.innerHTML = categorized.map((o) => `
      <article class="order-card" data-category="${o.category}">
        <div class="order-card-header">
          <div>
            <span class="order-label">Order ID</span>
            <h3>#ORD${o.order_id}</h3>
          </div>
          <div class="order-status ${o.category === 'delivered' ? 'delivered' : 'processing'}">
            ${o.displayBadge}
          </div>
        </div>
        <div class="order-card-details">
          <div><span>Order Date</span><strong>${o.order_date || 'Recent'}</strong></div>
          <div><span>Total Amount</span><strong>₹${parseFloat(o.total_amount).toLocaleString('en-IN')}</strong></div>
        </div>
        <div class="order-card-footer">
          <a href="order-details.html?id=${o.order_id}" class="view-order-btn">View Order Details</a>
        </div>
      </article>
    `).join("");

    function applyFilter(selected) {
      const existingEmpty = container.querySelector(".filter-empty-msg");
      if (existingEmpty) existingEmpty.remove();

      let visibleCount = 0;
      container.querySelectorAll(".order-card").forEach((card) => {
        const cat = card.getAttribute("data-category");
        if (selected === "all" || cat === selected) {
          card.style.display = "";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (visibleCount === 0) {
        const label = selected === "delivered" ? "delivered" : selected === "transit" ? "in-transit" : "processing";
        const emptyEl = document.createElement("div");
        emptyEl.className = "filter-empty-msg";
        emptyEl.style.cssText = "text-align:center; padding:40px 20px; background:#fff; border-radius:8px; border:1px solid #e5e7eb; margin-top:10px;";
        emptyEl.innerHTML = `<p style="color:#6b7280; font-size:1rem;">No ${label} orders found.</p>`;
        container.appendChild(emptyEl);
      }
    }

    filterBtns.forEach((btn) => {
      const freshBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(freshBtn, btn);

      freshBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
        freshBtn.classList.add("active");
        applyFilter(freshBtn.getAttribute("data-filter") || "all");
      });
    });

  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; background:#fff; border-radius:8px; border:1px solid #e5e7eb;">
        <h3 style="color:#ef4444;">Please Sign In</h3>
        <p style="margin-top:8px; color:#6b7280;">Sign in to inspect your order history.</p>
        <button class="login-btn" style="margin-top:14px;" onclick="openModal('login')">Log In Now</button>
      </div>`;
  }
}

async function loadOrderDetails() {
  const container = document.querySelector(".order-details-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");

  if (!orderId) {
    container.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>No Order Specified</h2><a href="orders.html" style="color: #0071e3;">← Back to Orders</a></div>`;
    return;
  }

  try {
    const res = await ApiClient.orders.view(orderId);
    const order = res.data;

    const displayBadge = order.status === "completed" ? "Delivered" : (order.status === "pending" ? "Processing" : order.status);

    const orderInfo = container.querySelector(".order-info-card");
    if (orderInfo) {
      orderInfo.innerHTML = `
        <div class="order-info-item"><span>Order ID</span><strong>#ORD${order.order_id}</strong></div>
        <div class="order-info-item"><span>Order Date</span><strong>${order.order_date}</strong></div>
        <div class="order-info-item"><span>Payment Method</span><strong>Cash on Delivery</strong></div>
        <div class="order-info-item"><span>Status</span><strong class="detail-status delivered">${displayBadge}</strong></div>
      `;
    }

    const productsSection = container.querySelector(".ordered-products");
    if (productsSection && order.items) {
      productsSection.innerHTML = `<h2>Ordered Products</h2>` + order.items.map((item) => `
        <div class="ordered-product">
          <div class="ordered-product-info">
            <span class="product-category">Item #${item.product_id}</span>
            <h3>${item.name}</h3>
            <p>Quantity: ${item.quantity} × ₹${parseFloat(item.unit_price).toLocaleString('en-IN')}</p>
          </div>
          <strong class="ordered-product-price">₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</strong>
        </div>
      `).join("");
    }

    const addressBox = container.querySelector(".address-box");
    if (addressBox) {
      addressBox.innerHTML = `<strong>Delivery Address</strong><p style="margin-top:6px; line-height: 1.5;">${order.shipping_address}</p>`;
    }

    const totalCard = container.querySelector(".order-total-card");
    if (totalCard) {
      totalCard.innerHTML = `
        <h2>Order Summary</h2>
        <div class="order-total-row"><span>Subtotal</span><span>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span></div>
        <div class="order-total-row"><span>Shipping</span><span style="color:#16a34a; font-weight:600;">FREE</span></div>
        <div class="order-total-divider"></div>
        <div class="order-final-total"><span>Total</span><strong>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</strong></div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: #ef4444;"><h2>Error Retrieving Order</h2><p>${err.message}</p></div>`;
  }
}

// ========================================================
// 5. STOREFRONT CATALOG & CART (index.html, cart.html)
// ========================================================

let catalogCache = [];

async function loadStorefrontProducts() {
  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) return;

  try {
    const res = await ApiClient.products.list();
    catalogCache = res.data || [];

    if (catalogCache.length === 0) {
      productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 30px; color: #888;">No active products found in inventory.</p>`;
      return;
    }

    renderProductCards(catalogCache);

    const sortSelect = document.getElementById("sortProducts");
    if (sortSelect) {
      sortSelect.onchange = () => {
        let sorted = [...catalogCache];
        if (sortSelect.value === "low-high") sorted.sort((a, b) => a.price - b.price);
        else if (sortSelect.value === "high-low") sorted.sort((a, b) => b.price - a.price);
        renderProductCards(sorted);
      };
    }
  } catch (err) {
    productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Failed to load products: ${err.message}</div>`;
  }
}

function renderProductCards(products) {
  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) return;

  productGrid.innerHTML = products.map((p) => `
    <article class="product-card" data-id="${p.product_id}">
      <div class="product-image">
        <img src="${p.image_url || 'images/ceramic-kettle.jpg'}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-category">Stock: ${p.stock_quantity}</span>
        <h3>${p.name}</h3>
        <p class="product-description">${p.description || 'Quality store item.'}</p>
        <div class="product-bottom">
          <span class="price">₹${parseFloat(p.price).toLocaleString('en-IN')}</span>
          <a href="product.html?id=${p.product_id}" class="view-product">View Product</a>
        </div>
      </div>
    </article>
  `).join("");
}

async function loadCartPage() {
  const cartSection = document.querySelector(".cart-items");
  if (!cartSection) return;

  try {
    const res = await ApiClient.cart.list();
    const items = res.data || [];

    if (items.length === 0) {
      cartSection.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3>Your shopping bag is empty</h3>
          <p style="margin-top: 8px;"><a href="index.html#products" style="color: #0071e3;">Browse items to add</a></p>
        </div>`;
      updateCartSummary(0);
      return;
    }

    let subtotal = 0;
    cartSection.innerHTML = items.map((item) => {
      subtotal += item.price * item.quantity;
      return `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image_url || 'images/ceramic-kettle.jpg'}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <span class="product-category">Item #${item.product_id}</span>
            <h3>${item.name}</h3>
            <div class="cart-item-price">₹${parseFloat(item.price).toLocaleString('en-IN')}</div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-quantity">
              <button type="button" onclick="modifyCartQty(${item.product_id}, ${item.quantity - 1})">−</button>
              <input type="number" value="${item.quantity}" readonly>
              <button type="button" onclick="modifyCartQty(${item.product_id}, ${item.quantity + 1})">+</button>
            </div>
            <button type="button" class="remove-item" onclick="removeCartItem(${item.product_id})">Remove</button>
          </div>
        </div>`;
    }).join("");

    updateCartSummary(subtotal);
  } catch (err) {
    cartSection.innerHTML = `<p style="color:red; padding:20px;">Error loading cart: ${err.message}</p>`;
  }
}

function updateCartSummary(subtotal) {
  const summaryBox = document.querySelector(".cart-summary");
  if (!summaryBox) return;

  const rows = summaryBox.querySelectorAll(".summary-row span:last-child");
  if (rows.length >= 2) {
    rows[0].textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    rows[1].textContent = `FREE`;
    rows[1].style.color = "#16a34a";
    rows[1].style.fontWeight = "600";
  }

  const totalEl = summaryBox.querySelector(".summary-total strong");
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}

window.modifyCartQty = async function (productId, newQty) {
  try {
    if (newQty <= 0) await ApiClient.cart.remove(productId);
    else await ApiClient.cart.update(productId, newQty);
    loadCartPage();
  } catch (err) { alert(err.message); }
};

window.removeCartItem = async function (productId) {
  try {
    await ApiClient.cart.remove(productId);
    loadCartPage();
  } catch (err) { alert(err.message); }
};

// ========================================================
// 6. ADMIN DASHBOARD, PRODUCTS & ORDERS (admin/*)
// ========================================================

async function initAdminDashboard() {
  const statsSection = document.querySelector(".admin-stats");
  if (!statsSection) return;

  try {
    const [prodRes, orderRes, userRes] = await Promise.all([
      ApiClient.products.list(),
      ApiClient.orders.adminList(),
      ApiClient.users.list()
    ]);

    const prods = prodRes.data || [];
    const orders = orderRes.data || [];
    const users = userRes.data || [];
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    const statCards = statsSection.querySelectorAll(".admin-stat-card strong, .stat-card strong");
    if (statCards.length >= 4) {
      statCards[0].textContent = prods.length;
      statCards[1].textContent = orders.length;
      statCards[2].textContent = users.length;
      statCards[3].textContent = `₹${totalSales.toLocaleString('en-IN')}`;
    }

    const recentTbody = document.querySelector(".recent-orders tbody");
    if (recentTbody) {
      const recent = orders.slice(0, 5);
      if (recent.length === 0) {
        recentTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">No orders recorded yet.</td></tr>`;
      } else {
        recentTbody.innerHTML = recent.map(o => `
          <tr>
            <td>#ORD${o.order_id}</td>
            <td>${o.email}</td>
            <td>${o.order_date || 'Recent'}</td>
            <td>₹${parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
            <td><span class="table-status ${o.status}">${o.status}</span></td>
          </tr>
        `).join("");
      }
    }
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

async function initAdminProducts() {
  const tbody = document.querySelector(".product-admin-table tbody");
  if (!tbody) return;

  try {
    const res = await ApiClient.products.list();
    const products = res.data || [];

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No products found in inventory.</td></tr>`;
    } else {
      tbody.innerHTML = products.map((p) => `
        <tr>
          <td>#${p.product_id}</td>
          <td>
            <div class="admin-product-name">
              <img src="${p.image_url || '../images/ceramic-kettle.jpg'}" alt="${p.name}">
              <span>${p.name}</span>
            </div>
          </td>
          <td>Catalog</td>
          <td>₹${parseFloat(p.price).toLocaleString('en-IN')}</td>
          <td>${p.stock_quantity}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="edit-btn" onclick="populateAndOpenEditModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
              <button type="button" class="delete-btn" onclick="handleAdminDeleteProduct(${p.product_id})">Delete</button>
            </div>
          </td>
        </tr>`).join("");
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error: ${err.message}</td></tr>`;
  }

  const addForm = document.getElementById("addProductForm");
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await ApiClient.products.create({
          name: document.getElementById("productName").value.trim(),
          price: parseFloat(document.getElementById("productPrice").value),
          stock_quantity: parseInt(document.getElementById("productStock").value, 10),
          image_url: document.getElementById("productImage").value.trim(),
          description: document.getElementById("productDescription").value.trim()
        });
        alert("Product added successfully!");
        if (typeof closeProductModal === "function") closeProductModal();
        window.location.reload();
      } catch (err) { alert(err.message); }
    };
  }

  const editForm = document.getElementById("editProductForm");
  if (editForm) {
    editForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await ApiClient.products.update({
          product_id: parseInt(editForm.querySelector('input[name="product_id"]').value, 10),
          name: document.getElementById("editProductName").value.trim(),
          price: parseFloat(document.getElementById("editProductPrice").value),
          stock_quantity: parseInt(document.getElementById("editProductStock").value, 10),
          image_url: document.getElementById("editProductImage").value.trim(),
          description: document.getElementById("editProductDescription").value.trim()
        });
        alert("Product updated successfully!");
        if (typeof closeProductModal === "function") closeProductModal();
        window.location.reload();
      } catch (err) { alert(err.message); }
    };
  }
}

window.populateAndOpenEditModal = function (product) {
  const editForm = document.getElementById("editProductForm");
  if (!editForm) return;

  editForm.querySelector('input[name="product_id"]').value = product.product_id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock_quantity;
  document.getElementById("editProductImage").value = product.image_url || "";
  document.getElementById("editProductDescription").value = product.description || "";

  if (typeof openProductModal === "function") openProductModal("edit");
};

// Fix 6: Use HTTP DELETE via ApiClient.products.delete
window.handleAdminDeleteProduct = async function (id) {
  if (!confirm(`Are you sure you want to delete Product #${id}?`)) return;
  try {
    await ApiClient.products.delete(id);
    alert("Product deleted successfully.");
    window.location.reload();
  } catch (err) { alert("Delete failed: " + err.message); }
};

async function initAdminOrders() {
  const statCards = document.querySelectorAll(".admin-stat-card, .stat-card");
  if (statCards.length > 0) {
    try {
      const [prodRes, userRes] = await Promise.all([
        ApiClient.products.list(),
        ApiClient.users.list()
      ]);
      statCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes("product")) {
          const numEl = card.querySelector("strong, h3, .stat-value, span:last-child");
          if (numEl) numEl.textContent = (prodRes.data || []).length;
        } else if (text.includes("customer")) {
          const numEl = card.querySelector("strong, h3, .stat-value, span:last-child");
          if (numEl) numEl.textContent = (userRes.data || []).length;
        }
      });
    } catch (e) {}
  }

  const tbody = document.querySelector(".order-admin-table tbody");
  if (!tbody) return;

  try {
    const res = await ApiClient.orders.adminList();
    const orders = res.data || [];

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No customer orders found.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td>#ORD${o.order_id}</td>
        <td>${o.email}</td>
        <td>${o.order_date || 'Recent'}</td>
        <td>-</td>
        <td>₹${parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
        <td><span class="table-status ${o.status}">${o.status}</span></td>
        <td>
          <div class="status-form" style="display:flex; gap:6px;">
            <select id="status-select-${o.order_id}">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>pending</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>completed</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
            </select>
            <button type="button" onclick="handleAdminUpdateStatus(${o.order_id})">Save</button>
          </div>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Error: ${err.message}</td></tr>`;
  }
}

window.handleAdminUpdateStatus = async function (orderId) {
  const select = document.getElementById(`status-select-${orderId}`);
  if (!select) return;
  try {
    await ApiClient.orders.updateStatus(orderId, select.value);
    alert("Status updated successfully!");
    window.location.reload();
  } catch (err) { alert("Status update failed: " + err.message); }
};

async function initAdminCustomers() {
  const tbody = document.querySelector(".customer-admin-table tbody");
  if (!tbody) return;

  try {
    const res = await ApiClient.users.list();
    const customers = res.data || [];

    if (customers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No registered customers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = customers.map((c) => `
      <tr>
        <td>#CUS${c.user_id}</td>
        <td>${c.first_name} ${c.last_name}</td>
        <td>${c.email}</td>
        <td>-</td>
        <td>${c.created_at || 'Recent'}</td>
        <td>Customer</td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error: ${err.message}</td></tr>`;
  }
}

// ========================================================
// 7. AUTHENTICATION & NAME SPLITTING (Fix 1 & 7)
// ========================================================

window.openModal = function (type) {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.add("active");

  const loginBox = document.getElementById("loginForm");
  const registerBox = document.getElementById("registerForm");
  if (type === "register") {
    if (loginBox) loginBox.style.display = "none";
    if (registerBox) registerBox.style.display = "block";
  } else {
    if (loginBox) loginBox.style.display = "block";
    if (registerBox) registerBox.style.display = "none";
  }
};

window.closeModal = function () {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("active");
};

async function syncAuthState() {
  const headerActions = document.querySelector(".header-actions");
  if (!headerActions) return;

  try {
    const res = await ApiClient.users.profile();
    const user = res.data;

    const isAdminPath = window.location.pathname.includes("/admin/");

    // Only display the "Admin Dashboard" shortcut on storefront pages, never inside the admin panel
    const adminBtn = (!isAdminPath && user.role === 'admin')
      ? `<a href="admin/dashboard.html" class="login-btn" style="text-decoration:none; display:inline-block; margin-right:8px;">Admin Dashboard</a>`
      : '';

    headerActions.innerHTML = `
      <span style="font-size:0.9rem; font-weight:600; margin-right:8px;">Hi, ${user.first_name}</span>
      ${adminBtn}
      <button class="register-btn" type="button" onclick="performLogout()">Logout</button>
    `;
  } catch {}
}

window.performLogout = async function () {
  try {
    await ApiClient.auth.logout();
    window.location.reload();
  } catch (err) { alert("Logout failed: " + err.message); }
};

function bindAuthForms() {
  const loginForm = document.querySelector("#loginForm form");
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await ApiClient.auth.login({
          email: document.getElementById("loginEmail").value.trim(),
          password: document.getElementById("loginPassword").value
        });
        window.closeModal();
        window.location.reload();
      } catch (err) { alert("Login Error: " + err.message); }
    };
  }

  // Fix 1: Robustly split single 'Name' field into first_name and last_name for backend
  const regForm = document.querySelector("#registerForm form");
  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();
      const rawName = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirm = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : password;

      if (!rawName || !email || !password) {
        alert("All registration fields are required.");
        return;
      }

      if (password !== confirm) {
        alert("Passwords do not match.");
        return;
      }

      const nameTokens = rawName.split(/\s+/);
      const firstName = nameTokens[0] || "Customer";
      const lastName = nameTokens.slice(1).join(" ") || "-";

      try {
        await ApiClient.auth.register({ first_name: firstName, last_name: lastName, email, password });
        await ApiClient.auth.login({ email, password });
        window.closeModal();
        window.location.reload();
      } catch (err) { alert("Registration Error: " + err.message); }
    };
  }
}

// ========================================================
// 8. LIFECYCLE DISPATCHER
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  syncAuthState();
  bindAuthForms();
  loadStorefrontProducts();
  loadCartPage();
  setupCheckout();
  loadMyOrders();
  loadOrderDetails();
  loadProfile();
  initAdminDashboard();
  initAdminProducts();
  initAdminOrders();
  initAdminCustomers();
});
