// تفاعل صفحة الهبوط: بناء الفئات والكتالوج، التصفية، وكشف العناصر عند التمرير.
(function () {
  "use strict";
  const products = window.PRODUCTS || [];

  const CATS = [
    { key: "all", label: "الكل" },
    { key: "spray", label: "بخاخات" },
    { key: "bottle", label: "بطلات وقناني" },
    { key: "cup", label: "كبّات وعلب" },
    { key: "glass", label: "زجاجيات" },
  ];

  // صورة ممثِّلة لكل فئة (أول منتج فيها) + عدّها.
  function catMeta(key) {
    const items = products.filter((p) => p.cat === key);
    return { count: items.length, img: items[0] ? items[0].img : "" };
  }

  const $ = (s) => document.querySelector(s);

  /* ---------- بطاقات الفئات ---------- */
  const catGrid = $("#catGrid");
  if (catGrid) {
    catGrid.innerHTML = CATS.filter((c) => c.key !== "all")
      .map((c) => {
        const m = catMeta(c.key);
        return `
        <article class="cat-card reveal" data-cat="${c.key}" role="button" tabindex="0"
                 aria-label="عرض ${c.label}">
          <span class="cat-go" aria-hidden="true">↖</span>
          <img src="${m.img}" alt="${c.label}" loading="lazy" />
          <h3>${c.label}</h3>
          <span class="cat-count">${m.count} صنف</span>
        </article>`;
      })
      .join("");
  }

  /* ---------- أزرار التصفية ---------- */
  const filters = $("#filters");
  if (filters) {
    filters.innerHTML = CATS.map(
      (c, i) =>
        `<button class="chip${i === 0 ? " active" : ""}" data-cat="${c.key}"
                 role="tab" aria-selected="${i === 0}">${c.label}</button>`,
    ).join("");
  }

  /* ---------- شبكة المنتجات ---------- */
  const grid = $("#prodGrid");

  function card(p) {
    const tags = [p.size, p.color, p.cap].filter(Boolean);
    return `
      <article class="prod-card reveal" data-cat="${p.cat}">
        <div class="prod-media">
          <span class="prod-type">${p.type}</span>
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="prod-body">
          <h3 class="prod-name">${p.name}</h3>
          <div class="prod-meta">
            ${tags.map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
          <span class="prod-sku">${p.sku}</span>
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

  /* ---------- كشف عند التمرير ---------- */
  let io;
  function observeReveals(scope) {
    if (!("IntersectionObserver" in window)) {
      (scope || document).querySelectorAll(".reveal").forEach((el) =>
        el.classList.add("in"),
      );
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
    (scope || document).querySelectorAll(".reveal:not(.in)").forEach((el) =>
      io.observe(el),
    );
  }

  /* ---------- ربط الأحداث ---------- */
  if (grid) render("all");

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
    if (!filters) return;
    const btn = filters.querySelector(`.chip[data-cat="${key}"]`);
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

  /* ---------- تشغيل عام ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // كشف عناصر البطل + الأقسام الثابتة.
  observeReveals(document);
})();
