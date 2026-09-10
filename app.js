// تفاعل صفحة الهبوط: الفئات، الكتالوج، الكميات الحيّة (Google Sheet)، والسلّة/واتساب.
(function () {
  "use strict";
  const CFG = window.MAKHZANI_CONFIG || {};
  const WA = String(CFG.whatsapp || "").replace(/[^0-9]/g, "");
  const products = window.PRODUCTS || [];
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const LOW = 50; // عتبة «الكمية قليلة»

  const $ = (s) => document.querySelector(s);
  const enc = encodeURIComponent;

  const CATS = [
    { key: "all", label: "الكل" },
    { key: "spray", label: "بخاخات" },
    { key: "bottle", label: "بطلات وقناني" },
    { key: "cup", label: "كبّات وعلب" },
    { key: "glass", label: "زجاجيات" },
  ];

  /* ============ الكميات الحيّة من Google Sheet (CSV منشور) ============ */
  let stock = null; // Map sku -> qty ، أو null إن لم تُضبط الورقة

  function stockUrl() {
    if (!CFG.sheetPubId) return null;
    let u =
      "https://docs.google.com/spreadsheets/d/e/" +
      CFG.sheetPubId +
      "/pub?output=csv";
    if (CFG.sheetGid) u += "&gid=" + enc(CFG.sheetGid) + "&single=true";
    return u;
  }

  // محلّل CSV بسيط يدعم الحقول المقتبسة والفواصل داخلها والأسطر المتعددة.
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else q = false;
        } else field += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch !== "\r") field += ch;
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  async function fetchStock() {
    const url = stockUrl();
    if (!url) return null;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ""));
    if (rows.length === 0) return new Map();
    const head = rows[0].map((h) => h.trim().toLowerCase());
    let si = head.indexOf("sku");
    let qi = head.findIndex((l) => ["quantity", "qty", "الكمية"].includes(l));
    const hasHeader = si >= 0 || qi >= 0;
    if (si < 0) si = 0;
    if (qi < 0) qi = head.length > 1 ? head.length - 1 : 1;
    const map = new Map();
    for (const r of hasHeader ? rows.slice(1) : rows) {
      const sku = (r[si] || "").trim();
      if (!sku || sku.toLowerCase() === "sku") continue;
      const q = Number((r[qi] || "").trim());
      map.set(sku, Number.isFinite(q) ? q : 0);
    }
    return map;
  }

  function stockState(sku) {
    if (!stock) return { cls: "", label: "", qty: null, out: false };
    const q = stock.has(sku) ? stock.get(sku) : null;
    if (q == null) return { cls: "", label: "", qty: null, out: false };
    if (q <= 0)
      return { cls: "stock-out", label: "نفد", qty: 0, out: true };
    if (q <= LOW)
      return { cls: "stock-low", label: "متبقٍّ " + q, qty: q, out: false };
    return { cls: "stock-in", label: "متوفّر · " + q, qty: q, out: false };
  }

  /* ============ الفئات ============ */
  function catMeta(key) {
    const items = products.filter((p) => p.cat === key);
    return { count: items.length, img: items[0] ? items[0].img : "" };
  }
  const catGrid = $("#catGrid");
  if (catGrid) {
    catGrid.innerHTML = CATS.filter((c) => c.key !== "all")
      .map((c) => {
        const m = catMeta(c.key);
        return `<article class="cat-card reveal" data-cat="${c.key}" role="button" tabindex="0" aria-label="عرض ${c.label}">
          <span class="cat-go" aria-hidden="true">↖</span>
          <img src="${m.img}" alt="${c.label}" loading="lazy" />
          <h3>${c.label}</h3>
          <span class="cat-count">${m.count} صنف</span>
        </article>`;
      })
      .join("");
  }

  /* ============ الفلاتر ============ */
  const filters = $("#filters");
  if (filters) {
    filters.innerHTML = CATS.map(
      (c, i) =>
        `<button class="chip${i === 0 ? " active" : ""}" data-cat="${c.key}" role="tab" aria-selected="${i === 0}">${c.label}</button>`,
    ).join("");
  }

  /* ============ الكتالوج ============ */
  const grid = $("#prodGrid");

  function card(p) {
    const tags = [p.size, p.color, p.cap].filter(Boolean);
    const st = stockState(p.sku);
    const badge = st.label
      ? `<span class="prod-stock ${st.cls}"><span class="sdot"></span>${st.label}</span>`
      : "";
    return `<article class="prod-card reveal" data-cat="${p.cat}" data-sku="${p.sku}">
      <div class="prod-media">
        <span class="prod-type">${p.type}</span>
        ${badge}
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="prod-body">
        <h3 class="prod-name">${p.name}</h3>
        <div class="prod-meta">${tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        <span class="prod-sku">${p.sku}</span>
        <div class="prod-foot">
          <div class="stepper" data-sku="${p.sku}">
            <button type="button" data-step="-1" aria-label="إنقاص">−</button>
            <input type="number" value="1" min="1" inputmode="numeric" aria-label="الكمية" />
            <button type="button" data-step="1" aria-label="زيادة">+</button>
          </div>
          <button class="add-btn" data-add="${p.sku}"${st.out ? " disabled" : ""}>
            ${st.out ? "نفد" : "أضِف"}
          </button>
        </div>
      </div>
    </article>`;
  }

  let current = "all";
  function render(cat) {
    current = cat;
    const list = cat === "all" ? products : products.filter((p) => p.cat === cat);
    grid.innerHTML = list.map(card).join("");
    observeReveals(grid);
  }

  // تحديث شارات المخزون داخل البطاقات المعروضة دون إعادة بناء كامل.
  function refreshStockBadges() {
    grid.querySelectorAll(".prod-card").forEach((el) => {
      const st = stockState(el.dataset.sku);
      const media = el.querySelector(".prod-media");
      let badge = media.querySelector(".prod-stock");
      if (st.label) {
        if (!badge) {
          badge = document.createElement("span");
          media.appendChild(badge);
        }
        badge.className = "prod-stock " + st.cls;
        badge.innerHTML = `<span class="sdot"></span>${st.label}`;
      } else if (badge) {
        badge.remove();
      }
      const add = el.querySelector(".add-btn");
      add.disabled = st.out;
      add.textContent = st.out ? "نفد" : "أضِف";
    });
  }

  /* ============ الكشف عند التمرير ============ */
  let io;
  function observeReveals(scope) {
    if (!("IntersectionObserver" in window)) {
      (scope || document)
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in"));
      return;
    }
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
    }
    (scope || document)
      .querySelectorAll(".reveal:not(.in)")
      .forEach((el) => io.observe(el));
  }

  /* ============ السلّة ============ */
  const cart = new Map(); // sku -> qty
  const fab = $("#cartFab");
  const overlay = $("#drawerOverlay");
  const drawer = $("#drawer");

  function cartTotals() {
    let lines = 0;
    let pieces = 0;
    cart.forEach((q) => {
      lines++;
      pieces += q;
    });
    return { lines, pieces };
  }
  function syncCartUi() {
    const { lines, pieces } = cartTotals();
    $("#cartCount").textContent = String(lines);
    $("#cartQty").textContent = String(pieces);
    fab.classList.toggle("show", lines > 0 || drawer.classList.contains("open"));
    renderCart();
  }
  function renderCart() {
    const box = $("#cartItems");
    if (cart.size === 0) {
      box.innerHTML = `<p class="cart-empty">سلّتك فارغة — أضِف أصنافاً من الكتالوج.</p>`;
      return;
    }
    const rows = [];
    cart.forEach((q, sku) => {
      const p = bySku.get(sku);
      if (!p) return;
      rows.push(`<div class="cart-row" data-sku="${sku}">
        <img src="${p.img}" alt="${p.name}" />
        <div class="cr-info">
          <div class="cr-name">${p.name}</div>
          <div class="cr-sku">${sku}</div>
        </div>
        <div class="stepper" data-sku="${sku}" data-cart="1">
          <button type="button" data-step="-1" aria-label="إنقاص">−</button>
          <input type="number" value="${q}" min="1" inputmode="numeric" aria-label="الكمية" />
          <button type="button" data-step="1" aria-label="زيادة">+</button>
        </div>
        <button class="cr-remove" data-remove="${sku}" aria-label="حذف">✕</button>
      </div>`);
    });
    box.innerHTML = rows.join("");
  }
  function setQty(sku, qty) {
    qty = Math.max(0, Math.floor(qty || 0));
    const st = stockState(sku);
    if (st.qty != null && qty > st.qty) qty = st.qty; // لا يتجاوز المتوفّر
    if (qty <= 0) cart.delete(sku);
    else cart.set(sku, qty);
    syncCartUi();
  }
  function addToCart(sku, qty) {
    const cur = cart.get(sku) || 0;
    setQty(sku, cur + (qty || 1));
    openDrawer(true);
  }

  function openDrawer(open) {
    drawer.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    fab.classList.toggle("show", open || cart.size > 0);
  }

  /* ============ رسائل واتساب ============ */
  function waLink(text) {
    const base = WA ? "https://wa.me/" + WA : "https://wa.me/";
    return base + (text ? "?text=" + enc(text) : "");
  }
  function orderMessage() {
    const lines = ["مخزني — طلب جديد", "————————————"];
    cart.forEach((q, sku) => {
      const p = bySku.get(sku);
      lines.push(`• ${p ? p.name : sku} (${sku}) × ${q}`);
    });
    const { pieces } = cartTotals();
    lines.push("————————————", `عدد القطع: ${pieces}`);
    const name = $("#custName").value.trim();
    const phone = $("#custPhone").value.trim();
    if (name) lines.push(`الاسم: ${name}`);
    if (phone) lines.push(`الهاتف: ${phone}`);
    return lines.join("\n");
  }
  function quickOrder(sku, qty) {
    const p = bySku.get(sku);
    const msg = [
      "مخزني — طلب مباشر",
      "————————————",
      `• ${p ? p.name : sku} (${sku}) × ${qty || 1}`,
    ].join("\n");
    window.open(waLink(msg), "_blank");
  }

  /* ============ ربط الأحداث ============ */
  if (grid) render("all");

  // ستيبر عام (كتالوج + سلّة) + أزرار الإضافة/الحذف
  document.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step) {
      const wrap = step.closest(".stepper");
      const input = wrap.querySelector("input");
      let v = parseInt(input.value, 10) || 1;
      v += Number(step.dataset.step);
      if (v < 1) v = 1;
      input.value = v;
      if (wrap.dataset.cart) setQty(wrap.dataset.sku, v);
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add && !add.disabled) {
      const wrap = add.parentElement.querySelector(".stepper");
      const qty = parseInt(wrap.querySelector("input").value, 10) || 1;
      addToCart(add.dataset.add, qty);
      return;
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      setQty(rm.dataset.remove, 0);
      return;
    }
  });
  // تعديل الكمية يدوياً داخل السلّة
  document.addEventListener("change", (e) => {
    const input = e.target;
    if (input.matches('.stepper[data-cart="1"] input')) {
      setQty(input.closest(".stepper").dataset.sku, parseInt(input.value, 10) || 0);
    }
  });

  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach((c) => {
        c.classList.remove("active");
        c.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      render(btn.dataset.cat);
    });
  }

  function gotoCat(key) {
    const btn = filters && filters.querySelector(`.chip[data-cat="${key}"]`);
    if (btn) btn.click();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  }
  if (catGrid) {
    catGrid.addEventListener("click", (e) => {
      const c = e.target.closest(".cat-card");
      if (c) gotoCat(c.dataset.cat);
    });
    catGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const c = e.target.closest(".cat-card");
        if (c) {
          e.preventDefault();
          gotoCat(c.dataset.cat);
        }
      }
    });
  }

  fab.addEventListener("click", () => openDrawer(true));
  $("#drawerClose").addEventListener("click", () => openDrawer(false));
  overlay.addEventListener("click", () => openDrawer(false));
  $("#sendWa").addEventListener("click", () => {
    if (cart.size === 0) {
      alert("سلّتك فارغة — أضِف أصنافاً أولاً.");
      return;
    }
    window.open(waLink(orderMessage()), "_blank");
  });

  // روابط واتساب العامة
  const greet = "مرحباً مخزني، أودّ الاستفسار عن علب التغليف.";
  const waContact = $("#waContact");
  const waFoot = $("#waFoot");
  if (waContact) waContact.href = waLink(greet);
  if (waFoot) waFoot.href = waLink(greet);

  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  syncCartUi();
  observeReveals(document);

  /* ============ تحميل المخزون + التحديث الدوري ============ */
  async function loadStock() {
    try {
      const map = await fetchStock();
      if (map) {
        stock = map;
        refreshStockBadges();
        // إعادة ضبط كميات السلّة ضمن المتوفّر
        cart.forEach((q, sku) => {
          const st = stockState(sku);
          if (st.qty != null && q > st.qty) setQty(sku, st.qty);
        });
      }
    } catch (err) {
      console.warn("[stock] تعذّر جلب الكميات:", err.message);
    }
  }
  if (stockUrl()) {
    loadStock();
    const ms = Number(CFG.stockRefreshMs) || 90000;
    setInterval(loadStock, ms);
  }
})();
