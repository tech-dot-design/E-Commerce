/**
 * Reusable HTTP client for communicating with the PHP backend API.
 * Automatically resolves subfolder paths and manages CSRF/session tokens.
 */
const ApiClient = (() => {
  let csrfToken = sessionStorage.getItem('csrf_token') || null;

  // Dynamically resolve base URL path (e.g., "/ecommerce-project")
  const getBasePath = () => {
    const path = window.location.pathname;
    const dir = path.substring(0, path.lastIndexOf('/'));
    return dir.endsWith('/admin') ? dir.substring(0, dir.lastIndexOf('/')) : dir;
  };

  const BASE_URI = getBasePath();

  const setCsrfToken = (token) => {
    csrfToken = token;
    if (token) {
      sessionStorage.setItem('csrf_token', token);
    } else {
      sessionStorage.removeItem('csrf_token');
    }
  };

  /**
   * Dispatches an HTTP request to the API with JSON and CSRF headers.
   */
  async function request(endpoint, method = 'GET', body = null) {
    // Ensure clean endpoint path concatenation
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URI}${cleanEndpoint}`;

    const headers = {
      'Accept': 'application/json'
    };

    const options = {
      method: method.toUpperCase(),
      headers: headers,
      credentials: 'same-origin'
    };

    if (['POST', 'PUT', 'DELETE'].includes(options.method) && csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    if (body !== null && ['POST', 'PUT'].includes(options.method)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        // Output the raw response if PHP threw an HTML notice or Apache returned 404/500
        console.error('Non-JSON server response:', text);
        throw new Error(`Server returned HTML instead of JSON (Status ${response.status}). Check DevTools Network tab.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error.message);
      throw error;
    }
  }

  return {
    setCsrfToken,
    getCsrfToken: () => csrfToken,

    get: (url) => request(url, 'GET'),
    post: (url, data) => request(url, 'POST', data),
    put: (url, data) => request(url, 'PUT', data),
    delete: (url) => request(url, 'DELETE'),

    auth: {
      register: (payload) => request('/api/auth/register.php', 'POST', payload),
      login: async (payload) => {
        const response = await request('/api/auth/login.php', 'POST', payload);
        if (response.data && response.data.csrf_token) {
          setCsrfToken(response.data.csrf_token);
        }
        return response;
      },
      logout: async () => {
        try {
          return await request('/api/auth/logout.php', 'POST');
        } finally {
          setCsrfToken(null);
        }
      }
    },

    products: {
      list: () => request('/api/products/list.php', 'GET'),
      get: (id) => request(`/api/products/get.php?id=${encodeURIComponent(id)}`, 'GET'),
      create: (data) => request('/api/products/create.php', 'POST', data),
      update: (data) => request('/api/products/update.php', 'PUT', data),
      delete: (id) => request(`/api/products/delete.php?id=${encodeURIComponent(id)}`, 'DELETE')
    },

    cart: {
      list: () => request('/api/cart/list.php', 'GET'),
      add: (productId, quantity = 1) => 
        request('/api/cart/add.php', 'POST', { product_id: productId, quantity }),
      update: (productId, quantity) => 
        request('/api/cart/update.php', 'PUT', { product_id: productId, quantity }),
      remove: (productId) => 
        request(`/api/cart/remove.php?product_id=${encodeURIComponent(productId)}`, 'DELETE')
    },

    orders: {
      checkout: (shippingAddress) => 
        request('/api/orders/checkout.php', 'POST', { shipping_address: shippingAddress }),
      view: (orderId) => 
        request(`/api/orders/view.php?order_id=${encodeURIComponent(orderId)}`, 'GET'),
      myOrders: () => request('/api/orders/my_orders.php', 'GET'),
      adminList: () => request('/api/orders/admin_list.php', 'GET'),
      updateStatus: (orderId, status) => 
        request('/api/orders/update_status.php', 'PUT', { order_id: orderId, status })
    },

    users: {
      profile: () => request('/api/users/profile.php', 'GET'),
      list: () => request('/api/users/list.php', 'GET')
    }
  };
})();