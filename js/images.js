/* ============================================================
   SHOPEASE — central image registry
   Change a URL below and it updates everywhere that product's
   key is used: home page, product detail, cart, checkout,
   order details, and the admin product table.

   This file is self-contained — just include it on a page
   (before or after script.js, order doesn't matter) and any
   element with data-img="pX" will be filled in automatically.
   Existing src="" attributes are left in the HTML as a fallback
   in case JavaScript is unavailable, so nothing breaks either way.
   ============================================================ */
const IMAGES = {
  p1: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80", // Wireless Headphones
  p2: "images/running-shoes.jpg",         // Running Shoes
  p3: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",  // Modern Table Lamp
  p4: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",   // Smart Watch
  p5: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",   // Minimalist Leather Backpack
  p6: "images/ceramic-kettle.jpg",        // Ceramic Pour-Over Kettle
  p7: "images/mechanical-keyboard.jpg",   // Mechanical Keyboard
  p8: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"    // Aromatherapy Stone Diffuser
};

document.addEventListener("DOMContentLoaded", function () {
  const isInAdmin = window.location.pathname.replace(/\\/g, "/").includes("/admin/");
  document.querySelectorAll("[data-img]").forEach(function (el) {
    let url = IMAGES[el.dataset.img];
    if (!url) return;
    if (isInAdmin && url.startsWith("images/")) {
      url = "../" + url;
    }
    if (el.tagName === "IMG") {
      el.src = url;
    } else {
      el.style.backgroundImage = 'url("' + url + '")';
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    }
  });
});
