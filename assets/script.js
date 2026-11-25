/* ===================================================
   Viana Store - Interactions
   =================================================== */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '966537543144'; // 0537543144
  const STORAGE_KEY = 'viana_cart';

  /* ---------- helpers ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const nav = $('#mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
    $$('a', nav).forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  /* ---------- cart drawer ---------- */
  const drawer = $('#cartDrawer');
  const overlay = $('#drawerOverlay');
  const cartItemsEl = $('#cartItems');
  const cartTotalEl = $('#cartTotal');
  const cartCountEl = $('#cartCount');

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  $('#cartBtn')?.addEventListener('click', openCart);
  $('#closeCart')?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  /* ---------- toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------- cart logic ---------- */
  function updateCart() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    if (cartCountEl) cartCountEl.textContent = count;
    if (cartTotalEl) cartTotalEl.textContent = total + ' ر.س';

    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<div class="cart-empty"><i>🛍️</i><p>سلتك فارغة حاليًا.<br>أضيفي قطعًا من منتجاتنا ✦</p></div>';
      return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${item.price} ر.س</span>
          <div class="qty-ctrl">
            <button data-action="minus" data-id="${item.id}" aria-label="إنقاص">−</button>
            <span>${item.qty}</span>
            <button data-action="plus" data-id="${item.id}" aria-label="زيادة">＋</button>
          </div>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="حذف">×</button>
      </div>
    `).join('');
  }

  $$('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        image: btn.dataset.image,
        qty: 1
      };
      const existing = cart.find(i => i.id === item.id);
      if (existing) existing.qty += 1;
      else cart.push(item);
      saveCart(cart);
      updateCart();
      showToast('تمت إضافة "' + item.name + '" إلى السلة ✓');
    });
  });

  cartItemsEl?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const item = cart.find(i => i.id === btn.dataset.id);
    if (!item) return;

    if (btn.dataset.action === 'plus') item.qty += 1;
    if (btn.dataset.action === 'minus') {
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
    }
    if (btn.dataset.action === 'remove') cart = cart.filter(i => i.id !== item.id);

    saveCart(cart);
    updateCart();
  });

  $('#checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('سلتك فارغة، أضيفي منتجات أولًا');
      return;
    }
    const lines = cart.map((item, i) =>
      `${i + 1}) ${item.name} × ${item.qty} = ${item.qty * item.price} ر.س`
    );
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    const message = `مرحبا فيانا، أود طلب التالي:\n\n${lines.join('\n')}\n\nالإجمالي: ${total} ر.س\n\nيرجى تأكيد الطلب وشكرًا ✦`;
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
  });

  updateCart();

  /* ---------- product filters ---------- */
  const filterBtns = $$('.filter-btn');
  const productCards = $$('#productsGrid .product-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  /* ---------- contact form -> WhatsApp ---------- */
  const contactForm = $('#contactForm');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const phone = $('#phone').value.trim();
    const subject = $('#subject').value.trim();
    const message = $('#message').value.trim();

    const text = `مرحبا فيانا،\n\nالاسم: ${name}\n${phone ? 'الجوال: ' + phone + '\n' : ''}الموضوع: ${subject}\n\nالرسالة:\n${message}`;
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    showToast('تم فتح واتساب، أرسلي الرسالة لإكمال الطلب ✓');
  });
})();
